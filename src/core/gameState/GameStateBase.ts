export default abstract class GameStateBase 
{
    public abstract onEnter(...args: any[]): void;
    public abstract onExit(): void;

    public abstract onUpdate() : void;
}