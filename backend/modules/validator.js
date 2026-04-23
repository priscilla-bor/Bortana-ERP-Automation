// Bortana Module-01: Naming Rule Logic
function validatePart(partID) {
    /**
     * Regex breakdown:
     * \d{4} - 6064 (Project)
     * \d{3} - 006 (System)
     * \d{3} - 001 (Item)
     * \d{2} - 00/01 (Finish)
     * \d{3} - 001 (Revision)
     * B     - Fixed code
     */
    const schema = /^\d{4}\.\d{3}\.\d{3}\.\d{2}\.\d{3}\.B$/;
    
    if (schema.test(partID)) {
        return "VALID: Part follows Bortana Schema.";
    } else {
        return "INVALID: Check format. Must be XXXX.XXX.XXX.XX.XXX.B (e.g. 6064.006.002.00.001.B)";
    }
}

module.exports = { validatePart };