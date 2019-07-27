/**
 * create by wangcheng on 2019/7/27 11:48
 * 提供配置表的基本数据操作
 */
namespace configs {
    /**
     * 获取配置表行数
     * @param config
     */
    export function lengthOf<T>(config: { [id: number]: T }): number {
        if (config) return Object.keys(config).length;
        return 0;
    }

    /**
     * 获取配置表所有键值
     * @param config
     */
    export function keysOf<T>(config: { [id: number]: T }): string[] {
        if (config) return Object.keys(config);
        return [];
    }

    /**
     * 根据索引获取配置表
     * @param config
     * @param index
     */
    export function getByIndex<T>(config: { [id: number]: T }, index: number): T {
        if (!config) return null;
        let keys = keysOf(config);
        let k = keys[index];
        return config[k];
    }
}