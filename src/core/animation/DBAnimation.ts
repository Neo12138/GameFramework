/**
 * create by WangCheng on 2019/9/18 21:39
 */
import logger from "../logger";

export default class DBAnimation {
    private _display: Laya.Skeleton;
    private _destroyed: boolean;
    private _loaded: boolean;
    public autoPlay: boolean = true;
    private times: number;
    private fnComplete: Function;

    private mode: number;
    private curUrl: string;

    public constructor(mode: number = 0) {
        this._display = new Laya.Skeleton();
        this._display.mouseEnabled = false;
        this.mode = mode;
    }

    public async load(url: string) {
        if (this.curUrl == url) return;
        this.curUrl = url;

        await this.loadAsync(url);
        if (!this.autoPlay) {
            this._display.stop();
        }

        this._loaded = true;
        if (this._destroyed) {
            this.destroy();
            return Promise.reject(`[DBAnimation] load error! animation already destroyed`);
        }

        this._display.player.on(Laya.Event.COMPLETE, this, () => {
            if (this.times > 0) this.times--;
            if (this.times == 0) {
                this.completeAnimation();
            }
        });
    }

    private loadAsync(url: string) {
        return new Promise(resolve => {
            this._display.load(url, Laya.Handler.create(this, resolve), this.mode);
        });
    }

    public get display() {
        return this._display;
    }


    /**
     * 播放动画
     * 如果播放次数为有限次，会在完成所有次数后，返回的promise才会结束
     * 如果播放次数为无限次(次数小于0), 返回的promise会立即结束
     * @param nameOrIndex 动画名或者索引
     * @param times 播放次数 -1则循环播放
     * @param speedRate 播放速率
     */
    public play(nameOrIndex: string | number, times: number = 1, speedRate: number = 1) {
        if (!this._loaded) {
            logger.warn("播放失败, 动画未加载", nameOrIndex);
            return;
        }
        if (times == 0) return;

        this.times = times;
        this._display.stop();
        this._display.playbackRate(speedRate);
        this._display.play(nameOrIndex, true, false, 0);

        if (times < 0) return;

        return new Promise(resolve => {
            this.fnComplete = resolve;
        });
    }

    public stop(): void {
        this.times = 0;
        this.completeAnimation();
    }

    //当前动画总帧数
    private currentTotal: number;

    public gotoAndStop(): void {
        this.times = 0;
        this._display.index = this.currentTotal;
        this.completeAnimation();
    }

    public replaceSlotTexture(slotName: string, texture: Laya.Texture): void {
        if (!this._loaded) {
            logger.warn('替换插槽纹理失败，动画未加载完成');
            return;
        }

        this._display.setSlotSkin(slotName, texture);
        this._display.play(0, false);
    }

    private completeAnimation(): void {
        this.fnComplete && this.fnComplete();
        this.fnComplete = null;

        this._display.index = 0;
        this._display.stop();
    }

    public removeSelf(): void {
        this.stop();
        this._display.removeSelf();
    }

    public destroy(): void {
        this._destroyed = true;
        if (!this._loaded) return;
        this._loaded = false;
        this.fnComplete = null;

        let display = this._display;
        display.stop();
        display.removeSelf();
        if (this.mode != 0) {
            this._display.templet.destroy();
        }
        display.destroy(true);
        this._display = null;
    }

    public get loaded(): boolean {
        return this._loaded;
    }
}