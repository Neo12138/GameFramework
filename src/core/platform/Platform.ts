/**
 * create by wangcheng on 2019/8/5 11:54
 */
import Sound from "../sound/Sound";
import LayaSound from "../sound/LayaSound";
import RES from "../RES";
import PlatformMgr, {Lifecycle, PlatformType} from "./PlatformMgr";
import TCCloudMgr from "../tccloud/TCCloudMgr";
import {PlayerData} from "../../game/data/PlayerData";
import {Const} from "../../game/Const";
import logger from "../logger";

export default abstract class Platform {
    public readonly type: number;

    public constructor(type: number) {
        this.type = type;
    }

    //设置资源加载的默认路径，通常是设置成CDN路径
    public getBasePath(): string {
        return "";
    }

    public abstract onLifeCycle(lifecycle: Lifecycle): void;

    public abstract login(res?: any): Promise<any>;

    public abstract getUserInfo(res?: any): Promise<any>;

    public abstract setDefaultShare(): void;

    public abstract share(res: any): void;

    public abstract pay(res): void;

    public abstract showBannerAd(res: any): void;

    public abstract hideBannerAd(): void;

    public abstract showVideoAd(res: any): void;

    public getSharedCanvas(): any {
    }

    public postMessage(res: any): void {
    }

    public playMusic(url: string, startTime: number): Sound {
        let channel = Laya.SoundManager.playMusic(url, 0, null, startTime);
        let sound: Sound = new LayaSound(channel);
        return sound;
    };

    public playSound(url: string, loop: boolean = false): Sound {
        let channel = Laya.SoundManager.playSound(url, loop ? 0 : 1);
        let sound: Sound = new LayaSound(channel);
        sound.loop = loop;
        return sound;
    }

    public clearSound(url: string): void {
        RES.clearResByUrl(url);
    }

    protected login2TCCloud(openID: string) {
        return new Promise(resolve => {
            TCCloudMgr.Instance.login(openID, (ret) => {
                if (ret && ret['code'] == 0) {
                    PlayerData.fetchFromCloud(ret);
                    resolve();
                }
                else {
                    console.error('腾讯云服务器登录异常！');
                }

            }, null);
        });
    }


    public onNetworkChanged(callback: (online: boolean) => void): void {
        if (!callback) return;
        window.addEventListener('online', () => {
            callback(true);
        });
        window.addEventListener('offline', () => {
            callback(false);
        });
    }

}