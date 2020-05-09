/**
 * create by wangcheng on 2019/7/23 16:48
 * UI类的基础类 子类秩序覆写或者实现父类的protected方法即可
 */
namespace zero {
    export abstract class BaseUI {
        private _loaded: boolean;
        private _showing: boolean;
        private _stopped: boolean;
        private _fnOnLoads: Function[];
        private _hideTime: number;

        protected _view: any;

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
        public zIndex: number = 0;

        protected constructor(props: any) {
            this.name = this["__proto__"].constructor.name;

            props = props || {};
            this.resGroup = props.resGroup;
            this.type = props.type || UIType.view;
            this.autoDestroy = props.autoDestroy == void 0 ? true : props.autoDestroy;
            this.destroyDelay = props.destroyDelay * 1000 || 0;
            this.touchBlankToHide = props.touchBlankToHide == void 0 ? true : props.touchBlankToHide;
            this.animationShow = props.animationShow || 0;
            this.animationHide = props.animationHide || 0;
            this.bannerAdState = props.bannerAdState;
        }

        /**
         * 加载UI资源或者配置表
         */
        public async load() {
            let load = this.getLoadMethod();
            if (load) {
                await load;
            }

            zero.log(this.name, "onLoaded");
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


        public show(): Promise<void> {
            zero.log(this.name, "onShow");
            this._showing = true;
            this.handleBannerAd();

            return this.onShow();
        }

        public hide(): Promise<any> {
            zero.log(this.name, "onHide");
            this._showing = false;
            this._hideTime = Date.now();

            return this.onHide();
        }

        public stop(): void {
            zero.log(this.name, "onStop");
            this._stopped = true;
            this.onStop();
        }

        public resume(): void {
            zero.log(this.name, "onResume");
            this._stopped = false;
            this.handleBannerAd();
            this.onResume();
        }

        public destroy(): void {
            let life = (Date.now() - this._hideTime) / 1000;
            zero.log(this.name, "onDestroy 享年：" + life.toFixed(2) + "s");
            UIUtils.removeFromParent(this._view);
            this._view = null;
            this.onDestroy();
        }

        public setParent(parent:fairygui.GComponent, index?:number):void {
            if(parent == null) {
                zero.error(`can't addChild ${this.name}.view to a null node`);
                return
            }
            if (index == null) {
                parent.addChild(this._view);
            }
            else {
                parent.addChildAt(this._view, index);
            }
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

        protected getLoadMethod(): Promise<any> {
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

        protected afterShowAnimation():void {

        }

        protected abstract onLoaded(): void;

        protected onShow(): Promise<any> {
            this.onRegister();
            if(this.getShowAnimation()) {
                return this.getShowAnimation().then(this.afterShowAnimation.bind(this));
            }
            else {
                this.afterShowAnimation();
                return this.getShowAnimation();
            }
        };

        /**
         * UI移除时，如果有动画效果，则返回一个promise对象
         * 如果没有动画则返回null
         */
        protected onHide(): Promise<any> {
            this.onDeregister();
            return this.getHideAnimation();
        };

        protected abstract onStop(): void;

        protected abstract onResume(): void ;

        protected abstract onDestroy(): void;

        protected onRegister(): void {
        };

        protected onDeregister(): void {
        };

        private handleBannerAd(): void {
            if (this.bannerAdState == 1) {
                //show banner
                zero.log("--todo--showBannerAd");
            }
            else if (this.bannerAdState == 0) {
                //hide banner
                zero.log("--todo--hideBannerAd");
            }
        }
    }
}
