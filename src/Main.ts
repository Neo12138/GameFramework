// 程序入口
class Main {
    constructor() {
        System.setDesignSize(720, 1280);
        Laya3D.init(System.designWidth, System.designHeight, true);
        Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_AUTO;
        Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
        Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
        System.preResize();

        this.init();
        this.start().catch();
    }

    private init(): void {
        Laya.Stat.show();
        zero.enableLog = true;
        UIMgr.init();
        UI.UIBinder.bindAll();
        RES.setAssetAdapter("csv", assetAdapter.adapterOfCSV);
    }

    private bg: Laya.Image;

    private async start() {
        this.showStartupBg();

        await RES.loadConfig("resource/default.res.json");

        // let p1 = RES.loadRes("ui_config_csv");
        let p2 = RES.loadRes("merged_csv");
        let p3 = RES.loadRes("ui_fui"); //fairygui确实是要比laya原生ui耗内存(固定多16M)
        // let p4 = RES.loadGroup("loading");

        await Promise.all([p2, p3, /*p4*/]);

        this.createScene();
    }

    /**
     * 加载显示启动背景
     * @private
     */
    private showStartupBg(): void {
        let url = "resource/images/login_bg.jpg";
        let bg = new Laya.Image();
        this.bg = bg;

        bg.skin = url;
        bg.width = System.width;
        bg.height = System.height;
        Laya.stage.addChild(bg);
    }

    private destroyStartupBg() {
        let bg = this.bg;
        this.bg = null;
        Laya.stage.removeChild(bg);
        RES.clearResByUrl(bg.skin);
    }

    private createScene(): void {
        gui.addPackage();

        UIMgr.show(HomeUI);

        this.destroyStartupBg();
    }

}

new Main();


