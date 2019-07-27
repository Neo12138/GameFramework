//由工具自动生成，请勿手动修改
declare namespace ConfigData {
	interface IActivity {
		/** ID */
		readonly id: number;
		/** 活动名称 */
		readonly name: string;
		/** 是否生效 */
		readonly takeEffect: number;
		/** 平台生效 */
		readonly platform: number;
		/** 显示位置 */
		readonly position: number;
		/** 活动图标/banner */
		readonly icon: string;
		/** 新玩家是否可见 */
		readonly delay: number;
		/** 活动类型 */
		readonly type: number;
		/** 开启时间 */
		readonly start: number;
		/** 结束时间 */
		readonly end: number;
		/** 显示顺序 */
		readonly order: number;
		/** HOT标识 */
		readonly hot: number;
		/** 功能参数 */
		readonly parameter: string;
		/** 功能参数说明 */
		readonly des: string;
	}

	interface IAiBattle {
		/** ID */
		readonly id: number;
		/** 未命中 */
		readonly miss: number;
		/** 人-头 */
		readonly head: number;
		/** 人-身体 */
		readonly body: number;
		/** 马-头 */
		readonly horseHead: number;
		/** 马-身体 */
		readonly horseBody: number;
		/** 弱点 */
		readonly weak: number;
		/** 拉满弓概率 */
		readonly full: number;
		/** 额外瞄准时间最小 */
		readonly timeMin: number;
		/** 额外瞄准时间最大 */
		readonly timeMax: number;
	}

	interface IBattle {
		/** ID */
		readonly id: number;
		/** 部位 */
		readonly type: number;
		/** 上限 */
		readonly max: number;
		/** 下限 */
		readonly min: number;
	}

	interface IBox {
		/** ID */
		readonly id: number;
		/** 图标 */
		readonly icon: string;
		/** 开启时间 */
		readonly time: number;
		/** 掉落ID */
		readonly dropId: number;
		/** 奖励数量 */
		readonly number: number;
		/** 是否重复掉落 */
		readonly repeat: number;
	}

	interface ILanding {
		/** ID */
		readonly id: number;
		/** 天数 */
		readonly day: number;
		/** 奖励 */
		readonly gift: number;
	}

	interface ISevenDays {
		/** ID */
		readonly id: number;
		/** 类型 */
		readonly type: number;
		/** 天数 */
		readonly day: number;
		/** 奖励 */
		readonly gift: number;
	}

	interface IUiConfig {
		/** ID */
		readonly id: number;
		/** 名字 */
		readonly name: string;
		/** 资源组 */
		readonly resGroup: string;
		/** UI类型(1:view-视图，2：section-片段，3：popup-弹窗) */
		readonly type: number;
		/** 隐藏后是否自动销毁 */
		readonly autoDestroy: boolean;
		/** 销毁延迟时间(单位：s) */
		readonly destroyDelay: number;
		/** 点击蒙版是否移除 */
		readonly touchBlankToHide: boolean;
		/** UI显示动画 */
		readonly animationShow: number;
		/** UI隐藏动画 */
		readonly animationHide: number;
		/** banner广告状态(-1不处理，0隐藏，1显示) */
		readonly bannerAdState: number;
	}

	let activity: { [key: number]: IActivity };
	let aiBattle: { [key: number]: IAiBattle };
	let battle: { [key: number]: IBattle };
	let box: { [key: number]: IBox };
	let landing: { [key: number]: ILanding };
	let sevenDays: { [key: number]: ISevenDays };
	let uiConfig: { [key: number]: IUiConfig };
}