/** This is an automatically generated class by FairyGUI. Please do not modify it. **/

module UI {

	export class PopupUI extends fairygui.GComponent {

		public ldrBg:fairygui.GLoader;
		public lblTitle:fairygui.GTextField;

		public static URL:string = "ui://83796hdkcdgt3";

		public static createInstance():PopupUI {
			return <PopupUI><any>(fairygui.UIPackage.createObject("UI","PopupUI"));
		}

		public constructor() {
			super();
		}

		protected constructFromXML(xml: any): void {
			super.constructFromXML(xml);

			this.ldrBg = <fairygui.GLoader><any>(this.getChildAt(0));
			this.lblTitle = <fairygui.GTextField><any>(this.getChildAt(1));
		}
	}
}