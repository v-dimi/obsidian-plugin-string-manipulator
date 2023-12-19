const _ = require("lodash");

export function toSnakeCase(word : string): string {
        
    return _.snakeCase(word);
}