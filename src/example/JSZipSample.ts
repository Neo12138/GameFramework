/**
 * create by WangCheng on 2020/5/8 11:18
 */
import Byte = Laya.Byte;
import Loader = Laya.Loader;
import Texture = Laya.Texture;

declare class JSZip
{
    file(name?, data?, o?): JSZip;

    filter(search?);

    folder(name?): JSZip;

    remove(path?);

    generateAsync(o?): Promise<any>;

    loadAsync(data?): Promise<any>;

    async(type: string): Promise<any>;

    static support: any;
}


class JSZipSample
{
    public constructor()
    {
        Laya.WebGL.enable();
    }

    public async run()
    {
        let zip = new JSZip();
        let a = await fetch("res/test.zip");
        let buffer = await a.arrayBuffer();

        let zipData = await zip.loadAsync(buffer);
        console.log("zip data:", zipData);
        let file1 = await zipData.file("test.txt").async("string");
        console.log("text.txt content: ", file1);

        // let file2 = await zipData.file("girl.png").async("blob");
        // console.log("girl.png: ", file2);
        // let bytes = new Byte(file2);
        // let blob = new Blob([bytes.buffer], {type: "image/png"});
        // let url = URL.createObjectURL(file2);
        // Laya.loader.load(url, Laya.Handler.create(this, (res)=>{
        //     Laya.Loader.cacheRes("res/test/girl.png", res);
        //     delete Laya.Loader.loadedMap[url];
        //     let img = new Laya.Image("res/test/girl.png");
        //     Laya.stage.addChild(img);
        // }), null, Laya.Loader.IMAGE);

        let now = performance.now();
        let file3 = await zipData.file("common.png").async("blob");
        let url2 = URL.createObjectURL(file3);
        let file4 = await zipData.file("common.atlas").async("string");
        Laya.Loader.cacheRes("res/test/common.atlas", JSON.parse(file4));
        Laya.loader.load(url2, Laya.Handler.create(this, (res:Laya.Texture) =>
        {
            // Laya.Loader.cacheRes("res/test/common.png", res);
            delete Laya.Loader.loadedMap[url2];
            this.loadAtlas(Laya.URL.formatURL("res/test/common.atlas"), JSON.parse(file4), res.bitmap);

            let img = new Laya.Image("common/lbl_btn_claim.png");
            Laya.stage.addChild(img);
            img.x = 100;
            let pass = performance.now() - now;
            console.log("----zip parse common.atlas cost:", pass + "ms");
            Laya.loader.load("res/test/common.atlas", Laya.Handler.create(this, ()=>{
                let img = new Laya.Image("common/giveup.png");
                Laya.stage.addChild(img);
                img.x = 100;
                img.y = 80;
            }))

        }), null, Laya.Loader.IMAGE);
    }

    private loadAtlas(url, atlas, png:Laya.WebGLImage)
    {
        if (atlas.meta && atlas.meta.image)
        {
            var toloadPics = atlas.meta.image.split(",");
            var split = url.indexOf("/") >= 0 ? "/" : "\\";
            var idx = url.lastIndexOf(split);
            var folderPath = idx >= 0 ? url.substr(0, idx + 1) : "";
            for (var i = 0, len = toloadPics.length; i < len; i++)
            {
                toloadPics[i] = folderPath + toloadPics[i];
            }
        }
        // toloadPics.reverse();
        atlas.toLoads = toloadPics;
        atlas.pics = [png];

        var frames = atlas.frames;
        var cleanUrl = url.split("?")[0];
        var directory = (atlas.meta && atlas.meta.prefix) ? atlas.meta.prefix : cleanUrl.substring(0, cleanUrl.lastIndexOf(".")) + "/";
        var pics = atlas.pics;
        var atlasURL = Laya.URL.formatURL(url);
        var map = Laya.Loader['atlasMap'][atlasURL] || (Laya.Loader['atlasMap'][atlasURL] = []);
        map.dir = directory;
        var scaleRate = 1;
        if (atlas.meta && atlas.meta.scale && atlas.meta.scale != 1)
        {
            scaleRate = parseFloat(atlas.meta.scale);
            for (var name in frames)
            {
                var obj = frames[name];
                var tPic = pics[obj.frame.idx ? obj.frame.idx : 0];
                var _url = Laya.URL.formatURL(directory + name);
                tPic.scaleRate = scaleRate;
                var tTexture;
                tTexture = Texture.create(tPic, obj.frame.x, obj.frame.y, obj.frame.w, obj.frame.h, obj.spriteSourceSize.x, obj.spriteSourceSize.y, obj.sourceSize.w, obj.sourceSize.h);
                Loader.cacheRes(_url, tTexture);
                tTexture.url = _url;
                map.push(_url);
            }
        }
        else
        {
            for (name in frames)
            {
                obj = frames[name];
                tPic = pics[obj.frame.idx ? obj.frame.idx : 0];
                url = Laya.URL.formatURL(directory + name);
                Loader.cacheRes(url, Texture.create(tPic, obj.frame.x, obj.frame.y, obj.frame.w, obj.frame.h, obj.spriteSourceSize.x, obj.spriteSourceSize.y, obj.sourceSize.w, obj.sourceSize.h));
                Loader.loadedMap[url].url = url;
                map.push(url);
            }
        }
        delete atlas.pics;
    }

}