/**
 * create by wangcheng on 2019/6/11 15:40
 */

namespace RES {
    type Group = { keys: string, name: string }
    type Resource = { name: string, type: string, url: string }
    type ResConfig = { groups: Group[], resources: Resource[], resourceMap: { [name: string]: Resource } }

    export let resConfig: ResConfig;

    /**
     * 加载资源配置表
     * @param src 配置表路径
     */
    export async function loadConfig(src: string) {
        return new Promise(resolve => {
            Laya.loader.load([{url: src, type: Laya.Loader.JSON}], Laya.Handler.create(this, () => {
                resConfig = Laya.loader.getRes(src);
                resConfig.resourceMap = {};
                for (let i = resConfig.resources.length - 1; i >= 0; i--) {
                    let res = resConfig.resources[i];
                    resConfig.resourceMap[res.name] = res;
                }
                delete resConfig.resources;
                Laya.loader.clearRes(src);
                // zero.log("resource configs loaded", resConfig);
                resolve();
            }));
        });

    }

    /**
     * 加载资源组
     * @param grpName
     * @param taskReporter
     */
    export async function loadGroup(grpName: string, taskReporter?: TaskReporter) {
        let resources = getResourcesByGroupName(grpName);
        let total: number = resources.length;

        return new Promise(resolve => {
            Laya.loader.load(resources, Laya.Handler.create(this, () => {
                resolve();
            }), Laya.Handler.create(this, (p) => {
                taskReporter && taskReporter.onProgress(p * total | 0, total);
            }, null, false))
        });
    }

    /**
     * 加载单个资源
     * @param name 资源名为资源配置表中的名称
     */
    export async function loadRes<T>(name: string): Promise<T> {
        //防止无法根据文件后缀，判断文件类型
        let resources = [resConfig.resourceMap[name]];
        if (resources.length == 0) {
            zero.warn("不存在资源名为" + name + "资源");
            return;
        }
        return new Promise<T>(resolve => {
            Laya.loader.load(resources, Laya.Handler.create(this, () => {
                let url = resources[0].url;
                let res = Laya.loader.getRes(url) as T;

                let suffix = zero.utils.suffixOf(url);
                let adapted = adaptAsset(suffix, res);
                if (adapted) {
                    let key = Laya.URL.basePath + url;
                    Laya.Loader.loadedMap[key] = true;
                }

                resolve(res);
            }));
        });
    }

    /**
     * url可以有2种形式
     * 单个资源，直接传入url。此时如有必要，需要传入type
     * 多个资源，则传入一个数组{url:string, type:string}的格式，
     * @param url
     * @param type 文件类型
     */
    export async function loadResByUrl<T>(url: string | object[], type?: string): Promise<T> {
        return new Promise<T>(resolve => {
            if (typeof url == "string") {
                let suffix = zero.utils.suffixOf(url);
                type = Laya.Loader.typeMap[suffix] || type;
                type || zero.warn(`文件类型不明确，可能导致资源 ${url} 无法正确下载`);

                let complete = Laya.Handler.create(this, () => {
                    let res = Laya.loader.getRes(url);
                    resolve(res);
                });

                Laya.loader.load(url, complete, null, type);
            }
            else {
                Laya.loader.load(url, Laya.Handler.create(this, resolve, [true]));
            }
        });
    }

    /**
     * 获取资源，如果资源未加载，返回的是空值
     * @param name 资源名为资源配置表中的名称
     */
    export function getRes<T>(name: string): T {
        if (!name) return;

        let res = Laya.loader.getRes(name);
        if (res) return res;

        let resource = resConfig.resourceMap[name];
        if (!resource) return;

        return Laya.loader.getRes(resource.url) as T;
    }

    /**
     * 销毁资源
     * @param name 资源名为资源配置表中的名称
     * @param forceDispose 强制销毁
     */
    export function clearRes(name: string, forceDispose: boolean = false): void {
        let resource = resConfig.resourceMap[name];
        if (!resource) {
            zero.warn("不存在资源名为" + name + "资源");
            return;
        }
        Laya.loader.clearRes(resource.url, forceDispose);
    }

    /**
     * 根据url销毁资源, 其实就是将Laya.loader封装了一次
     * @param url
     * @param forceDispose
     */
    export function clearResByUrl(url:string, forceDispose: boolean = false): void {
        Laya.loader.clearRes(url, forceDispose);
    }

    /**
     * 销毁资源组
     * @param grpName
     * @param forceDispose 强制销毁
     */
    export function clearResGroup(grpName: string, forceDispose: boolean = false): void {
        let resources = getResourcesByGroupName(grpName);
        for (let i = 0, len = resources.length; i < len; i++) {
            Laya.loader.clearRes(resources[i].url, forceDispose);
        }
    }

    /**
     * 根据资源组名 获取资源配置
     * @param grpName
     */
    export function getResourcesByGroupName(grpName: string): Resource[] {
        let groups = resConfig.groups;
        let keys: string[] = [];
        for (let i = groups.length - 1; i >= 0; i--) {
            if (groups[i].name == grpName) {
                keys = groups[i].keys.split(",");
                break;
            }
        }

        let res: any[] = [];
        for (let i = 0, len = keys.length; i < len; i++) {
            let r = resConfig.resourceMap[keys[i]];
            if (r) res.push(r);
        }
        return res;
    }

    export function getResUrl(name: string): string {
        let resource = resConfig.resourceMap[name];
        if (!resource) {
            zero.warn("不存在资源名为" + name + "资源");
            return;
        }
        return resource.url;
    }


    /****************3D资源加载*****************/
    /**
     * 预先加载3D资源
     * @param name 资源名
     */
    export async function loadRes3d<T>(name: string): Promise<T> {
        let src = resConfig.resourceMap[name];
        return new Promise<T>(resolve => {
            Laya.loader.create(src.url, Laya.Handler.create(this, (res) => {
                zero.log("res: " + name, res);
                let sp3d = Laya.loader.getRes(src.url);
                resolve(sp3d);
            }));
        });
    }

    export async function loadRes3ds(names: string[]) {
        let resources: Resource[] = [];
        for (let i = 0, len = names.length; i < len; i++) {
            resources[i] = resConfig.resourceMap[names[i]];
        }

        return new Promise(resolve => {
            Laya.loader.create(resources, Laya.Handler.create(this, () => {
                resolve();
            }));

        });
    }

    /**
     * 异步加载3D资源
     * 异步加载，无法立刻设置坐标等属性
     * @param name
     */
    export function loadRes3dAsync(name: string): Laya.Sprite3D {
        let src = resConfig.resourceMap[name];
        return Laya.Sprite3D.load(src.url);
    }

    export interface TaskReporter {
        onProgress(complete: number, total: number): void;
    }


    let assetAdapterMap: { [suffix: string]: (res: any) => void } = {};

    /**
     * 设置特定文件类型的资源适配器
     * @param suffix
     * @param adapter
     */
    export function setAssetAdapter(suffix: string, adapter: (res: any) => void): void {
        if (!suffix || !adapter) return;
        assetAdapterMap[suffix] = adapter;
    }

    function adaptAsset(suffix: string, res: any) {
        let adapter = assetAdapterMap[suffix];
        if (!adapter) {
            // zero.warn(`未设置 '${suffix}' 对应的资源解释器`);
            return false;
        }
        adapter(res);
        return true;
    }
}