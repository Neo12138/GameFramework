/**
 * created by wangcheng at 2019/8/3 11:10
 */
import MD5 from "./MD5";
type Point = {x:number, y:number}
type Rect = {x:number, y:number, width:number, height:number}
namespace utils
{
    const _W = 0x738b;
    const _C = 0x6210;
    const _T = 0xc;
    /**
     * 是否开启调试模式，开启后可以通过<code>defineGlobalProperty</code>将属性定义到<code>window</code>
     */
    export let debugMode: boolean = false;

    /**
     * 定义全局变量，主要用于调试
     * 只有<code>debugMode</code>开启时生效
     * @param key
     * @param value
     * @param force 是否强制将属性绑定到全局对象上
     */
    export function defineGlobalProperty(key: string, value: any, force: boolean = false): void
    {
        if (force || debugMode)
        {
            window[key] = value;
        }
    }

    /**
     * 获取文件后缀名
     * @param url
     */
    export function suffixOf(url: string): string
    {
        if (!url) return "";
        let index = url.lastIndexOf(".");
        return url.substr(index + 1);
    }

    let objectCount = 1;

    export function injectHashCode(obj: object): void
    {
        if (!obj) return;

        if (obj['hashCode'] == void 0)
        {
            obj['hashCode'] = objectCount++;
        }
    }

    export async function tween(target: any, props: any, duration: number, ease?: Function)
    {
        if (!target) return;
        Laya.Tween.clearAll(target);
        return new Promise(resolve =>
        {
            Laya.Tween.to(target, props, duration, ease, Laya.Handler.create(this, resolve));
        })
    }


    export function clamp(value: number, min: number, max: number): number
    {
        if (min > max)
        {
            let t = min;
            min = max;
            max = t;
        }
        return value < min ? min : value > max ? max : value;
    }

    /**
     * 将value固定在0~1内
     * @param value
     */
    export function clamp01(value: number): number
    {
        return utils.clamp(value, 0, 1);
    }

    export function approach(current: number, target: number, step: number): number
    {
        let temp = current + step;
        if (step >= 0)
        {
            return temp > target ? target : temp;
        }
        if (step < 0)
        {
            return temp < target ? target : temp;
        }
    }


    /**
     * 当前点是否到达目标点
     * @param current
     * @param target
     * @param precision
     */
    export function reach(current: Point, target: Point, precision: number = 1): boolean
    {
        return Math.abs(current.x - target.x) <= precision && Math.abs(current.y - target.y) < precision;
    }


    export function arrayEqual<T>(a1: T[], a2: T[]): boolean
    {
        if (!a1 || !a2) return false;
        if (a1.length != a2.length) return false;
        for (let i = 0, len = a1.length; i < len; i++)
        {
            if (a1[i] != a2[i]) return false;
        }
        return true;
    }

    export function arrayConcat(p1: any[], p2: any[]): any[]
    {
        let a = [];

        if (p1 && p1.length)
        {
            a = a.concat(p1);
        }
        if (p2 && p2.length)
        {
            a = a.concat(p2);
        }
        return a;
    }

    export function arrayDelete<T>(arr: T[], e: T): T[]
    {
        if (!arr || !arr.length) return arr;
        let i = arr.indexOf(e);
        if (i == -1) return arr;
        arr.splice(i, 1);
        return arr;
    }

    /**
     * 指定一个数，从数组中找到小于等于这个数的 最大数的索引
     * 要求数组从小到大排列
     * @param arr
     * @param e
     */
    export function maxOverIndex<T>(arr: T[], e: T): number
    {
        if (!arr || !arr.length) return -1;
        for (let i = arr.length - 1; i >= 0; i--)
        {
            if (e >= arr[i]) return i;
        }
        return -1;
    }

    export function arrayToMap<T>(arr: T[], key: keyof T): { [id: string]: T }
    {
        let map: any = {};

        arr.forEach(v =>
        {
            let id = v[key];
            map[id] = v;
        });
        return map;
    }

    /**
     * 函数节流
     * 使函数在一段时间内只执行一次
     * @param caller
     * @param method 被节流的函数
     * @param duration 函数执行的最小间隔时间(单位：ms) 默认值：1000
     * @returns 被节流后的包装函数
     */
    export function throttle(caller: any, method: (...args: any[]) => void, duration: number = 1000): (...args: any[]) => void
    {
        let begin: number;
        //不能改成箭头函数
        return function (...args: any[])
        {
            let current = Date.now();
            if (begin == void 0 || current - begin >= duration)
            {
                method.apply(caller, args);
                begin = current;
            }
        }
    }

    export function throttleButton(btn: Laya.Sprite, duration: number = 1000): void
    {
        btn.mouseEnabled = false;
        btn.mouseThrough = true;
        Laya.timer.once(duration, this, () =>
        {
            btn.mouseEnabled = true;
            btn.mouseThrough = false;
        });
    }

    /**
     * 返回字符串的签名
     * @param value
     */
    export function sign(value: string): string
    {
        value = "" + value;
        let a = (_W - 0x20a2 ^ 0x52e9) * (0x9f82 - _C ^ 0x3d72);
        let c = a > _T ? a : a + _T;

        let k = String.fromCharCode(c);
        let v = k + value + k;
        v = v.trim();

        let sign = new MD5().hex_md5(v);
        return sign
    }

    /**
     * 求两点间距离
     * @param p1
     * @param p2
     */
    export function distanceOf(p1: Point, p2: Point): number
    {
        let diffX = p1.x - p2.x;
        let diffY = p1.y - p2.y;
        return Math.sqrt(diffX * diffX + diffY * diffY);
    }

    /**
     * 判断某点是否在矩形范围内
     * @param rect
     * @param point
     */
    export function containPoint(rect: Rect, point: Point): boolean
    {
        return !(point.x < rect.x || point.y < rect.y || point.x > rect.x + rect.width || point.y > rect.y + rect.height);
    }

    /**
     * 判断都点是否在矩形的内接椭圆内
     * @param bound
     * @param point
     */
    export function ellipseContainPoint(bound: Rect, point: Point): boolean
    {
        let a = bound.width / 2;
        let b = bound.height / 2;
        let x = point.x - a;
        let y = point.y - b;

        return x * x / (a * a) + y * y / (b * b) <= 1;
    }

    export function complexEllipseContainPoint(point: Point, ...bounds: Rect[]): boolean
    {
        let p = {x: 0, y: 0};

        for (let bound of bounds)
        {
            p.x = point.x - bound.x;
            p.y = point.y - bound.y;
            if (ellipseContainPoint(bound, p)) return true;
        }
        return false;
    }

    /**
     * 将世界坐标转换为局部坐标（并不完全准确）
     * 只是转换到父容器那一层的坐标，多层UI嵌套时可能不准确
     * @param parent 父容器
     * @param globalPos 位置坐标
     * @returns {{x: number, y: number}}
     */
    export function globalToLocal(parent: Point, globalPos: Point): Point
    {
        if (!parent) return globalPos;
        return {
            x: globalPos.x - parent.x,
            y: globalPos.y - parent.y
        };
    }

    /**
     * 将局部坐标转换为世界坐标（并不完全准确）
     * 多层UI嵌套时可能不准确
     * @param parent 父容器
     * @param localPos 位置坐标
     * @returns {any}
     */
    export function localToGlobal(parent: Point, localPos: Point): Point
    {
        if (!parent) return localPos;
        return {
            x: localPos.x + parent.x,
            y: localPos.y + parent.y
        }
    }


    /*************************************字符串***************************************/
    /**
     * 返回字符串的真实长度，（一个中文算2个字符单位）
     * @param str
     * @returns {number}
     */
    export function stringRealLength(str: string): number
    {
        if (!str) return 0;
        return str.replace(/[^\x00-\xff]/g, "01").length;
    }

    /**
     * 截取字符串的前几位（中文按两个字符算） 稍微有点误差
     * @param {string} str
     * @param {number} length 字符长度（中文一个字占2字符长度）
     */
    export function stringSlice(str: string, length: number): string
    {
        if (!str) return '';
        let chars = str.split('');
        //长度小于限定的长度，直接返回
        if (utils.stringRealLength(str) <= length) return str;

        //超过限定的长度，截取
        let count = 0, i;
        for (i = 0; i < chars.length && count < length; i++)
        {
            if (chars[i].search(/[\x00-\xff]/) == -1)
            {
                count += 2;
            }
            else
            {
                count++;
            }
        }
        return str.substring(0, i) + "...";
    }


    export async function wait(milliseconds: number)
    {
        return new Promise(resolve =>
        {
            Laya.timer.once(milliseconds, null, resolve);
        })
    }

    /**
     * 对promise进行异常捕获
     * 并将promise的运行结果 转换成 异常优先的结果数组
     * @param promise 原始的promise对象
     * @returns [err, result] 异常优先的结果数组
     */
    export async function catchify<E, T>(promise: Promise<T>): Promise<[E, T]>
    {
        try
        {
            const data = await promise;
            return [null, data];
        }
        catch (error)
        {
            return [error, null];
        }
    }

    /**
     * 根据权重获取对应的值，值数组和权重数组一一对应
     * 例如: values = [1,2,3,4,5]
     *       weight = [10,10,20,20,40]
     *       则0.1的概率范围1，0.2的概率返回3， 0.4的概率返回5
     * @param values 值数组
     * @param weights 权重数组
     */
    export function getValueByWeight<T>(values: T[], weights: number[]): T
    {
        let sum = weights.reduce((prev, cur) => prev + cur, 0);
        let rand = this.randomInt(0, sum);
        let min = 0;
        for (let i = 0, len = weights.length; i < len; i++)
        {
            let weight = weights[i];
            let max = weight + min;
            if (rand >= min && rand < max) return values[i];
            min = max;
        }
    }

    /**
     * 从values数组中找到小于等于value的最大值的索引（或者说要从values数组中找到value对应的档位）。
     * 然后根据这个索引，返回ranges数组中的值
     * values 和 ranges 一一对应
     * 例如 values = [0,10,20,30,40]
     *      ranges = [3, 6, 9, 12, 15]
     *  当 value = 3时，从values中找到的索引为0，即返回ranges[0] = 3;
     *  当 value = 41时，从values中找到的索引为4，即返回range[4] = 15;
     * @param value
     * @param values
     * @param ranges
     */
    export function getValueByRange(value, values: number[], ranges: number[]): number
    {
        for (let i = values.length - 1; i > 0; i--)
        {
            if (value >= values[i]) return ranges[i];
        }
        return ranges[0];
    }

    /**
     * 判断前一个版本是否大于后一个版本
     * @param v1 前一个版本
     * @param v2 后一个版本
     * @returns {number} 大于返回1，小于返回-1，相等返回0
     */
    export function compareVersion(v1: string, v2: string): number
    {
        let vs1 = v1.split(".");
        let vs2 = v2.split(".");
        let len = Math.max(vs1.length, vs2.length);

        for (let i = 0; i < len; i++)
        {
            let n1 = +vs1[i] || 0;
            let n2 = +vs2[i] || 0;
            if (n1 > n2)
            {
                return 1;
            }
            else if (n1 < n2) return -1;
        }

        return 0;
    }
}

export default utils;
utils.defineGlobalProperty('utils', utils, true);
