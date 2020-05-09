/**
 * create by wangcheng on 2019/7/23 17:03
 */
namespace UIMgr {
    import Map = zero.utils.Map;
    import BaseUI = zero.BaseUI;
    export const allUIMap: Map<BaseUI> = new Map<BaseUI>();

    export let baseLayer: fairygui.GComponent;
    let popupLayer: fairygui.GComponent;
    let mask: fairygui.GGraph;
    let curShowingUI: BaseUI;
    let prevUIShowing:boolean = true;

    export function init(): void {
        baseLayer = new fairygui.GComponent();
        baseLayer.setSize(System.width, System.height);
        popupLayer = new fairygui.GComponent();
        popupLayer.setSize(System.width, System.height);

        fairygui.GRoot.inst.addChild(baseLayer);
        fairygui.GRoot.inst.addChild(popupLayer);

        let root = fairygui.GRoot.inst.displayObject;
        root.zOrder = 100;
        Laya.stage.addChild(root);

        mask = new fairygui.GGraph();
        mask.setSize(System.width, System.height);
        mask.drawRect(0, "#333333", "#333333");
        mask.alpha = .8;
        mask.touchable = true;
        mask.onClick(this, touchBlankToRemovePopup);

        Laya.timer.loop(200, this, checkUIDestroy);
    }

    /**
     * 获取一个UI对象，如果没有创建，或者已经销毁，返回的是null
     * @param clazz
     */
    export function get<T extends BaseUI>(clazz: new (props?: any) => T): T {
        return allUIMap.get(clazz) as T;
    }

    /**
     * 获取一个UI对象，如果没有创建，或者已经销毁，返回的是null
     * @param clazz
     */
    export function show<T extends BaseUI>(clazz: new (props?: any) => T): T {
        //根据类名查找配置
        let className: string = clazz['name'];
        let config = configs.getUIConfigByName(className) || {};

        if(!prevUIShowing && config['type'] != UIType.section) {
            console.warn(`can't show current ui, cause previous ui have not finish show animation yet`);
            return;
        }
        let ui = get(clazz);
        if (ui) {
            if (ui.showing) {
                zero.warn(`show '${ui.name}' fail! already on show`);
            }
            else {
                addUI(ui);
            }
            return ui;
        }


        ui = new clazz(config);
        allUIMap.set(clazz, ui);

        ui.load().then(() => {
            addUI(ui);
        });

        return ui;
    }

    /**
     * 获取一个UI对象，如果没有创建，或者已经销毁，返回的是null
     * @param clazz
     */
    export function hide<T extends BaseUI>(clazz: new (props?: any) => T): void {
        let ui = get(clazz);
        if (!ui || !ui.showing) return;

        if (ui.loaded) {
            hideUI(ui);
        }
        else {
            ui.afterLoad(() => {
                hideUI(ui);
            });
        }

    }

    export function doMethod<T extends BaseUI>(clazz: new (props?: any) => T, method: string, ...args: any[]): any {
        let ui = get(clazz);
        if (ui && ui[method]) {
            if (ui.loaded) {
                return ui[method](...args);
            }
            else {
                ui.afterLoad(() => {
                    return ui[method](...args);
                });
            }
        }
    }

    async function addUI(ui: BaseUI) {
        let view = ui.view;
        if (!view) {
            zero.warn(`show '${ui.name}' fail! view is null`);
            return;
        }
        curShowingUI = ui;
        if (ui.type == UIType.view) {
            await hideAll();
            ui.zIndex = baseLayer.numChildren;
            baseLayer.addChild(view);
        }
        else if (ui.type == UIType.section) {
            baseLayer.addChild(view);
        }
        else if (ui.type == UIType.popup) {
            stopAll();
            addPopup(ui);
        }

        prevUIShowing = false;
        await ui.show();
        prevUIShowing = true;
    }

    async function hideAll() {
        let uis = allUIMap.values();
        uis.sort((a, b) => a.zIndex - b.zIndex);

        for (let i = uis.length - 1; i >= 0; i--) {
            let ui = uis[i];
            if (ui == curShowingUI) continue;

            if (ui.showing) {
                await ui.hide();
                UIUtils.removeFromParent(ui.view);

                //处理蒙版的层级
                let numChildren = popupLayer.numChildren;
                if (numChildren >= 2) {
                    popupLayer.addChildAt(mask, numChildren - 2);
                }
                else {
                    popupLayer.removeChildren();
                }
            }
        }
    }

    async function hideUI(ui: BaseUI) {
        if (ui && ui.showing) {
            if (ui.type == UIType.popup) {
                removePopup(ui);
            }
            else {
                await ui.hide();
                UIUtils.removeFromParent(ui.view);
            }
        }
    }

    function stopAll(): void {
        let uis = allUIMap.values();
        for (let i = uis.length - 1; i >= 0; i--) {
            let ui = uis[i];
            if (ui == curShowingUI) continue;
            if (ui.showing && !ui.stopped) {
                ui.stop();
            }
        }
    }

    function addPopup(ui: BaseUI): void {
        let view = ui.view;
        if (!view) {
            zero.warn(`show ${ui.name} fail! view is null`);
            return;
        }
        popupLayer.addChild(mask);

        view.setXY(System.width - view.width >> 1, System.height - view.height >> 1);
        ui.zIndex = 1000 + popupLayer.numChildren;
        popupLayer.addChild(view);
    }

    async function removePopup(ui: BaseUI) {
        let numChildren = popupLayer.numChildren;
        if (numChildren <= 1) {
            popupLayer.removeChildren();
            return;
        }

        let view = popupLayer.getChildAt(numChildren - 1);
        if (ui.view == view) {
            await ui.hide();
            UIUtils.removeFromParent(view);
        }

        //如果弹窗下面还有界面需要resume
        let showingUIs = getShowingUIs();
        let curTopUI = showingUIs.pop();
        if (curTopUI && curTopUI.stopped) {
            curTopUI.resume();
        }

        //popupLayer上只有2个及一下的节点, 必然是遮罩和view, 处理到这里就结束了
        if (numChildren <= 2) {
            popupLayer.removeChildren();
            return;
        }

        //底下还有弹窗，需要将遮罩下移
        popupLayer.addChildAt(mask, numChildren - 3);
    }

    function touchBlankToRemovePopup(): void {
        let numChildren = popupLayer.numChildren;
        let view = popupLayer.getChildAt(numChildren - 1) as fairygui.GComponent;
        if (!view) {
            popupLayer.removeChildren();
            return;
        }
        let ui = getUIByView(view);
        if (ui && ui.type == UIType.popup && ui.touchBlankToHide) {
            removePopup(ui);
        }
    }


    function getShowingUIs(): BaseUI[] {
        let uis = [];
        let allUIs = allUIMap.values();
        for (let i = 0, len = allUIs.length; i < len; i++) {
            if (allUIs[i].showing) {
                uis.push(allUIs[i]);
            }
        }
        return uis;
    }

    function getUIByView(view: fairygui.GComponent): BaseUI {
        let uis = allUIMap.values();
        for (let i = uis.length - 1; i >= 0; i--) {
            let ui = uis[i];
            if (ui.view == view) {
                return ui;
            }
        }
        return null;
    }

    function checkUIDestroy(): void {
        let uis = allUIMap.values();
        let now = Date.now();
        for (let i = uis.length - 1; i >= 0; i--) {
            let ui = uis[i];
            if (ui.autoDestroy && !ui.showing && now - ui.hideTime > ui.destroyDelay) {
                if (curShowingUI === ui) {
                    curShowingUI = null;
                }
                ui.destroy();
                allUIMap.removeByValue(ui);
                ui = null;
            }
        }
    }

}