/**
 * created by wangcheng at 2019/8/3 11:12
 */
namespace logger {
    export const C_RED = "#FF0000";
    export const C_ORANGE = "#FF7711";
    export const C_YELLOW = "#fbd239";
    export const C_GREEN = "#30c14b";
    export const C_CYAN = "#009bd4";
    export const C_BLUE = "#0000FF";
    export const C_PURPLE = "#a100d1";
    export const C_BLACK = "#3e3e3e";

    function paddingTime(num: number): string {
        return num < 10 ? "0" + num : "" + num;
    }

    function getTimestamp(time: Date = new Date()): string {
        // let Y = time.getFullYear();
        // let M = time.getMonth() + 1;
        // let D = time.getDate();

        let h = time.getHours();
        let m = time.getMinutes();
        let s = time.getSeconds();
        let ms = time.getMilliseconds();

        return `${paddingTime(h)}:${paddingTime(m)}:${paddingTime(s)}.${ms}`;
    }

    const preColors = [
        C_RED,
        C_ORANGE,
        C_YELLOW,
        C_GREEN,
        C_CYAN,
        C_BLUE,
        C_PURPLE,
        C_BLACK
    ];
    let colorIndex: number = 0;

    let tagColorMap: { [tag: string]: string } = {};

    function getTagColor(tag: string): string {
        let color = tagColorMap[tag];
        if (!color) {
            color = preColors[colorIndex++];
            tagColorMap[tag] = color;
            if (colorIndex == preColors.length) colorIndex = 0;
        }
        return "color:#fff;background:" + color;
    }

    export function setTagColor(tag: string, color: string): void {
        if (!tagColorMap[tag]) {
            tagColorMap[tag] = color;
        }
    }

    //是否开启日志
    export let enableLog: boolean = true;

    /**
     * 带颜色的log
     * @param tag
     * @param args
     */
    export function colorfulLog(tag: string, ...args: any[]) {
        enableLog && console.log(`${getTimestamp()} %c[${tag}]`, getTagColor(tag), ...args);
    }

    /**
     * 不受开关控制的带颜色的log
     * @param color
     * @param tag
     * @param args
     */
    export function colorfulLOG(tag: string, ...args: any[]) {
        enableLog && console.log(`${getTimestamp()} %c[${tag}]`, getTagColor(tag), ...args);
    }

    export function info(message?: any, ...args: any[]) {
        enableLog && console.info(`${getTimestamp()} [I] ${message}`, ...args);
    }

    export function warn(message?: string, ...args: any[]): void {
        enableLog && console.warn(`${getTimestamp()} [W] ${message}`, ...args);
    }

    export function error(message?: string, ...args: any[]): void {
        enableLog && console.error(`${getTimestamp()} [E] ${message}`, ...args);
    }

    export function debug(message?: string, ...args: any[]): void {
        enableLog && console.debug(`${getTimestamp()} [D] ${message}`, ...args);
    }

    export function trace(message?: string, ...args: any[]): void {
        enableLog && console.trace(`${getTimestamp()} [T] ${message}`, ...args);
    }
}

export default logger;

