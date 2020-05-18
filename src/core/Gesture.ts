import Vector from "./utils/Vector";
import utils from "./utils/utils";
import Map from "./utils/Map";

/**
 * create by wangcheng on 2019/8/12 11:16
 */
namespace Gesture {
    let dispatcherMap = new Map<Laya.EventDispatcher, GestureDispatcher>();

    export function get(target: Laya.EventDispatcher): GestureDispatcher {
        let dispatcher = dispatcherMap.get(target);
        if(!dispatcher) {
            dispatcher = new GestureDispatcher(target);
            dispatcherMap.set(target, dispatcher);
        }
        return dispatcher;
    }

    export function removeAllListener(target: Laya.EventDispatcher): void {
        let dispatcher = dispatcherMap.get(target);
        if(dispatcher) {
            dispatcher.offAll();
        }
    }
}


class GestureDispatcher {
    public static PINCH_START: string = "pinch_start";
    public static PINCH: string = "pinch";
    public static PINCH_END: string = "pinch_end";
    public static ROTATE_START: string = "rotate_start";
    public static ROTATE: string = "rotate";
    public static TAP: string = "tap";
    public static LONG_TAP: string = "long_tap";

    private target: Laya.EventDispatcher;

    private callerMap: { [event: string]: any } = {};
    private methodMap: { [event: string]: Function } = {};
    private argsMap: { [event: string]: any[] } = {};

    private pressed: boolean;
    private downVector: Vector;

    private taplike: boolean;
    private longTapTimer: number;
    private down: { x: number, y: number };

    public constructor(target: Laya.EventDispatcher) {
        if (!target) return;
        this.target = target;
        target.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        target.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        target.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        target.on(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
    }

    public on(event: string, caller: any, method: Function, args: any[]): void {
        if (this.methodMap[event]) return;
        this.callerMap[event] = caller;
        this.methodMap[event] = method;
        this.argsMap[event] = args;
    }

    public onPinchStart(caller: any, method: Function, args?: any[]): void {
        this.on(GestureDispatcher.PINCH_START, caller, method, args);
    }

    public onPinch(caller: any, method: Function, args?: any[]): void {
        this.on(GestureDispatcher.PINCH, caller, method, args)
    }

    public onPinchEnd(caller: any, method: Function, args?: any[]): void {
        this.on(GestureDispatcher.PINCH_END, caller, method, args);
    }

    public onRotateStart(caller: any, method: Function, args?: any[]): void {
        this.on(GestureDispatcher.ROTATE_START, caller, method, args)
    }

    public onRotate(caller: any, method: Function, args?: any[]): void {
        this.on(GestureDispatcher.ROTATE, caller, method, args)
    }

    public onTap(caller: any, method: Function, args?: any[]): void {
        this.on(GestureDispatcher.TAP, caller, method, args);
    }

    public onLongTap(caller: any, method: Function, args?: any[]): void {
        this.on(GestureDispatcher.LONG_TAP, caller, method, args);
    }

    public off(event:string):void {
        if(!this.methodMap[event]) return;
        delete this.callerMap[event];
        delete this.methodMap[event];
        delete this.argsMap[event];
    }

    public offAll():void {
        this.off(GestureDispatcher.PINCH_START);
        this.off(GestureDispatcher.PINCH_END);
        this.off(GestureDispatcher.PINCH);
        this.off(GestureDispatcher.ROTATE_START);
        this.off(GestureDispatcher.ROTATE);
        this.off(GestureDispatcher.TAP);
        this.off(GestureDispatcher.LONG_TAP);

        let target = this.target;
        target.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        target.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        target.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        target.off(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
        this.target = null;
    }

    private trigger(event: string, ...args: any[]): void {
        let fnEvent = this.methodMap[event];
        if (fnEvent) {

            let params = utils.arrayConcat(this.argsMap[event], args);
            fnEvent.call(this.callerMap[event], ...params);
        }
    }

    private hasListener(event: string): boolean {
        return !!this.methodMap[event];
    }

    private onMouseDown(e: Laya.Event): void {
        this.pressed = true;
        this.taplike = true;
        this.down = {x: e.stageX, y: e.stageY};

        if (this.hasListener(GestureDispatcher.LONG_TAP)) {
            if ((!e.touches || (e.touches && e.touches.length <= 1))) {
                this.longTapTimer = setTimeout(() => {
                    this.trigger(GestureDispatcher.LONG_TAP, e);
                    this.taplike = false;
                }, 750);
            }
        }

        if (!e.touches || e.touches.length < 2) return;
        this.taplike = false;

        this.trigger(GestureDispatcher.PINCH_START);
        this.trigger(GestureDispatcher.ROTATE_START);
        let distX = e.touches[1].stageX - e.touches[0].stageX;
        let distY = e.touches[1].stageY - e.touches[0].stageY;

        this.downVector = new Vector(distX, distY);
    }

    private lastDistance = 0;
    private onMouseMove(e: Laya.Event): void {
        if (!this.pressed) return;

        if (this.touchMoved(this.down, {x: e.stageX, y: e.stageY})) {
            clearTimeout(this.longTapTimer);
        }

        if (!e.touches || e.touches.length < 2 || !this.downVector) return;
        this.taplike = false;
        clearTimeout(this.longTapTimer);

        let hasPinchListener = this.hasListener(GestureDispatcher.PINCH);
        let hasRotateListener = this.hasListener(GestureDispatcher.ROTATE);
        if (!hasPinchListener && !hasRotateListener) return;

        let distX = e.touches[1].stageX - e.touches[0].stageX;
        let distY = e.touches[1].stageY - e.touches[0].stageY;

        //判断上帧的两指距离是否小于这帧的距离，得出是放大还是缩小
        let distance = Math.sqrt(distX * distX + distY * distY);
        let big = true;
        if(this.lastDistance != 0){
            if(distance < this.lastDistance){
                big = false;
            }
        }
        this.lastDistance = distance;

        let curVector = new Vector(distX, distY);

        let mag1 = this.downVector.magnitude;
        let mag2 = curVector.magnitude;

        //如果有 捏事件 的监听 则执行以下计算
        if (hasPinchListener) {
            let scale = mag2 / mag1;
            this.trigger(GestureDispatcher.PINCH, scale, big);
        }

        //如果有 旋转事件 的监听 则执行以下计算
        if (hasRotateListener) {
            let angle = Math.acos(this.downVector.dot(curVector) / (mag1 * mag2)) / Math.PI * 180;
            let cross = this.downVector.cross(curVector);
            angle *= cross > 0 ? 1 : -1;
            this.trigger(GestureDispatcher.ROTATE, angle || 0);
        }
    }


    private throttledTrigger = utils.throttle(this, this.trigger, 100);

    private onMouseUp(e: Laya.Event): void {
        this.lastDistance = 0;
        this.pressed = false;
        clearTimeout(this.longTapTimer);
        if (!this.down || !this.taplike) return;

        // if(e.touches.length > 1)
        this.trigger(GestureDispatcher.PINCH_END);

        if (!this.touchMoved(this.down, {x: e.stageX, y: e.stageY})) {
            this.throttledTrigger(GestureDispatcher.TAP, e);
        }
    }

    private touchMoved(prePos: { x: number, y: number }, curPos: { x: number, y: number }, precision: number = 20): boolean {
        if (!prePos || !curPos) return true;
        let distX = Math.abs(curPos.x - prePos.x);
        let distY = Math.abs(curPos.y - prePos.y);
        return distX > precision || distY > precision;
    }

}

export default Gesture;