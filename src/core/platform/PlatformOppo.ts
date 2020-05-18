import Platform from "./Platform";
import { PlatformType, Lifecycle } from "./PlatformMgr";
import { Const } from "../../game/Const";
import OppoSecret from "./OppoSecret";
import utils from "../utils/utils";
import logger from "../logger";
import http from "../utils/http";
import TCCloudMgr from "../tccloud/TCCloudMgr";
import { PlayerData } from "../../game/data/PlayerData";
import { PlayerDataManager } from "../../game/data/PlayerDataManager";
import UITools from "../../game/tools/UITools";
import RES from "../RES";
import TEA from "../../TEA";
import RSAEncrypt from "../../RSAEncrypt";

enum PlatformMethodType
{
    Query,
    Consume,
}

export enum OppoConsumeReason
{
    Feed = "龙宝喂食消耗",
    LuckyDraw = "幸运转盘消耗",
}

export default class PlatformOppo extends Platform {    


    private uID;
    private avatarUrl;
    private nickName;
    private token;
    private signTimeStamp;

    private jsencrypt;

    public constructor()
    {
        super(PlatformType.OPPO);
    }
    
    // getBasePath()
    // {
    //     return '';
    // }

    public onLifeCycle(lifecycle: Lifecycle): void
    {   
        if (!lifecycle) return;

        lifecycle.onEnterBackground && qg.onHide(lifecycle.onEnterBackground);
        qg.onShow(()=>{
            this.queryMyCoin();
            lifecycle.onEnterForeground && lifecycle.onEnterForeground(null);
        });
    }

    public noticeIsOpen: boolean = false;
    public noticeContent: string = '';
    public login(res?: any): Promise<any>
    {
        logger.debug('------> oppo platform login');
        let self = this;
        return new Promise((resolve, reject)=>
        {
            qg.login({
                pkgName : OppoSecret.pkgName,
                success: function(res)
                {
                    var data = JSON.stringify(res);
                    logger.debug('======== qg login successed ====, id = ' + res.uid);
                    console.error('=============================> game version: ' + Const.GameVersion);
                    self.uID = res.uid;
                    self.avatarUrl = res.avatar;
                    self.nickName = res.nickName;
                    self.token = res.token;
                    
                    // 422815218 泽海
                    TEA.init("dino_life_oppo", "hhhj_dinolife_oppo_" + self.uID, Const.GameVersion);
                    RSAEncrypt.Init();
                    
                    self.questServerAddr().then((data)=>{
                        TCCloudMgr.Instance.fetchAPIFromCDN(data.data.url);
                        self.login2TCCloud(self.uID).then(()=>
                        {
                            self.queryMyCoin();
                            resolve();
                        });
                    });

                    self.questNoticeData().then((data) => {
                        logger.error('获取到的公告信息', data);
                        self.noticeIsOpen = data.data.isopen;
                        self.noticeContent = data.data.content;
                    });
                },
                fail: function(res)
                {
                    logger.debug('======== qg login failed ====');
                    //console.log(JSON.stringify(res));
                    reject();
                },
                complete:function(res)
                {
                    logger.debug('======== qg login completed ====');
                }    
            })
        });
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

    private questServerAddr() : Promise<any>
    {
        let requestParams = {url:`https://cdn.sparkbullet.com/CDN/dinolife/oppo/${Const.GameVersion}/serveraddr.json`,
        method :'GET'};
        
        return http.request(requestParams);
    }

    private questNoticeData(): Promise<any>
    {
        let requestParams = {url: `https://cdn.sparkbullet.com/CDN/dinolife/oppo/${Const.GameVersion}/notice.json`,
        method : 'GET'};
        return http.request(requestParams);
    }

    public cryptoTest() : void
    {
        let data = "1234567890";
        let encrypted = this.jsencrypt.encrypt(data);
        logger.debug('**************** RSA Encrypted = ' + encrypted);
        let decrypted = this.jsencrypt.decrypt(encrypted);
        logger.debug('**************** RSA Decrypted = ' + decrypted);
    }

    public consumeMyCoin(num, reason, onSuccess?: Function, onFail?: Function)
    {
        let data:any = {};
        data['token'] = this.token;
        data['amount'] = num;
        data['reason'] = reason,

        TCCloudMgr.Instance.consumeOppoPlatformCoin(data, (value) => {
            logger.debug('===== consume oppo platform coin successed, ' + value);
            if(value.code == "200")
            {
                onSuccess && onSuccess();
                PlayerDataManager.Instance.CostDiamond(num);
            }
            else
            {
                UITools.showFloatText('消费失败，' + value.errMsg);
                this.queryMyCoin();
            }
        }, (error) => 
        {
            logger.debug('===== consume oppo platform coin failed, ' + error);
        });
    }

    public queryMyCoin(onSuccess?: Function, onFail?: Function)
    {
        let data:any = {};
        data['token'] = this.token;

        TCCloudMgr.Instance.queryOppoPlatformCoin(data, (value) => {
            logger.debug('===== queryMyCoinTest successed, ' + value);
            if(value.code == "200")
            {
                PlayerDataManager.Instance.setDiamond(value.data);
            }
            else
            {
                UITools.showFloatText('查询平台币失败,' + value.errMsg);
            }
        }, (error) => 
        {
            logger.debug('===== queryMyCoinTest failed, ' + error);
        });
    }

    public jumpToLobby()
    {
        logger.debug('+++++++++++++ call jump to Lobby!!!!!');
        qg._callNativeMethod(
        { 
            method:"jump_app", 
            args:
            {
                deeplink:"oaps://qg/welfare",
                force_dl:"true"
            }, 
            success(res)
            { 
                logger.debug('=======> oaps://qg/welfare success', res); 
            },
            fail(res) 
            { 
                logger.debug('=======> oaps://qg/welfare failed', res); 
                qg._callNativeMethod(
                    { 
                        method:"jump_app", 
                        args:
                        {
                            deeplink:"hap://app/com.nearme.quickgame/Index?currentTabIndex=2" 
                        }, 
                        success(res)
                        {
                            logger.debug('============> 22222 successed:', JSON.stringify(res));
                        },
                        fail(res)
                        {
                            logger.debug('============> 22222 failed:', JSON.stringify(res));
                        }
                    }) 
            },
            complete() 
            { 
                logger.debug('call jump to Lobby complete'); 
            }
        })
    }

    public installShortcut()
    {
        qg.hasShortcutInstalled({
            success: function(res) {
                // 判断图标未存在时，创建图标
                if(res == false){
                    qg.installShortcut({
                        success: function() {
                            // 执行用户创建图标奖励
                            UITools.showFloatText('已成功创建游戏桌面!');
                        },
                        fail: function(err) {
                            UITools.showFloatText('创建游戏桌面失败，请重试!');
                        },
                        complete: function() {
                        }
                    })
                }else {
                    UITools.showFloatText('已成功创建游戏桌面!');
                }
            },
            fail: function(err) {},
            complete: function() {}
        })
    }

    public onNetworkChanged(callback: (online: boolean) => void): void {
        if(!callback) return;

        qg.onNetworkStatusChange((res)=>{
            callback(res.isConnected);
        })
    }
}