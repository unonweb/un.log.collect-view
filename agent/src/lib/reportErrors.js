import cmdOutputToJson from './cmdOutputToJson.js';
import processJournalEntries from "./processJournalEntries.js";

export default async function reportErrors(priority, hostname) {

    const timeFrame = 'today'
    const bootID = -0
    priority ??= 3

    const cmd = new Deno.Command('journalctl', {
        args: [
            '--quiet',
            `--since=${timeFrame}`,
            `--boot=${bootID}`,
            `--priority=${priority}`,
            '--output=json',
            '--output-fields=MESSAGE,PRIORITY',
        ],
        stdout: 'piped',
        stdin: 'inherit'
    });

    const { code, stdout, stderr } = await cmd.output();

    if (code == 0) {
        const journalEntries = cmdOutputToJson(stdout)
        processJournalEntries(journalEntries, [{ reportType: 'errors', host: hostname }])
        return journalEntries
    }
    else {
        throw new Error(new TextDecoder().decode(stderr))
    }
}