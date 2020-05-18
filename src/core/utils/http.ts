/**
 * Created by admin on 2018/12/24.
 * 网络请求相关的工具方法(只能放与特定的游戏无关的代码，如果依赖游戏中的模块，就不能放到这里)
 */
import logger from "../logger";

namespace http {
    import Event = Laya.Event;
    
    type RequestParams = { url: string, data?: string | object, header?: string, method?: string, dataType?: string, responseType?: string }

    /**
     * http请求（类似wx.request）
     * @param res
     * @returns {Promise<T>}
     */
    export async function request(res: RequestParams, useAuth:boolean = false, useSign:boolean = false): Promise<any> {
        
        logger.info('url:' + res.url);
        logger.info("auth:" + useAuth);
        
        if (!res) {
            logger.warn('utils.request', '请求参数为空值');
            return;
        }
        res.url = res.url || '';
        res.data = res.data || '';
        res.method = res.method || 'POST';
        res.header = res.header || 'application/json';
        res.dataType = res.dataType || 'json';

        let strParams = formatURLParameters(res.data);            
        let xhr: Laya.HttpRequest = new Laya.HttpRequest();
        xhr.http.timeout = 10000;

        logger.info(`Http请求参数 method = ${res.method}`);

        if (res.method == 'POST') {
            strParams = strParams.substring(1);

            let signature = "";
            if (useSign && res.data!='' && res.data['params'])
            {
                //console.error('=======> 需要签名:' + res.data['params']);

                strParams += `&signature=${signature}`;
            }

            //console.error('http post:' + res.url + strParams);
            xhr.send(res.url, strParams, res.method, res.header);
        }
        else {
            let signature = "";
            if (useSign && res.data!='' && res.data['params'])
            {
                //console.error('=======> 需要签名:' + strParams);
                strParams += `&signature=${signature}`;
            }
            //console.error('http get:' + res.url + strParams);
            xhr.send(res.url + strParams, '', res.method, res.header);
        }

        return new Promise<any>((resolve, reject) => {
            xhr.once(Event.COMPLETE, this, (data: any) => {
                let d:any;
                if (res.dataType == "json" && data) {
                    try {
                        d = JSON.parse(data);
                    } catch (error) {
                        d = data;
                    }
                }

                resolve({data: d});
            });
            xhr.once(Event.ERROR, this, (data: any) => {

                let d:any;
                if (res.dataType == "json" && data) {
                    try {
                        d = JSON.parse(data);
                    } catch (error) {
                        d = data;
                    }
                }

                reject({data : d});
            });
        });
    }

    /**
     * 将url参数encode之后拼接成字符串
     * @param params
     * @returns {any}
     */
    export function formatURLParameters(params: any): string {
        let needEncode = false;
        if (!params) return '';
        let queryArray = [];
        for (let a in params) {
            queryArray.push(`${a}=${needEncode? encodeURIComponent(params[a]) : params[a]}`);
        }
        return "?" + queryArray.join("&");
    }
}

export default http;