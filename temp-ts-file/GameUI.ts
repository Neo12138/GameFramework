import {ui} from "./../ui/layaMaxUI";
import math from "../math/basic";
import support from "../support";
import FirstPersonControls from "../controls/FirstPersonControls";
import PointerLockControls from "../controls/PointerLockControls";
import OrbitControls from "../controls/OrbitControls";
/**
 * 本示例采用非脚本的方式实现，而使用继承页面基类，实现页面逻辑。在IDE里面设置场景的Runtime属性即可和场景进行关联
 * 相比脚本方式，继承式页面类，可以直接使用页面定义的属性（通过IDE内var属性定义），比如this.tipLbll，this.scoreLbl，具有代码提示效果
 * 建议：如果是页面级的逻辑，需要频繁访问页面内多个元素，使用继承式写法，如果是独立小模块，功能单一，建议用脚本方式实现，比如子弹脚本。
 */
export default class GameUI extends ui.test.TestSceneUI
{
    private scene3d;

    constructor()
    {
        super();
        let bottom = 80;
        let btn = support.createButton("加1个方块", 50, Laya.stage.height - bottom);
        this.scene.addChild(btn);
        btn.on(Laya.Event.CLICK, this, this.addObjects, [1, 48]);
        let btn2 = support.createButton("加10个方块", 200, Laya.stage.height - bottom);
        this.scene.addChild(btn2);
        btn2.on(Laya.Event.CLICK, this, this.addObjects, [10, 48]);
        let btn3 = support.createButton("加100个方块", 350, Laya.stage.height - bottom);
        btn3.on(Laya.Event.CLICK, this, this.addObjects, [100, 48]);
        this.scene.addChild(btn3);
        let btn4 = support.createButton("加10个角色", 500, Laya.stage.height - bottom);
        btn4.on(Laya.Event.CLICK, this, this.createRoles, [10]);
        this.scene.addChild(btn4);
        let btn5 = support.createButton("加50个球", 500, Laya.stage.height - bottom - 100);
        btn5.on(Laya.Event.CLICK, this, this.addSpheres, [50]);
        this.scene.addChild(btn5);

        window['t'] = this;
        //添加3D场景
        let scene: Laya.Scene3D = Laya.stage.addChild(new Laya.Scene3D()) as Laya.Scene3D;
        this.scene3d = scene;
        //添加照相机
        let camera: Laya.Camera = new Laya.Camera(0, .1, 1000);
        window['c'] = camera;
        camera.fieldOfView = 75;
        camera.transform.translate(new Laya.Vector3(10, 5, 5));
        scene.addChild(camera);
        let controls = camera.addComponent(OrbitControls) as OrbitControls;
        controls.enableDamping = true;
        controls.maxPolarAngle = Math.PI * 0.5;
        controls.minDistance = 1;
        controls.maxDistance = 500;
        window['ctr'] = controls;


        //添加方向光
        let directionLight: Laya.DirectionLight = scene.addChild(new Laya.DirectionLight()) as Laya.DirectionLight;
        directionLight.color = new Laya.Vector3(1, 1, 1);
        directionLight.transform.worldMatrix.setForward(new Laya.Vector3(1, -1, 1));

        let wallSize = 50;
        let wallF = 0;
        let wallR = 0;

        let plane: Laya.MeshSprite3D = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(wallSize, wallSize));
        scene.addChild(plane);
        let material = new Laya.BlinnPhongMaterial();
        plane.meshRenderer.material = material;
        Laya.Texture2D.load("res/layabox.png", Laya.Handler.create(null, function (tex: Laya.Texture2D)
        {
            material.albedoTexture = tex;
        }));
        let boxCollider = new Laya.BoxColliderShape(wallSize, 0.1, wallSize);
        let physicsCollider = plane.addComponent(Laya.PhysicsCollider) as Laya.PhysicsCollider;
        physicsCollider.colliderShape = boxCollider;
        physicsCollider.friction = 1;
        physicsCollider.restitution = wallR;

        let wallFar: Laya.MeshSprite3D = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(wallSize, wallSize));
        scene.addChild(wallFar);
        wallFar.meshRenderer.material = material;
        wallFar.transform.position = new Laya.Vector3(0, wallSize / 2, -wallSize / 2);
        wallFar.transform.rotate(new Laya.Vector3(90, 0, 0), true, false);
        let boxCollider1 = new Laya.BoxColliderShape(wallSize, 0.1, wallSize);
        let physicsCollider1 = wallFar.addComponent(Laya.PhysicsCollider) as Laya.PhysicsCollider;
        physicsCollider1.colliderShape = boxCollider1;
        physicsCollider1.friction = wallF;
        physicsCollider1.restitution = wallR;

        let wallNear: Laya.MeshSprite3D = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(wallSize, wallSize));
        scene.addChild(wallNear);
        wallNear.meshRenderer.material = material;
        wallNear.transform.position = new Laya.Vector3(0, wallSize / 2, wallSize / 2);
        wallNear.transform.rotate(new Laya.Vector3(-90, 0, 0), true, false);
        let boxCollider2 = new Laya.BoxColliderShape(wallSize, 0.1, wallSize);
        let physicsCollider2 = wallNear.addComponent(Laya.PhysicsCollider) as Laya.PhysicsCollider;
        physicsCollider2.colliderShape = boxCollider2;
        physicsCollider2.friction = wallF;
        physicsCollider2.restitution = wallR;

        let wallLeft: Laya.MeshSprite3D = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(wallSize, wallSize));
        scene.addChild(wallLeft);
        wallLeft.meshRenderer.material = material;
        wallLeft.transform.position = new Laya.Vector3(-wallSize / 2, wallSize / 2, 0);
        wallLeft.transform.rotate(new Laya.Vector3(0, 0, -90), true, false);
        let boxCollider3 = new Laya.BoxColliderShape(wallSize, 0.1, wallSize);
        let physicsCollider3 = wallLeft.addComponent(Laya.PhysicsCollider) as Laya.PhysicsCollider;
        physicsCollider3.colliderShape = boxCollider3;
        physicsCollider3.friction = wallF;
        physicsCollider3.restitution = wallR;

        let wallRight: Laya.MeshSprite3D = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(wallSize, wallSize));
        scene.addChild(wallRight);
        wallRight.meshRenderer.material = material;
        wallRight.transform.position = new Laya.Vector3(wallSize / 2, wallSize / 2, 0);
        wallRight.transform.rotate(new Laya.Vector3(0, 0, 90), true, false);
        let boxCollider4 = new Laya.BoxColliderShape(wallSize, 0.1, wallSize);
        let physicsCollider4 = wallRight.addComponent(Laya.PhysicsCollider) as Laya.PhysicsCollider;
        physicsCollider4.colliderShape = boxCollider4;
        physicsCollider4.friction = wallF;
        physicsCollider4.restitution = wallR;

        let wallTop: Laya.MeshSprite3D = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(wallSize, wallSize));
        scene.addChild(wallTop);
        wallTop.meshRenderer.material = material;
        wallTop.transform.position = new Laya.Vector3(0, wallSize, 0);
        wallTop.transform.rotate(new Laya.Vector3(180, 0, 0), true, false);
        let boxCollider5 = new Laya.BoxColliderShape(wallSize, 0, wallSize);
        let physicsCollider5 = wallTop.addComponent(Laya.PhysicsCollider) as Laya.PhysicsCollider;
        physicsCollider5.colliderShape = boxCollider5;
        physicsCollider5.friction = wallF;
        physicsCollider5.restitution = wallR;

        this.matGreen.albedoColor = new Laya.Vector4(0.1, 0.6, 0.2, 1);
        this.matGray.albedoColor = new Laya.Vector4(0.6, 0.6, 0.6, 1);
        // this.createRoles(10);
        // this.addObjects(40, 10);


        // let capsule = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCapsule(0.5, 1.8, 20, 10));
        // capsule.meshRenderer.material = this.matGreen;
        // scene.addChild(capsule);
        // let collider = new Laya.CapsuleColliderShape(0.5, 1.8, Laya.ColliderShape.SHAPEORIENTATION_UPY);
        // let x = math.randomInt(-20, 20);
        // let z = math.randomInt(-20, 20);
        // capsule.transform.position = new Laya.Vector3(x, 10, z);
        // let ctr = capsule.addComponent(Laya.CharacterController) as Laya.CharacterController;
        // ctr.colliderShape = collider;
        // ctr.restitution = 0;
        // ctr.friction = 1;
        // ctr.gravity.setValue(0,-49,0);
        // ctr.gravity = ctr.gravity;
        //
        // capsule.addComponent(FirstPersonControls);
        // capsule.addComponent(PointerLockControls);
        // camera.transform.localPosition.setValue(0,1.5,0);
        // camera.transform.localPosition = camera.transform.localPosition;
        // capsule.addChild(camera);
    }

    private matGreen = new Laya.BlinnPhongMaterial();
    private matGray = new Laya.BlinnPhongMaterial();

    private createRoles(amount)
    {
        let scene = this.scene3d;
        for (let i = 0; i < amount; i++)
        {
            let capsule = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCapsule(0.5, 1.8, 20, 10));
            capsule.meshRenderer.material = this.matGreen;
            scene.addChild(capsule);
            let collider = new Laya.CapsuleColliderShape(0.5, 1.8, Laya.ColliderShape.SHAPEORIENTATION_UPY);
            let x = math.randomInt(-20, 20);
            let z = math.randomInt(-20, 20);
            capsule.transform.position = new Laya.Vector3(x, 10, z);
            let ctr = capsule.addComponent(Laya.CharacterController) as Laya.CharacterController;
            ctr.colliderShape = collider;
            ctr.restitution = 0;

            Laya.timer.loop(1000, this, this.randomMove, [ctr], false)
        }
    }

    private randomMove(ctr: Laya.CharacterController)
    {
        let jump = Math.random() > 0.9;
        if (jump)
        {
            ctr.jump(new Laya.Vector3(0, 20, 0));
        }
        else
        {
            let speed = math.randomInt(2, 15) * 0.0167;
            let rad = math.randomFloat(0, Math.PI * 2);
            let x = Math.cos(rad) * speed;
            let z = Math.sin(rad) * speed;
            ctr.move(new Laya.Vector3(x, 0, z));
        }
    }


    private createCube(x, y, z, rotateY): Laya.MeshSprite3D
    {
        let height = math.randomFloat(0.2, 6);
        let w = math.randomInt(2, 4);
        let box = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(w, height, w));
        box.meshRenderer.material = this.matGray;
        box.transform.position = new Laya.Vector3(x, y, z);
        box.transform.rotate(new Laya.Vector3(0, rotateY, 0));
        let colliderShape = new Laya.BoxColliderShape(w, height, w);
        let rig = box.addComponent(Laya.Rigidbody3D) as Laya.Rigidbody3D;
        rig.colliderShape = colliderShape;
        rig.mass = 10;
        rig.restitution = 0;
        rig.friction = 1;

        return box;
    }

    private createSphere(x, y, z): Laya.MeshSprite3D
    {
        let sphere = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(1, 12, 12));
        sphere.transform.position = new Laya.Vector3(x, y, z);
        let colliderShape = new Laya.SphereColliderShape(1);
        let rig = sphere.addComponent(Laya.Rigidbody3D) as Laya.Rigidbody3D;
        rig.colliderShape = colliderShape;
        rig.mass = 1;
        rig.friction = 0;
        rig.restitution = 1;
        return sphere;
    }
    private addSpheres(amount:number, y:number = 40) {
        let scene = this.scene3d;
        for (let i = 0; i < amount; i++)
        {
            let x = math.randomInt(-20, 20);
            let z = math.randomInt(-20, 20);
            let y = math.randomInt(30,48);
            let obj = this.createSphere(x,y,z);
            scene.addChild(obj);
        }
    }
    private createCubes(amount: number, y: number)
    {
        let objs = [];

        for (let i = 0; i < amount; i++)
        {
            let x = math.randomInt(-20, 20);
            let z = math.randomInt(-20, 20);
            let obj = this.createCube(x, y, z, math.randomInt(0, 360));
            // let obj = this.createSphere(x,y,z);
            objs.push(obj);
        }
        return objs;
    }

    private addObjects(amount: number, y)
    {
        let scene = this.scene3d;
        let objects = this.createCubes(amount, y);

        for (let o of objects)
        {
            if (o)
            {
                scene.addChild(o);
            }
            else
            {
                console.warn("空对象", o)
            }
        }
    }
}