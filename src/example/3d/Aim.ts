/**
 * create by wangcheng on 2019/6/17 17:40
 */

class Aim extends Laya.Script {
    private transform: Laya.Transform3D;
    private rotationX: number = 0;

    private sensitivityVert: number = 0.05;
    private sensitivityHor: number = 0.05;

    //垂直方向最小旋转角度，向上为逆时针渲染，角度变小
    private minVert: number = -45;
    //垂直方向最大旋转角度，向下为顺时针旋转，角度变大
    private maxVert: number = 20;

    private downX: number;
    private downY: number;
    private isMouseDown: boolean;

    private camera: Laya.Camera;

    public constructor() {
        super();
    }


    _initialize(owner: Laya.Sprite3D): void {
        super._initialize(owner);

        this.transform = owner.transform;
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.onMouseUp);
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMoseMove);

        // this.ray = new Laya.Ray(owner.transform.position, owner.transform.forward);
        this.ray = new Laya.Ray(new Laya.Vector3(), new Laya.Vector3());
        this.phasor = new Laya.PhasorSpriter3D();
        this.rayCastHit = new Laya.RaycastHit();
        this.projectViewMat = new Laya.Matrix4x4();

        console.log(this.transform.position, this.transform.localRotationEuler, this.transform.forward);
    }

    private parent: Laya.Scene;

    public setCamera(camera: Laya.Camera): void {
        this.camera = camera;
        this.ray.origin = camera.transform.position.clone();
        this.checkHit();
    }

    public setScene(scene: Laya.Scene): void {
        this.parent = scene;
        this.shpereIndicator(new Laya.Vector3(0, 2, 5), null);
    }

    // _update(state: Laya.RenderState): void {
    // super._update(state);
    // this.onUpdate(state.elapsedTime);
    // }


    private onMouseDown(e: Laya.Event): void {
        this.downX = Laya.stage.mouseX;
        this.downY = Laya.stage.mouseY;

        this.isMouseDown = true;
    }

    private onMouseUp(): void {
        this.isMouseDown = false;
    }


    /**
     * 间隔时间
     * @param elapsedTime
     */
    // private onUpdate(elapsedTime: number) {
    //     if (!this.isMouseDown) return;
    //
    //     let offsetX = Laya.stage.mouseX - this.downX;
    //     let offsetY = Laya.stage.mouseY - this.downY;
    //
    //     this.rotationX += offsetY * this.sensitivityVert;
    //     this.rotationX = zero.utils.clamp(this.rotationX, -20, 45);
    //
    //     let delta = -offsetX * this.sensitivityHor;
    //     let rotationY = this.transform.localRotationEuler.y + delta;
    //
    //     this.transform.localRotationEuler = new Laya.Vector3(this.rotationX, rotationY, 0);
    //
    //     this.downX = Laya.stage.mouseX;
    //     this.downY = Laya.stage.mouseY;
    // }

    private onMoseMove() {
        if (!this.enable) return;
        if (!this.isMouseDown || Laya.KeyBoardManager.hasKeyDown(Laya.Keyboard.CONTROL)) return;

        let offsetX = Laya.stage.mouseX - this.downX;
        let offsetY = Laya.stage.mouseY - this.downY;

        this.rotationX += offsetY * this.sensitivityVert;
        this.rotationX = zero.utils.clamp(this.rotationX, this.minVert, this.maxVert);

        let delta = -offsetX * this.sensitivityHor;
        let rotationY = this.transform.localRotationEuler.y + delta;

        this.transform.localRotationEuler = new Laya.Vector3(this.rotationX, rotationY, 0);

        this.downX = Laya.stage.mouseX;
        this.downY = Laya.stage.mouseY;

        this.checkHit();

        console.log(this.transform.position, this.transform.localRotationEuler, this.transform.forward);
    }

    private ray: Laya.Ray;
    private rayCastHit: Laya.RaycastHit;
    private phasor: Laya.PhasorSpriter3D;

    private projectViewMat: Laya.Matrix4x4;

    private checkHit(): void {
        /**
         * 射线由 起点p0,和方向d(单位向量)组成,射线上的每个点的坐标可表示为 p = p0 + t*d (t >= 0)
         */

        let point = new Laya.Vector2(Laya.stage.width / 2, 0);
        // console.log(point.x, point.y);
        this.camera.viewportPointToRay(point, this.ray);
        // console.log(this.ray.origin.elements, this.ray.direction.elements);
        // Laya.Physics.rayCast(this.ray, this.rayCastHit, 300);


        // let forward = this.transform.forward;
        // this.ray.direction = new Laya.Vector3(-forward.x, -forward.y, -forward.z) ;


        this.drawRay(this.ray, 9);
    }


    public drawLine(start: Laya.Vector3, end: Laya.Vector3, color: Laya.Vector4) {
        if (this.phasor == null) {
            this.phasor = new Laya.PhasorSpriter3D();
            // this.parent.addChild(this.phasor);
        }

        this.phasor.begin(Laya.WebGLContext.LINES, this.camera);
        this.phasor.line(start, color, end, color);
        this.phasor.end();
    }

    private outPos: Laya.Vector3 = new Laya.Vector3();

    public drawRay(ray: Laya.Ray, dist: number) {
        let start = ray.origin;
        let dirNormal = new Laya.Vector3();
        Laya.Vector3.normalize(ray.direction, dirNormal);
        let delta = new Laya.Vector3();
        Laya.Vector3.scale(dirNormal, dist, delta);
        let end = new Laya.Vector3();
        Laya.Vector3.add(start, delta, end);

        // this.drawLine(start, end, new Vector4(1,1,0,1));
        this.shpereIndicator(end, null);

        // Laya.Matrix4x4.multiply(this.camera.projectionMatrix, this.camera.viewMatrix, this.projectViewMat);
        // this.camera.viewport.project(end, this.projectViewMat, this.outPos);
        // console.log("out", this.outPos)
    }


    private shpere: Laya.MeshSprite3D;

    private shpereIndicator(pos: Laya.Vector3, parent: Laya.Node): void {
        if (!this.shpere) {
            let o = new Laya.MeshSprite3D(new Laya.SphereMesh(0.05, 4, 4));
            this.shpere = o;

            let matRed: Laya.StandardMaterial = new Laya.StandardMaterial();
            matRed.albedo = new Laya.Vector4(1, 0, 0, 1);
            o.meshRender.material = matRed;
        }

        this.shpere.transform.localScale = new Laya.Vector3(1, 1, 1);
        this.shpere.transform.position = pos;
        if (!parent) {
            parent = this.parent as Laya.Node;
        }
        parent.addChild(this.shpere);
    }
}