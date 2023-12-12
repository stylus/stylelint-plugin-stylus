"use strict"

module.exports = { optionsMatches, isString, isRegExp, isNumber, isBoolean }

/**
 * Checks if the value is a string or a String object.
 * @param {unknown} value
 * @returns {value is string}
 */
function isString(value) {
    return typeof value === "string"
}

/**
 * Checks if the value is a number or a Number object.
 * @param {unknown} value
 * @returns {value is number}
 */
function isNumber(value) {
    return typeof value === "number"
}

/**
 * Checks if the value is a boolean or a Boolean object.
 * @param {unknown} value
 * @returns {value is boolean}
 */
function isBoolean(value) {
    return typeof value === "boolean"
}

/**
 * Checks if the value is a regular expression.
 * @param {unknown} value
 * @returns {value is RegExp}
 */
function isRegExp(value) {
    return value instanceof RegExp
}

/**
 * Check if an options object's propertyName contains a user-defined string or
 * regex that matches the passed in input.
 *
 * @param {{ [x: string]: any; }} options
 * @param {string} propertyName
 * @param {unknown} input
 *
 * @returns {boolean}
 */
function optionsMatches(options, propertyName, input) {
    return Boolean(
        options &&
            options[propertyName] &&
            typeof input === "string" &&
            matchesStringOrRegExp(input, options[propertyName]),
    )
}

/**
 * Compares a string to a second value that, if it fits a certain convention,
 * is converted to a regular expression before the comparison.
 * If it doesn't fit the convention, then two strings are compared.
 *
 * Any strings starting and ending with `/` are interpreted
 * as regular expressions.
 *
 * @param {string | Array<string>} input
 * @param {string | RegExp | Array<string | RegExp>} comparison
 *
 * @returns {false | {match: string, pattern: (string | RegExp), substring: string}}
 */
function matchesStringOrRegExp(input, comparison) {
    if (!Array.isArray(input)) {
        return testAgainstStringOrRegExpOrArray(input, comparison)
    }

    for (const inputItem of input) {
        const testResult = testAgainstStringOrRegExpOrArray(
            inputItem,
            comparison,
        )

        if (testResult) {
            return testResult
        }
    }

    return false
}

/**
 * @param {string} value
 * @param {string | RegExp | Array<string | RegExp>} comparison
 */
function testAgainstStringOrRegExpOrArray(value, comparison) {
    if (!Array.isArray(comparison)) {
        return testAgainstStringOrRegExp(value, comparison)
    }

    for (const comparisonItem of comparison) {
        const testResult = testAgainstStringOrRegExp(value, comparisonItem)

        if (testResult) {
            return testResult
        }
    }

    return false
}

/**
 * @param {string} value
 * @param {string | RegExp} comparison
 */
function testAgainstStringOrRegExp(value, comparison) {
    // If it's a RegExp, test directly
    if (comparison instanceof RegExp) {
        const match = comparison.exec(value)

        return match
            ? { match: value, pattern: comparison, substring: match[0] || "" }
            : false
    }

    // Check if it's RegExp in a string
    const firstComparisonChar = comparison[0]
    const lastComparisonChar = comparison[comparison.length - 1]
    const secondToLastComparisonChar = comparison[comparison.length - 2]

    const comparisonIsRegex =
        firstComparisonChar === "/" &&
        (lastComparisonChar === "/" ||
            (secondToLastComparisonChar === "/" && lastComparisonChar === "i"))

    const hasCaseInsensitiveFlag =
        comparisonIsRegex && lastComparisonChar === "i"

    // If so, create a new RegExp from it
    if (comparisonIsRegex) {
        const valueMatch = hasCaseInsensitiveFlag
            ? new RegExp(comparison.slice(1, -2), "i").exec(value)
            : new RegExp(comparison.slice(1, -1)).exec(value)

        return valueMatch
            ? {
                  match: value,
                  pattern: comparison,
                  substring: valueMatch[0] || "",
              }
            : false
    }

    // Otherwise, it's a string. Do a strict comparison
    return value === comparison
        ? { match: value, pattern: comparison, substring: value }
        : false
}
