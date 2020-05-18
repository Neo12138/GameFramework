/**
 * create by WangCheng on 2020/5/13 19:32
 */
export class Vect2
{
    /**
     * 2维向量减法，返回值是结果，
     * @param left 被减数
     * @param right 减数
     * @param out 结果，可选值。返回值也是该值
     */
    public static subtract(left: Laya.Vector2, right: Laya.Vector2, out?: Laya.Vector2): Laya.Vector2
    {
        if (out == null) out = new Laya.Vector2();
        out.x = left.x - right.x;
        out.y = left.y - right.y;
        return out;
    }
}

export class Vect3
{
    /**
     * 获取3维向量的长度（模）
     * @param v
     */
    static lengthOf(v: Laya.Vector3): number
    {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    /**
     * out = a + b * scaler
     * @param a
     * @param b
     * @param scaler
     * @param out
     */
    static addScaledVector(a: Laya.Vector3, b: Laya.Vector3, scaler: number, out: Laya.Vector3): Laya.Vector3
    {
        out.x = a.x + b.x * scaler;
        out.y = a.y + b.y * scaler;
        out.z = a.z + b.z * scaler;
        return out;
    }

    static setFromMatrixColumn(mat:Laya.Matrix4x4, index:number, out: Laya.Vector3):Laya.Vector3 {
        out.fromArray(mat.elements, index * 4);
        return out;
    }

    static setFromSphericalCoords(radius:number, phi:number, theta:number, out:Laya.Vector3):Laya.Vector3 {
        let sinPhiRadius = Math.sin(phi) * radius;
        out.x = sinPhiRadius * Math.sin(theta);
        out.y = Math.cos(phi) * radius;
        out.z = sinPhiRadius * Math.cos(theta);
        return out;
    };
}

export class Quaternion
{
    /**
     * 由两个向量构成的四元数
     * @param vFrom
     * @param vTo
     * @param out
     */
    static setFromUnitVectors(vFrom: Laya.Vector3, vTo: Laya.Vector3, out: Laya.Quaternion): Laya.Quaternion
    {
        // assumes direction vectors vFrom and vTo are normalized
        let EPS = 0.000001;
        let r = Laya.Vector3.dot(vFrom, vTo) + 1;
        if (r < EPS)
        {
            r = 0;
            if (Math.abs(vFrom.x) > Math.abs(vFrom.z))
            {
                out.x = -vFrom.y;
                out.y = vFrom.x;
                out.z = 0;
                out.w = r;
            }
            else
            {
                out.x = 0;
                out.y = -vFrom.z;
                out.z = vFrom.y;
                out.w = r;
            }
        }
        else
        {
            // crossVectors( vFrom, vTo ); // inlined to avoid cyclic dependency on Vector3
            out.x = vFrom.y * vTo.z - vFrom.z * vTo.y;
            out.y = vFrom.z * vTo.x - vFrom.x * vTo.z;
            out.z = vFrom.x * vTo.y - vFrom.y * vTo.x;
            out.w = r;
        }
        out.normalize(out);
        return out;
    }
}