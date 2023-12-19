export function asciiToHex(words:string) {
    var buffer = "";

	for(var i = 0; i < words.length; i ++) {
		const code = words.charCodeAt(i).toString(16);
		
        if (code.length < 2) {
            buffer += "0";
        }
		buffer += code;
	}
	return buffer.toUpperCase();
}