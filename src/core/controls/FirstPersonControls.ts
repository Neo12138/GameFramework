/**
 * create by WangCheng on 2020/5/13 20:20
 */
import {Quaternion, Vect3} from "../math/LayaPolyfill";

//这个是挂在角色身上的
export default class FirstPersonControls extends Laya.Script3D {
    private object: Laya.Sprite3D;
    private trans: Laya.Transform3D;
    public enabled: boolean = true;
    public movementSpeed: number = 10;
    public jumpSpeed: number = 20;
    public enableDamping: boolean = true;
    public dampingFactor: number = 0.05;

    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;
    private jump = false;

    private ctr: Laya.CharacterController;
    private velocity: Laya.Vector3;
    private up = new Laya.Vector3();
    private forward = new Laya.Vector3();
    private quat: Laya.Quaternion;

    public onStart(): void {
        this.object = this.owner as Laya.Sprite3D;
        this.ctr = this.owner.getComponent(Laya.CharacterController) as Laya.CharacterController;
        this.trans = this.object.transform;
        this.trans.getUp(this.up);

        this.quat = new Laya.Quaternion();
        this.velocity = new Laya.Vector3();
        this.addEventListener();
    }

    onEnable(): void {
        this.addEventListener();
    }

    onDisable(): void {
        this.removeEventListener();
    }

    public onUpdate(): void {
        this.update(Laya.timer.delta / 1000);
    }

    public onKeyDown(e: Laya.Event): void {
        switch (e.keyCode) {
            case Laya.Keyboard.UP:
            case Laya.Keyboard.W:
                this.moveForward = true;
                break;
            case Laya.Keyboard.LEFT:
            case Laya.Keyboard.A:
                this.moveLeft = true;
                break;
            case Laya.Keyboard.DOWN:
            case Laya.Keyboard.S:
                this.moveBackward = true;
                break;
            case Laya.Keyboard.RIGHT:
            case Laya.Keyboard.D:
                this.moveRight = true;
                break;
            case Laya.Keyboard.SPACE:
                this.jump = true;
                break;
        }
    }

    public onKeyUp(e: Laya.Event): void {
        switch (e.keyCode) {
            case Laya.Keyboard.UP:
            case Laya.Keyboard.W:
                this.moveForward = false;
                break;
            case Laya.Keyboard.LEFT:
            case Laya.Keyboard.A:
                this.moveLeft = false;
                break;
            case Laya.Keyboard.DOWN:
            case Laya.Keyboard.S:
                this.moveBackward = false;
                break;
            case Laya.Keyboard.RIGHT:
            case Laya.Keyboard.D:
                this.moveRight = false;
                break;
            case Laya.Keyboard.SPACE:
                this.jump = false;
                break;
        }
    }


    private update(delta: number) {
        if (this.enabled === false) return;
        if (!this.ctr.isGrounded) {
            let value = 1 - this.dampingFactor;
            this.velocity.y = 0;
            Laya.Vector3.scale(this.velocity, value, this.velocity);
            this.ctr.move(this.velocity);
            return;
        }

        let forwardMovement = 0;
        let rightMovement = 0;
        let actualMoveSpeed = delta * this.movementSpeed;
        if (this.moveForward) {
            forwardMovement -= actualMoveSpeed;
        }
        if (this.moveBackward) {
            forwardMovement += actualMoveSpeed;
        }
        if (this.moveLeft) {
            rightMovement -= actualMoveSpeed;
        }
        if (this.moveRight) {
            rightMovement += actualMoveSpeed;
        }

        //当前的前方
        Vect3.setFromMatrixColumn(this.trans.localMatrix, 2, this.forward);
        //旋转的角度
        Quaternion.setFromUnitVectors(Laya.Vector3._ForwardLH, this.forward, this.quat);
        this.velocity.setValue(rightMovement, 0, forwardMovement);
        //移动的方向也相应旋转
        Laya.Vector3.transformQuat(this.velocity, this.quat, this.velocity);
        this.ctr.move(this.velocity);

        if (this.jump) {
            this.velocity.y = this.jumpSpeed;
            this.ctr.jump(this.velocity);
            this.jump = false;
        }
    }

    private addEventListener() {
        Laya.stage.on(Laya.Event.KEY_DOWN, this, this.onKeyDown);
    }

    private removeEventListener() {
        Laya.stage.off(Laya.Event.KEY_DOWN, this, this.onKeyDown);
    }
}

