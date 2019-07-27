/** This is an automatically generated class by FairyGUI. Please do not modify it. **/

module UI {

	export class HomeUI extends fairygui.GComponent {

		public ldrBg:fairygui.GLoader;
		public lblTitle:fairygui.GTextField;
		public lblTest:fairygui.GTextField;

		public static URL:string = "ui://83796hdkcdgt2";

		public static createInstance():HomeUI {
			return <HomeUI><any>(fairygui.UIPackage.createObject("UI","HomeUI"));
		}

		public constructor() {
			super();
		}

		protected constructFromXML(xml: any): void {
			super.constructFromXML(xml);

			this.ldrBg = <fairygui.GLoader><any>(this.getChildAt(0));
			this.lblTitle = <fairygui.GTextField><any>(this.getChildAt(1));
			this.lblTest = <fairygui.GTextField><any>(this.getChildAt(4));
		}
	}
}