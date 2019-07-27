/** This is an automatically generated class by FairyGUI. Please do not modify it. **/

module UI {

	export class MenuBar extends fairygui.GComponent {

		public btnEquip:fairygui.GGraph;

		public static URL:string = "ui://83796hdkc1wc4";

		public static createInstance():MenuBar {
			return <MenuBar><any>(fairygui.UIPackage.createObject("UI","MenuBar"));
		}

		public constructor() {
			super();
		}

		protected constructFromXML(xml: any): void {
			super.constructFromXML(xml);

			this.btnEquip = <fairygui.GGraph><any>(this.getChildAt(1));
		}
	}
}