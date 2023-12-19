

export function formatJSON(word : string): string  {
    try {
		// I feel like this should have a real parser/formatter
		// but hey, it works so who am I to judge?
		return JSON.stringify(JSON.parse(word), null, 2);
	}
	catch(error) {
		console.warn("Invalid JSON");
	}

    return word;
}