/**
 * create by WangCheng on 2019/9/26 9:37
 */
export default class LayaAnimation {
    private readonly _view: Laya.Sprite;
    private times: number;
    private fnComplete: Function;

    public constructor(view: Laya.Sprite) {
        this._view = view;
    }

    /**
     * 播放动画
     * 如果播放次数为有限次，会在完成所有次数后，返回的promise才会结束
     * 如果播放次数为无限次(次数小于0), 返回的promise会立即结束
     * @param name 动画名
     * @param times 播放次数 -1则循环播放
     * @param speedRate
     */
    public play(name: string, times: number = 1, speedRate: number = 1) {
        if (times == 0) return;

        this.times = times;
        if (name in this._view) {
            let anim = <Laya.FrameAnimation>this._view[name];
            anim.gotoAndStop(0);
            anim.offAll(Laya.Event.COMPLETE);
            anim.interval = Config.animationInterval * speedRate;
            anim.play(0, true);

            if (times < 0) return;

            anim.on(Laya.Event.COMPLETE, this, this.onAnimComplete, [name]);
            return new Promise(resolve => {
                this.fnComplete = resolve;
            })
        }
    }

    private onAnimComplete(name: string): void {
        if (this.times > 0) this.times--;
        if (this.times == 0) {
            this.stop(name);
        }
    }

    public stop(name: string): void {
        this.fnComplete && this.fnComplete();
        this.fnComplete = null;

        if (name in this._view) {
            let anim = <Laya.FrameAnimation>this._view[name];
            anim.gotoAndStop(0);
        }
    }
}