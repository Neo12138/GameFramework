/**
 * create by wangcheng on 2019/6/26 9:44
 */

namespace utils {
    type Point = {x:number, y:number};
    type Rect = { x: number, y: number, width: number, height: number };

    export class Vector {
        public x: number;
        public y: number;

        public constructor(x?: number, y?: number) {
            this.x = x || 0;
            this.y = y || 0;
        }

        /**
         * 向量的模
         */
        public magnitude(): number {
            return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        }

        /**
         * 两向量点乘运算得到内积(点积)
         * 一个向量在平行于另一个向量的方向上的投影的数值乘积
         * m(v1) * m(v2) * cos
         * @param vector
         */
        public dot(vector: Vector): number {
            return this.x * vector.x + this.y * vector.y;
        }

        public subtract(vector: Vector): Vector {
            return new Vector(this.x - vector.x, this.y - vector.y);
        }

        /**
         * 获取两个向量顶点构成的边的向量(由两向量相减得到)
         * @param vector
         */
        public edge(vector: Vector): Vector {
            return this.subtract(vector);
        }

        /**
         * 获取此向量的法向量(单位向量)
         */
        public normal(): Vector {
            return new Vector(this.y, -this.x).normalize();
        }

        /**
         * 获取此向量的单位向量(向量的模为1)
         * 一个非零向量除以它的模即可得到单位向量
         */
        public normalize(): Vector {
            let m = this.magnitude();
            let v = new Vector();
            if (m !== 0) {
                v.x = this.x / m;
                v.y = this.y / m;
            }
            return v;
        }
    }

    export class Projection {
        public min: number;
        public max: number;

        public constructor(min: number, max: number) {
            this.min = min;
            this.max = max;
        }

        /**
         * 判断两投影是否重叠
         * @param projection
         */
        public overlap(projection: Projection): boolean {
            return this.max > projection.min && this.min < projection.max;
        }
    }

    export class Polygon {
        public points: Point[];

        public constructor(...points: Point[]) {
            this.points = points;
        }

        public setRectangle(rect: Rect): void {
            this.points = getRectangleVertexes(rect);
        }

        /**
         * 获取几何体的所有投影轴
         */
        public getAxes(): Vector[] {
            let axes: Vector[] = [];
            for (let i = 0, len = this.points.length; i < len - 1; i++) {
                let p1 = this.points[i];
                let p2 = this.points[i + 1];

                let v1 = new Vector(p1.x, p1.y);
                let v2 = new Vector(p2.x, p2.y);

                let axis = v1.subtract(v2).normal();
                axes.push(axis);
            }
            return axes;
        }

        public project(axis: Vector): Projection {
            let dotProducts: number[] = [];
            let v = new Vector();

            for (let p of this.points) {
                v.x = p.x;
                v.y = p.y;
                dotProducts.push(v.dot(axis));
            }

            return new Projection(Math.min(...dotProducts), Math.max(...dotProducts))
        }

        public intersectWith(polygon: Polygon): boolean {
            let axes: Vector[];
            let projection1: Projection;
            let projection2: Projection;

            axes = this.getAxes();
            axes = axes.concat(polygon.getAxes());

            for (let axis of axes) {
                projection1 = this.project(axis);
                projection2 = polygon.project(axis);

                if (!projection1.overlap(projection2)) return false;
            }

            return true;
        }
    }

    export function rotate(o:Point, p:Point, angle:number):Point {
        let radian = Math.PI * angle / 180;
        let cos = Math.cos(radian);
        let sin = Math.sin(radian);

        let x = (p.x - o.x) * cos - (p.y - o.y) * sin + o.x;
        let y = (p.x - o.x) * sin + (p.y - o.y) * cos + o.y;

        return {x:x, y:y}
    }

    export function compRotate(angle:number, rect:fairygui.GObject, o?:Point):Point[] {
        if(!o) o = {x: rect.x, y: rect.y};
        let x = rect.x;
        let y = rect.y;
        if(rect.pivotAsAnchor) {
            x = rect.x - rect.pivotX * rect.width;
            y = rect.y - rect.pivotY * rect.height;
        }
        let points = getRectangleVertexes({x:x, y:y, width:rect.width, height:rect.height});

        let ret = [];
        let radian = Math.PI * angle / 180;
        let cos = Math.cos(radian);
        let sin = Math.sin(radian);
        for(let p of points) {
            let x = (p.x - o.x) * cos - (p.y - o.y) * sin + o.x;
            let y = (p.x - o.x) * sin + (p.y - o.y) * cos + o.y;
            ret.push({x:x, y:y});
        }
        return ret;
    }

    function getRectangleVertexes(rect: Rect):Point[] {
        return [
            {x: rect.x, y: rect.y},
            {x: rect.x + rect.width, y: rect.y},
            {x: rect.x + rect.width, y: rect.y + rect.height},
            {x: rect.x, y: rect.y + rect.height},
        ];
    }
}
