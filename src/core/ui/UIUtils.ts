/**
 * created by wangcheng at 2019/8/3 11:43
 */
import {UIAnimHide, UIAnimShow} from "./UIType";
import system from "../System";

type Rect = { x: number, y: number, width: number, height: number, parent?: any };
type AlignMethod = { top?: boolean, bottom?: boolean, left?: boolean, right?: boolean, center?: boolean, middle?: boolean }
type AlignStyle = { top?: number, bottom?: number, left?: number, right?: number, center?: number, middle?: number }

export function removeFromParent(view: any): void {
    if (view && view.parent) {
        view.parent.removeChild(view);
    }
}

export function addAnimationUIShow(target: Laya.Sprite, type: UIAnimShow, onComplete?: () => void) {
    let complete: Laya.Handler;
    let p: Promise<void>;
    if (type > 0) {
        p = new Promise(resolve => {
            complete = Laya.Handler.create(this, () => {
                resolve();
                onComplete && onComplete();
            });
        });
    }

    if (type == UIAnimShow.scale) {
        target.scaleX = 0;
        target.scaleY = 0;
        Laya.Tween.to(target, {scaleX: 1, scaleY: 1}, 300, Laya.Ease.backOut, complete);
        return p;
    }

    if (type == UIAnimShow.scroll) {
        target.scaleX = 1;
        target.scaleY = 0;
        Laya.Tween.to(target, {scaleY: 1}, 300, Laya.Ease.quartOut, complete);
        return p;
    }

    if (type == UIAnimShow.fadeIn) {
        target.alpha = 0;
        Laya.Tween.to(target, {alpha: 1}, 300, Laya.Ease.quadOut, complete);
        return p;
    }
}

export function addAnimationUIHide(target: Laya.Sprite, type: UIAnimHide, onComplete?: () => void, delay:number = 100) {
    let complete: Laya.Handler;
    let p: Promise<void>;
    if (type > 0) {
        p = new Promise(resolve => {
            complete = Laya.Handler.create(this, () => {
                resolve();
                onComplete && onComplete();
            });
        });
    }

    if (type == UIAnimHide.scale) {
        Laya.Tween.to(target, {scaleX: 0, scaleY: 0}, 200, Laya.Ease.backIn, complete, delay);
        return p;
    }

    if (type == UIAnimHide.scroll) {
        Laya.Tween.to(target, {scaleY: 0}, 200, Laya.Ease.backIn, complete, delay);
        return p;
    }

    if (type == UIAnimHide.fadeOut) {
        target.alpha = 0;
        Laya.Tween.to(target, {alpha: 0}, 200, Laya.Ease.quadOut, complete, delay);
        return p;
    }
}


/**
 * 保持UI组件和舞台尺寸一致
 * @param targets
 */
export function fillFullScreen(...targets: Rect[]): void {
    if (!targets || targets.length == 0) return;

    for (let i = 0, len = targets.length; i < len; i++) {
        if (!targets[i]) continue;
        targets[i].width = system.width;
        targets[i].height = system.height;
    }
}

/**
 * 保持UI组件 底对齐(相对于舞台)
 * 如果是全面屏手机，会增加一个值为刘海高度的顶边距
 * @param targets
 */
export function alignTop(...targets: Rect[]): void {
    align({top: true}, ...targets);
}

/**
 * 保持UI组件 底对齐(相对于舞台)
 * 如果是全面屏手机，会增加一个值为home键指示条高度的底边距
 * @param targets
 */
export function alignBottom(...targets: Rect[]): void {
    align({bottom: true}, ...targets);
}

/**
 * 保持UI组件 右对齐(相对于舞台)
 * @param targets
 */
export function alignRight(...targets: Rect[]): void {
    align({right: true}, ...targets);
}

/**
 * 保持UI组件 左右居中对齐(相对于舞台)
 * @param targets
 */
export function alignCenter(...targets: Rect[]): void {
    align({center: true}, ...targets);
}

/**
 * 保持UI组件 上下居中对齐(相对于舞台)
 * @param targets
 */
export function alignMiddle(...targets: Rect[]): void {
    align({middle: true}, ...targets);
}

/**
 * 控制UI组件对齐的方式(相对于舞台)
 * @param method {AlignMethod} 对齐的方式
 * @param targets UI组件数组
 */
export function align(method: AlignMethod, ...targets: Rect[]): void {
    if (!targets || targets.length == 0) return;

    let offsetX: number = 0;
    let offsetY: number = 0;
    //x方向
    if (method.right) {
        offsetX = system.width - system.designWidth;
    }
    else if (method.center) {
        offsetX = system.centerOffsetX;
    }

    if (method.top) {
        offsetY = system.liuhaiHeight;
    }
    else if (method.bottom) {
        offsetY = (system.height - system.designHeight) - system.homeIndicatorHeight;
    }
    else if (method.middle) {
        offsetY = system.centerOffsetY;
    }
    //y方向

    //调整坐标
    for (let i = 0, len = targets.length; i < len; i++) {
        if (!targets[i]) continue;
        targets[i].x += offsetX;
        targets[i].y += offsetY;
    }
}