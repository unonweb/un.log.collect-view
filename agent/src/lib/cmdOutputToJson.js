export default function cmdOutputToJson(output) {

    let text = new TextDecoder().decode(output)
    text = text.substring(0, text.lastIndexOf('\n')) // remove last newline
    text = text.replaceAll('\n', ',') // replace newline with comma
    text = `[${text}]` // wrap into array literal
    const json = JSON.parse(text)
    return json
}