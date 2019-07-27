/**
 * create by wangcheng on 2019/6/17 11:32
 */
class MainScene {
    private scene: Laya.Scene;

    public constructor() {
        window['scene'] = this;
    }

    public async show() {
        zero.log("开始加载场景");
        let scene = await RES.loadRes3d<Laya.Scene>("mainscene_ls");
        zero.log("加载场景完成");
        this.scene = scene;
        Laya.stage.addChild(scene);
        scene.enableLight = false;
        // setSceneBrightness(scene, 1.2);

        //创建摄像机(横纵比，近距裁剪，远距裁剪)
        let camera: Laya.Camera = new Laya.Camera(0, 0.01, 1000);
        scene.addChild(camera);

        // camera.transform.rotate(new Laya.Vector3(-35.26, 45, 0), true, false);
        // camera.transform.position = new Laya.Vector3(0, 1.75, -1.625);
        camera.transform.position = new Laya.Vector3(2, 2, 10);
        // camera.transform.position = new Laya.Vector3(20, 20, 20);
        camera.transform.rotate(new Laya.Vector3(0, 0, 0), true, false);

        //设置摄像机视野范围（角度）
        camera.fieldOfView = 60;
        camera.clearColor = new Laya.Vector4(.6, .6, .6, 1);
        camera.addComponent(CameraMoveScript);

        this.camera = camera;
        this.drawAxes(scene);

        let a = new Laya.MeshSprite3D(new Laya.BoxMesh(4, 2, 3));
        a.transform.position = new Laya.Vector3(0, 2, 20);
        scene.addChild(a);


        // let matYellow: Laya.StandardMaterial = new Laya.StandardMaterial();
        // matYellow.albedo = new Laya.Vector4(1, 1, 0, 1);
        //
        // let b = new Laya.MeshSprite3D(new Laya.BoxMesh(1, 1, 1));
        // b.transform.position = new Laya.Vector3(1.5, 0.5, 0.5);
        // b.meshRender.material = matYellow;
        // b.addComponent(PlayerMove);
        // b.transform.localRotationEuler = new Laya.Vector3(0,180,0);
        // // b.addChild(camera);
        //
        // scene.addChild(b);
        //
        // let c = new Laya.MeshSprite3D(new Laya.BoxMesh(1, 1, 1));
        // c.transform.position = new Laya.Vector3(-3, 0.5, 3);
        // scene.addChild(c);
        //
        // let d = new Laya.MeshSprite3D(new Laya.BoxMesh(1, 1, 1));
        // d.transform.position = new Laya.Vector3(-3, 0.5, -3);
        // scene.addChild(d);
        //
        // let dirLight = new Laya.DirectionLight();
        // dirLight.direction = new Laya.Vector3(0. -3, 5);
        // // dirLight.direction = new Laya.Vector3(0,5, 10);
        // dirLight.color = new Laya.Vector3(2.5, 2.5, 2.5);
        // scene.addChild(dirLight);
        // winddow['light'] = dirLight;

        this.addGun().catch();


    }

    private async addGun() {
        zero.log("开始加载枪");
        let scene = this.scene;

        let names = ["xm2010_3_lh", "awm_lh", "awm_loader_lh"];
        await RES.loadRes3ds(names);

        // let gun1 = await RES.loadRes3d("xm2010_3_lh");
        let gun1 = RES.getRes<Laya.Sprite3D>("awm_lh");
        // gun1.transform.position = new Laya.Vector3(0, 1.6, -1.5);
        gun1.transform.position = new Laya.Vector3(2, 2, 2);
        gun1.transform.rotate(new Laya.Vector3(45, 45, 45), true, false);
        scene.addChild(gun1);
        window['g'] = gun1;
        let aim = gun1.addComponent(Aim) as Aim;
        aim.setScene(this.scene);
        aim.setCamera(this.camera);

        let bolt = RES.getRes<Laya.Sprite3D>("awm_loader_lh");
        let target = new Laya.Vector3();
        Laya.Vector3.add(gun1.transform.position, new Laya.Vector3(0,1,0), target);
        bolt.transform.position = new Laya.Vector3(0,0.08,0);
        gun1.addChild(bolt);
        window['b'] = bolt.transform;
        setBrightness(gun1, 1.2);


        // let gun2 = await RES.loadRes3d("awm_lh");
        let gun2 = RES.getRes<Laya.Sprite3D>("xm2010_3_lh");
        gun2.transform.position = new Laya.Vector3(1, 1.6, -1.5);
        scene.addChild(gun2);

        let gun3: Laya.Sprite3D = gun2.clone();
        gun3.transform.position = new Laya.Vector3(-1, 1.6, -1.5);
        scene.addChild(gun3);


        zero.log("枪资源加载完成");
        // setTimeout(() => {
        //     zero.log("清理 枪资源");
        //
        //     gun1.destroy(true);
        //     gun2.destroy(true);
        //     gun3.destroy(true);
        //     this.disposeAssets().catch();
        //
        // }, 5000);
    }

    private async disposeAssets() {
        let urls: any[] = await RES.loadRes<any[]>("assetsrecord_json");
        for (let i = 0, len = urls.length; i < len; i++) {
            let res = RES.getRes<Laya.Resource>("resource/sprite3d/Gun/" + urls[i].url);
            if (res) {
                zero.log("clear: ", urls[i]);
                res.dispose();
            }
        }
    }


    private camera: Laya.Camera;
    private angle: number = 300;

    private rotateCamera(): void {
        let camera = this.camera;
        let angle = this.angle;
        let Y = 20;

        let radian = (angle / 180) * Math.PI;
        let x = Math.sin(radian) * Y;
        let z = Math.cos(radian) * Y;

        console.log("position", x, Y, z);
        console.debug("rotation", -30, angle, 0);
        camera.transform.position = new Laya.Vector3(x, Y, z);
        camera.transform.localRotationEuler = new Laya.Vector3(-30, angle, 0);

        angle += 5;
        if (angle == 360) angle = 0;
        this.angle = angle;
    }

    private drawAxes(scene: Laya.Scene): void {
        let matRed: Laya.StandardMaterial = new Laya.StandardMaterial();
        matRed.albedo = new Laya.Vector4(1, 0, 0, 1);

        let matGreen: Laya.StandardMaterial = new Laya.StandardMaterial();
        matGreen.albedo = new Laya.Vector4(0, 1, 0, 1);

        let matBlue: Laya.StandardMaterial = new Laya.StandardMaterial();
        matBlue.albedo = new Laya.Vector4(0, 0, 1, 1);

        // let field: Laya.MeshSprite3D = new Laya.MeshSprite3D(new Laya.BoxMesh(100, 100, 0.001));
        // let matGray: Laya.StandardMaterial = new Laya.StandardMaterial();
        // matGray.albedo = new Laya.Vector4(0.5, 0.5, 0.5, 1);
        // field.meshRender.material = matGray;
        // field.meshRender.receiveShadow = true;
        // scene.addChild(field);

        let x = new Laya.MeshSprite3D(new Laya.BoxMesh(100, 0.01, 0.01));
        x.meshRender.material = matRed;
        scene.addChild(x);

        let y = new Laya.MeshSprite3D(new Laya.BoxMesh(0.01, 0.01, 100));
        y.meshRender.material = matGreen;
        scene.addChild(y);

        let z = new Laya.MeshSprite3D(new Laya.BoxMesh(0.01, 100, 0.01));
        z.meshRender.material = matBlue;
        scene.addChild(z);

        let o = new Laya.MeshSprite3D(new Laya.SphereMesh(0.05, 4, 4));
        o.transform.position = new Laya.Vector3(0, 0, 0);
        scene.addChild(o);

        let px = new Laya.MeshSprite3D(new Laya.SphereMesh(0.05, 4, 4));
        px.meshRender.material = matRed;
        px.transform.position = new Laya.Vector3(5, 0, 0);
        scene.addChild(px);

        let py = new Laya.MeshSprite3D(new Laya.SphereMesh(0.05, 4, 4));
        py.meshRender.material = matGreen;
        py.transform.position = new Laya.Vector3(0, 5, 0);
        scene.addChild(py);

        let pz = new Laya.MeshSprite3D(new Laya.SphereMesh(0.05, 4, 4));
        pz.meshRender.material = matBlue;
        pz.transform.position = new Laya.Vector3(0, 0, 5);
        scene.addChild(pz);
    }
}

function setSceneBrightness(scene: Laya.Scene, brightness: number): void {
    setBrightness(scene.getChildAt(0).getChildByName("Opaque"), brightness);
}

function setBrightness(node: Laya.Node, brightness: number): void {
    if (!node || !node.numChildren) return;

    let albedo = new Laya.Vector4(brightness, brightness, brightness, 1.0);
    let ambientColor = new Laya.Vector3();
    for (let i = 0, len = node._childs.length; i < len; i++) {
        let child = node._childs[i];
        if (child instanceof Laya.MeshSprite3D) {
            let meshMat = child.meshRender.sharedMaterial as Laya.StandardMaterial;
            meshMat.albedo = albedo;
            meshMat.ambientColor = ambientColor;

            setBrightness(child, brightness);
        }

    }
}


function getColorVec3(hex: number, brightness:number = 1): Laya.Vector3 {
    let r = hex >> 16 & 0xff;
    let g = hex >> 8 & 0xff;
    let b = hex & 0xff;

    return new Laya.Vector3(r / 255 * brightness, g / 255 * brightness, b / 255 * brightness);
}