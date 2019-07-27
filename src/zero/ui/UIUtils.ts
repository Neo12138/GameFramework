/**
 * create by wangcheng on 2019/7/24 9:51
 */
namespace UIUtils {
    export function removeFromParent(view: any): void {
        if (view && view.parent) {
            view.parent.removeChild(view);
        }
    }

    export function addAnimationUIShow(target: fairygui.GObject, type: UIAnimShow, onComplete?: () => void): void {
        let complete: Laya.Handler;
        if (type > 0 && onComplete) {
            complete = Laya.Handler.create(this, onComplete);
        }

        if (type == UIAnimShow.scale) {
            target.setPivot(.5, .5);
            target.setScale(0, 0);
            Laya.Tween.to(target, {scaleX: 1, scaleY: 1}, 300, Laya.Ease.backOut, complete);
            return;
        }

        if (type == UIAnimShow.scroll) {
            target.pivotY = .5;
            target.scaleY = 0;
            Laya.Tween.to(target, {scaleY: 1}, 300, Laya.Ease.quartOut, complete);
            return;
        }

        if (type == UIAnimShow.fadeIn) {
            target.alpha = 0;
            Laya.Tween.to(target, {alpha: 1}, 300, Laya.Ease.quadOut, complete);
            return;
        }
    }

    export function addAnimationUIHide(target: fairygui.GObject, type: UIAnimHide, onComplete?: () => void): void {
        let complete: Laya.Handler;
        if (type > 0 && onComplete) {
            complete = Laya.Handler.create(this, onComplete);
        }

        if (type == UIAnimHide.scale) {
            target.setPivot(.5, .5);
            Laya.Tween.to(target, {scaleX: 0, scaleY: 0}, 300, Laya.Ease.backIn, complete);
            return;
        }

        if (type == UIAnimHide.scroll) {
            target.pivotY = .5;
            Laya.Tween.to(target, {scaleY: 0}, 300, Laya.Ease.backIn, complete);
            return;
        }

        if (type == UIAnimHide.fadeOut) {
            target.alpha = 0;
            Laya.Tween.to(target, {alpha: 0}, 300, Laya.Ease.quadOut, complete);
            return;
        }
    }
}