//const envObj = Deno.env.toObject()
//console.log(envObj)
//import { TextLineStream } from "@std/streams/text-line-stream";
//import { JsonParseStream } from "@std/json/parse-stream";
import reportErrors from './lib/reportErrors.js';
import reportSSH from './lib/reportSSH.js';
import reportSudo from './lib/reportSudo.js';
import readAndParseJSONConfig from './lib/readAndParseJsonConfig.js';

const SCRIPT_DIR = import.meta.dirname
const CONFIG_PATH = `${SCRIPT_DIR}/config.json`

async function main() {

    try {

        const config = await readAndParseJSONConfig(CONFIG_PATH)
        const logDir = config.log.dir ?? `${SCRIPT_DIR}/log`
        const logTimeStamp = getFormattedDate()
        const hostname = Deno.hostname()
        const logName = `${hostname}_${logTimeStamp}.json`
        const logPath = `${logDir}/${logName}`

        //const report = {}
        const reports = []
        //report.host = hostname
        //report.time = Date.now()

		// GATHER REPORTS
		// --------------

        if (config.reports.ssh.enabled == true) {
            //report.ssh = await reportSSH()
            reports.push(...await reportSSH(hostname))
        }

        if (config.reports.admin.enabled == true) {
            //report.sudo = await reportSudo()
            reports.push(...await reportSudo(hostname))
        }

        if (config.reports.errors.enabled == true) {
            //report.errors = await reportErrors(config?.reports?.errors?.priority)
            reports.push(...await reportErrors(config?.reports?.errors?.priority, hostname))
        }

        await Deno.writeTextFile(logPath, JSON.stringify(reports));
        console.log(`Successfully written to ${logPath}`)

    } catch (error) {
        console.error(error.stack)
    }
}

function getFormattedDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}-${hours}:${minutes}`;
}

main()