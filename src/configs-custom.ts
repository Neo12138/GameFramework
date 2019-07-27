/**
 * create by wangcheng on 2019/6/14 10:06
 */
namespace configs {
    export function getUIConfigByName(name: string): ConfigData.IUiConfig {
        for (let key in ConfigData.uiConfig) {
            if (ConfigData.uiConfig[key].name == name) {
                return ConfigData.uiConfig[key];
            }
        }
        return null;
    }
}
