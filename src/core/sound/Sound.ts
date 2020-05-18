/**
 * create by wangcheng on 2019/8/5 10:37
 */
export default abstract class Sound {
    protected _url: string;
    protected _volume: number;
    protected _playTimestamp:number;

    protected constructor() {
    }

    public abstract play(): void;

    public abstract stop(): void;

    public abstract pause(): void;

    public abstract resume(): void;

    public abstract get url();
    public abstract set url(url:string);

    public abstract get volume();
    public abstract set volume(volume:number);

    public abstract get loop();
    public abstract set loop(loop:boolean);

    public abstract get playTimestamp();

}