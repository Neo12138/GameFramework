/**
 * create by WangCheng on 2020/5/12 20:02
 */
import Spherical from "../math/Spherical";
import math from "../math/basic";
import {Quaternion, Vect2, Vect3} from "../math/LayaPolyfill";
import {MOUSE, TOUCH} from "./constants";

export default class OrbitControls extends Laya.Script3D {
    //设置为false,禁用这个控制器
    public enabled: boolean;
    //设置焦点的位置，即对象围绕其旋转的位置
    public target: Laya.Vector3;
    //设置可以推拉进出多远（仅限透视照相机）
    public minDistance: number = 0;
    public maxDistance: number = Infinity;

    //设置放大缩小的距离（仅限正交摄象机）
    public minZoom: number = 0;
    public maxZoom: number = 0;

    //垂直，上限和下限的角度，范围是0到Math.PI
    public minPolarAngle: number = 0;
    public maxPolarAngle: number = Math.PI;

    //水平，上限和下限的角度，范围是[-Math.PI, Math.PI]
    public minAzimuthAngle: number = -Infinity;
    public maxAzimuthAngle: number = Infinity;

    //设置为true，启用阻尼（惯性）
    public enableDamping: boolean = false;
    //如果启用阻尼，则必须在动画循环中调用controls.update();
    public dampingFactor: number = 0.05;

    //此选项实际上启用了拉入和拉出；左为“缩放”以向后兼容。
    //设置为false可禁用缩放
    public enableZoom: boolean = true;
    public zoomSpeed: number = 1.0;

    //设置false,禁用旋转
    public enableRotate: boolean = true;
    public rotateSpeed: number = 1.0;

    //设置false,禁用摇摄（鼠标右键移动摄象机）
    public enablePan: boolean = true;
    public panSpeed: number = 2.0;
    //如果为true,在屏幕空间中平移
    public screenSpacePanning: boolean = false;
    //每次按下方向键移动的像素
    public keyPanSpeed: number = 7.0;

    //设置true,自动围绕目标旋转。如果启用了，必须在动画循环中调用controls.update()
    public autoRotate: boolean = false;
    //60帧时每分钟转多少圈。 设置为2，且当fps为60时，每圈30s
    public autoRotateSpeed: number = 2.0;

    //设置为false,禁用按键
    public enableKeys = true;

    //4个方向键
    protected keys = {LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40};

    //鼠标按键
    protected mouseButtons = {LEFT: MOUSE.LEFT, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN};
    //手指触摸
    protected touches = {ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN};

    //用于 重置
    private target0: Laya.Vector3;
    private postion0: Laya.Vector3;
    private zoom0: number;

    public static readonly STATE = {
        NONE: -1,
        ROTATE: 0,
        DOLLY: 1,
        PAN: 2,
        TOUCH_ROTATE: 3,
        TOUCH_PAN: 4,
        TOUCH_DOLLY_PAN: 5,
        TOUCH_DOLLY_ROTATE: 6,
    };
    private state: number = OrbitControls.STATE.NONE;

    public static readonly EPS: number = 0.000001;
    // public static readonly changeEvent = {type: "change"};
    // public static readonly startEvent = {type: "start"};
    // public static readonly endEvent = {type: "end"};

    private object: Laya.Camera;
    private trans: Laya.Transform3D;
    private up: Laya.Vector3;

    private spherical = new Spherical();
    private sphericalDelta = new Spherical();

    private scale = 1;
    private panOffset = new Laya.Vector3();
    private zoomChanged = false;

    private rotateStart = new Laya.Vector2();
    private rotateEnd = new Laya.Vector2();
    private rotateDelta = new Laya.Vector2();

    private panStart = new Laya.Vector2();
    private panEnd = new Laya.Vector2();
    private panDelta = new Laya.Vector2();

    private dollyStart = new Laya.Vector2();
    private dollyEnd = new Laya.Vector2();
    private dollyDelta = new Laya.Vector2();

    public onStart(): void {
        this.object = this.owner as Laya.Camera;
        this.trans = this.object.transform;

        this.target = new Laya.Vector3();
        this.target0 = this.target.clone();
        this.postion0 = this.trans.position.clone();
        // this.zoom0 = this.object.

        this.up = new Laya.Vector3();
        this.trans.getUp(this.up);
        this.quat = new Laya.Quaternion();
        Quaternion.setFromUnitVectors(this.up, Laya.Vector3._Up, this.quat);
        this.quatInverse = this.quat.clone();
        this.quatInverse.invert(this.quatInverse);
        this.lastPosition = this.trans.position;
        this.lastQuaternion = this.trans.rotation;

        this.update();
    }

    onEnable(): void {
        this.addEventListener();
    }

    onDisable(): void {
        this.removeEventListener();
    }

    private addEventListener() {
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        Laya.stage.on(Laya.Event.RIGHT_MOUSE_DOWN, this, this.onMouseDown);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
        Laya.stage.on(Laya.Event.RIGHT_MOUSE_UP, this, this.onMouseUp);
        Laya.stage.on(Laya.Event.MOUSE_WHEEL, this, this.onMouseWheel);

        Laya.stage.on(Laya.Event.KEY_DOWN, this, this.onKeyDown);
    }

    private removeEventListener() {
        Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        Laya.stage.off(Laya.Event.RIGHT_MOUSE_DOWN, this, this.onMouseDown);
        Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
        Laya.stage.off(Laya.Event.RIGHT_MOUSE_UP, this, this.onMouseUp);
        Laya.stage.off(Laya.Event.MOUSE_WHEEL, this, this.onMouseWheel);

        Laya.stage.off(Laya.Event.KEY_DOWN, this, this.onKeyDown);
    }

    public onMouseDown(e: Laya.Event): void {
        if (this.enabled === false) return;

        let mouseAction;
        switch (e.nativeEvent.button) {
            case 0:
                mouseAction = this.mouseButtons.LEFT;
                break;
            case 1:
                mouseAction = this.mouseButtons.MIDDLE;
                break;
            case 2:
                mouseAction = this.mouseButtons.RIGHT;
                break;
            default:
                mouseAction = -1;
        }

        switch (mouseAction) {
            case MOUSE.DOLLY:
                if (!this.enableZoom) return;
                this.handleMouseDownDolly(e);
                this.state = OrbitControls.STATE.DOLLY;
                break;
            case MOUSE.ROTATE:
                if (e.ctrlKey || e.shiftKey || e.altKey) {
                    if (!this.enablePan) return;
                    this.handleMouseDownPan(e);
                    this.state = OrbitControls.STATE.PAN;
                }
                else {
                    if (!this.enableRotate) return;
                    this.handleMouseDownRotate(e);
                    this.state = OrbitControls.STATE.ROTATE;
                }
                break;
            case MOUSE.PAN:
                if (e.ctrlKey || e.shiftKey || e.altKey) {
                    if (!this.enableRotate) return;
                    this.handleMouseDownRotate(e);
                    this.state = OrbitControls.STATE.ROTATE;
                }
                else {
                    if (!this.enablePan) return;
                    this.handleMouseDownPan(e);
                    this.state = OrbitControls.STATE.PAN;
                }
                break;
            default:
                this.state = OrbitControls.STATE.NONE;
        }
        if (e.touches) {
            switch (e.touches.length) {
                case 1:
                    switch (this.touches.ONE) {
                        case TOUCH.ROTATE:
                            if (this.enableRotate === false) return;
                            this.handleTouchStartRotate(e);
                            this.state = OrbitControls.STATE.TOUCH_ROTATE;
                            break;
                        case TOUCH.PAN:
                            if (this.enablePan === false) return;
                            this.handleTouchStartPan(e);
                            this.state = OrbitControls.STATE.TOUCH_PAN;
                            break;
                        default:
                            this.state = OrbitControls.STATE.NONE;
                    }
                    break;
                case 2:
                    switch (this.touches.TWO) {
                        case TOUCH.DOLLY_PAN:
                            if (this.enableZoom == false && this.enablePan == false) return;
                            this.handleTouchStartDollyPan(e);
                            this.state = OrbitControls.STATE.TOUCH_DOLLY_PAN;
                            break;
                        case TOUCH.DOLLY_ROTATE:
                            if (this.enableZoom == false && this.enableRotate === false) return;
                            this.handleTouchStartDollyRotate(e);
                            this.state = OrbitControls.STATE.TOUCH_DOLLY_ROTATE;
                            break;
                        default:
                            this.state = OrbitControls.STATE.NONE;
                    }
                    break;
                default:
                    this.state = OrbitControls.STATE.NONE;
            }
        }

        if (this.state !== OrbitControls.STATE.NONE) {
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        }
    }

    private onMouseMove(e: Laya.Event) {
        if (this.enabled === false) return;
        switch (this.state) {
            case OrbitControls.STATE.ROTATE:
                if (this.enableRotate === false) return;
                this.handleMouseMoveRotate(e);
                break;
            case OrbitControls.STATE.DOLLY:
                if (this.enableZoom === false) return;
                this.handleMouseMoveDolly(e);
                break;
            case OrbitControls.STATE.PAN:
                if (this.enablePan === false) return;
                this.handleMouseMovePan(e);
                break;
            case OrbitControls.STATE.TOUCH_ROTATE:
                if (this.enableRotate === false) return;
                this.handleTouchMoveRotate(e);
                this.update();
                break;
            case OrbitControls.STATE.TOUCH_PAN:
                if (this.enablePan === false) return;
                this.handleTouchMovePan(e);
                this.update();
                break;
            case OrbitControls.STATE.TOUCH_DOLLY_PAN:
                if (this.enableZoom == false && this.enablePan == false) return;
                this.handleTouchMoveDollyPan(e);
                this.update();
                break;
            case OrbitControls.STATE.TOUCH_DOLLY_ROTATE:
                if (this.enableZoom == false && this.enableRotate == false) return;
                this.handleTouchMoveDollyRotate(e);
                this.update();
                break;
            default:
                this.state = OrbitControls.STATE.NONE;

        }
    }

    public onMouseUp(e: Laya.Event): void {
        if (this.enabled === false) return;
        this.handleMouseUp(e);
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
        this.state = OrbitControls.STATE.NONE;
    }

    private onMouseWheel(e: Laya.Event) {
        if (!this.enabled || !this.enableZoom) return;
        if (this.state !== OrbitControls.STATE.NONE && this.state !== OrbitControls.STATE.ROTATE) return;

        this.handleMouseWheel(e);
    }

    public onKeyDown(e: Laya.Event) {
        if (!this.enabled || !this.enableKeys || !this.enablePan) return;
        this.handleKeyDown(e);
    }

    private handleMouseDownRotate(e: Laya.Event) {
        this.rotateStart.setValue(e.stageX, e.stageY);
    }

    private handleMouseDownDolly(e: Laya.Event) {
        this.dollyStart.setValue(e.stageX, e.stageY);
    }

    private handleMouseDownPan(e: Laya.Event) {
        this.panStart.setValue(e.stageX, e.stageY);
    }

    private handleMouseMoveRotate(e: Laya.Event) {
        this.rotateEnd.setValue(e.stageX, e.stageY);
        Vect2.subtract(this.rotateEnd, this.rotateStart, this.rotateDelta);
        Laya.Vector2.scale(this.rotateDelta, this.rotateSpeed, this.rotateDelta);
        let whole = 2 * Math.PI / Laya.stage.height;
        this.rotateLeft(whole * this.rotateDelta.x);
        this.rotateUp(whole * this.rotateDelta.y);
        this.rotateEnd.cloneTo(this.rotateStart);
        this.update();
    }

    private handleMouseMoveDolly(e: Laya.Event) {
        this.dollyEnd.setValue(e.stageX, e.stageY);
        Vect2.subtract(this.dollyEnd, this.dollyStart, this.dollyDelta);
        if (this.dollyDelta.y > 0) {
            this.dollyOut(this.getZoomScale())
        }
        else if (this.dollyDelta.y < 0) {
            this.dollyIn(this.getZoomScale())
        }
        this.dollyEnd.cloneTo(this.dollyStart);
        this.update();
    }

    private handleMouseMovePan(e: Laya.Event) {
        this.panEnd.setValue(e.stageX, e.stageY);
        Vect2.subtract(this.panEnd, this.panStart, this.panDelta);
        Laya.Vector2.scale(this.panDelta, this.panSpeed, this.panDelta);
        this.pan(this.panDelta.x, this.panDelta.y);
        this.panEnd.cloneTo(this.panStart);
        this.update();
    }

    private handleMouseUp(e: Laya.Event) {
    }

    private handleMouseWheel(e: Laya.Event) {
        if (e.delta > 0) {
            this.dollyIn(this.getZoomScale());
        }
        else if (e.delta < 0) {
            this.dollyOut(this.getZoomScale());
        }
        this.update();
    }

    private handleKeyDown(e: Laya.Event) {
        let needsUpdate = false;
        switch (e.keyCode) {
            case this.keys.UP:
                this.pan(0, this.keyPanSpeed);
                needsUpdate = true;
                break;
            case this.keys.BOTTOM:
                this.pan(0, -this.keyPanSpeed);
                needsUpdate = true;
                break;
            case this.keys.LEFT:
                this.pan(this.keyPanSpeed, 0);
                needsUpdate = true;
                break;
            case this.keys.RIGHT:
                this.pan(-this.keyPanSpeed, 0);
                needsUpdate = true;
                break;
        }
        if (needsUpdate) {
            this.update();
        }
    }

    private handleTouchStartRotate(e: Laya.Event) {
        if (e.touches.length === 1) {
            this.rotateStart.setValue(e.touches[0].stageX, e.touches[0].stageY);
        }
        else {
            let x = 0.5 * (e.touches[0].stageX + e.touches[1].stageX);
            let y = 0.5 * (e.touches[0].stageY + e.touches[1].stageY);
            this.rotateStart.setValue(x, y);
        }
    }

    private handleTouchStartPan(e: Laya.Event) {
        if (e.touches.length === 1) {
            this.panStart.setValue(e.touches[0].stageX, e.touches[0].stageY);
        }
        else {
            let x = 0.5 * (e.touches[0].stageX + e.touches[1].stageX);
            let y = 0.5 * (e.touches[0].stageY + e.touches[1].stageY);
            this.panStart.setValue(x, y);
        }
    }

    private handleTouchStartDolly(e: Laya.Event) {
        let dx = e.touches[0].stageX - e.touches[1].stageX;
        let dy = e.touches[0].stageY - e.touches[1].stageY;

        let dist = Math.sqrt(dx * dx + dy * dy);
        this.dollyStart.setValue(0, dist);
    }

    private handleTouchStartDollyPan(e: Laya.Event) {
        if (this.enableZoom) this.handleTouchStartDolly(e);
        if (this.enablePan) this.handleTouchStartPan(e);
    }

    private handleTouchStartDollyRotate(e: Laya.Event) {
        if (this.enableZoom) this.handleTouchStartDolly(e);
        if (this.enableRotate) this.handleTouchStartRotate(e);
    }

    private handleTouchMoveRotate(e: Laya.Event) {
        if (e.touches.length == 1) {
            this.rotateEnd.setValue(e.touches[0].stageX, e.touches[0].stageY);
        }
        else {
            let x = 0.5 * (e.touches[0].stageX + e.touches[1].stageX);
            let y = 0.5 * (e.touches[0].stageY + e.touches[1].stageY);
            this.rotateEnd.setValue(x, y);
        }

        Vect2.subtract(this.rotateEnd, this.rotateStart, this.rotateDelta);
        Laya.Vector2.scale(this.rotateDelta, this.rotateSpeed, this.rotateDelta);
        let whole = 2 * Math.PI / Laya.stage.height;
        this.rotateLeft(whole * this.rotateDelta.x);
        this.rotateUp(whole * this.rotateDelta.y);
        this.rotateEnd.cloneTo(this.rotateStart);
    }

    private handleTouchMovePan(e: Laya.Event) {
        if (e.touches.length == 1) {
            this.panEnd.setValue(e.touches[0].stageX, e.touches[0].stageY);
        }
        else {
            let x = 0.5 * (e.touches[0].stageX + e.touches[1].stageX);
            let y = 0.5 * (e.touches[0].stageY + e.touches[1].stageY);
            this.panEnd.setValue(x, y);
        }

        Vect2.subtract(this.panEnd, this.panStart, this.panDelta);
        Laya.Vector2.scale(this.panDelta, this.panSpeed, this.panDelta);
        this.pan(this.panDelta.x, this.panDelta.y);
        this.panEnd.cloneTo(this.panStart);
    }

    private handleTouchMoveDolly(e: Laya.Event) {
        let dx = e.touches[0].stageX - e.touches[1].stageX;
        let dy = e.touches[0].stageY - e.touches[1].stageY;
        let dist = Math.sqrt(dx * dx + dy * dy);
        this.dollyEnd.setValue(0, dist);
        this.dollyDelta.setValue(0, Math.pow(this.dollyEnd.y / this.dollyStart.y, this.zoomSpeed));
        this.dollyOut(this.dollyDelta.y);
        this.dollyEnd.cloneTo(this.dollyStart);
    }

    private handleTouchMoveDollyPan(e: Laya.Event) {
        if (this.enableZoom) this.handleTouchMoveDolly(e);
        if (this.enablePan) this.handleTouchMovePan(e);
    }

    private handleTouchMoveDollyRotate(e: Laya.Event) {
        if (this.enableZoom) this.handleTouchMoveDolly(e);
        if (this.enableRotate) this.handleTouchMoveRotate(e)
    }

    public getPolarAngle() {
        return this.spherical.phi;
    }

    public getAzimuthalAngle() {
        return this.spherical.theta;
    }

    public saveState() {
        this.target0.setValue(this.target.x, this.target.y, this.target.z);
        let pos = this.object.transform.position;
        this.postion0.setValue(pos.x, pos.y, pos.z);
        // this.zoom0 = 1;
    }

    public reset() {
        this.target.setValue(this.target0.x, this.target0.y, this.target0.z);
        this.trans.position.setValue(this.postion0.x, this.postion0.y, this.postion0.z);
        // this.zoom

        //dispatchEvent(changeEvent)
        this.update();
        this.state = OrbitControls.STATE.NONE;
    }

    public onUpdate(): void {
        if (this.enableDamping || this.autoRotate) {
            this.update();
        }
    }


    private offset: Laya.Vector3 = new Laya.Vector3();
    private quat: Laya.Quaternion;
    private quatInverse: Laya.Quaternion;
    private lastPosition: Laya.Vector3;
    private lastQuaternion: Laya.Quaternion;

    public update() {
        let position = this.trans.position;
        Laya.Vector3.subtract(position, this.target, this.offset);
        Laya.Vector3.transformQuat(this.offset, this.quat, this.offset);

        this.spherical.setFromVector3(this.offset);

        if (this.autoRotate && this.state === OrbitControls.STATE.NONE) {
            this.rotateLeft(this.getAutoRotateAngle());
        }

        if (this.enableDamping) {
            this.spherical.theta += this.sphericalDelta.theta * this.dampingFactor;
            this.spherical.phi += this.sphericalDelta.phi * this.dampingFactor;
        }
        else {
            this.spherical.theta += this.sphericalDelta.theta;
            this.spherical.phi += this.sphericalDelta.phi;
        }

        this.spherical.theta = math.clamp(this.spherical.theta, this.minAzimuthAngle, this.maxAzimuthAngle);
        this.spherical.phi = math.clamp(this.spherical.phi, this.minPolarAngle, this.maxPolarAngle);
        this.spherical.makeSafe();
        this.spherical.radius *= this.scale;
        this.spherical.radius = math.clamp(this.spherical.radius, this.minDistance, this.maxDistance);

        if (this.enableDamping) {
            Vect3.addScaledVector(this.target, this.panOffset, this.dampingFactor, this.target);
        }
        else {
            Laya.Vector3.add(this.target, this.panOffset, this.target);
        }

        Spherical.setToVector3(this.spherical, this.offset);
        Laya.Vector3.transformQuat(this.offset, this.quatInverse, this.offset);
        this.target.cloneTo(position);
        Laya.Vector3.add(position, this.offset, position);

        this.trans.position = position;
        this.trans.lookAt(this.target, Laya.Vector3._Up);

        if (this.enableDamping) {
            let value = 1 - this.dampingFactor;
            this.sphericalDelta.theta *= value;
            this.sphericalDelta.phi *= value;
            Laya.Vector3.scale(this.panOffset, value, this.panOffset);
        }
        else {
            this.sphericalDelta.set(0, 0, 0);
            this.panOffset.setValue(0, 0, 0);
        }
        this.scale = 1;
        if (this.zoomChanged ||
            Laya.Vector3.distanceSquared(this.lastPosition, this.trans.position) > OrbitControls.EPS ||
            8 * (1 - Laya.Quaternion.dot(this.lastQuaternion, this.trans.rotation)) > OrbitControls.EPS
        ) {
            this.trans.position.cloneTo(this.lastPosition);
            this.trans.rotation.cloneTo(this.lastQuaternion);
            this.zoomChanged = false;
        }
    }

    private getAutoRotateAngle() {
        //2 * Math.PI / 60 / 60 每分钟多少圈
        return 7200 * Math.PI * this.autoRotateSpeed;
    }

    private getZoomScale() {
        return Math.pow(.95, this.zoomSpeed);
    }

    private rotateLeft(angle: number) {
        this.sphericalDelta.theta -= angle;
    }

    private rotateUp(angle: number) {
        this.sphericalDelta.phi -= angle;
    }

    private dollyOut(dollyScale: number) {
        //正交摄象机
        if (this.object.orthographic) {

        }
        else {
            this.scale /= dollyScale;
        }
    }

    private dollyIn(dollyScale: number) {
        //正交摄象机
        if (this.object.orthographic) {

        }
        else {
            this.scale *= dollyScale;
        }
    }

    private panLeftDelta: Laya.Vector3 = new Laya.Vector3();

    private panLeft(distance: number, objectMatrix: Laya.Matrix4x4) {
        Vect3.setFromMatrixColumn(objectMatrix, 0, this.panLeftDelta);
        Laya.Vector3.scale(this.panLeftDelta, -distance, this.panLeftDelta);
        Laya.Vector3.add(this.panOffset, this.panLeftDelta, this.panOffset);
    }

    private panUpDelta: Laya.Vector3 = new Laya.Vector3();

    private panUp(distance: number, objectMatrix: Laya.Matrix4x4) {
        if (this.screenSpacePanning === true) {
            Vect3.setFromMatrixColumn(objectMatrix, 1, this.panUpDelta);
        }
        else {
            Vect3.setFromMatrixColumn(objectMatrix, 0, this.panUpDelta);
            Laya.Vector3.cross(this.up, this.panUpDelta, this.panUpDelta);
        }
        Laya.Vector3.scale(this.panUpDelta, distance, this.panUpDelta);
        Laya.Vector3.add(this.panOffset, this.panUpDelta, this.panOffset);
    }

    private panOffsetTemp: Laya.Vector3 = new Laya.Vector3();

    private pan(deltaX: number, deltaY: number) {
        if (this.object.orthographic) {

        }
        else {
            //透视摄象机
            let position = this.trans.position;
            position.cloneTo(this.panOffsetTemp);
            Laya.Vector3.subtract(this.panOffsetTemp, this.target, this.panOffsetTemp);
            let targetDistance = Vect3.lengthOf(this.panOffsetTemp);
            //fov/2 * Math.PI / 180
            targetDistance *= Math.tan(this.object.fieldOfView * Math.PI / 360);

            let whole = targetDistance / Laya.stage.height;
            this.panLeft(whole * deltaX, this.trans.localMatrix);
            this.panUp(whole * deltaY, this.trans.localMatrix);
        }
    }

}