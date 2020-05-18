/**
 * create by WangCheng on 2020/5/6 16:04
 */
namespace math
{
    export function clamp(value: number, min: number, max: number): number
    {
        if (max < min)
        {
            let t = max;
            max = min;
            min = t;
        }
        return value < min ? min : value > max ? max : value;
    }

    export function clamp01(value: number): number
    {
        return clamp(value, 0, 1);
    }

    export function floor(n: number, digits: number = 0): number
    {
        let base = pow10(digits);
        return Math.floor(n * base) / base;
    }

    export function ceil(n: number, digits: number = 0): number
    {
        let base = pow10(digits);
        return Math.ceil(n * base) / base;
    }

    export function round(n: number, digits: number = 0): number
    {
        let base = Math.pow(10, digits);
        return Math.round(n * base) / base;
    }

    //十进制倍数 ... 0.1，1，10，100....
    const _decimals: { [k: number]: number } = {};

    export function pow10(exp: number): number
    {
        if (_decimals[exp] == void 0)
        {
            _decimals[exp] = Math.pow(10, exp);
        }
        return _decimals[exp];
    }

    export function randomInt(min:number, max:number):number
    {
        return min + Math.floor(Math.random() * (max - min));
    }
    export function randomFloat(min:number, max:number, digits:number = 2):number {
        return round(min + Math.random() * (max - min), digits);
    }

    export const Deg2Rad = Math.PI / 180;
    export const Rad2Deg = 180 / Math.PI;

    export function radian<T>(degree: T): T
    {
        if (typeof degree == "number")
        {
            return <T><any>(math.Deg2Rad * degree);
        }
    }

    export function degree<T>(radian: T): T
    {
        if (typeof radian == "number")
        {
            return <T><any>(math.Rad2Deg * radian);
        }
    }

    /**
     * 返回值x从[a1,a2]范围到[b1,b2]范围的线性映射
     * @param x
     * @param a1
     * @param a2
     * @param b1
     * @param b2
     */
    export function mapLinear(x:number, a1:number,a2:number,b1:number,b2:number):number {
        return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
    }
}
export default math;