export default function processJournalEntries(logEntries, addFields = []) {

    for (const logEntry of logEntries) {
        // add fields
        for (const field of addFields) {
            for (const key of Object.keys(field)) {
                logEntry[key] = field[key]
            }
        }
        // rm
        delete logEntry._BOOT_ID
        delete logEntry.__MONOTONIC_TIMESTAMP
        delete logEntry.__CURSOR
    }
}