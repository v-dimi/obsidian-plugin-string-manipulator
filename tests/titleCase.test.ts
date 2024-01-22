import { toTitleCase } from "../scripts/titleCase"

test('Convert two words to title case', () => {
    expect(toTitleCase("abc def")).toBe("Abc Def");
})

test('Convert one word to title case', () => {
    expect(toTitleCase("abcdef")).toBe("Abcdef");
})