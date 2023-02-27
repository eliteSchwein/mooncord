const fs = require('fs');
const path = require('path');

const localeDir = '../../locales/'
const args = process.argv.slice(2)
const targetLocaleName = args[0]
const sourceLocaleRaw = fs.readFileSync(path.resolve(__dirname, `${localeDir}en.json`)).toString()
const sourceLocale = JSON.parse(sourceLocaleRaw)
let targetLocale = {}

if (fs.existsSync(path.resolve(__dirname, `${localeDir}${targetLocaleName}.json`))) {
    const targetLocaleRaw = fs.readFileSync(path.resolve(__dirname, `${localeDir}${targetLocaleName}.json`)).toString()
    targetLocale = JSON.parse(targetLocaleRaw)
}

mergeDeep(sourceLocale, targetLocale)

fs.writeFileSync(path.resolve(__dirname, `${localeDir}${targetLocaleName}.json`), JSON.stringify(sourceLocale, null, 4))

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeep(target, ...sources) {
    if (!sources.length) {
        return target;
    }
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, {[key]: {}});
                }
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, {[key]: source[key]});
            }
        }
    }

    return mergeDeep(target, ...sources);
}