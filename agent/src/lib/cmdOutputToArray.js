export default function cmdOutputToArr(output) {
    const text = new TextDecoder().decode(output)
    const arr = text.split('\n')

    if (arr[arr.length - 1] === '') {
        arr.pop()
    }

    return arr
}