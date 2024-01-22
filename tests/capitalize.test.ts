import { toHigherCase } from "../scripts/capitalize"

test('Convert two words to higher case', () => {
    expect(toHigherCase("abc def")).toBe("Abc Def");
})

test('Convert one word to higher case', () => {
    expect(toHigherCase("abcdef")).toBe("Abcdef");
})