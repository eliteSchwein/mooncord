export function formatPercent(percent, digits) {
    return (percent*100).toFixed(digits)
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function stripAnsi(input: string) {
    return input.replace(
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        '')
}