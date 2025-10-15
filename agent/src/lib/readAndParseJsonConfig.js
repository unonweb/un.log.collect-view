export default async function readAndParseJSONConfig(path) {
    try {
        const config = await Deno.readTextFile(path)
        return JSON.parse(config)
    } catch (error) {
        console.error(error.stack)
    }
}