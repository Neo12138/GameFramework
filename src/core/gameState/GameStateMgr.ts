/**
 * create by wangcheng on 2019/8/5 14:58
 */
import GameStateBase from "./GameStateBase";
import logger from "../logger";

class GameStateManager {
    private _states: { [clazz: string]: GameStateBase } = {};
    private _curState: GameStateBase;
    private _preState: GameStateBase;

    public constructor() {
    }

    public pushState<T extends GameStateBase>(clazz: new () => T, ...args:any[]): void {
        if (!clazz) {
            logger.error("pushState error, can't set null as a new state");
            return;
        }

        let state = this._states[clazz.toString()];
        if (!state) {
            state = new clazz();
            this._states[clazz.toString()] = state;
        }

        if (this._curState) {
            this._curState.onExit();
            this._preState = this._curState;
        }

        this._curState = state;
        state.onEnter(...args);
    }

    public get curState() {
        return this._curState;
    }

    public get preState() {
        return this._preState;
    }
}

const GameStateMgr = new GameStateManager();
export default GameStateMgr;