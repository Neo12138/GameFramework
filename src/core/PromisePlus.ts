/**
 * create by wangcheng on 2019/7/18 16:00
 */
namespace PromisePlus {
    let promiseMap: { [name: string]: Promise<any> } = {};
    let taskResolveMap: { [key: string]: () => void } = {};
    let taskNamesMap: { [key: string]: string[] } = {};
    let taskTimerMap: { [key: string]: number } = {};

    /**
     * 将任务名和promise绑定
     * @param name
     * @param promise
     */
    export function bind(name: string, promise: Promise<any>): void {
        promiseMap[name] = promise;
        promise.then(() => {
            finishOneTask(name);
        });
    }

    function finishOneTask(name: string): void {
        for (let key in taskNamesMap) {
            let names = taskNamesMap[key];
            let i = names.indexOf(name);
            if (i >= 0) {
                names.splice(i, 1);

                if (names.length == 0) {
                    finishAllTask(key);
                }
            }
        }
    }

    function finishAllTask(key: string) {
        let resolve = taskResolveMap[key];
        resolve && resolve();
        clearTimeout(taskTimerMap[key]);

        taskNamesMap[key] = null;
        taskResolveMap[key] = null;
        delete taskNamesMap[key];
        delete taskResolveMap[key];
        delete taskTimerMap[key];
    }

    /**
     * 所有任务都完成时
     * 注意：任务名，必须和任务绑定
     * @see bind
     * @param values 任务名数组
     */
    export async function all(values: string[]) {
        return new Promise(resolve => {
            if (!values || values.length == 0) resolve();

            let key = values.join("_");
            taskNamesMap[key] = values;
            taskResolveMap[key] = resolve;

            taskTimerMap[key] = startTimeout(key);
        });
    }

    function startTimeout(key: string): number {
        return setTimeout(() => {
            console.warn(`任务 '${key}' 还未完成，由于以下任务还未完成: ${taskNamesMap[key]}`);
        }, 10000);
    }
}

export default PromisePlus;