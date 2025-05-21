const PORT = 4212;

async function main() {
    console.log(import.meta.dirname);
    const pathLogs = `${import.meta.dirname}/data`;

    // initially read logs once
    let logFileContents = await readLogs(pathLogs);

    serveJsObj(logFileContents);
    // watch for logs changes
    const watcher = Deno.watchFs(pathLogs);
    for await (const _event of watcher) {
        //console.log(">>>> event", event);
        logFileContents = await readLogs(pathLogs);
    }

    function serveJsObj(obj: object) {
        console.log(`Serving on port ${PORT} ...`);
        Deno.serve(
            { port: PORT, hostname: "127.0.0.1" },
            createResponse,
        );
    }

    function createResponse(): Response {
        const body:string = JSON.stringify(logFileContents);
        return new Response(
            body,
            {
                status: 200,
                headers: {
                    "content-type": "application/json; charset=utf-8",
                    "Access-Control-Allow-Origin": "*",
                },
            },
        );
    }
}





async function readLogs(pathLogs: string) {
    let logFileContents = [];

    for await (const dirEntry of Deno.readDir(pathLogs)) {
        console.log(`Reading ${dirEntry.name} ...`);
        const content = await Deno.readTextFile(`${pathLogs}/${dirEntry.name}`);
        logFileContents.push(JSON.parse(content));
    }

    return logFileContents;
}

await main();
