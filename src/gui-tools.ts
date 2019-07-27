/**
 * create by wangcheng on 2019/6/11 17:10
 */
namespace gui {
    export function addPackage() {
        fairygui.UIPackage.addPackage("resource/UI");
    }

    export function addAssetPackage(path:string):void {
        fairygui.UIPackage.addPackage("resource/assets/"+path);
    }

    export function createObject(resName: string) {
        return fairygui.UIPackage.createObject("UI", resName);
    }
}