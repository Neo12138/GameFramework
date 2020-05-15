/**
 * Created by admin on 2018/9/22.
 */
namespace support {
    /**
     * 绘制网格
     * @param {number} stageW
     * @param {number} stageH
     */
    export function drawGrid(stageW: number, stageH: number): void {
        let grid = new Laya.Sprite();
        Laya.stage.addChild(grid);
        //横线
        for (let i = 0; i < stageH; i += 50) {
            grid.graphics.drawLine(0, i, stageW, i, "#00a700");
            let t = new Laya.Text();
            t.color = '#ffffff';
            t.y = i;
            t.text = "" + i;
            grid.addChild(t);
        }
        //竖线
        for (let i = 0; i < stageW; i += 50) {
            grid.graphics.drawLine(i, 0, i, stageH, "#00a700");
            let t = new Laya.Text();
            t.color = '#ffffff';
            t.x = i;
            t.text = "" + i;
            grid.addChild(t);
        }
        grid.cacheAs = 'bitmap';
    }

    export function createButton(name: string, x: number = 0, y: number = 0, w: number = 100, h: number = 50): Laya.Sprite {
        let sp = new Laya.Sprite();
        sp.pos(x, y);
        sp.size(w, h);

        sp.graphics.drawRect(0, 0, w, h, "#ffca28");

        let text = new Laya.Text();
        text.text = name;
        text.size(w, h);
        text.align = 'center';
        text.valign = 'middle';
        text.fontSize = 20;
        text.color = "#fff";
        sp.addChild(text);

        sp.cacheAs = 'bitmap';

        // sp.pivot(sp.width>>1,sp.height>>1);
        // sp.x += sp.width>>1;
        // sp.y += sp.height>>1;

        return sp;
    }

}
export default support;