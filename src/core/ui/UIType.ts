/**
 * created by wangcheng at 2019/8/3 11:38
 */
export enum UIType {
    //视图
    view = 1,
    //片段，通常为视图的一部分
    section = 2,
    //弹窗
    popup = 3,
    //顶层，系统飘字，喇叭
    top = 4,
}

export enum UIAnimShow {
    scale = 1,
    scroll = 2,
    fadeIn = 3
}

export enum UIAnimHide {
    scale = 1,
    scroll = 2,
    fadeOut = 3
}