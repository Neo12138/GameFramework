/**
 * create by wangcheng on 2019/8/10 15:48
 */
import utils from "./utils";

export default class Vector {
    public  static readonly ZERO = new Vector(0,0);

    private _x: number;
    private _y: number;
    private _magnitude: number;
    private _magnitudeChanged: boolean;

    public constructor(x?: number, y?: number) {
        this._x = x || 0;
        this._y = y || 0;
        this._magnitudeChanged = true;
    }


    public set x(value: number) {
        if (this._x == value) return;
        this._x = value;
        this._magnitudeChanged = true;
    }

    public get x() {
        return this._x;
    }

    public set y(value: number) {
        if (this._y == value) return;
        this._y = value;
        this._magnitudeChanged = true;
    }

    public get y() {
        return this._y;
    }

    public get magnitude() {
        if (this._magnitudeChanged) {
            this._magnitude = Math.sqrt(Math.pow(this._x, 2) + Math.pow(this._y, 2));
            this._magnitudeChanged = false;
        }
        return this._magnitude;
    }

    /**
     * 两向量点乘运算得到内积(点积)
     * 一个向量在平行于另一个向量的方向上的投影的数值乘积
     * m(v1) * m(v2) * cos
     * @param vector
     */
    public dot(vector: Vector): number {
        return this._x * vector._x + this._y * vector._y;
    }

    /**
     * 叉乘本应得到的是向量，但是2维向量的的叉乘结果位于z轴，因此直接返回结果向量的z坐标
     * (x1, y1, 0) x (x2, y2, 0) = (0, 0, x1y2 - x2y1)
     * @param vector
     */
    public cross(vector: Vector): number {
        return this._x * vector._y - vector._x * this._y;
    }

    public add(vector: Vector): Vector {
        this.x += vector._x;
        this.y += vector._y;
        return this;
    }

    public subtract(vector: Vector): Vector {
        this.x -= vector._x;
        this.y -= vector._y;
        return this;
    }

    /**
     * 获取两个向量顶点构成的边的向量(由两向量相减得到)
     * @param vector
     */
    public edge(vector: Vector): Vector {
        return this.subtract(vector);
    }

    /**
     * 获取此向量的法向量(与此向量垂直的单位向量)
     */
    public normal(): Vector {
        return new Vector(this._y, -this._x).normalize();
    }

    /**
     * 获取此向量的单位向量(向量的模为1)
     * 一个非零向量除以它的模即可得到单位向量
     */
    public normalize(): Vector {
        let m = this.magnitude;
        let v = new Vector();
        if (m !== 0) {
            v._x = this._x / m;
            v._y = this._y / m;
        }
        return v;
    }
}

utils.defineGlobalProperty("Vector", Vector, true);