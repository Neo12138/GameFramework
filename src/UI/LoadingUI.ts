/** This is an automatically generated class by FairyGUI. Please do not modify it. **/

module UI {

	export class LoadingUI extends fairygui.GComponent {

		public ldrBg:fairygui.GLoader;
		public loadingBar:fairygui.GProgressBar;

		public static URL:string = "ui://83796hdkg7rf0";

		public static createInstance():LoadingUI {
			return <LoadingUI><any>(fairygui.UIPackage.createObject("UI","LoadingUI"));
		}

		public constructor() {
			super();
		}

		protected constructFromXML(xml: any): void {
			super.constructFromXML(xml);

			this.ldrBg = <fairygui.GLoader><any>(this.getChildAt(0));
			this.loadingBar = <fairygui.GProgressBar><any>(this.getChildAt(1));
		}
	}
}