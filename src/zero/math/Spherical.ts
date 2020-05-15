/**
 * create by WangCheng on 2020/5/13 9:44
 */
import math from "./basic";

/**
 * 球坐标系
 */
export default class Spherical
{
    public radius:number;
    /**
     * 垂直方向的角度， 与y轴正方向的夹角
     */
    public phi:number;
    /**
     * 水平角度，投影与z轴正方向的夹角
     */
    public theta:number;

    /**
     * 创建一个球面坐标
     * @param radius 半径
     * @param phi 垂直方向的角度， 与y轴正方向的夹角
     * @param theta 水平角度，投影与z轴正方向的夹角
     */
    public constructor(radius:number = 1, phi:number = 0, theta:number = 0)
    {
        this.set(radius, phi, theta);
    }

    public set(radius:number, phi:number, theta:number) {
        this.radius = radius;
        this.phi = phi;
        this.theta = theta;
    }
    public clone() {
        return new Spherical().copy(this);
    }
    public copy(other:Spherical):Spherical {
        this.radius = other.radius;
        this.phi = other.phi;
        this.theta = other.theta;
        return this;
    }

    /**
     * 限制 phi处于 EPS到PI-EPS
     */
    public makeSafe() {
        let EPS = 0.000001;
        this.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.phi));
        return this;
    }

    public setFromVector3(v: Laya.Vector3):Spherical {
        return this.setFromCartesianCoords(v.x, v.y, v.z);
    }
    public setFromCartesianCoords(x:number, y:number, z:number): Spherical {
        this.radius = Math.sqrt(x * x + y * y + z * z);
        if(this.radius == 0) {
            this.theta = 0;
            this.phi = 0;
        }
        else {
            this.theta = Math.atan2(x, z);
            this.phi = Math.acos(math.clamp(y/this.radius, -1, 1))
        }
        return this;
    }

    public static setToVector3(s:Spherical, v:Laya.Vector3) {
        let sinPhiRadius = Math.sin(s.phi) * s.radius;

        v.x = sinPhiRadius * Math.sin(s.theta);
        v.y = Math.cos(s.phi) * s.radius;
        v.z = sinPhiRadius * Math.cos(s.theta);

        return v;
    }
}