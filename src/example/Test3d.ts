/**
 * create by WangCheng on 2020/5/7 16:14
 */
class Test3d
{
    public constructor()
    {
        this.matRed = new Laya.StandardMaterial();
        this.matRed.albedo = new Laya.Vector4(0.9, 0, 0, 1);

        this.matGray = new Laya.StandardMaterial();
        this.matGray.albedo = new Laya.Vector4(0.6, 0.6, 0.6, 1);

        this.matGreen = new Laya.StandardMaterial();
        this.matGreen.albedo = new Laya.Vector4(0, 0.9, 0, 1);

        this.matWhite = new Laya.StandardMaterial();
        this.matWhite.albedo = new Laya.Vector4(1, 1, 1, 1);
    }

    private matRed: Laya.StandardMaterial;
    private matGray: Laya.StandardMaterial;
    private matGreen: Laya.StandardMaterial;
    private matWhite: Laya.StandardMaterial;

    public run()
    {
        let scene = Laya.stage.addChild(new Laya.Scene());

        //初始化照相机
        let camera = new Laya.Camera(0, 0.1, 100);
        scene.addChild(camera);
        camera.transform.translate(new Laya.Vector3(0, 50, 0));
        camera.transform.rotate(new Laya.Vector3(-90, 0, 0), true, false);
        camera.clearColor = null;

        //方向光
        let directionLight = scene.addChild(new Laya.DirectionLight()) as Laya.DirectionLight;
        directionLight.color = new Laya.Vector3(0.6, 0.6, 0.6);
        directionLight.direction = new Laya.Vector3(1, -1, -1);

        //平面
        let w = 50;
        let plane = new Laya.MeshSprite3D(new Laya.PlaneMesh(w, w, 10, 10));
        scene.addChild(plane);
        plane.meshRender.material = this.matGray;
        plane.name = "平面";

        let tree = new math.QuadTree<RectCollider>({x:-w/2,y:-w/2, width:w,height:w});
        let objects = this.createObjects(800,w,w);
        objects = objects.concat(this.createBigObjects(10,w,w));
        for (let obj of objects)
        {
            scene.addChild(obj);
            let r = this.convertColliderToRectangle(obj._colliders[0]);
            tree.insert(r);
        }

        let ret = tree.retrieve({x:-0.5,y:-0.5,width:1,height:1});
        for(let r of ret) {
            let cube = r.collider.owner as Laya.MeshSprite3D;
            cube.meshRender.material = this.matGreen;
        }

    }

    private createCube(x: number, z: number, long: number, width: number, rotate: number = 0): Laya.MeshSprite3D
    {
        let box = new Laya.MeshSprite3D(new Laya.BoxMesh(long, width, 0.5));
        box.meshRender.material = this.matWhite;
        box.transform.position = new Laya.Vector3(x, 0.5, z);
        box.transform.rotate(new Laya.Vector3(0, rotate, 0), false, false);
        let collider = box.addComponent(Laya.BoxCollider) as Laya.BoxCollider;
        collider.setFromBoundBox(box.meshFilter.sharedMesh.boundingBox);
        return box;
    }

    private createObjects(amount: number, maxL: number = 20, maxW: number = 20): Laya.MeshSprite3D[]
    {
        let objects = [];
        let x, z, long, width, rotate;
        let halfMaxL = maxL / 2;
        let halfMaxW = maxW / 2;
        for (let i = 0; i < amount; i++)
        {
            long = math.randomFloat(0.5, 2);
            width = math.randomFloat(0.5, 2);
            x = math.randomFloat(-halfMaxL, halfMaxL);
            z = math.randomFloat(-halfMaxW, halfMaxW);
            rotate = math.randomInt(0, 360);
            objects.push(this.createCube(x, z, long, width, rotate));
        }
        return objects;
    }
    private createBigObjects(amount: number, maxL: number = 20, maxW: number = 20): Laya.MeshSprite3D[]{
        let objects = [];
        let x, z, long, width, rotate;
        let halfMaxL = maxL / 2;
        let halfMaxW = maxW / 2;
        for (let i = 0; i < amount; i++)
        {
            long = math.randomFloat(5, 10);
            width = math.randomFloat(5, 10);
            x = math.randomFloat(-halfMaxL, halfMaxL);
            z = math.randomFloat(-halfMaxW, halfMaxW);
            rotate = math.randomInt(0, 360);
            objects.push(this.createCube(x, z, long, width, rotate));
        }
        return objects;
    }

    private convertColliderToRectangle(collider: Laya.BoxCollider): RectCollider
    {
        let obb: Laya.OrientedBoundBox = collider.boundBox;
        let corners = [];
        for (let i = 0; i < 8; i++)
        {
            corners[i] = new Laya.Vector3();
        }
        obb.getCorners(corners);
        let minX = Number.MAX_VALUE;
        let maxX = Number.NEGATIVE_INFINITY;
        let minZ = Number.MAX_VALUE;
        let maxZ = Number.NEGATIVE_INFINITY;
        for (let i = 0, len = corners.length; i < len; i++)
        {
            minX = corners[i].x < minX ? corners[i].x : minX;
            maxX = corners[i].x > maxX ? corners[i].x : maxX;
            minZ = corners[i].z < minZ ? corners[i].z : minZ;
            maxZ = corners[i].z > maxZ ? corners[i].z : maxZ;
        }

        return {
            x: minX,
            y: minZ,
            width: maxX - minX,
            height: maxZ - minZ,
            collider: collider
        };
    }
}
type RectCollider = { x: number, y: number, width: number, height: number, collider: Laya.BoxCollider }