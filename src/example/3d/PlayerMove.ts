/**
 * Created by admin on 2018/11/30.
 */
class PlayerMove extends Laya.Script {
    private player: Laya.MeshSprite3D;

    constructor() {
        super();
    }


    public _initialize(owner: Laya.ComponentNode): void {
        super._initialize(owner);

        this.player = owner as Laya.MeshSprite3D;
    }


    public _update(state: Laya.RenderState): void {
        super._update(state);

        this.move(state.elapsedTime);
        this.jump();
    }

    private move(time: number): void {
        let position = this.player.transform.position;
        Laya.KeyBoardManager.hasKeyDown(87) && (position.x = position.x + 0.01 * time);//W
        Laya.KeyBoardManager.hasKeyDown(83) && (position.x = position.x - 0.01 * time);//S
        Laya.KeyBoardManager.hasKeyDown(65) && (position.z = position.z - 0.01 * time);//A
        Laya.KeyBoardManager.hasKeyDown(68) && (position.z = position.z + 0.01 * time);//D
        this.player.transform.position = position;

        if (Laya.KeyBoardManager.hasKeyDown(Laya.Keyboard.SPACE)) {
            this.forceY = 1;
            this.speedY = 1;
        }
    }

    private forceY: number = 0;
    private speedY: number = 1;
    private aY: number = 0.1;

    private jump(): void {
        if (this.forceY <= 0) return;
        let y = this.player.transform.position.y;
        let speed = this.speedY;
        speed -= this.aY;
        y += speed;
        if (y <= 0.5) {
            this.forceY = 0;
            this.aY = 0.1;
            y = 0.5;
        }

        this.speedY = speed;
        this.player.transform.position.y = y;

    }
}