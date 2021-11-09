import exp from "constants";

export function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

export function removeFromArray(array: any[], value: string|number|object) {
    const index = array.indexOf(value);
    if (index > -1) {
        array.splice(index, 1);
    }
}

export function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

export async function sleep(delay) {
    return await new Promise((r) => setTimeout(r, delay))
}

export function formatPercent(percent, digits) {
    return (percent*100).toFixed(digits)
}

export function stripAnsi(input: string) {
    return input.replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        '')
}