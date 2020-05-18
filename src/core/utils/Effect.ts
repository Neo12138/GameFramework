/**
 * create by WangCheng on 2019/9/18 16:25
 */
import utils from "./utils";

namespace Effect {
    export function clearEffect(target: any): void {
        Laya.timer.clearAll(target);
        Laya.Tween.clearAll(target);
        target.scaleX = 1;
        target.scaleY = 1;

        let timeLine: Laya.TimeLine = target['customTimeLine'];
        if (timeLine) {
            timeLine.pause();
            timeLine.destroy();
            target['customTimeLine'] = null;
        }
    }

    export async function blink(target: { visible: boolean }, times: number = 8) {
        if (!target || !times) return;

        Laya.timer.clearAll(target);
        Laya.timer.loop(80, target, () => {
            target.visible = !target.visible;
            if (times > 0) times--;
            if (times == 0) {
                Laya.timer.clearAll(target);
                return Promise.resolve();
            }
        })
    }

    export function breath(target: any, args?: any[]): void {
        clearEffect(target);

        let originSX = target.scaleX;
        let originSY = target.scaleY;
        let playTime = 500;
        let l1 = 0.1;
        let l2 = 0.1;
        if (args != null) {
            l1 = args[0] || 0.1;
            l2 = args[1] || 0.1;
            playTime = args[2] || 500;
        }

        let timeline = Laya.TimeLine
            .to(target, {scaleX: originSX + l1, scaleY: originSY + l1}, playTime, Laya.Ease.quadIn)
            .to(target, {scaleX: originSX - l2, scaleY: originSY - l2}, playTime * 2, Laya.Ease.quadIn);
        target['customTimeLine'] = timeline;

        let anim = () => {
            timeline.play(0, false);
        };
        anim();
        Laya.timer.loop(playTime * 3, target, anim);
    }

    export function heartBeat(target: any): void {
        breath(target, [.1, .2, 200]);
    }

    export function bubbling(target: any, args?: any[]): void {
        clearEffect(target);

        let originSX = target.scaleX;
        let originSY = target.scaleY;
        let playTime = 500;
        let s1 = 0.1;
        if (args != null) {
            s1 = args[0] || 0.1;
            playTime = args[1] || 500;
        }

        let anim = () => {
            target.scaleX = 0;
            target.scaleY = 0;
            target.visible = true;
            Laya.Tween.to(target, {scaleX: originSX + s1, scaleY: originSY + s1}, playTime, Laya.Ease.quadIn, Laya.Handler.create(this, () => {
                target.visible = false;
                utils.wait(1000).then(anim);
            }));
        };
        anim();
    }

    export function beat(target: any) {
        Laya.Tween.clearAll(target);
        let originScaleX = target.scaleX;
        let originScaleY = target.scaleY;
        Laya.Tween.to(target, {scaleX: originScaleX * 1.2, scaleY: originScaleY * 1.2}, 200, Laya.Ease.backIn, Laya.Handler.create(this, () => {
            Laya.Tween.to(target, {scaleX: originScaleX, scaleY: originScaleY}, 150, Laya.Ease.quadIn);
        }));
    }
}

export default Effect;