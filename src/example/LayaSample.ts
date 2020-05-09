// 程序入口
class GameMain
{
    constructor()
    {
        Laya3D.init(800, 600, true);
        Laya.Stat.show();
        // this.test();
        // this.testPow();
        // this.testQuadTreeDynamic();
        // this.testQuadTree2();
        // new Test3d().run();
        new JSZipSample().run();
    }


    private test()
    {
        let a = math.lerp(0, 10, -0.1);
        let b = math.lerp(0, 10, 0.4);
        let c = math.lerp(0, 10, 1.5);
        console.log(a, b, c);

        let a2 = math.lerp(Vect2.zero, new Vect2(10, 10), -0.1);
        let b2 = math.lerp(Vect2.zero, new Vect2(10, 10), 0.8);
        let c2 = math.lerp(Vect2.zero, new Vect2(10, 10), 2);
        console.log("Vect2\n", "" + a2, b2.toString(), c2);

        let a3 = math.lerp(Vect3.zero, new Vect3(10, 10), -0.1);
        let b3 = math.lerp(Vect3.zero, new Vect3(10, 10), 0.8);
        let c3 = math.lerp(Vect3.zero, new Vect3(10, 10), 2);
        console.log("Vect3\n", "" + a3, b3.toString(), c3.toArray());
    }

    private testPow(len = 10)
    {
        let a = 100;
        let ret;
        console.time("just x*x");
        for (let i = 0; i < len; i++)
        {
            ret = a * a * a * a;
        }
        console.timeEnd("just x*x");

        console.time("pow");
        for (let i = 0; i < len; i++)
        {
            ret = Math.pow(a, 4);
        }
        console.timeEnd("pow");
    }

    private testProp(len = 10)
    {
        let v = new Vect3(100, 100, 1);
        console.time("save");
        for (let i = 0; i < len; i++)
        {
            let x = v.x;
            let y = v.y;
            v.z = x + y;
            v.y = x;
            v.x = y;
        }
        console.timeEnd("save");

        console.time("not save");
        for (let i = 0; i < len; i++)
        {
            v.z = v.x + v.y;
            v.y = v.x;
            v.x = v.z;
        }
        console.timeEnd("not save");
    }

    private testQuadTreeDynamic()
    {
        let sp = new Laya.Sprite();
        sp.graphics.setAlpha(0.5);
        Laya.stage.addChild(sp);
        let text = new Laya.Text();
        text.x = 300;
        text.y = 10;
        text.fontSize = 24;
        text.color = "#fff";
        Laya.stage.addChild(text);

        let objects = this.createObjects(3000);
        let tree = new math.QuadTree(Laya.stage, 25, 6);
        this.testArea = {x: Laya.stage.width / 2, y: Laya.stage.height / 2, width: 200, height: 200};
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
        document.addEventListener("mouseout", this.onMouseOut.bind(this));

        let loop = () =>
        {
            let start = performance.now();
            tree.clear();
            sp.graphics.clear();

            for (let i = objects.length - 1; i >= 0; i--)
            {
                let obj = objects[i];

                obj.x += obj.vx;
                obj.y += obj.vy;
                obj.check = false;
                if (obj.x > Laya.stage.width) obj.x = -obj.width;
                if (obj.x < -obj.width) obj.x = Laya.stage.width;
                if (obj.y > Laya.stage.height) obj.y = -obj.height;
                if (obj.y < -obj.height) obj.y = Laya.stage.height;

                tree.insert(obj);
            }

            let candidates = [];
            if (this.isMouseover)
            {
                sp.graphics.drawRect(this.testArea.x, this.testArea.y, this.testArea.width, this.testArea.height, null, "#00f", 1);
                candidates = tree.retrieve(this.testArea);

                for (let i = candidates.length - 1; i >= 0; i--)
                {
                    candidates[i].check = true;
                }
            }
            this.drawQuadTree(tree, sp.graphics);
            this.drawObjects(objects, sp.graphics);
            let end = performance.now();
            text.text = `${(end - start).toFixed(4)}ms ${candidates.length}/${objects.length}(${(candidates.length * 100 / objects.length).toFixed(2)}%)`;
        };
        Laya.timer.frameLoop(1, this, loop);
    }
    private testQuadTree2() {
        let sp = new Laya.Sprite();
        sp.graphics.setAlpha(0.5);
        Laya.stage.addChild(sp);
        let text = new Laya.Text();
        text.x = 300;
        text.y = 10;
        text.fontSize = 24;
        text.color = "#fff";
        Laya.stage.addChild(text);

        let objects = this.createObjects(3000);
        let tree = new QuadTreeNode(new Laya.Rectangle(Laya.stage.x,Laya.stage.y,Laya.stage.width, Laya.stage.height), 0);
        this.testArea = {x: Laya.stage.width / 2, y: Laya.stage.height / 2, width: 200, height: 200};
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
        document.addEventListener("mouseout", this.onMouseOut.bind(this));
        let loop = () =>
        {
            let start = performance.now();
            tree.Clear();
            sp.graphics.clear();

            for (let i = objects.length - 1; i >= 0; i--)
            {
                let obj = objects[i];

                obj.x += obj.vx;
                obj.y += obj.vy;
                obj.check = false;
                if (obj.x > Laya.stage.width) obj.x = -obj.width;
                if (obj.x < -obj.width) obj.x = Laya.stage.width;
                if (obj.y > Laya.stage.height) obj.y = -obj.height;
                if (obj.y < -obj.height) obj.y = Laya.stage.height;

                tree.Insert(obj);
            }

            let candidates = [];
            if (this.isMouseover)
            {
                sp.graphics.drawRect(this.testArea.x, this.testArea.y, this.testArea.width, this.testArea.height, null, "#00f", 1);
                /*candidates = */tree.Retrieve(this.testArea, candidates);

                for (let i = candidates.length - 1; i >= 0; i--)
                {
                    candidates[i].check = true;
                }
            }
            this.drawQuadTree2(tree, sp.graphics);
            this.drawObjects(objects, sp.graphics);
            let end = performance.now();
            text.text = `${(end - start).toFixed(4)}ms ${candidates.length}/${objects.length}(${(candidates.length * 100 / objects.length).toFixed(2)}%)`;
        };
        Laya.timer.frameLoop(1, this, loop);
    }

    private testArea;
    private isMouseover;

    private onMouseMove(e)
    {
        this.isMouseover = true;
        if (!e.offsetX)
        {
            e.offsetX = e.layerX - e.target.offsetLeft;
            e.offsetY = e.layerY - e.target.offsetTop;
        }
        this.testArea.x = e.offsetX - this.testArea.width / 2;
        this.testArea.y = e.offsetY - this.testArea.height / 2;
    }

    private onMouseOut()
    {
        this.isMouseover = false;
    }

    private createObjects(amount): any[]
    {
        let objects = [];
        for (let i = 0; i < amount; i++)
        {
            objects.push({
                x: math.randomInt(0, Laya.stage.width),
                y: math.randomInt(0, Laya.stage.height),
                width: math.randomInt(10, 20),
                height: math.randomInt(10, 20),
                vx: math.randomFloat(-0.5, 0.5),
                vy: math.randomFloat(-0.5, 0.5),
                check: false
            })
        }
        return objects;
    }

    private drawObjects(objects: any[], g: Laya.Graphics)
    {
        let obj;
        for (let i = objects.length - 1; i >= 0; i--)
        {
            obj = objects[i];
            if (obj.check)
            {
                g.drawRect(obj.x, obj.y, obj.width, obj.height, "#03ff03");
            }
            else
            {
                g.drawRect(obj.x, obj.y, obj.width, obj.height, null, "#a3a3a3");
            }
        }
    }

    private drawQuadTree(node: math.QuadTree<any>, g: Laya.Graphics)
    {
        if (node.nodes.length)
        {
            node.nodes.forEach(v => this.drawQuadTree(v, g));
        }
        else
        {
            g.drawRect(node.bounds.x, node.bounds.y, node.bounds.width, node.bounds.height, null, "#ff0", 0.5);
        }
    }

    private drawQuadTree2(node: QuadTreeNode, g:Laya.Graphics) {
        if (node._nodes.length)
        {
            node._nodes.forEach(v => this.drawQuadTree2(v, g));
        }
        else
        {
            g.drawRect(node._bounds.x, node._bounds.y, node._bounds.width, node._bounds.height, null, "#ff0", 0.5);
        }
    }

}

window['m'] = new GameMain();