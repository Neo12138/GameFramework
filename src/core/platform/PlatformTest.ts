import Platform from "./Platform";
import { Lifecycle, PlatformType } from "./PlatformMgr";
import SaveMgr from "../utils/SaveMgr";
import TCCloudMgr from "../tccloud/TCCloudMgr";
import { PlayerData } from "../../game/data/PlayerData";
import { eTestUserID, Const } from "../../game/Const";
import logger from "../logger";
import http from "../utils/http";
import TEA from "../../TEA";


export default class PlatfotmTest extends Platform
{
    public constructor()
    {
        super(PlatformType.Test);

        TEA.init('dino_life_oppo', 'sparkgame_dinolife_oppo_webtest', Const.GameVersion);
    }

    public onLifeCycle(lifecycle: Lifecycle): void
    {
    }

    public login(res?: any): Promise<any>
    {
        let self = this;
        let id = Laya.Utils.getQueryString("id") || "11";
        logger.debug('------> test platform login id: ', id);
        return this.login2TCCloud(id);
    }

    public getUserInfo(res?: any): Promise<any>
    {
        return new Promise(()=>{});
    }

    public setDefaultShare(): void
    {
        
    }

    public share(res: any): void
    {

    }

    public pay(res): void
    {

    }

    public showBannerAd(res: any): void
    {

    }

    public hideBannerAd():void
    {

    }

    public showVideoAd(res: any): void
    {

    }
}