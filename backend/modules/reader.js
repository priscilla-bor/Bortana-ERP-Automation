const XLSX = require('xlsx');

function getParts(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

    const itemMap = new Map();

    data.forEach((row) => {
        // Iterate through cells to find a 3-digit Item ID or a full PN
        row.forEach((cell, index) => {
            const val = String(cell || "").trim();
            const isItemID = /^\d{3}$/.test(val);
            const isFullPN = /^\d{4}\.\d{3}\.\d{3}/.test(val);

            if (isItemID || isFullPN) {
                const itemCode = isFullPN ? val.split('.')[2] : val;
                // Grab the description (usually the next cell)
                const description = String(row[index + 1] || "Legacy Component").trim();
                
                if (!itemMap.has(itemCode)) {
                    itemMap.set(itemCode, description);
                }
            }
        });
    });

    return Array.from(itemMap, ([id, name]) => ({ id, name }));
}

module.exports = { getParts };