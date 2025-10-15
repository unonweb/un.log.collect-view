import cmdOutputToJson from "./cmdOutputToJson.js";
import processJournalEntries from './processJournalEntries.js';

export default async function reportSSH(hostname) {
	
	const timeFrame = 'today'

	const cmd = new Deno.Command('journalctl', {
		args: [
			'--quiet',
			`--since=${timeFrame}`,
			'--identifier=sshd',
			'--output=json',
			'--output-fields=MESSAGE,PRIORITY',
		],
		stdout: 'piped',
		stdin: 'inherit'
	});

	const { code, stdout, stderr } = await cmd.output();

	if (code == 0) {
		const journalEntries = cmdOutputToJson(stdout)
		processJournalEntries(journalEntries, [{ reportType: 'ssh', host: hostname }])
		return journalEntries
	}
	else {
		throw new Error(new TextDecoder().decode(stderr))
	}
}