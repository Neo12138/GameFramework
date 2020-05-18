// 最终没有用上

import utils from "./utils";
import logger from "../logger";
import http from "./http";

type TimestampedValue = { timestamp: number, value: string };
type Config = { host: string, saveAPI: string, fetchAPI: string }

/**
 * create by WangCheng on 2019/9/4 15:21
 *
 * 数据存储管理类
 * 用于将数据缓存到本地，以及上传到服务器
 * 只会处理变化了的数据
 *
 * 上传数据时，检查数据是否变化时，md5值是通过原始数据的计算出的
 * 下载数据时，检查签名时，md5值是包含时间戳的数据计算出的
 */
class SaveManager {
    private cKeyMd5Map: { [key: string]: string } = {};
    private sKeyMd5Map: { [key: string]: string } = {};
    private host: string;
    private saveAPI: string;
    private fetchAPI: string;

    public init(config: Config): void {
        if (!config) return;
        this.host = config.host;
        this.saveAPI = config.saveAPI;
        this.fetchAPI = config.fetchAPI;
    }

    /**
     * 将缓存的所有数据上传到服务器
     * 通过数据的md5值，判断数据有没有发生变化，只有数据发生了变化才存储
     * 返回一个Promise对象,只有所有数据上传成功才会resolve, 存在一条上传失败的数据都会reject,reject回调中只返回第一条错误的信息
     */
    public push(): Promise<any> {
        let keys = Object.keys(this.cKeyMd5Map);
        if (!keys || !keys.length) return;

        let ps = [];
        for (let k of keys) {
            let oldMd5 = this.sKeyMd5Map[k];
            let newMd5 = this.cKeyMd5Map[k];
            if (oldMd5 == newMd5) {
                logger.info(`data ${k} 的值未发生变化，已忽略上传服务器`);
            }
            else {
                let tsv = this.fetchLocalStorage(k);

                let p = this.saveServer(k, tsv.value, newMd5);
                ps.push(p);
                p.then(() => {
                    this.sKeyMd5Map[k] = newMd5;
                }).catch((e) => {
                    logger.warn(`data ${k} 上传失败！`, e);
                });
            }
        }
        return Promise.all(ps);
    }

    /**
     * 将数据缓存到本地
     * 通过数据的md5值，判断数据有没有发生变化，只有数据发生了变化才存储
     * @param key
     * @param value
     */
    public save(key: string, value: any): void {
        if (!key || !value) {
            console.warn(`key和value不能为空值 key:${key}, value:${value}`);
            return;
        }

        let oldMd5 = this.cKeyMd5Map[key];
        let strValue = JSON.stringify(value);
        let newMd5 = utils.sign(strValue);

        if (!oldMd5 || oldMd5 !== newMd5) {
            this.saveMethod(key, strValue);
            this.cKeyMd5Map[key] = newMd5;
            logger.info(`data ${key} 本地存储成功`);
        }
        else {
            logger.info(`data ${key} 的值未发生变化，已忽略本地存储`);
        }
    }

    private saveMethod(key: string, value: string): void {
        this.saveLocalStorage(key, value);
    }

    private saveLocalStorage(key: string, value: string): void {
        value = Date.now() + "|" + value;
        Laya.LocalStorage.setItem(key, value);
    }

    /**
     * 没有服务器这里可以不实现
     * @param key
     * @param value
     * @param sign
     */
    private async saveServer(key: string, value: string, sign: string) {
        value = Date.now() + "|" + value;
        logger.colorfulLog("Save Data", key, value);

        if (!this.host || !this.saveAPI) {
            logger.error("上传数据失败！请求url为空值，请检查DataMgr是否初始化");
            return;
        }


        return await http.request({
            url: this.host + this.saveAPI,
            data: {
                key: key,
                value: value,
                sign: sign
            },
            method: "POST",
        });
    }

    /**
     * 从服务器或者本地取数据
     * @param key
     */
    public async fetch(key: string) {
        let tsv = await this.fetchMethod(key);
        if(!tsv) return null;

        let data = tsv.value ? JSON.parse(tsv.value) : tsv.value;
        return data;
    }


    private async fetchMethod(key: string): Promise<TimestampedValue> {
        let local = this.fetchLocalStorage(key);
        let server = await this.fetchServer(key);

        //如果本地和服务器都有数据，返回最新的
        if (local && server) {
            return server.timestamp >= local.timestamp ? server : local;
        }
        //哪个数据存在就返回哪个
        return server || local;
    }

    private parseTimestampedValue(str: string): TimestampedValue {
        let ss = str.split("|");
        let time = +ss[0];
        let strValue = ss[1];
        return {
            timestamp: time,
            value: strValue
        };
    }

    private fetchLocalStorage(key: string): TimestampedValue {
        let s = Laya.LocalStorage.getItem(key);
        if(!s) return null;
        return this.parseTimestampedValue(s);
    }

    /**
     * 没有服务器，这里可以不实现
     * @param key
     */
    private async fetchServer(key: string) {
        if (!this.host || !this.fetchAPI) {
            logger.error("请求数据失败！请求url为空值，请检查DataMgr是否初始化");
            return;
        }

        let resp = await http.request({
            url: this.host + this.fetchAPI,
            data: key,
            method: "GET",
            dataType: "text"
        });
        let sign = resp.data.sign;
        let newSign = utils.sign(resp.data.data);
        //校验签名
        if (sign == newSign) {
            let tsv = this.parseTimestampedValue(resp.data.data);
            return tsv;
        }
        else {
            logger.warn("当前数据已经被篡改");
            return Promise.reject({code: 110, message: "当前数据已经被篡改"})
        }
    }


}

const SaveMgr = new SaveManager();
export default SaveMgr;

utils.defineGlobalProperty("SaveMgr", SaveMgr, true);