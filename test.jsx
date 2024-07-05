// 初期設定
var max_width = 650;
var init_artboard_width = 812;
var init_artboard_height = 456;
var art_board_padding = 50; // アートボード間の間隔
var text_padding = 20;
var font_size = 100;
var defFont = app.textFonts["KozGoPr6N-Regular"];

// 座標系をアートボード基準に設定
app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

// ドキュメントをアクティブにする
var doc = app.documents.add(DocumentColorSpace.RGB, init_artboard_width, init_artboard_height);

// 画像フォルダの選択
var img_folder = Folder.selectDialog("画像フォルダを選択して下さい", "");
if (!img_folder) {
    alert("画像フォルダが選択されていません");
    throw new Error("画像フォルダが選択されていません");
}

// テキストファイルの選択
var fileObj = File.openDialog("テキストファイルを選択してください", "*.txt", false);
if (!fileObj) {
    alert("テキストファイルが選択されていません");
    throw new Error("テキストファイルが選択されていません");
}

// テキストファイルの内容を読み込む
var lineStr = [];
var flag = fileObj.open("r");
if (flag) {
    while (!fileObj.eof) {
        lineStr.push(fileObj.readln());
    }
    fileObj.close();
} else {
    alert("テキストファイルの読み込みに失敗しました");
    throw new Error("テキストファイルの読み込みに失敗しました");
}

var img_png = img_folder.getFiles("*.png");
var img_jpg = img_folder.getFiles("*.jpg");
var img_list = img_png.concat(img_jpg);
var img_num = img_list.length;

for (var i = 0; i < img_num; i++) {
    // 1. レイヤーを作成
    var layObj = doc.layers.add();
    layObj.name = "Layer " + (i + 1);
    var color = new RGBColor();
    color.red = 0;
    color.green = 100;
    color.blue = 100;
    layObj.color = color;
    doc.activeLayer = layObj;

    // 2. 画像を配置
    var img_file = new File(img_list[i]);
    var obj = doc.placedItems.add();
    obj.file = img_file;
    obj.position = [0, 0];

    if (obj.width > max_width) {
        var img_width = obj.width;
        var img_height = obj.height;
        obj.width = max_width;
        obj.height = (img_height * max_width) / img_width;
    }

    // 3. テキストから画像を作成して配置
    var whiteColor = new RGBColor();
    whiteColor.red = 255;
    whiteColor.green = 255;
    whiteColor.blue = 255;

    var textFrameObj = doc.textFrames.add();
    textFrameObj.contents = lineStr[i % lineStr.length];
    textFrameObj.paragraphs[0].fillColor = whiteColor;
    textFrameObj.paragraphs[0].size = font_size;
    textFrameObj.paragraphs[0].textFont = defFont;

    // テキストフレームを画像の中央に配置
    var textFrameWidth = textFrameObj.width;
    var textFrameHeight = textFrameObj.height;
    var imgCenterX = obj.position[0] + (obj.width / 2);
    var imgCenterY = obj.position[1] - (obj.height / 2);
    textFrameObj.position = [imgCenterX - (textFrameWidth / 2), imgCenterY + (textFrameHeight / 2)];

    var artboards = doc.artboards;
    artboards[i].artboardRect = [0, 0, obj.width, -obj.height];

    if (i < img_num - 1) {
        var rect = [0, artboards[i].artboardRect[3] - art_board_padding, init_artboard_width, artboards[i].artboardRect[3] - init_artboard_height];
        artboards.add(rect);
    }
}
// 画像ファイルとして保存
var exportOptions = new ExportOptionsPNG24();
exportOptions.transparency = true; // 透明部分を保存
var exportFolder = Folder.selectDialog("エクスポート先のフォルダを選択してください");

if (exportFolder) {
    for (var j = 0; j < doc.artboards.length; j++) {
        doc.artboards.setActiveArtboardIndex(j);
        var fileName = new File(exportFolder + "/image_" + (j + 1) + ".png");
        doc.exportFile(fileName, ExportType.PNG24, exportOptions);
    }
    alert("全ての処理が完了しました！");
} else {
    alert("エクスポート先が選択されていません");
    throw new Error("エクスポート先が選択されていません");
}
