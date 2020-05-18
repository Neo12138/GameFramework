/**
 * created by wangcheng at 2019/8/3 9:40
 */
import BaseUI from "./BaseUI";
import Map from "../utils/Map";
import system from "../System";
import {UIAnimShow, UIType} from "./UIType";
import {addAnimationUIShow} from "./UIUtils";
import utils from "../utils/utils";

class UIManager {
    /**
     * 视图层，添加view界面，以及view界面的bg
     */
    private viewLayer: Laya.Sprite;
    /**
     *  片段层, 添加view之间共享的界面(底部导航，顶部玩家信息等)
     */
    private sectionLayer: Laya.Sprite;
    /**
     * 弹窗层，添加各种弹窗界面
     */
    private popupLayer: Laya.Sprite;
    /**
     * 系统消息层，添加系统喇叭，飘字等界面
     */
    private systemLayer: Laya.Sprite;

    private mask: Laya.Sprite;

    private allUIMap: Map<any, BaseUI> = new Map<any, BaseUI>();

    private curView: BaseUI;
    private curPopup: BaseUI;

    public init(): void {
        //确保UI界面永远在3d场景上层
        let zOrder = 100;
        let viewLayer = new Laya.Sprite();
        this.viewLayer = viewLayer;
        viewLayer.zOrder = zOrder++;
        viewLayer.name = "viewLayer";
        Laya.stage.addChild(viewLayer);

        let sectionLayer = new Laya.Sprite();
        this.sectionLayer = sectionLayer;
        sectionLayer.zOrder = zOrder++;
        sectionLayer.name = "sectionLayer";
        Laya.stage.addChild(sectionLayer);

        let popupLayer = new Laya.Sprite();
        this.popupLayer = popupLayer;
        popupLayer.zOrder = zOrder++;
        popupLayer.name = "popupLayer";
        Laya.stage.addChild(popupLayer);

        let systemLayer = new Laya.Sprite();
        this.systemLayer = systemLayer;
        systemLayer.zOrder = zOrder;
        systemLayer.name = "systemLayer";
        Laya.stage.addChild(systemLayer);

        if (this.mask == null) {
            let mask = new Laya.Sprite();
            this.mask = mask;
            mask.name = "mask";
            mask.size(system.width, system.height);
            mask.graphics.drawRect(0, 0, system.width, system.height, "#333333");
            mask.alpha = 0.8;
            mask.mouseEnabled = true;
            mask.on(Laya.Event.CLICK, this, this.touchBlankToRemovePopup);
        }

        Laya.timer.loop(200, this, this.checkUIDestroy);

        utils.defineGlobalProperty('UIMgr', this);
    }

    private sectionClazzMap: { [name: string]: new() => BaseUI } = {};

    public regSectionClass(clazz: new () => BaseUI): void {
        this.sectionClazzMap[clazz.name] = clazz;
    }

    public setPopupMask(mask: Laya.Sprite): void {
        if (this.mask) {
            this.mask.destroy();
        }
        this.mask = mask;
        mask.mouseEnabled = true;
        mask.on(Laya.Event.CLICK, this, this.touchBlankToRemovePopup);
    }

    /**
     * 获取一个UI对象，如果没有创建，或者已经销毁，返回的是null
     * @param clazz
     */
    public get<T extends BaseUI>(clazz: new () => T): T {
        return this.allUIMap.get(clazz) as T;
    }

    public getOrCreate<T extends BaseUI>(clazz: new () => T): T {
        let ui = this.get(clazz);
        if (ui == void 0) {
            //ui刚创建时，只会创建配置数据，load之后才有的界面
            ui = new clazz();
            //todo 读取配置表
            this.allUIMap.set(clazz, ui);
        }
        return ui;
    }

    public async show<T extends BaseUI>(clazz: new () => T) {
        let ui = this.getOrCreate(clazz);
        if (!ui.loaded) {
            await ui.load();
        }
        if (ui.showing) return;

        await this.addUI(ui);
    }

    /**
     * 获取一个UI对象，如果没有创建，或者已经销毁，返回的是null
     * @param clazz
     */
    public async hide<T extends BaseUI>(clazz: new () => T) {
        let ui = this.get(clazz);
        if (!ui || !ui.showing) {
            console.warn(`hide UI '${ui.name}'fail, ui not show yet`);
            return;
        }

        if (!ui.loaded) {
            console.warn(`hide UI '${ui.name}'fail, ui not load yet`);
            await ui.load();
        }
        await this.removeUI(ui);
    }

    private async addUI(ui: BaseUI) {
        let view = ui.view;
        if (!view) {
            console.warn(`add UI '${ui.name}' fail, view is null`);
            return;
        }
        //添加新的界面可能会对已经存在的界面产生一些影响，
        //这里根据新添加的UI的类型，分别对新界进行添加，并对对其它UI进行处理
        if (ui.type === UIType.view) {
            await this.addView(ui);
        }
        else if (ui.type === UIType.section) {
            //不会影响其它UI, 直接添加；如有必要，检查此UI是否属于当前UI
            this.sectionLayer.addChild(ui.view);
            await ui.show();
        }
        else if (ui.type === UIType.popup) {
            await this.addPopup(ui);
        }
        else if (ui.type == UIType.top) {
            //不会影响其它UI,直接添加
            this.systemLayer.addChild(ui.view);
            await ui.show();
        }
    }

    /**
     * popupLayer 全部hide
     *
     * sharedLayer
     * 根据情况移除，如果sharedLayer中存在的ui,在下一个ui的includes中，则不hide，否则hide
     *
     * baseLayer
     * await preView.hide()
     * baseLayer remove preView
     * baseLayer add ui bg2;
     * bg2.fadeIn.then(重新添加回preView)
     * await ui.show()
     * show sharedUI
     * @param ui
     */
    private async addView(ui: BaseUI) {
        //移除所有弹窗
        this.removeAllPopup();
        //移除当前添加的ui上没有的section
        this.removeSections(ui);
        //处理两个view界面之间的切换
        let bg = this.getBackgroundFrom(ui);
        if (this.curView) {
            let preView = this.curView;
            this.curView = ui;
            await preView.hide();
            preView.view.removeSelf();
            let preBg = this.viewLayer.getChildAt(0) as Laya.Sprite;
            if (bg) {
                this.viewLayer.addChild(bg);
            }

            if (bg && preBg) {
                addAnimationUIShow(bg, UIAnimShow.fadeIn, () => {
                    preView.view.addChildAt(preBg, 0);
                });
            }
            else if (preBg) {
                preView.view.addChildAt(preBg, 0);
            }
            this.viewLayer.addChild(ui.view);
        }
        else {
            if (bg) this.viewLayer.addChild(bg);
            this.viewLayer.addChild(ui.view);
            this.curView = ui;
        }
        await ui.show();
        //添加当前ui的section
        this.addSections(ui);
    }

    private getBackgroundFrom(ui: BaseUI): Laya.Sprite {
        let view: Laya.Sprite = ui.view;

        if ("bg" in view) {
            return view["bg"];
        }
        let childrenCount = view.numChildren;
        for (let i = 0; i < childrenCount; i++) {
            let child = view.getChildAt(i) as Laya.Sprite;
            if (child.name == "bg") {
                return child;
            }
        }
        console.warn(`${ui.name}上没有发现背景图。如果此界面有背景，请确保背景图的var属性或者name属性的值为'bg'`);
    }

    private removeAllPopup() {
        let uis = this.allUIMap.values();
        uis.sort((a, b) => a.zIndex - b.zIndex);

        for (let i = uis.length - 1; i >= 0; i--) {
            let ui = uis[i];

            if (ui.type == UIType.popup) {
                ui.hide();
                this.popupLayer.removeChild(ui.view);
            }
        }
        this.curPopup = null;
    }

    private removeSections(ui: BaseUI) {
        if (!this.curView) return;
        let preSections = this.curView.data.includes;
        let curSections = ui.data.includes;
        for (let i = preSections.length - 1; i >= 0; i--) {
            let className = preSections[i];
            if (curSections.indexOf(className) == -1) {
                let clazz = this.sectionClazzMap[className];
                this.hide(clazz);
            }
        }
    }

    private addSections(ui: BaseUI) {
        let curSections = ui.data.includes;
        for (let i = 0, len = curSections.length; i < len; i++) {
            let clazzName = curSections[i];
            let clazz = this.sectionClazzMap[clazzName];
            if (clazz) {
                this.show(clazz);
            }
        }
    }

    /**
     * popupLayer 如果有暂停最上层弹窗
     * ectionLayer 如果popupLayer没有UI,暂停所有
     * baseLayer 如果popupLayer没有UI,暂停所有
     * 添加ui
     * @param ui
     */
    private async addPopup(ui: BaseUI) {
        //popupLayer如果有，暂停最上层（暂时不考虑异步加载导致的弹窗当前可能未添加的问题）
        if (this.curPopup) {
            this.curPopup.stop();
        }
        else {
            let sections = this.curView.data.includes;
            for (let i = 0, len = sections.length; i < len; i++) {
                let clazzName = sections[i];
                let clazz = this.sectionClazzMap[clazzName];
                let ui = this.get(clazz);
                if (ui) {
                    ui.stop();
                }
            }
            this.curView.stop();
        }
        this.curPopup = ui;
        this.popupLayer.addChild(this.mask);
        this.popupLayer.addChild(ui.view);
        await ui.show();
    }

    private async removeUI(ui: BaseUI) {
        let view = ui.view;
        if (!view) {
            console.warn(`remove UI '${ui.name}' fail, view is null`);
            return;
        }

        if (ui.type == UIType.view) {
            await this.removeView(ui);
        }
        else if (ui.type == UIType.section) {
            await ui.hide();
            this.sectionLayer.removeChild(ui.view);
        }
        else if (ui.type == UIType.popup) {
            await this.removePopup(ui);
        }
        else if (ui.type == UIType.top) {
            await ui.hide();
            this.systemLayer.removeChild(ui.view);
        }
    }

    /**
     * 移除所有弹窗
     * 移除所有section
     * 移除view
     * @param ui
     */
    private async removeView(ui: BaseUI) {
        this.removeAllPopup();
        if (!this.curView) return;
        let preSections = this.curView.data.includes;
        for (let i = 0, len = preSections.length; i < len; i++) {
            let className = preSections[i];
            let clazz = this.sectionClazzMap[className];
            this.hide(clazz);
        }

        await ui.hide();
        this.viewLayer.removeChild(ui.view);
        this.curView = null;
    }

    /**
     * 移除当前弹窗，恢复下方暂停的界面
     * @param ui
     */
    private async removePopup(ui: BaseUI) {
        await ui.hide();
        this.popupLayer.removeChild(ui.view);
        let numPopup = this.popupLayer.numChildren;
        //底下还有弹窗
        if (numPopup > 1) {
            //将蒙版下移
            this.popupLayer.addChildAt(this.mask, numPopup - 2);

            //移除弹窗后还有弹窗，恢复此时顶层弹窗
            let topPop = this.popupLayer.getChildAt(numPopup - 1) as Laya.View;
            let ui = this.getUIByView(topPop);
            this.curPopup = ui;
            ui.resume();
        }
        else {
            //移除蒙版
            this.popupLayer.removeChild(this.mask);
            this.resumeViewAndSection();
        }
    }

    private resumeViewAndSection() {
        //已经没有了弹窗，恢复当前view和他的section
        this.curPopup = null;
        let preSections = this.curView.data.includes;
        for (let i = preSections.length - 1; i >=0; i--) {
            let className = preSections[i];
            let clazz = this.sectionClazzMap[className];
            let ui = this.get(clazz);
            ui.resume();
        }
        this.curView.resume();
    }

    private touchBlankToRemovePopup(): void {
        let numChildren = this.popupLayer.numChildren;
        let view = this.popupLayer.getChildAt(numChildren - 1) as Laya.View;
        if (view == this.mask) {
            if (numChildren == 1) {
                this.popupLayer.removeChildren();
                this.resumeViewAndSection();
                return;
            }
            this.popupLayer.addChildAt(this.mask, numChildren - 2);
            this.touchBlankToRemovePopup();
        }
        let ui = this.getUIByView(view);
        if (ui && ui.touchBlankToHide) {
            console.log("remove popup", ui.name);
            this.removePopup(ui);
        }
    }

    private getUIByView(view: Laya.View): BaseUI {
        let uis = this.allUIMap.values();
        if (uis.find) {
            return uis.find(v => v.view == view);
        }
        for (let i = uis.length - 1; i >= 0; i--) {
            let ui = uis[i];
            if (ui.view == view) {
                return ui;
            }
        }
        return null;
    }

    private checkUIDestroy(): void {
        let uis = this.allUIMap.values();
        let now = Date.now();
        for (let i = uis.length - 1; i >= 0; i--) {
            let ui = uis[i];
            if (ui.autoDestroy && !ui.showing && now - ui.hideTime > ui.destroyDelay) {
                if (this.curView === ui) {
                    this.curView = null;
                }
                if (this.curPopup === ui) {
                    this.curPopup = null;
                }
                ui.destroy();
                this.allUIMap.removeByValue(ui);
            }
        }
    }

}

const UIMgr = new UIManager();
export default UIMgr;

