const PORT = 4212

class Server {

    main() {
        const pathLogs = `${import.meta.dirname}/data`
        let logFileContents = await this.readLogs(pathLogs)
    }

    async readLogs(pathLogs: string) {
        let logFileContents = []

        for await (const dirEntry of Deno.readDir(pathLogs)) {
            console.log(`Reading ${dirEntry.name} ...`);
            const content = await Deno.readTextFile(`${pathLogs}/${dirEntry.name}`)
            logFileContents.push(JSON.parse(content))
        }

        return logFileContents
    }

    handler(req: Request, info: Deno.ServeHandlerInfo): Response {
        const body = JSON.stringify(data);
        return new Response(
            body,
            {
                status: 404,
                headers: {
                    "content-type": "application/json; charset=utf-8",
                },
            });
    }
}

async function main() {

    console.log(import.meta.dirname);
    
    let logs = []



    Deno.serve({ port: PORT, hostname: '127.0.0.1' }, () => serveLogs(logs));
}

function serveLogs(data: any): Response {

    return function handler(req: Request, info: Deno.ServeHandlerInfo): Response {
        const body = JSON.stringify(data);
        return new Response(
            body,
            {
                status: 404,
                headers: {
                    "content-type": "application/json; charset=utf-8",
                },
            });
    }
}

async function handler(req: Request, info: Deno.ServeHandlerInfo): Promise<Response> {
    const method = req.method;
    const remoteIP = info.remoteAddr;

    console.log(`${remoteIP} just made an HTTP ${method} request.`);
    console.log('Method:', req.method);

    const url = new URL(req.url);
    console.log('Path:', url.pathname);
    console.log('Query parameters:', url.searchParams);

    console.log('Headers:', req.headers);

    if (req.body) {
        const body = await req.text();
        console.log('Body:', body);
    }

    return new Response('Hello, World!');
}

main()