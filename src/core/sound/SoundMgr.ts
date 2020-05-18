/**
 * create by wangcheng on 2019/8/5 9:44
 */
import Sound from "./Sound";
import RES from "../RES";
import PlatformMgr from "../platform/PlatformMgr";

class SoundManager {
    private _soundPath: string = "res/sounds/";
    private _suffix: string = ".mp3";

    //所有声音的控制开关
    private _enableSound: boolean = true;
    //全局的音乐开关
    private _musicEnabled: boolean = true;
    //全局的音乐音量
    private _musicVolume: number = 1;
    //全局的音效开关
    private _soundEnabled: boolean = true;
    //全局的音效声音
    private _soundVolume: number = 1;

    private _music: Sound;
    private _curMusicName: string;
    private _musicPlaying: boolean;
    private _musicPaused: boolean;


    public constructor() {
    }

    public init(): void {
        Laya.SoundManager.autoReleaseSound = false;

        this.enableSound = true;

        let localMusicVol = Laya.LocalStorage.getItem("musicVolume");
        this.musicVolume = localMusicVol == void 0 ? 1 : parseFloat(localMusicVol);

        let localSoundVol = Laya.LocalStorage.getItem("soundVolume");
        this.soundVolume = localSoundVol == void 0 ? 1 : parseFloat(localSoundVol);

    }

    //所有声音的控制开关
    public set enableSound(value: boolean) {
        if (this._enableSound === value) return;

        this._enableSound = value;
        this.musicEnabled = value;
        this.soundEnabled = value;
    }

    public get enableSound() {
        return this._enableSound;
    }

    //全局的音乐开关
    public set musicEnabled(value: boolean) {
        if (this._musicEnabled === value) return;

        this._musicEnabled = value;
        if (value) {
            this.enableMusic();
        }
        else {
            this.disableMusic();
        }
    }

    public get musicEnabled() {
        return this._musicEnabled;
    }

    private enableMusic(): void {
        if (this._curMusicName) {
            this.playMusic(this._curMusicName);
        }
    }

    private disableMusic(): void {
        this.stopMusic();
    }

    //全局的音效开关
    public set soundEnabled(value: boolean) {
        if (this._soundEnabled === value) return;

        this._musicEnabled = value;
        if (!value) this.disableSound();
    }

    public get soundEnabled() {
        return this._soundEnabled;
    }

    private disableSound(): void {
        this.stopAllSound();
    }

    //全局的音乐音量
    public set musicVolume(volume: number) {
        this._musicVolume = volume;
        this.musicEnabled = volume > 0;
        Laya.SoundManager.setMusicVolume(volume);

        if (this._music) {
            this._music.volume = volume;
        }
    }

    public get musicVolume() {
        return this._musicVolume;
    }

    //全局的音效声音
    public set soundVolume(volume: number) {
        this._soundVolume = volume;
        this.soundEnabled = volume > 0;
        Laya.SoundManager.setSoundVolume(volume);
    }

    public get soundVolume() {
        return this._soundVolume;
    }

    public playMusic(musicName: string, startTime: number = 0): Sound {
        if (!this._musicEnabled || !musicName) return this._music;
        if (this._curMusicName && this._curMusicName == musicName && this._musicPlaying) return this._music;
        this.stopMusic();
        this._musicPaused = false;
        this._musicPlaying = true;

        this._curMusicName = musicName;
        let url = `${this._soundPath}bg/${musicName}${this._suffix}`;

        let sound: Sound = PlatformMgr.platform.playMusic(url, startTime);
        this._music = sound;
        sound.volume = this._musicVolume;

        return sound;
    }

    public stopMusic(): void {
        this._musicPlaying = false;
        this._musicPaused = true;
        if (this._music) {
            this._music.stop();
        }
        else {
            Laya.SoundManager.stopMusic();
        }
    }

    public pauseMusic(): void {
        if (!this._musicPaused && this._music) {
            this._musicPaused = true;
            this._musicPlaying = false;
            this._music.pause();
        }
    }

    public resumeMusic(): void {
        if (this._musicPaused) {
            this._musicPaused = false;
            this._musicPlaying = true;
            this._music.play();
        }
    }

    public playSound(soundName: string, loop: boolean = false): Sound {
        if (!this._soundEnabled || !soundName) return;
        let url = this._soundPath + soundName + this._suffix;
        this.recordSoundUrl(url);

        let sound: Sound = PlatformMgr.platform.playSound(url, loop);
        sound.volume = this._soundVolume;
        return sound;
    }

    public stopSound(sound: Sound): void {
        if (sound) {
            sound.stop();
        }
    }

    public stopAllSound(): void {
        Laya.SoundManager.stopAllSound();
    }

    private _soundUrls: string[] = [];

    private recordSoundUrl(url: string): void {
        let i = this._soundUrls.indexOf(url);
        if (i < 0) {
            this._soundUrls.push(url);
        }
    }

    public clearAllSound(): void {
        let soundUrls = this._soundUrls;
        for (let i = 0, len = soundUrls.length; i < len; i++) {
            RES.clearResByUrl(soundUrls[i])
        }
    }
}

const SoundMgr = new SoundManager();
export default SoundMgr;