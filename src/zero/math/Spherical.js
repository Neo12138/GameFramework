"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * create by WangCheng on 2020/5/13 9:44
 */
var basic_1 = require("./basic");
/**
 * 球坐标系
 */
var Spherical = /** @class */ (function () {
    /**
     * 创建一个球面坐标
     * @param radius 半径
     * @param phi 垂直方向的角度， 与y轴正方向的夹角
     * @param theta 水平角度，投影与z轴正方向的夹角
     */
    function Spherical(radius, phi, theta) {
        if (radius === void 0) { radius = 1; }
        if (phi === void 0) { phi = 0; }
        if (theta === void 0) { theta = 0; }
        this.set(radius, phi, theta);
    }
    Spherical.prototype.set = function (radius, phi, theta) {
        this.radius = radius;
        this.phi = phi;
        this.theta = theta;
    };
    Spherical.prototype.clone = function () {
        return new Spherical().copy(this);
    };
    Spherical.prototype.copy = function (other) {
        this.radius = other.radius;
        this.phi = other.phi;
        this.theta = other.theta;
        return this;
    };
    //限制 phi处于 EPS到PI-EPS
    Spherical.prototype.makeSafe = function () {
        var EPS = 0.000001;
        this.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.phi));
        return this;
    };
    Spherical.prototype.setFromVector3 = function (v) {
        return this.setFromCartesianCoords(v.x, v.y, v.z);
    };
    Spherical.prototype.setFromCartesianCoords = function (x, y, z) {
        this.radius = Math.sqrt(x * x + y * y + z * z);
        if (this.radius == 0) {
            this.theta = 0;
            this.phi = 0;
        }
        else {
            this.theta = Math.atan2(x, z);
            this.phi = Math.acos(basic_1.default.clamp(y / this.radius, -1, 1));
        }
        return this;
    };
    Spherical.setToVector3 = function (s, v) {
        var sinPhiRadius = Math.sin(s.phi) * s.radius;
        v.x = sinPhiRadius * Math.sin(s.theta);
        v.y = Math.cos(s.phi) * s.radius;
        v.z = sinPhiRadius * Math.cos(s.theta);
        return v;
    };
    return Spherical;
}());
exports.default = Spherical;
