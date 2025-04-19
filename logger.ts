import { appendFile } from 'fs/promises';

function formatDate(date: Date) {
    // Get individual components
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Combine in desired format
    return `${year}${month}${day}`;
}

export class Logger {
    private infoPath: string;
    private dataPath: string;
    constructor() {
        this.infoPath = `outputs/info${formatDate(new Date(Date.now()))}.txt`;
        this.dataPath = `outputs/data${formatDate(new Date(Date.now()))}.jsonl`;
    }

    async logInfo(info: string) {
        await appendFile(this.infoPath, info);
    }

    async logData(data: any) {
        await appendFile(this.dataPath, `${JSON.stringify(data)}\n`);
    }
}