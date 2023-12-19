export function hexToAscii(words: string) {

    const input = words.toUpperCase();

    var buffer = "";

    var hexBuffer = "";

    for (var i = 0; i < input.length; i++) {

        const character = input.charAt(i);

        if ("0123456789ABCDEF".includes(character)) {
            hexBuffer += character;

            if (hexBuffer.length >= 2) {
                buffer += String.fromCharCode(parseInt(hexBuffer, 16));
                hexBuffer = "";
            }
        } else if (character != ' ' && character != '\t' && character != '\n' && character != '\r') {
            throw "Not hex";
        }
    }
    return buffer;
}