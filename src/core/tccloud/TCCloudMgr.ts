import PlatformMgr from "../platform/PlatformMgr";
import http from "../utils/http";
import {PlayerData} from "../../game/data/PlayerData";
import {Const} from "../../game/Const";
import logger from "../logger";
import UITools from "../../game/tools/UITools";
import UIMgr from "../ui/UIMgr";
import CommonPrompt from "../../game/ui/prompt/CommonPrompt";
import InputUserInfoUI from "../../game/ui/prompt/InputUserInfoUI";
import {PromptBtnType} from "../../game/definetion/GlobalEnum";

import RSAEncrypt from "../../RSAEncrypt";

const enum CloudCmd {
    login = 1,
    update = 2,
    queryOppoPlatformCoin = 888,
    consumeOppoPLatformCoin = 999,

    fetchShopInventory = 7001,
    buyOneRealGood = 7002,

    luckyDraw = 8001,

    commitRealGoodOwnerInfo = 9000,
}

export default class TCCloudMgr {
    private static _instance: TCCloudMgr;
    private apiAddr: string;
    private apiAddrOppo : string;

    public constructor() {
        if (Const.isRelease) {
            this.apiAddr = Const.useAuth ? Const.ReleaseServerTestAuth : Const.ReleaseServerTest;
        }
        else {
            this.apiAddr = Const.TestServer;
        }

        this.apiAddrOppo = Const.OPPO_API_URL;
    }

    public fetchAPIFromCDN(url:string)
    {
        logger.info('--------------------> fetchAPIFromCDN : ' + url);
        this.apiAddr = url;
    }

    public static get Instance(): TCCloudMgr {
        if (!this._instance) {
            this._instance = new TCCloudMgr();
        }
        return this._instance;
    }

    // 登录腾讯云，不需要鉴权，不需要签名
    public login(openID, onSuccess, onFail) {
        // let platform = PlatformMgr.curPlatformType;
        let requestParams = {url: this.apiAddr, data: {'cmd': CloudCmd.login, 'id': openID, 'platform': Const.CurPlatform}};

        logger.info('TCCloud start Login');
        this.requestAPI(requestParams, Const.useAuth)
            .then((value) => {
                logger.debug('-----> login sussessed:', JSON.stringify(value.data));
                    onSuccess && onSuccess(value.data);  // 云函数成功，但逻辑可能异常
                }
            ).catch((error) => {
                logger.debug('-----> login fail:', error);
            // 云函数异常
            onFail && onFail(error);
        });
    }

    /**
     * 同步数据到腾讯云 不需要鉴权，需要签名
     * @param params 数据   281736499 gold:1025959540
     * @param onSuccess 
     * @param onFail 
     */
    public async update(params: {}, onSuccess?: Function, onFail?: Function) {
        // let platform = PlatformMgr.curPlatformType;
        let requestParams = {url: this.apiAddr, data: {'cmd': CloudCmd.update, 'id': PlayerData.playerID, 'platform': Const.CurPlatform, 'params': JSON.stringify(params)}};

        logger.info('TCCloud update start');
        this.requestAPI(requestParams, Const.useAuth, true).then(
            (value) => {
                // logger.debug('-----> update sussessed:', JSON.stringify(value.data));
                onSuccess && onSuccess(value.data);  // 云函数成功，但逻辑可能异常
            }
        ).catch((error) => {
            // 云函数异常
            onFail && onFail(error);
            logger.error('-----> update fail:', error);
        });
    }

    // 查询实物商品库存，不需要鉴权，需要签名
    public async fetchShopInventory(params?: any)
    {
        let requestParams = {url: this.apiAddr, data: {'cmd': CloudCmd.fetchShopInventory}};

        logger.info('TCCloud fetchShopInventory start');
        return this.requestAPI(requestParams, Const.useAuth, true);
    }

    // 购买一件实物，不需要鉴权，需要签名
    public buyOneRealGood(params: {})
    {
        let requestParams = {url: this.apiAddr, data: {'cmd': CloudCmd.buyOneRealGood, "id" : PlayerData.playerID, "params" : JSON.stringify(params)}};
        logger.info('TCCloud buyOneRealGood start');
        return this.requestAPI(requestParams, Const.useAuth, true);
    }

    // 实物抽奖，不需要鉴权，需要签名
    public luckyDraw(params?: {})
    {
        let requestParams = {url: this.apiAddr, data: {'cmd': CloudCmd.luckyDraw, "id" : PlayerData.playerID}};
        logger.info('TCCloud luckyDraw start');
        return this.requestAPI(requestParams, Const.useAuth, true);
    }

    // 提交实物信息，不需要鉴权，需要签名
    public commitRealGoodOwnerInfo(params: {})
    {
        let requestParams = {url: this.apiAddr, data: {'cmd': CloudCmd.commitRealGoodOwnerInfo, "id" : PlayerData.playerID, "params" : JSON.stringify(params)}};
        logger.info('TCCloud commitRealGoodOwnerInfo start');
        return this.requestAPI(requestParams, Const.useAuth, true);
    }

    // 查询Oppo平台币，不需要签名，不需要鉴权
    public async queryOppoPlatformCoin(params:{}, onSuccess, onFail)
    {
        let requestParams = {url: this.apiAddrOppo, method:'GET', data: {'cmd': CloudCmd.queryOppoPlatformCoin, 'id': PlayerData.playerID, 'platform': Const.CurPlatform, 'params': JSON.stringify(params)}};

        logger.info('TCCloud queryOppoPlatformCoin start');
        this.requestAPI(requestParams).then(
            (value) => {
                logger.debug('-----> query sussessed:', JSON.stringify(value.data));
                onSuccess(value.data);  // 云函数成功，但逻辑可能异常
            }
        ).catch((error) => {
            // 云函数异常
            onFail(error);
        });
    }

    // 消耗Oppo平台币，不需要鉴权，不需要签名
    public async consumeOppoPlatformCoin(params:{}, onSuccess, onFail)
    {
        let requestParams = {url: this.apiAddrOppo, method:'GET', data: {'cmd': CloudCmd.consumeOppoPLatformCoin, 'id': PlayerData.playerID, 'platform': Const.CurPlatform, 'params': JSON.stringify(params)}};

        logger.info('TCCloud consumeOppoPlatformCoin start');
        this.requestAPI(requestParams).then(
            (value) => {
                logger.debug('-----> consume sussessed:', JSON.stringify(value.data));
                onSuccess(value.data);  // 云函数成功，但逻辑可能异常
            }
        ).catch((error) => {
            // 云函数异常
            onFail(error);
        });
    }

    private requestAPI(params, useAuth = false, useSign = false): Promise<any> {
        return http.request(params, useAuth, useSign).catch(()=>{
            UITools.showPrompt('服务器连接失败，请稍后重登游戏');
        });
    }
}