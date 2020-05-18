/**
 * create by wangcheng on 2019/8/5 11:06
 */
import Sound from "./Sound";

export default class LayaSound extends Sound {
    private readonly _audio: Laya.SoundChannel;

    public constructor(audio: Laya.SoundChannel) {
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
        this._audio.resume();
    }

    stop(): void {
        if (!this._audio) {
            return;
        }
        this._audio.stop();
    }

    public set url(url: string) {
        if (!this._audio) {
            return;
        }
        this._url = url;
        this._audio.url = url;
        this._playTimestamp = Date.now();
    }

    public get url() {
        return this._url;
    }

    public set volume(volume: number) {
        if (!this._audio) {
            return;
        }

        this._audio.volume = volume;
    }

    public get volume() {
        return this._audio.volume;
    }

    public set loop(loop: boolean) {
        if (!this._audio) {
            return;
        }
        this._audio.loops = loop ? 0 : 1;
    }

    public get loop() {
        if (!this._audio) {
            return;
        }
    }

    public get playTimestamp() {
        return this._playTimestamp;
    }


}