/**
 * create by WangCheng on 2020/5/12 20:02
 */
import Spherical from "../math/Spherical";
import math from "../math/basic";
import OrbitControls from "./OrbitControls";
import {MOUSE, TOUCH} from "./constants";

export default class MapControls extends OrbitControls
{
    public constructor() {
        super();

        this.mouseButtons.LEFT = MOUSE.PAN;
        this.mouseButtons.RIGHT = MOUSE.ROTATE;

        this.touches.ONE = TOUCH.PAN;
        this.touches.TWO = TOUCH.DOLLY_ROTATE;
    }
}