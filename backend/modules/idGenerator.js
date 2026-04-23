/**
 * Logic Module: Sequential ID & Revision Generation
 * Role: Generates new IDs or Revisions while ensuring absolute uniqueness.
 */

function isUnique(existingParts, newId) {
    return !existingParts.includes(newId);
}

// --- Scenario A: Generate a Brand-New Part ---
function generateNextPartID(existingParts, product, system, finish = "00", revision = "001", code = "B") {
    // Defensive: Ensure product is only the first 4 digits (e.g., strip '-MK1')
    const cleanProduct = String(product).slice(0, 4);
    const prefix = `${cleanProduct}.${system}`;

    const matches = existingParts.filter(id => typeof id === 'string' && id.startsWith(prefix));

    let nextSequence = 1;
    if (matches.length > 0) {
        const sequenceNumbers = matches.map(id => {
            const segs = id.split('.');
            return segs.length >= 3 ? parseInt(segs[2], 10) : 0;
        });
        nextSequence = Math.max(...sequenceNumbers) + 1;
    }

    const formattedSequence = nextSequence.toString().padStart(3, '0');
    const newPartID = `${cleanProduct}.${system}.${formattedSequence}.${finish}.${revision}.${code}`;

    if (!isUnique(existingParts, newPartID)) {
        throw new Error(`CRITICAL: Generated Part ID ${newPartID} already exists!`);
    }

    return newPartID;
}

// --- Scenario B: Generate a New Revision ---
function generateNextRevision(existingParts, basePartID) {
    const segments = basePartID.split('.');
    if (segments.length < 6) throw new Error("Invalid Base ID for revision");

    // Prefix: Product.System.Sequence.Finish
    const basePrefix = `${segments[0]}.${segments[1]}.${segments[2]}.${segments[3]}`;
    const suffixCode = segments[5]; 

    const matches = existingParts.filter(id => typeof id === 'string' && id.startsWith(basePrefix));

    let nextRev = 1;
    if (matches.length > 0) {
        const revNumbers = matches.map(id => {
            const segs = id.split('.');
            return segs.length >= 5 ? parseInt(segs[4], 10) : 0;
        });
        nextRev = Math.max(...revNumbers) + 1;
    }

    const formattedRev = nextRev.toString().padStart(3, '0');
    const newRevID = `${basePrefix}.${formattedRev}.${suffixCode}`;

    if (!isUnique(existingParts, newRevID)) {
        throw new Error(`CRITICAL: Generated Revision ${newRevID} already exists!`);
    }

    return newRevID;
}

module.exports = { generateNextPartID, generateNextRevision };