"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * create by WangCheng on 2020/5/6 16:04
 */
var math;
(function (math) {
    function clamp(value, min, max) {
        if (max < min) {
            var t = max;
            max = min;
            min = t;
        }
        return value < min ? min : value > max ? max : value;
    }
    math.clamp = clamp;
    function clamp01(value) {
        return clamp(value, 0, 1);
    }
    math.clamp01 = clamp01;
    function floor(n, digits) {
        if (digits === void 0) { digits = 0; }
        var base = pow10(digits);
        return Math.floor(n * base) / base;
    }
    math.floor = floor;
    function ceil(n, digits) {
        if (digits === void 0) { digits = 0; }
        var base = pow10(digits);
        return Math.ceil(n * base) / base;
    }
    math.ceil = ceil;
    function round(n, digits) {
        if (digits === void 0) { digits = 0; }
        var base = Math.pow(10, digits);
        return Math.round(n * base) / base;
    }
    math.round = round;
    //十进制倍数 ... 0.1，1，10，100....
    var _decimals = {};
    function pow10(exp) {
        if (_decimals[exp] == void 0) {
            _decimals[exp] = Math.pow(10, exp);
        }
        return _decimals[exp];
    }
    math.pow10 = pow10;
    function randomInt(min, max) {
        return min + Math.floor(Math.random() * (max - min));
    }
    math.randomInt = randomInt;
    function randomFloat(min, max, digits) {
        if (digits === void 0) { digits = 2; }
        return round(min + Math.random() * (max - min), digits);
    }
    math.randomFloat = randomFloat;
})(math || (math = {}));
exports.default = math;
