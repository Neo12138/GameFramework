/**
 * create by WangCheng on 2019/9/6 12:26
 */
type Point = {x:number, y:number}
type Rect = {x:number, y:number, width:number, height:number}
namespace RandomMgr {
    /**
     * 返回随机正整数 左闭区间
     * @param {number} start
     * @param {number} end
     * @returns {number}
     */
    export function randomInt(start: number, end: number): number {
        return start + Math.floor((end - start) * Math.random());
    }

    /**
     * 返回随机数值 左闭区间
     * @param {number} start
     * @param {number} end
     * @param digit 保留位数
     * @returns {number}
     */
    export function randomFloat(start: number = 0, end: number = 1, digit?: number): number {
        let f = start + (end - start) * Math.random();
        if (digit > 0) {
            f = parseFloat(f.toFixed(digit));
        }
        return f;
    }

    /**
     * 返回随机真值
     * @param probability 返回真值的概率 默认0.5
     */
    export function randomTrue(probability: number = 0.5): boolean {
        return Math.random() < probability;
    }


    /**
     * 从数组中随机一个值
     * @param arr
     */
    export function randomFromArray<T>(arr: T[]): T {
        if (!arr || arr.length == 0) return null;
        let len = arr.length;
        if (len == 1) return arr[0];
        let i = randomInt(0, arr.length);
        return arr[i];
    }


    export function randomDestination(minR: number, maxR: number, radian?: number): Point {
        if (radian == void 0) radian = Math.random() * Math.PI *2;
        let r = randomInt(minR, maxR);
        return {
            x: r * Math.cos(radian),
            y: r * Math.sin(radian)
        }
    }

    export function randomPointInEllipse(bound: Rect): Point {
        let radian = Math.random() * Math.PI *2;
        let rate = Math.random() * 0.8;
        let a = bound.width / 2;
        let b = bound.height / 2;

        return {
            x: rate * a * Math.cos(radian) + bound.x + a,
            y: rate * b * Math.sin(radian) + bound.y + b,
        }
    }

    export function randomPointInEllipses(...bounds: Rect[]): Point {
        let bound = randomFromArray(bounds);
        return randomPointInEllipse(bound);
    }
}

export default RandomMgr;

