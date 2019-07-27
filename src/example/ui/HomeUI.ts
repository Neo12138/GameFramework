/**
 * create by wangcheng on 2019/7/23 18:46
 */
class HomeUI extends zero.BaseUI {
    protected _view: UI.HomeUI;

    public constructor(props: any) {
        super(props);
    }

    protected getLoadMethod(): Promise<any> {
        return null;
    }

    protected getShowAnimation(): Promise<any> {
        let view = this._view;
        view.lblTitle.x = 0;
        let targetX = System.width - view.lblTitle.width >> 1;

        return new Promise(resolve => {
            Laya.Tween.to(view.lblTitle, {x: targetX}, 200, Laya.Ease.backOut, Laya.Handler.create(this, resolve));
        });
    }

    protected getHideAnimation(): Promise<any> {
        let view = this._view;
        return new Promise(resolve => {
            Laya.Tween.to(view.lblTitle, {x: System.width}, 200, Laya.Ease.backIn, Laya.Handler.create(this, resolve));
        });
    }

    protected onLoaded(): void {
        let view = UI.HomeUI.createInstance();
        view.setSize(System.width, System.height);
        this._view = view;

        view.ldrBg.url = RES.getResUrl('equip_bg_jpg');
        view.ldrBg.onClick(this, this.onBgClick);
    }

    protected onShow(): Promise<any> {
        //todo show logic here
        return super.onShow();
    }

    protected onHide(): Promise<any> {
        //todo hide logic here
        return super.onHide();
    }

    protected onStop(): void {
    }

    protected onResume(): void {
    }

    protected onDestroy(): void {
        RES.clearRes('equip_bg_jpg');
        this._view = null;
    }

    protected onRegister(): void {
        EventCenter.register("test", this, this.onTest);
    }

    protected onDeregister(): void {
        EventCenter.deregister("test", this, this.onTest);
    }

    private onTest(a, b, c) {
        console.trace('onTest', a, b, c, this._view.lblTitle.text);
    }

    private onBgClick() {
        UIMgr.show(EquipUI);
    }
}