/**
 * create by WangCheng on 2019/9/11 17:14
 */

export default class AbortablePromise<T> {
    private promise: Promise<T>;
    private aborted: boolean;

    public constructor(promise: Promise<T>) {
        this.promise = promise;
    }

    public async execute() {
        await this.promise;
        if (this.aborted) {
            return Promise.reject("promise aborted");
        }
        return this.promise;
    }

    public abort(): void {
        this.aborted = true;
        this.promise = null;
    }
}