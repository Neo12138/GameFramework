/**
 * Created by admin on 2018/12/21.
 */
namespace zero.utils {
    export function getTimestamp(time: Date = new Date()): string {
        // let Y = time.getFullYear();
        // let M = time.getMonth() + 1;
        // let D = time.getDate();

        let h = time.getHours();
        let m = time.getMinutes();
        let s = time.getSeconds();
        let ms = time.getMilliseconds();

        return `${paddingTime(h)}:${paddingTime(m)}:${paddingTime(s)}.${ms}`;
    }

    export function paddingTime(value: number): string {
        return value < 10 ? '0' + value : '' + value;
    }

    export function paddingLeft(value: number, digits: number = 2): string {
        if (!value) value = 0;
        let len = value.toString().length;
        return Array(digits - len + 1).join('0') + value;
    }

    export function getWeekExpireTime(day: number = 1, today?: Date): number {
        if (!today) today = new Date();

        let y = today.getFullYear();
        let m = today.getMonth();
        let d = today.getDate();
        let w = today.getDay();

        day = day % 7;
        let dist = w - day;
        dist = day > w ? dist + 7 : dist;
        let todayTime = new Date(y, m, d).getTime();    //今天0点的时间戳

        return todayTime - 86400000 * dist;
    }

    export function testGetWeekDay(day: number, today: Date): void {
        let timestamp = utils.getWeekExpireTime(day, today);
        zero.log('expire at', utils.getTimestamp(new Date(timestamp)))
    }

    export function clamp(value: number, min: number, max: number): number {
        if (min > max) {
            let t = min;
            min = max;
            max = t;
        }
        return value < min ? min : value > max ? max : value;
    }

    /**
     * 获取文件的格式后缀
     * @param url
     */
    export function suffixOf(url: string): string {
        let indexDot = url.lastIndexOf(".");
        return url.substr(indexDot + 1);
    }

    /**
     * 将标识符转成 下划线格式
     * ClassName => class_name | CLASS_NAME
     * className => class_name | CLASS_NAME
     * 注意：Class_NAME => class__n_a_m_e
     * @param identifier
     * @param upper 是否全大写
     */
    export function identifierUnderLine(identifier: string, upper: boolean = false): string {
        let ret = identifier.replace(/([A-Z])/g, "_$1");
        ret = ret[0] == "_" ? ret.substr(1) : ret;
        return upper ? ret.toUpperCase() : ret.toLowerCase();
    }

    /**
     * 将标识符转成 驼峰格式
     * 注意：className => classname
     * class_name => className | ClassName
     * @param identifier
     * @param firstUpper
     */
    export function identifierCamel(identifier: string, firstUpper: boolean = false): string {
        let ret = identifier.toLowerCase();
        ret = ret.replace(/_([\w+])/g, (all, char) => char.toUpperCase());
        if (firstUpper) {
            ret = ret.replace(/\b(\w)(\w*)/g, ($0, $1, $2) => $1.toUpperCase() + $2);
        }
        return ret;
    }
}