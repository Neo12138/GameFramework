class CameraMoveScript extends Laya.Script {
    protected yawPitchRoll = new Laya.Vector3();
    protected resultRotation = new Laya.Quaternion();
    protected tempRotationZ = new Laya.Quaternion();
    // protected tempRotationX = new Laya.Quaternion();
    // protected tempRotationY = new Laya.Quaternion();
    // protected rotaionSpeed: number = 0.0001;

    protected scene: Laya.Scene;
    protected camera: Laya.Camera;

    private transform: Laya.Transform3D;
    private rotationX: number = 0;

    private sensitivityVert: number = 0.04;
    private sensitivityHor: number = 0.04;

    //垂直方向最小旋转角度
    private minVert:number = -60;
    //垂直方向最大旋转角度
    private maxVert:number = 60;

    private downX: number;
    private downY: number;
    private isMouseDown: boolean;

    constructor() {
        super();
    }


    public _initialize(owner: Laya.Sprite3D): void {
        super._initialize(owner);
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.mouseUp);
        Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.mouseOut);
        Laya.stage.on(Laya.Event.MOUSE_WHEEL, this, this.mouseWheel);

        this.camera = owner as Laya.Camera;
        this.transform = owner.transform;
    }

    public _update(state: Laya.RenderState): void {
        super._update(state);
        this.updateCamera(state.elapsedTime);
    }

    private pressTime:number;
    private maxSpeed:number;
    protected mouseDown(e: Laya.Event): void {
        this.camera.transform.localRotation.getYawPitchRoll(this.yawPitchRoll);
        this.downX = Laya.stage.mouseX;
        this.downY = Laya.stage.mouseY;
        this.isMouseDown = true;
    }
    protected mouseWheel(e: Laya.Event):void {
        this.zoom(e.delta);
    }

    private zoom(delta:number):void {
        let scale = -delta*0.5;
        // let vec3:Laya.Vector3 = new Laya.Vector3();
        // Laya.Vector3.add(this.camera.transform.position, new Laya.Vector3(scale, scale, scale), vec3);
        let vec3 = this.camera.transform.position;
        vec3.x += scale;
        vec3.y += scale;
        vec3.z += scale;
        this.camera.transform.position = vec3;
    }

    protected mouseUp(e: Laya.Event): void {
        this.isMouseDown = false;
        this.pressTime = 0;
    }

    protected mouseOut(e: Laya.Event): void {
        this.isMouseDown = false;
        this.pressTime = 0;
    }

    protected updateCamera(elapsedTime: number): void {

        if (!isNaN(this.downX) && !isNaN(this.downX)) {
            Laya.KeyBoardManager.hasKeyDown(87) && this.camera.moveForward(-0.002 * elapsedTime);//W
            Laya.KeyBoardManager.hasKeyDown(83) && this.camera.moveForward(0.002 * elapsedTime);//S
            Laya.KeyBoardManager.hasKeyDown(65) && this.camera.moveRight(-0.002 * elapsedTime);//A
            Laya.KeyBoardManager.hasKeyDown(68) && this.camera.moveRight(0.002 * elapsedTime);//D
            Laya.KeyBoardManager.hasKeyDown(81) && this.camera.moveVertical(0.002 * elapsedTime);//Q
            Laya.KeyBoardManager.hasKeyDown(69) && this.camera.moveVertical(-0.002 * elapsedTime);//E
            if (this.isMouseDown && Laya.KeyBoardManager.hasKeyDown(Laya.Keyboard.CONTROL)) {

                let offsetX = Laya.stage.mouseX - this.downX;
                let offsetY = Laya.stage.mouseY - this.downY;

                this.rotationX -= offsetY * this.sensitivityVert;
                this.rotationX = zero.utils.clamp(this.rotationX, this.minVert, this.maxVert);

                let delta = offsetX * this.sensitivityHor;
                let rotationY = this.transform.localRotationEuler.y + delta;

                this.transform.localRotationEuler = new Laya.Vector3(this.rotationX, rotationY, 0);
                console.log(this.transform.localRotationEuler.elements);
            }
        }
        this.downX = Laya.stage.mouseX;
        this.downY = Laya.stage.mouseY;
    }

    protected updateRotation(): void {
        var yprElem: Float32Array = this.yawPitchRoll.elements;
        if (Math.abs(yprElem[1]) < 1.50) {
            Laya.Quaternion.createFromYawPitchRoll(yprElem[0], yprElem[1], yprElem[2], this.tempRotationZ);
            this.camera.transform.localRotation = this.tempRotationZ;
        }
    }

}