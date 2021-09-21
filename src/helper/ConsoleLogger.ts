import 'colorts/lib/string';

export function logError (message:string) {
    console.log(getTimeStamp(), message.red)
};

export function logSuccess(message:string) {
    console.log(getTimeStamp(), message.green)
};

export function logRegular(message:string) {
    console.log(getTimeStamp(), message.white)
};

export function logEmpty() { console.log('') }

function getTimeStamp() {
    const date = new Date()
    return `[${date.toISOString()}]`.grey
}