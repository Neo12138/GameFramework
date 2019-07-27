/**
 * create by wangcheng on 2019/7/25 20:40
 */
namespace assetAdapter {
    export function adapterOfCSV(res: string): void {
        if (!('ConfigData' in window)) {
            window['ConfigData'] = {}
        }
        configs.parseConfigData(res, ConfigData);
    }
}