/**
 * create by WangCheng on 2019/10/17 11:06
 */
export default class AbortableWait {

    public constructor() {
    }

    private complete(onComplete: Function): void {
        onComplete && onComplete();
    }

    public wait(delay) {
        this.abort();
        return new Promise(resolve => {
            Laya.timer.once(delay, this, this.complete, [resolve]);
        });
    }

    public abort(): void {
        Laya.timer.clear(this, this.complete);
    }
}