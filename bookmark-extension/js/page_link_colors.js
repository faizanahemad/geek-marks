var pinkStyle = new Map();
pinkStyle.set(0, "color: Lavender !important; font-weight:lighter; opacity:0.4;");
pinkStyle.set(1, "color: Plum !important; font-weight:lighter;");
pinkStyle.set(2, "color: Violet !important;");
pinkStyle.set(3, "color: Magenta !important;");
pinkStyle.set(4, "color: BlueViolet !important;");
pinkStyle.set(5, "color: Indigo !important; font-weight:bold;");

var greenStyle = new Map();
greenStyle.set(0, "color: PaleGreen !important; font-weight:lighter; opacity:0.3;");
greenStyle.set(1, "color: YellowGreen !important; font-weight:lighter;");
greenStyle.set(2, "color: DarkSeaGreen !important;");
greenStyle.set(3, "color: LimeGreen !important;");
greenStyle.set(4, "color: SeaGreen !important;");
greenStyle.set(5, "color: DarkGreen !important; font-weight:bold;");

var grayStyle = new Map();
grayStyle.set(0, "color: Gainsboro !important; font-weight:lighter; opacity:0.4;");
grayStyle.set(1, "color: LightGray !important; font-weight:lighter;");
grayStyle.set(2, "color: Silver !important;");
grayStyle.set(3, "color: DarkGray !important;");
grayStyle.set(4, "color: DarkSlateGray !important;");
grayStyle.set(5, "color: Black !important; font-weight:bold;");

var blueStyle = new Map();
blueStyle.set(0, "color: LightSteelBlue !important; font-weight:lighter; opacity:0.4;");
blueStyle.set(1, "color: LightSkyBlue !important; font-weight:lighter;");
blueStyle.set(2, "color: DeepSkyBlue !important;");
blueStyle.set(3, "color: DodgerBlue !important;");
blueStyle.set(4, "color: MediumBlue !important;");
blueStyle.set(5, "color: DarkBlue !important; font-weight:bold;");

var redStyle = new Map();
redStyle.set(0, "color: Cornsilk !important; font-weight:lighter; opacity:0.4;");
redStyle.set(1, "color: Wheat !important; font-weight:lighter;");
redStyle.set(2, "color: BurlyWood !important;");
redStyle.set(3, "color: DarkGoldenrod !important;");
redStyle.set(4, "color: IndianRed !important;");
redStyle.set(5, "color: DarkRed !important; font-weight:bold;");

var styleMaps = [pinkStyle,greenStyle,grayStyle,blueStyle,redStyle];

var levelStyleMap = blueStyle;

function setStyle(style) {
    levelStyleMap = styleMaps[style];
}
