const paths = require('path');
const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

// 2. Load environment variables immediately after 'path' is defined
require('dotenv').config({ path: paths.resolve(__dirname, '.env') });

// 3. Keep your logs here to verify the EC2 is reading the .env file
console.log("--- Environment Check ---");
console.log("Redirect URI:", process.env.REDIRECT_URI);
console.log("Client ID Present:", !!process.env.CLIENT_ID);
console.log("-------------------------");

const { getParts } = require('./modules/reader.js'); 
const auth = require('./modules/auth');

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET || 'bortana-development-secret-key', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, sameSite: 'lax', maxAge: 3600000 }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://3.25.94.141', credentials: true }));

const dbPath = paths.join(__dirname, 'erp.db');
const db = new sqlite3.Database(dbPath);

// --- AUTH ROUTES ---
app.get('/api/login', auth.login);
app.get('/api/auth/callback', auth.callback);
app.get('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid'); 
        res.redirect('/');  // Redirect to frontend home after logout
    });
});

// --- DASHBOARD & SUMMARY  ---
app.get('/api/dashboard-summary', auth.isAuthenticated, (req, res) => {
    const user = req.session.user.name;

    const statsQuery = `SELECT status, COUNT(*) as count FROM components GROUP BY status`;
    
    // Updated Digest: Shows real Handshake activity (Comments and Approvals)
    const digestQuery = `
        SELECT 'COMMENT' as type, c.part_number, al.details as message, al.timestamp 
        FROM activity_log al 
        JOIN components c ON al.component_id = c.id 
        WHERE al.action = 'Comment'
        UNION ALL
        SELECT 'APPROVED' as type, c.part_number, 'Status changed to Approved' as message, al.timestamp 
        FROM activity_log al
        JOIN components c ON al.component_id = c.id
        WHERE al.action = 'Approved'
        ORDER BY timestamp DESC LIMIT 10
    `;

    const releasesQuery = `SELECT * FROM components ORDER BY created_at DESC LIMIT 50`;

    db.all(statsQuery, (err, stats) => {
        if (err) return res.status(500).json({ error: err.message });
        db.all(digestQuery, (err, digest) => {
            if (err) return res.status(500).json({ error: err.message });
            db.all(releasesQuery, (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ stats: stats || [], digest: digest || [], releases: rows || [], user });
            });
        });
    });
});

// --- DASHBOARD DATA (for frontend components expecting specific releases) ---
app.get('/api/dashboard-data', auth.isAuthenticated, (req, res) => {
    const currentUser = req.session.user.name;
    const query = `SELECT * FROM components WHERE status IN ('Published', 'Released') OR (status = 'Review' AND created_by = ?) ORDER BY id DESC LIMIT 50`;
    db.all(query, [currentUser], (err, rows) => {
        if (err) return res.status(500).json({ error: "Fetch error" });
        res.json({ user: currentUser, releases: rows });
    });
});

// --- RELEASE DETAIL & PORTAL ---
app.get('/api/releases', auth.isAuthenticated, (req, res) => {
    const { status, category, sort } = req.query;
    let query = `SELECT * FROM components WHERE 1=1`;
    const params = [];
    if (status) { query += ` AND status = ?`; params.push(status); }
    if (category) { query += ` AND part_type LIKE ?`; params.push(`%${category}%`); }
    query += ` ORDER BY ${sort === 'date' ? 'created_at DESC' : 'id DESC'}`;
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/releases/:id', auth.isAuthenticated, (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM components WHERE id = ?`, [id], (err, component) => {
        if (err || !component) return res.status(404).json({ error: "Part not found" });
        db.all(`SELECT * FROM activity_log WHERE component_id = ? ORDER BY timestamp DESC`, [id], (err, logs) => {
            res.json({ ...component, storyline: logs || [] });
        });
    });
});

// --- ITEM SEARCH & REVISION ---
app.get('/api/item-master', auth.isAuthenticated, (req, res) => {
    try {
        const itemDetailPath = paths.join(__dirname, 'data', 'PartID detail.xlsx');
        const items = getParts(itemDetailPath); 
        res.json(items);
    } catch (err) { res.status(500).json({ error: "Could not load item details" }); }
});

app.get('/api/check-revision', auth.isAuthenticated, (req, res) => {
    const { product, system, item, finish } = req.query;
    const prefix = `${product}.${system}.${item}.${finish}`;
    db.all(`SELECT revision FROM components WHERE part_number LIKE ?`, [`${prefix}%`], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.json({ nextRevision: '001' });
        const revs = rows.map(r => parseInt(r.revision)).filter(n => !isNaN(n));
        const maxRev = revs.length > 0 ? Math.max(...revs) : 0;
        const nextRev = (maxRev + 1).toString().padStart(3, '0');
        res.json({ nextRevision: nextRev });
    });
});

// --- CREATION & APPROVAL ---
app.post('/api/components', auth.isAuthenticated, (req, res) => {
    const data = req.body;
    const user = req.session.user.name;
    const query = `INSERT INTO components (
        part_number, name, part_type, mod_type, mod_description, responsible_engineer, 
        reason, drawing_2d, drawing_3d, compliance_adr, vehicle_ev, vehicle_marrua, 
        stock_action, finishing_stage, revision, bortana_code, created_by
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    const params = [
        data.part_number, data.name, data.part_type, data.mod_type, data.mod_description, user, 
        data.reason, data.drawing_2d ? 1 : 0, data.drawing_3d ? 1 : 0, 
        data.compliance_adr ? 1 : 0, data.vehicle_ev ? 1 : 0, data.vehicle_marrua ? 1 : 0, 
        data.stock_action, data.finish, data.rev, data.code, user
    ];

    db.run(query, params, function(err) {
        if (err) return res.status(400).json({ error: "Duplicate Part Number." });
        db.run(`INSERT INTO activity_log (component_id, user_name, action, details) VALUES (?, ?, 'Created', 'Engineering release submitted.')`, [this.lastID, user]);
        res.status(201).json({ id: this.lastID });
    });
});

app.post('/api/approve/:id', auth.isAuthenticated, (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    const user = req.session.user.name;
    db.run(`UPDATE components SET status = 'Approved' WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (comment) {
            db.run(`INSERT INTO activity_log (component_id, user_name, action, details) VALUES (?, ?, 'Comment', ?)`, [id, user, comment]);
        }
        db.run(`INSERT INTO activity_log (component_id, user_name, action, details) VALUES (?, ?, 'Approved', 'Status changed to Approved')`, [id, user]);
        res.json({ success: true });
    });
});

// --- INITIALIZATION ---
const excelFilePath = paths.join(__dirname, 'data', '006BOM.xlsx');
function seedDatabaseIfNeeded() {
    db.get(`SELECT COUNT(*) as count FROM components`, (err, row) => {
        if (err || (row && row.count > 0)) return;
        try {
            const parts = getParts(excelFilePath); 
            const stmt = db.prepare(`INSERT OR IGNORE INTO components (part_number, name, finishing_stage, revision, bortana_code, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`);
            parts.forEach(part => {
                let finalPN = part.id;
                let finish = "00", rev = "001", code = "B";
                if (part.id.length === 3) finalPN = `6040.006.${part.id}.00.001.B`;
                else if (part.id.includes('.')) {
                    const segs = part.id.split('.');
                    finish = segs[3] || "00"; rev = segs[4] || "001"; code = segs[5] || "B";
                }
                stmt.run(finalPN, part.name, finish, rev, code, 'Published', 'SYSTEM');
            });
            stmt.finalize();
        } catch (e) { console.error("Seed Error:", e.message); }
    });
}

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS components (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        part_number TEXT UNIQUE NOT NULL, 
        name TEXT, part_type TEXT, mod_type TEXT, mod_description TEXT, responsible_engineer TEXT, 
        reason TEXT, drawing_2d BOOLEAN, drawing_3d BOOLEAN, compliance_adr BOOLEAN, 
        vehicle_ev BOOLEAN, vehicle_marrua BOOLEAN, stock_action TEXT, finishing_stage TEXT, 
        revision TEXT, bortana_code TEXT, status TEXT DEFAULT 'Review', 
        comment TEXT, created_by TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => { if (!err) seedDatabaseIfNeeded(); });
    db.run(`CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT, component_id INTEGER, user_name TEXT, 
        action TEXT, details TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, 
        FOREIGN KEY(component_id) REFERENCES components(id)
    )`);
});


app.listen(5000, () => console.log(`Bortana ERP Live at http://localhost:5000`));