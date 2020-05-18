/**
 * create by wangcheng on 2019/8/6 20:25
 */
namespace utils3d {
    /**
     * 设置场景亮度
     * @param scene
     * @param brightness
     */
    export function setSceneBrightness(scene: Laya.Scene3D, brightness: number): void {
        setBrightness(scene, brightness);
    }

    export function setBrightness(node: Laya.Node, brightness: number): void {
        if (!node || !node.numChildren) return;
        let albedo = new Laya.Vector4(brightness, brightness, brightness, 1.0);
        for (let i = 0, len = node._children.length; i < len; i++) {
            let child = node._children[i];
            if (child instanceof Laya.MeshSprite3D) {
                let meshMat = child.meshRenderer.sharedMaterial as Laya.BlinnPhongMaterial;
                meshMat.albedoColor = albedo;
            }
            setBrightness(child, brightness);
        }
    }

    export function destroySprite3d(sp3d: Laya.Sprite3D):void {
        if(sp3d) {
            sp3d.active = false;
            sp3d.removeSelf();
            sp3d.destroy(true);
        }
    }
}

export default utils3d;