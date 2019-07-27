/**
 * create by wangcheng on 2019/7/24 16:14
 */
class Popup1 extends zero.BaseUI{
    protected _view: UI.HomeUI;
    public constructor(props) {
        super(props);
    }

    protected onLoaded(): void {
        let view = UI.HomeUI.createInstance();
        this._view = view;
        view.setSize(640, 960);

        view.ldrBg.url = RES.getResUrl("result_bg_jpg");
        view.lblTitle.text = this.name;
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
        RES.clearRes("result_bg_jpg");
    }
}