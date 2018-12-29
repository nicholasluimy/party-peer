export default class Utils {
    public static generateRandomSixDigits(): string {
        return Math.random()
            .toString()
            .slice(2, 8);
    }

    public static uuidv4() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            /* tslint:disable-next-line:no-bitwise */
            const r = (Math.random() * 16) | 0;
                /* tslint:disable-next-line:no-bitwise */
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    // Object.values is only available in ES2017
    public static getDictionaryValues(dict: object) {
        const dictVals: any[] = [];
        for (const key in dict) {
            if (dict.hasOwnProperty(key)) {
                // @ts-ignore
                dictVals.push(dict[key]);
            }
        }
        return dictVals;
    }
}
