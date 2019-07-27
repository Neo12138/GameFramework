/**
 * Created by admin on 2018/12/21.
 */
namespace zero {
    export let enableLog: boolean = true;
    export function log(message?: string, ...args: any[]): void {
        if (zero.enableLog) console.log(`${utils.getTimestamp()} [LOG] ${message}`, ...args);
    }

    export function warn(message?: string, ...args: any[]): void {
        if (zero.enableLog) console.warn(`${utils.getTimestamp()} [WARN] ${message}`, ...args);
    }

    export function error(message?: string, ...args: any[]): void {
        if (zero.enableLog) console.error(`${utils.getTimestamp()} [ERROR] ${message}`, ...args);
    }

    export function info(message?: string, ...args: any[]): void {
        if (zero.enableLog) console.info(`${utils.getTimestamp()} [INFO] ${message}`, ...args);
    }

    export function debug(message?: string, ...args: any[]): void {
        if (zero.enableLog) console.debug(`${utils.getTimestamp()} [DEBUG] ${message}`, ...args);
    }

    export function trace(message?: string, ...args: any[]): void {
        if (zero.enableLog) console.trace(`${utils.getTimestamp()} [TRACE] ${message}`, ...args);
    }


}