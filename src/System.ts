class System {
    private static _designWidth = 0;
    private static _designHeight = 0;
    private static _width = 0;
    private static _height = 0;
    private static _scaleFactor = 1;
    //宽高比
    private static _aspectRatio = 0.5625; // 9/16

    public static system = '';

    private constructor(){
    }
    public static setDesignSize(width:number, height:number):void {
        System._designWidth = width;
        System._designHeight = height;
        System._width = width;
        System._height = height;
    }
    public static resize():void {
        System._width = Laya.stage.width;
        System._height = Laya.stage.height;
        System._resize();
        zero.info("Resize", System.width, System.height);
    }

    private static _resize():void {
        System._aspectRatio = System.width / System.height;
        System._scaleFactor = Math.max(System.width / System.designWidth, System.height / System.designHeight);
        System._centerOffsetY = System.height - System.designHeight >> 1;

        System.setSafeOffsetY();
    }

    public static preResize():void {
        switch (Laya.stage.scaleMode) {
            case Laya.Stage.SCALE_FIXED_WIDTH:
                System._height = Math.round(Laya.Browser.height * System.width / Laya.Browser.width);
                break;
            case Laya.Stage.SCALE_FIXED_HEIGHT:
                System._width = Math.round(Laya.Browser.width * System.height / Laya.Browser.height);
                break;
            case Laya.Stage.SCALE_FIXED_AUTO:
                if (Laya.Browser.width / Laya.Browser.height < System.designWidth / System.designHeight) {
                    System._height = Math.round(Laya.Browser.height * System.width / Laya.Browser.width);
                } else {
                    System._width = Math.round(Laya.Browser.width * System.height / Laya.Browser.height);
                }
                break;
            default:
                break;
        }
        System._resize();
        zero.info("PreResize", System.width, System.height);
    }

    private static _offsetYForBanner:number = 0;
    public static get offsetYForBanner(){
        return System._offsetYForBanner;
    }

    public static get designWidth(): number{
        return this._designWidth
    }

    public static get designHeight(): number {
        return this._designHeight;
    }

    public static get width(): number {
        return this._width;
    }

    public static get height(): number {
        return this._height;
    }

    public static get scaleFactor(): number {
        return this._scaleFactor;
    }
    //屏幕 宽高比
    public static get aspectRatio(): number {
        return this._aspectRatio;
    }

    private static _liuhaiHeight:number;
    public static get liuhaiHeight(){
        return System._liuhaiHeight;
    }


    private static setSafeOffsetY():void {
        if(System.scaleFactor > 1.005) {
            System._liuhaiHeight = System._aspectRatio > 0.5 ? 0: 100;
            System._safeOffsetY = System._centerOffsetY - System._liuhaiHeight;
        }else {
            System._liuhaiHeight = 0;
            System._safeOffsetY = 0;
        }
    }
    private static _safeOffsetY:number;
    public static get safeOffsetY() {
        return System._safeOffsetY;
    }

    private static _centerOffsetY:number;
    //轴心Y轴偏移的值
    public static get centerOffsetY(){
        return System._centerOffsetY;
    }
}
