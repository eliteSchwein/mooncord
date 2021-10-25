export function formatPercent(percent, digits) {
    return (percent*100).toFixed(digits)
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}