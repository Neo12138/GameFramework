/**
 * create by wangcheng on 2019/6/11 15:12
 */
class EquipUI extends zero.BaseUI{
    protected _view: UI.HomeUI;
    public constructor(props) {
        super(props);
    }

    protected onLoaded(): void {
        let view = UI.HomeUI.createInstance();
        this._view = view;
        view.setSize(System.width, System.height);

        view.ldrBg.url = RES.getResUrl("loading_bg_jpg");
        view.lblTitle.text = this.name;
        view.ldrBg.onClick(this, this.onBgClick);
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

    protected onShow(): Promise<any> {
        return super.onShow();
    }

    protected onHide(): Promise<any> {
        return super.onHide();
    }

    protected onStop(): void {
    }

    protected onResume(): void {
    }

    protected onDestroy(): void {
        RES.clearRes("loading_bg_jpg");
    }

    private onBgClick() {
        UIMgr.show(HomeUI);
    }
}
