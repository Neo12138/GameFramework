/**
 * create by wangcheng on 2019/6/11 15:40
 */
import utils from "./utils/utils";
import logger from "./logger";

type Group = { keys: string, name: string }
type Resource = { name: string, type: string, url: string }
type ResConfig = { groups: Group[], resources: Resource[], resourceMap: { [name: string]: Resource } }


namespace RES {
    let resConfig: ResConfig;

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
            logger.warn("不存在资源名为" + name + "资源");
            return;
        }
        return new Promise<T>(resolve => {
            Laya.loader.load(resources, Laya.Handler.create(this, () => {
                let url = resources[0].url;
                let res = Laya.loader.getRes(url) as T;

                let suffix = utils.suffixOf(url);
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
                let suffix = utils.suffixOf(url);
                type = type || Laya.Loader.typeMap[suffix];
                type || logger.warn(`文件类型不明确，可能导致资源 ${url} 无法正确下载`);

                let complete = Laya.Handler.create(this, () => {
                    let res = Laya.loader.getRes(url);

                    let suffix = utils.suffixOf(url);
                    let adapted = adaptAsset(suffix, res);
                    if (adapted) {
                        let key = Laya.URL.basePath + url;
                        Laya.Loader.loadedMap[key] = true;
                    }

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
     * 获取图集中的纹理资源，如果未加载，返回的是空值
     * @param atlasName 图集的名称 不包含路径和后缀
     * @param imageName 图片的名称（带后缀）
     */
    export function getResAtAtlas(atlasName: string, imageName: string): Laya.Texture {
        return Laya.loader.getRes(atlasName + "/" + imageName) as Laya.Texture;
    }

    /**
     * 根据url获取资源，如果未加载，返回的是空值
     * @param url
     */
    export function getResByUrl<T>(url: string): T {
        return Laya.Loader.getRes(url) as T;
    }

    /**
     * 销毁资源
     * @param name 资源名为资源配置表中的名称
     */
    export function clearRes(name: string): void {
        let resource = resConfig.resourceMap[name];
        if (!resource) {
            logger.warn("不存在资源名为" + name + "资源");
            return;
        }
        Laya.loader.clearRes(resource.url);
    }

    /**
     * 根据url销毁资源, 其实就是将Laya.loader封装了一次
     * @param url
     */
    export function clearResByUrl(url: string): void {
        Laya.loader.clearRes(url);
    }

    export function clearImage(img: Laya.Image): void {
        if (!img) return;
        Laya.loader.clearRes(img.skin);
    }

    export function clearSpriteTexture(sp: Laya.Sprite): void {
        if (!sp) return;
        if (sp['skin']) {
            clearResByUrl(sp['skin']);
        }
        else if (sp.texture) {
            clearResByUrl(sp.texture.bitmap.url);
        }
    }

    /**
     * 销毁资源组
     * @param grpName
     */
    export function clearResGroup(grpName: string): void {
        let resources = getResourcesByGroupName(grpName);
        for (let i = 0, len = resources.length; i < len; i++) {
            Laya.loader.clearRes(resources[i].url);
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
            logger.warn("不存在资源名为" + name + "资源");
            return;
        }
        return resource.url;
    }


    /****************3D资源加载*****************/
    /**
     * 根据资源配置表中的名称 加载3D资源
     * @param name 资源名
     */
    export async function loadRes3d<T>(name: string): Promise<T> {
        let src = resConfig.resourceMap[name];
        if(!src) {
            logger.error(`can't find resource called '${name}'`);
            return;
        }

        return new Promise<T>(resolve => {
            let suffix = utils.suffixOf(src.url);
            let loader;
            switch (suffix) {
                case "ls":
                    loader = Laya.Scene3D;
                    break;
                case "lh":
                    loader = Laya.Sprite3D;
                    break;
                case "lmat":
                    loader = Laya.BaseMaterial;
                    break;
                case "lm":
                    loader = Laya.Mesh;
                    break;
                case "lani":
                    loader = Laya.AnimationClip;
                    break;
                case "jpg":
                case "png":
                case "ltc":
                case "ktx":
                case "pvr":
                    loader = Laya.Texture2D;
                    break;
                default:
                    break;
            }

            if (loader) {
                loader.load(src.url, Laya.Handler.create(this, (res)=>{
                    logger.info("3d res loaded: " + name);
                    resolve(res);
                }));
            }
            else {
                Laya.loader.create(src.url, Laya.Handler.create(this, (res)=>{
                    logger.info("3d res loaded: " + name);
                    resolve(res);
                }))
            }
        });
    }

    /**
     * 根据url加载3d资源
     * @param url
     */
    export async function loadRes3dByUrl<T>(url: string): Promise<T> {
        return new Promise<T>(resolve => {
            Laya.loader.create(url, Laya.Handler.create(this, (res) => {
                logger.info("3d res loaded: " + url);
                let sp3d = Laya.loader.getRes(url);
                resolve(sp3d);
            }));
        });
    }


    export async function loadRes3ds(names: string[]) {
        let resources: string[] = [];
        for (let i = 0, len = names.length; i < len; i++) {
            if(!names[i]) continue;
            let src = resConfig.resourceMap[names[i]];
            if(src) {
                resources[i] = src.url;
            }
        }
        if(!resources.length) {
            logger.error("can't find resources called "+ names.toString());
            return;
        }
        return new Promise(resolve => {
            Laya.loader.create(resources, Laya.Handler.create(this, () => {
                resolve();
            }));

        });
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
        if (!suffix || !adapter) {
            logger.error("setAssetAdapter 参数不合法", suffix, adapter);
            return;
        }
        assetAdapterMap[suffix] = adapter;
    }

    function adaptAsset(suffix: string, res: any) {
        let adapter = assetAdapterMap[suffix];
        if (!adapter) {
            // logger.warn(`未设置 '${suffix}' 对应的资源解释器`);
            return false;
        }
        adapter(res);
        return true;
    }
}

export default RES;



