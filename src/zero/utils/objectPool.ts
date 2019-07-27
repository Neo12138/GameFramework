/**
 * Created by wangcheng on 2019/1/2 16:57.
 */
namespace zero.utils {
    let objectCount = 1;

    export function injectHashCode(obj: Object): void {
        if (!obj['hashCode']) {
            obj['hashCode'] = objectCount++;
        }
    }

    export interface ObjectPoolImpl<T> {
        create: () => T;
        recover: (e: T) => void;
    }

    /**
     * 返回一个对象池对象，只有最基础的创建和回收方法。
     * @param clazz 类名
     */
    export function objectPoolFactory<T>(clazz: new() => T): ObjectPoolImpl<T> {
        let objectPool: T[] = [];
        return {
            create: () => {
                return objectPool.length == 0 ? new clazz() : objectPool.shift();
            },
            recover: (e: T) => {
                objectPool.push(e);
            }
        }
    }

    export class ObjectPool<T> implements ObjectPoolImpl<T> {
        private readonly objectPool: T[];
        private readonly clazz: new () => T;

        public constructor(clazz: new () => T) {
            this.objectPool = [];
            this.clazz = clazz;
        }

        public create(): T {
            let objectPool = this.objectPool;
            return objectPool.length == 0 ? new this.clazz() : objectPool.shift();
        }

        public recover(e: T): void {
            this.objectPool.push(e);
        }
    }


    let poolMap: Laya.Dictionary = new Laya.Dictionary();

    /**
     * 为指定的类创建一个对象池
     * @param clazz 类名
     */
    export function getPool<T>(clazz: new () => T): ObjectPool<T> {
        let pool = poolMap.get(clazz);
        if (!pool) {
            pool = new ObjectPool<T>(clazz);
            poolMap.set(clazz, pool);
        }
        return pool;
    }

    /**
     * 允许使用相同的类，创建不同的对象池。
     * @param sign 对象池标识符
     * @param clazz 类名。第一次创建对象池时需要传入，后续可以不传
     * @returns 对象池
     */
    export function getPool2<T>(sign: string, clazz?: new () => T): ObjectPool<T> {
        let pool = poolMap.get(sign);
        if (!pool) {
            if(clazz == void 0) {
                zero.error('创建对象池失败，必须传入一个类');
                return;
            }
            pool = new ObjectPool<T>(clazz);
            poolMap.set(sign, pool);
        }
        return pool;
    }

}
