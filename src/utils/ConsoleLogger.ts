import 'colorts/lib/string';

export class ConsoleLogger {
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    logError = (message:string) => {
        console.log(this.getTimeStamp(), message.red)
    };
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    logSuccess = (message:string) => {
        console.log(this.getTimeStamp(), message.green)
    };
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    logRegular = (message:string) => {
        console.log(this.getTimeStamp(), message.grey)
    };

    private getTimeStamp() {
        const date = new Date()
        return `[${date.toISOString()}]`.grey
    }
}