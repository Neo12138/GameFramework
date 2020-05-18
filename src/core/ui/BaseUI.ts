/**
 * created by wangcheng at 2019/8/3 9:40
 */
import {UIAnimHide, UIAnimShow, UIType} from "./UIType";
import * as UIUtils from "./UIUtils";
import RES from "../RES";
import logger from "../logger";

interface UiConfig {
    //UI类型，一般全屏的为view, 弹窗为popup, 通用的部分UI为section
    type: UIType
    //资源组名
    resGroup?: string,
    //UI移除之后是否自动销毁
    autoDestroy?: boolean,
    //UI移除之后延迟多少秒销毁(仅在autoDestroy为true时生效)
    destroyDelay?: number,
    //点击空白区域是否移除(仅对弹窗有效)
    touchBlankToHide?: boolean,
    //UI显示时的动画
    animationShow?: UIAnimShow,
    //UI移除时的动画
    animationHide?: UIAnimHide,
    //banner广告在此界面的状态，0隐藏，1显示，其他值不处理
    bannerAdState?: number;
    //包含的类型为section的UI,当此UI显示时，包含的section UI也要自动添加并显示
    includes?:string[];
}

/**
 * UI的基础类，定义UI的生命周期和默认行为
 * 请勿覆写或直接调用BaseUI中的public方法，只应覆写protected方法
 * 派生类中定义的public方法，不要直接调用，建议使用UIMgr.doMethod方法间接调用
 */
export default abstract class BaseUI {
    private _loaded: boolean;
    private _showing: boolean;
    private _stopped: boolean;
    //资源加载时调用的方法
    private _fnOnLoads: Function[];
    private _hideTime: number;

    protected _view: Laya.View;

    public readonly name: string;
    public readonly resGroup: string;
    public readonly autoDestroy: boolean;
    //配置表中单位为秒，这里已经换算成毫秒了
    public readonly destroyDelay: number;
    public readonly type: UIType;
    public readonly touchBlankToHide: boolean;
    public readonly animationShow: UIAnimShow;
    public readonly animationHide: UIAnimHide;
    //-1：不处理， 0：隐藏，1：显示
    public readonly bannerAdState: number;
    public data: UiConfig;
    public zIndex: number = 0;

    protected constructor(props: UiConfig) {
        let name = this.constructor['name'];
        this.name = name;
        //根据类名查找配置
        // props = props || customConfigs.getUIConfigByName(name) ;

        props = props || {type: UIType.view};
        this.type = props.type;
        this.resGroup = props.resGroup;
        this.autoDestroy = props.autoDestroy == void 0 ? false : props.autoDestroy;
        this.destroyDelay = props.destroyDelay * 1000 || 0;
        this.touchBlankToHide = props.touchBlankToHide == void 0 ? true : props.touchBlankToHide;
        this.animationShow = props.animationShow || 0;
        this.animationHide = props.animationHide || 0;
        this.bannerAdState = props.bannerAdState;
        this.data = props;
    }

    /**
     * 加载UI资源或者配置表
     */
    public async load() {
        let load = this.getLoadMethod();
        if (load) {
            await load;
        }

        logger.info(this.name, "onLoaded");
        this._loaded = true;
        this.onLoaded();

        if (this._fnOnLoads) {
            let fnOnLoads = this._fnOnLoads;
            for (let i = 0, len = fnOnLoads.length; i < len; i++) {
                fnOnLoads[i]();
            }
            this._fnOnLoads = null;
        }
    }

    public afterLoad(res: () => void) {
        if (!res) return;
        let fnOnLoads = this._fnOnLoads || [];

        if (fnOnLoads.indexOf(res) < 0) {
            fnOnLoads.push(res);
        }
        this._fnOnLoads = fnOnLoads;
    }


    public async show() {
        this._showing = true;

        let promiseShow = this.getShowAnimation();
        if (promiseShow) {
            logger.info(this.name, "getShowAnimation");
            this._view.mouseEnabled = false;
            await promiseShow;
            this._view.mouseEnabled = true;
        }
        logger.info(this.name, "onShow");
        this.onShow();
        this.onRegister();
        this.handleBannerAd();
    }


    public async hide() {
        let promiseHide = this.getHideAnimation();
        if (promiseHide) {
            logger.info(this.name, "getHideAnimation");
            this._view.mouseEnabled = false;
            await promiseHide;
            this._view.mouseEnabled = true;
        }

        logger.info(this.name, "onHide");
        this._showing = false;
        this._hideTime = Date.now();
        this.onHide();
        this.onDeregister();
        this.clearListEvent();
    }

    public stop(): void {
        logger.info(this.name, "onStop");
        this._stopped = true;
        this.onStop();
    }

    public resume(): void {
        logger.info(this.name, "onResume");
        this._stopped = false;
        this.handleBannerAd();
        this.onResume();
    }

    public destroy(): void {
        let life = (Date.now() - this._hideTime) / 1000;
        logger.info(this.name, "onDestroy 享年：" + life.toFixed(2) + "s");
        this.onDestroy();
        UIUtils.removeFromParent(this._view);
        this._view.destroy(true);
        this._view = null;
    }

    public get loaded() {
        return this._loaded;
    }

    public get showing() {
        return this._showing;
    }

    public get stopped() {
        return this._stopped;
    }

    public get view() {
        return this._view;
    }

    public get hideTime() {
        return this._hideTime;
    }

    protected getLoadMethod() {
        if (this.resGroup) {
            return RES.loadGroup(this.resGroup);
        }
        return null;
    }

    protected getShowAnimation(): Promise<any> {
        if (!this.animationShow) {
            return null;
        }
        return new Promise(resolve => {
            UIUtils.addAnimationUIShow(this._view, this.animationShow, resolve);
        });
    }

    protected getHideAnimation(): Promise<any> {
        if (!this.animationHide) {
            return null;
        }
        return new Promise(resolve => {
            UIUtils.addAnimationUIHide(this._view, this.animationHide, resolve);
        });
    }

    private _listArr = [];

    /**
     * 设置list渲染内容,禁止直接去赋值renderHandler,会造成内存泄漏
     * @param target list
     * @param func 渲染函数
     */
    protected setListRender(target: Laya.List, func: Function, args = null) {
        let index = this._listArr.indexOf(target);
        if (index < 0) {
            this._listArr.push(target);
        }
        target.renderHandler = Laya.Handler.create(this, func, args, false);
    }

    /**
     * 设置list点击事件,禁止直接去赋值selectHandler,会造成内存泄漏
     * @param target list
     * @param func item点击响应函数
     */
    protected setListSelect(target: Laya.List | Laya.Tab | Laya.RadioGroup, func: Function, args = null) {
        if (this._listArr.indexOf(target) < 0) {
            this._listArr.push(target);
        }
        target.selectHandler = Laya.Handler.create(this, func, args, false);
    }

    private clearListEvent(): void {
        for (let list of this._listArr) {
            if (list.renderHandler) {
                list.renderHandler.clear();
                list.renderHandler = null;
            }
            if (list.selectHandler) {
                list.selectHandler.clear();
                list.selectHandler = null;
            }
            if (list.changeHandler) {
                list.changeHandler.clear();
                list.changeHandler = null;
            }
        }
        this._listArr.length = 0;
    }

    /**
     * 资源加载完成时
     */
    protected abstract onLoaded(): void;

    /**
     * UI显示时的处理逻辑
     */
    protected abstract onShow(): void;

    /**
     * UI移除时的处理逻辑
     */
    protected abstract onHide(): void;

    /**
     * UI被弹窗盖住时的处理逻辑
     */
    protected onStop(): void {
    }

    /**
     * UI直接上层的弹窗被移除时的处理逻辑
     */
    protected onResume(): void {
    }

    /**
     * 在这里处理销毁操作
     * (确保)解绑所有的事件监听
     * 销毁引用的图片，声音等资源(如有必要)
     */
    protected abstract onDestroy(): void;

    /**
     * 绑定事件监听(onShow时)
     */
    protected onRegister(): void {
    }

    /**
     * 移除事件监听(onHide时)
     */
    protected onDeregister(): void {
    }

    private handleBannerAd(): void {
        if (this.bannerAdState == 1) {
            //show banner
            logger.info("--todo--showBannerAd");
        }
        else if (this.bannerAdState == 0) {
            //hide banner
            logger.info("--todo--hideBannerAd");
        }
    }

}