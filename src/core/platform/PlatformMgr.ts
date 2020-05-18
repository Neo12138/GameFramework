/**
 * create by wangcheng on 2019/8/5 12:06
 */
import Platform from "./Platform";
import logger from "../logger";

export enum PlatformType
{
    Test = 99999, // 本地模式 
    OPPO = 1006,
}

export interface Lifecycle {
    onLoad: (res: any) => void;
    onEnterForeground: (res: any) => void;
    onEnterBackground: (res: any) => void;
    onExit: (res: any) => void;
}

class PlatformManager {
    private _platform: Platform;

    public init<T extends Platform>(clazz: new () => T): void {
        try {
            let inst = new clazz();
            this._platform = inst;

            let basePath = inst.getBasePath();
            if (basePath) {
                Laya.URL.basePath = basePath;
            }
            logger.debug("Laya.URL.basePath：", Laya.URL.basePath);

        }
        catch (e) {
            logger.error(e);
        }
    }


    public get platform() {
        return this._platform;
    }
}

const PlatformMgr = new PlatformManager();
export default PlatformMgr;