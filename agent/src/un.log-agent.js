//const envObj = Deno.env.toObject()
//console.log(envObj)
import { TextLineStream } from "@std/streams/text-line-stream";
import { JsonParseStream } from "@std/json/parse-stream";

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

async function reportSudo(hostname) {
    const timeFrame = 'today'

    const cmd = new Deno.Command('journalctl', {
        args: [
            '--quiet',
            `--since=${timeFrame}`,
            '--identifier=sudo',
            '--grep=COMMAND=',
            '--output=json',
            '--output-fields=MESSAGE,PRIORITY',
        ],
        stdout: 'piped',
        stdin: 'inherit'
    });

    const { code, stdout, stderr } = await cmd.output();

    if (code == 0) {
        const logEntries = cmdOutputToJson(stdout)
        processLogEntries(logEntries, [{ reportType: 'sudo', host: hostname }])
        return logEntries
    }
    else {
        throw new Error(new TextDecoder().decode(stderr))
    }
}

async function reportSSH(hostname) {
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
        const logEntries = cmdOutputToJson(stdout)
        processLogEntries(logEntries, [{ reportType: 'ssh', host: hostname }])
        return logEntries
    }
    else {
        throw new Error(new TextDecoder().decode(stderr))
    }
}

async function reportErrors(priority, hostname) {
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
        const logEntries = cmdOutputToJson(stdout)
        processLogEntries(logEntries, [{ reportType: 'errors', host: hostname }])
        return logEntries
    }
    else {
        throw new Error(new TextDecoder().decode(stderr))
    }
}

function processLogEntries(logEntries, addFields = []) {

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

function cmdOutputToJson(output) {

    let text = new TextDecoder().decode(output)
    text = text.substring(0, text.lastIndexOf('\n')) // remove last newline
    text = text.replaceAll('\n', ',') // replace newline with comma
    text = `[${text}]` // wrap into array literal
    const json = JSON.parse(text)
    return json
}

function cmdOutputToArr(output) {
    let text = new TextDecoder().decode(output)
    let arr = text.split('\n')

    if (arr[arr.length - 1] === '') {
        arr.pop()
    }

    return arr
}

async function readAndParseJSONConfig(path) {
    try {
        const config = await Deno.readTextFile(path)
        return JSON.parse(config)
    } catch (error) {
        console.error(error.stack)
    }
}
main()