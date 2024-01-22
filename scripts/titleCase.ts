const _ = require("lodash");

export function toTitleCase(word : string): string {
    return _.startCase(_.camelCase(word));
}