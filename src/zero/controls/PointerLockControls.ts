/**
 * create by WangCheng on 2020/5/14 9:37
 */
import math from "../math/basic";

//这个也挂到角色身上
export default class PointerLockControls extends Laya.Script3D
{
    //垂直方向最大，最小的角度
    public verticalMin: number = -80;
    public verticalMax: number = 80;
    public sensitivityHor: number = 0.05;
    public sensitivityVert: number = 0.05;

    protected object: Laya.Sprite3D;
    protected trans: Laya.Transform3D;

    private eulerAngle: Laya.Vector3 = new Laya.Vector3();
    private mouse: Laya.Vector2;
    private isLock: boolean;

    onStart(): void
    {
        this.object = this.owner as Laya.Sprite3D;
        this.trans = this.object.transform;

        this.trans.localRotationEuler.cloneTo(this.eulerAngle);
        this.mouse = new Laya.Vector2(Laya.stage.width / 2, Laya.stage.height / 2);
        this.isLock = true;
    }

    onEnable(): void
    {
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
    }

    onDisable(): void
    {
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseDown);
        Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.off(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
    }

    onMouseDown(e: Laya.Event): void
    {
        this.mouse.setValue(e.stageX, e.stageY);
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
    }

    onMouseUp(e: Laya.Event): void
    {
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
    }

    private onMouseMove(e: Laya.Event)
    {
        let deltaX = e.stageX - this.mouse.x;
        let deltaY = e.stageY - this.mouse.y;
        this.mouse.setValue(e.stageX, e.stageY);

        this.handleMouseMove(deltaX, deltaY);
    }



    private handleMouseMove(deltaX: number, deltaY: number)
    {
        this.eulerAngle.x -= deltaY * this.sensitivityVert;
        this.eulerAngle.x = math.clamp(this.eulerAngle.x, this.verticalMin, this.verticalMax);

        this.eulerAngle.y = this.trans.localRotationEulerY - deltaX * this.sensitivityHor;

        this.trans.localRotationEuler = this.eulerAngle;
    }


}