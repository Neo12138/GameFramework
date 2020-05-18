/**
 * create by wangcheng on 2019/8/5 10:47
 */
import Sound from "./Sound";
import RES from "../RES";

export default class InnerAudioSound extends Sound {
    private readonly _audio: InnerAudioContext;
    private _loop: boolean;

    public constructor(audio: InnerAudioContext) {
        super();
        this._audio = audio;
    }

    pause(): void {
        if (!this._audio) {
            return;
        }
        this._audio.pause();
    }

    play(): void {
        if (!this._audio) {
            return;
        }
        this._audio.play();
        this._playTimestamp = Date.now();
    }

    resume(): void {
        if (!this._audio) {
            return;
        }
        this._audio.play();
    }

    stop(): void {
        if (!this._audio) {
            return;
        }
        this._audio.stop();
    }

    public set url(url: string) {
        this._url = url;
        if(!this._audio) {
            return;
        }

        RES.loadResByUrl(url, Laya.Loader.SOUND).then(() => {
            let sound = Laya.loader.getRes(url);
            let audio = this._audio;
            audio.src = sound.url;
            audio.play();
            audio.playTimestamp = Date.now();
        })
    }

    public get url() {
        return this._url;
    }

    public set volume(volume: number) {
        if(!this._audio) {
            return;
        }

        this._volume = volume;
        this._audio.volume = volume;
    }

    public get volume() {
        return this._volume;
    }

    public set loop(loop: boolean) {
        if(!this._audio) {
            return;
        }
        this._loop = loop;
        this._audio.loop = loop;
    }

    public get playTimestamp() {
        return this._playTimestamp;
    }
}