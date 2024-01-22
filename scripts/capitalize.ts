const _ = require("lodash");

export function toHigherCase(word : string): string {
    return _.startCase(_.camelCase(word));
}