/**
 * created by wangcheng at 2019/8/3 10:53
 */
import logger from "./logger";
import utils from "./utils/utils";

class System {
    private _designWidth: number;
    private _designHeight: number;
    private _width: number;
    private _height: number;
    private _aspectRatio: number;

    private _liuhaiHeight: number;
    private _homeIndicatorHeight: number;

    private _centerOffsetX: number;
    private _centerOffsetY: number;

    public setDesignSize(width: number, height: number): void {
        this._designWidth = width;
        this._designHeight = height;

        this._width = width;
        this._height = height;
        this._aspectRatio = width / height;
    }

    public resize(): void {
        let scaleMode = Laya.stage.scaleMode;
        let screenMode = Laya.stage.screenMode;
        let width = Laya.Browser.width;
        let height = Laya.Browser.height;
        if (screenMode == Laya.Stage.SCREEN_HORIZONTAL) {
            if (height > width) {
                [width, height] = [height, width];
            }
        }
        else if (height < width) {
            [width, height] = [height, width];
        }

        switch (scaleMode) {
            case Laya.Stage.SCALE_FIXED_WIDTH:
                this._height = Math.round(this._designWidth * height / width);
                break;
            case Laya.Stage.SCALE_FIXED_HEIGHT:
                this._width = Math.round(this._designHeight * width / height);
                break;
            case Laya.Stage.SCALE_FIXED_AUTO:
                if (height / width >= this._designHeight / this._designWidth) {
                    this._height = Math.round(this._designWidth * height / width);
                }
                else {
                    this._width = Math.round(this._designHeight * width / height);
                }
                break;
            default:
                this._height = Math.round(this._designWidth * height / width);
        }
        logger.info("System", this._width, this._height);
        this.afterResize();
    }

    private afterResize(): void {
        this._aspectRatio = this._width / this._height;
        this.setCenterOffset();
        this.setSafeArea();
    }

    private setSafeArea(): void {
        // 宽高比小于0.5，可视为刘海屏手机
        if (this._aspectRatio < 0.5) {
            //0.11733333333333333  44/ 375
            let height = Math.round(this._designWidth * 0.1173);

            this._liuhaiHeight = height;
            // 34 / 375
            this._homeIndicatorHeight = Math.round(this._designWidth * 0.0907);
        }
        else {
            this._liuhaiHeight = 0;
            this._homeIndicatorHeight = 0;
        }
    }

    private setCenterOffset(): void {
        this._centerOffsetX = Math.round((this._width - this._designWidth) / 2);
        this._centerOffsetY = Math.round((this._height - this._designHeight) / 2);
    }


    get designWidth(): number {
        return this._designWidth;
    }

    get designHeight(): number {
        return this._designHeight;
    }

    //当前游戏舞台宽度
    get width(): number {
        return this._width;
    }

    //当前游戏舞台高度
    get height(): number {
        return this._height;
    }

    //屏幕宽高比
    get aspectRatio(): number {
        return this._aspectRatio;
    }

    get liuhaiHeight(): number {
        return this._liuhaiHeight;
    }

    get homeIndicatorHeight(): number {
        return this._homeIndicatorHeight;
    }

    //屏幕中心相对于设计尺寸偏移的距离x
    get centerOffsetX(): number {
        return this._centerOffsetX;
    }

    //屏幕中心相对于设计尺寸偏移的距离y
    get centerOffsetY(): number {
        return this._centerOffsetY;
    }
}

const system = new System();
export default system;
utils.defineGlobalProperty('system', system, true);