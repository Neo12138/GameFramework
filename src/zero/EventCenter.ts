/**
 * create by wangcheng on 2019/7/24 17:20
 */
namespace EventCenter {
    export let eventObserversMap: { [event: string]: Observer[] } = {};

    /**
     * 注册事件
     * @param event 事件名
     * @param caller 方法的调用者
     * @param method 方法
     */
    export function register(event: string, caller: object, method: Function) {
        if (!method) return;

        let observers = eventObserversMap[event] || [];
        let o = new Observer(caller, method);

        let registered: boolean;
        for (let i = 0, len = observers.length; i < len; i++) {
            if (o.equal(observers[i])) {
                registered = true;
                break;
            }
        }
        registered || observers.push(o);

        eventObserversMap[event] = observers;
    }

    /**
     * 事件解绑
     * @param event 事件名
     * @param caller 方法的调用者
     * @param method 方法
     */
    export function deregister(event: string, caller: object, method: Function) {
        if (!method) return;
        let observers = eventObserversMap[event];
        if (!observers) return;

        let o = new Observer(caller, method);

        let index: number;
        for (let i = 0, len = observers.length; i < len; i++) {
            if (o.equal(observers[i])) {
                index = i;
                break;
            }
        }
        observers[index].destroy();
        observers.splice(index, 1);

        if (observers.length == 0) {
            delete eventObserversMap[event];
        }
    }

    /**
     * 发送通知
     * 事件派发会延迟一帧执行，如果在同一帧内解绑事件，则不会执行事件监听
     * @param event 事件名
     * @param args 参数
     */
    export function notify(event: string, ...args: any[]) {
        let observers = eventObserversMap[event];
        if (!observers) return;
        Laya.timer.callLater(EventCenter, notifyLater, [event, ...args]);
    }

    /**
     * 延迟一帧执行事件派发，通知所有观察者更新
     * 防止同一帧内多次执行更新
     * @param event
     * @param args
     */
    export function notifyLater(event:string, ...args:any[]) {
        let observers = eventObserversMap[event];
        if (!observers) return;

        for (let i = 0, len = observers.length; i < len; i++) {
            observers[i].update(...args);
        }
    }


    class Observer {
        private caller: object;
        private method: Function;

        public constructor(caller: object, method: Function) {
            this.caller = caller;
            this.method = method;
        }

        public update(...args: any): void {
            this.method.call(this.caller, ...args);
        }

        public equal(observer: Observer): boolean {
            return observer && this.caller == observer.caller && this.method == observer.method;
        }

        public destroy() {
            this.caller = null;
            this.method = null;
        }
    }
}