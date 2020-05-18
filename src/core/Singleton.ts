/**
 * create by wangcheng on 2019/8/24 10:31
 */
import logger from "./logger";

export default class Singleton {
    private static instanceMap: { [name: string]: Object } = {};

    /**
     * 获取 指定类 的单例
     * @param clazz
     */
    public static for<T>(clazz: new () => T): T {
        if (!clazz) {
            logger.error("Singleton", `can't create instance from null constructor`);
            return;
        }
        let name = clazz["name"];
        let inst = this.instanceMap[name] as T;
        if (!inst) {
            try {
                inst = new clazz();
                logger.colorfulLog(logger.C_YELLOW, "Singleton", `created singleton of '${name}'`);
            }
            catch (e) {
                logger.error("Singleton", e);
                return;
            }

            this.instanceMap[name] = inst;
        }
        return inst;
    }

    /**
     * 清理 指定类 的单例
     * @param clazz
     */
    public static clear<T>(clazz: new () => T):void {
        if (!clazz) {
            logger.error("Singleton", `can't clear instance of null constructor`);
            return;
        }
        let name = clazz["name"];
        let inst = this.instanceMap[name];
        if(inst) {
            this.instanceMap[name] = null;
            delete this.instanceMap[name];
            logger.colorfulLog(logger.C_YELLOW, "Singleton", `cleared singleton of '${name}'`);
        }
    }
}