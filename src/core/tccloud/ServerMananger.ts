import {PlayerData, ServerPlayerData} from "../../game/data/PlayerData";
import TimeMgr from "../../game/common/TimeMgr";
import TCCloudMgr from "./TCCloudMgr";
import { PlayerDataManager } from "../../game/data/PlayerDataManager";

/**
 * 数据同步，上传管理类
 */
export class ServerMananger
{
    private static _serverMgr: ServerMananger;
    public static get Instance(): ServerMananger
    {
        if(!this._serverMgr)
            this._serverMgr = new ServerMananger();
        return this._serverMgr;
    }

    public readonly playerDataId = -1;
    /**从服务器获取到的旧数据，用来校验过滤新数据 */
    public preData: any;

    public updateDataToCloud()
    {
        let newData = {};
        newData['id'] = this.playerDataId;
        newData['gold'] = PlayerData.gold;
        newData['goodsData'] = PlayerData.goodsData;
        newData['populationData'] = PlayerData.populationData;
        newData['hisMaxPopulation'] = PlayerData.hisMaxPopulation;
        newData['luckyDrawFreeTimes'] = PlayerData.luckyDrawFreeTimes;
        newData['luckyDrawTodayTimes'] = PlayerData.luckyDrawTodayTimes;
        newData['luckyDrawData'] = PlayerData.luckyDrawData;
        newData['guideProcess'] = PlayerData.guideProcess;
        newData['lastLoginTimestamp'] = TimeMgr.now();

    }


/*******************************下面是一些重要数据（大概），有变化就要同步的********************************/

    /**即时同步金币数量 */ //@Leo 改成增量同步，改回全量同步，加签名校验
    public updateGoldToServer()
    {
        TCCloudMgr.Instance.update({'gold': PlayerData.gold}, (ret)=>
        {
            // 什么都不做
        });
    }

    // public updateGoldChangeToServer(changed)
    // {
    //     //console.error('!!!!!!!!!!!!!!!=====================> updateGoldChangeToServer changed = ' + changed);
    //     TCCloudMgr.Instance.update({'goldchanged': changed}, (ret)=>
    //     {
    //         if (ret.code == 6)
    //         {
    //             console.error('========== 非法操作，重设金币值 ============ ' + ret.gold);
    //             if (ret && ret.gold && ret.gold > 0)
    //                 PlayerDataManager.Instance.setGold(ret.gold);
    //         }
    //     });
    // }

    /**即时同步道具数据 */
    public updateGoodsDataToServer()
    {
        Laya.timer.once(300, this, this._updateGoodsData);
    }
    private _updateGoodsData():void {
        TCCloudMgr.Instance.update({'goodsData': PlayerData.goodsData});
    }


    /**即时同步恐龙数据 */
    public updatePopulationDataToServer()
    {
        TCCloudMgr.Instance.update({'populationData': PlayerData.populationData});
    }
    /**即时同步恐龙数量 */
    public updateHisMaxPopulationToServer()
    {
        TCCloudMgr.Instance.update({'hisMaxPopulation': PlayerData.hisMaxPopulation});
    }
    /**即时同步转盘数据 */
    public updateLuckyDrawDataToServer()
    {
        let newData = {};
        newData['luckyDrawFreeTimes'] = PlayerData.luckyDrawFreeTimes;
        newData['luckyDrawTodayTimes'] = PlayerData.luckyDrawTodayTimes;
        newData['luckyDrawData'] = PlayerData.luckyDrawData;
        TCCloudMgr.Instance.update(newData);
    }
    /**即时同步新手进度 */
    public updateGuideProcessToServer()
    {
        TCCloudMgr.Instance.update({'guideProcess': PlayerData.guideProcess});
    }

    //至少等待2s再上传数据
    public updateDailyTaskStat() {
        Laya.timer.once(2000, this, this._updateDailyTaskStat);
    }
    private _updateDailyTaskStat() {
        let data:ServerPlayerData = {dailyTaskStat: PlayerData.dailyTaskStat};
        TCCloudMgr.Instance.update(data);
    }

    public updateDailyTaskClaimCount() {
        let data:ServerPlayerData = {dailyTaskClaim: PlayerData.dailyTaskClaim};
        TCCloudMgr.Instance.update(data);
    }

    //至少等待2s再上传数据
    public updateAchieveTaskStat() {
        Laya.timer.once(2000, this, this._updateAchieveTaskStat);
    }
    private _updateAchieveTaskStat() {
        let data:ServerPlayerData = {achieveTaskStat: PlayerData.achieveTaskStat};
        TCCloudMgr.Instance.update(data);
    }

    public updateAchieveTaskClaimCount() {
        let data:ServerPlayerData = {achieveTaskClaim: PlayerData.achieveTaskClaim};
        TCCloudMgr.Instance.update(data);
    }

    public updateLastLoginTime():void {
        let data:ServerPlayerData = {lastLoginTimestamp: PlayerData.loginTimestamp};
        TCCloudMgr.Instance.update(data);
    }

    public updateRealGoodsInfoIsCanFill():void {
        let data:ServerPlayerData = {realGoodsInfoIsCanFill: PlayerData.realGoodsInfoIsCanFill};
        TCCloudMgr.Instance.update(data);
    }

    public updateRealGoodsInfoIsFill():void {
        let data:ServerPlayerData = {realGoodsInfoIsFill: PlayerData.realGoodsInfoIsFill};
        TCCloudMgr.Instance.update(data);
    }


    public updateFootballCount():void {
        Laya.timer.once(1000, this, this._updateFootballCount);
    }
    private _updateFootballCount():void {
        let data: ServerPlayerData = {footballCount: PlayerData.footballCount};
        TCCloudMgr.Instance.update(data);
    }

    public updateFreeFood():void {
        Laya.timer.once(1000, this, this._updateFreeFood);
    }
    private _updateFreeFood():void {
        let data: ServerPlayerData = {freeFood: PlayerData.freeFood};
        TCCloudMgr.Instance.update(data);
    }


    public updateOrders():void {
        let data: ServerPlayerData = {orders: PlayerData.orders};
        TCCloudMgr.Instance.update(data);
    }

}