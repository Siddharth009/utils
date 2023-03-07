MakeTOC = app.trustedFunction(function () {
  app.beginPriv();
  var bm = this.bookmarkRoot;
  var t = app.thermometer; // acquire a thermometer object
  t.duration = this.numPages;
  this.pane = "nobookmarks";
  t.begin();
  var myFDF = "";
  var myPages = "";
  var myTOClinks = "";
  var myBookmarktext = "";
  var myPagesPrint = "";
  //part to include TOC
  var ibmLength = bm.children.length;
  //console.println("Number of bookmarks: " + bm.children.length);
  //console.println("Number of Pages: " + Math.ceil(bm.children.length/15));
  //number of pages to insert assuming that 10 lines fit on one page : Math.ceil(bm.children.length/20)
  var tocpages = Math.ceil(bm.children.length / 16);
  //console.println("Number of TOC Pages: " + tocpages);
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
  };
  //Retrieve page header data from very first page;
  //obviously, the next section won´t fit your needs if you use a different setup of the page header.
  var ckWord, numWords;
  var k = 0;
  var l = 0;
  var tflpos = 0;
  var confi = 0;
  // //Read file data into stream
  // var stmFileData = util.readFileIntoStream();
  // // Convert data into a String
  // var titltesWithBookmarks = util.stringFromStream(stmFileData);
  // var oData = eval("(" + titltesWithBookmarks + ")");
  var oStream = util.readFileIntoStream();
  var titltesWithBookmarks = util.stringFromStream(oStream);
  // var oData = eval("(" + strJSON + ")");
  // console.println(JSON.parse(strJSON));
  // insert function to insert charcters on middle of stringgs
  function insert(str, index, value) {
    return str.substr(0, index) + value + str.substr(index);
  }
  numWords = this.getPageNumWords(0);
  for (var j = 0; j < numWords; j++) {
    t.value = j;
    t.text = "Processing header text...";
    if (l == 0 || tflpos == 0) {
      ckWord = this.getPageNthWord(0, j);
      var ck = ckWord.toUpperCase();
      var ck = ckWord;
      //console.println(this.getPageNthWord(0, j));
      if (ckWord == "PharmaCompany") {
        k = j;
        //console.println("k=" + k);
      }
      if (ckWord == "Draft" || ckWord == "Final") {
        l = j;
        //console.println("l=" + l);
      }
      // if (ckWord == "CONFIDENTIAL") {
      //   confi = j;
      //   //console.println("confi=" + j);
      // }
      //the next is to find position of table listing figure _after_ Draft and Final;
      if (
        (ckWord == "Table" || ckWord == "Listing" || ckWord == "Figure") &&
        l > 0 &&
        confi > 0
      ) {
        tflpos = j;
      }
      if (k >= 0 && l > 0) {
        //console.println("K=" + k + " l=" + l);
        var projectnam = "";
        var studynam = "";
        var version = this.getPageNthWord(0, l);
        //console.println("version=" + version);
        version = version.trim();
        for (var h = k; h <= l + 1; h++) {
          //console.println("Nam=" + this.getPageNthWord(0, h, false));
          //console.println(this.getPageNthWordQuads(0, h));
          //concat words between Draft and CONFIDENTIAL;
          if (confi < h && h < l) {
            projectnam =
              projectnam.trim() + " " + this.getPageNthWord(0, h, false);
            projectnam = projectnam.trim();
            //console.println("Project=" + projectnam);
          }
          if (h == l) {
            studynam = this.getPageNthWord(0, h + 1);
            studynam = studynam.trim();
            //console.println("erste" + studynam);
          }
        }
      }
      //included extra loop for concatenated study name if either table/listing/figure is found and the these trigger words are <15 words from "draft" or "final";#
      //the next change is needed to catch keywords in the footer, in this case tflpos<l and is not defined;
      if (l > 0 && tflpos > 0 && 0 < tflpos - l && tflpos - l < 15) {
        var studynam = "";
        //console.println("l= " + l);
        //console.println("tflpos= " + tflpos);
        //console.println("tflpos-l= " + tflpos-l);
        for (var h = l + 1; h < tflpos; h++) {
          //console.println("inside");
          //console.println(this.getPageNthWord(0, h, false));
          //console.println(this.getPageNthWordQuads(0, h));
          //concat words between Draft and CONFIDENTIAL;
          studynam = studynam.trim() + " " + this.getPageNthWord(0, h, false);
          studynam = studynam.trim();
          //included the next bit to replace underscores which are seen as separator by getPageNthWord;
          studynam = studynam.replace("_ ", "_", "gi");
          //console.println("" + studynam);
        }
      }
    } else {
      break;
    }
  }
  // const titltesWithBookmarks =
  //   "Figure 14.4.1::Figure 14.4.1: Scatter Plot " +
  //   +" Figure 14.4.2::Box Plot Sample" +
  //   +"Figure 14.4.3::Violin Plot Sample";
  if (titltesWithBookmarks) {
    var tempVar = titltesWithBookmarks.split(/\r?\n/);
    var bookmarkToTitleMap = [];
    tempVar.forEach((t) => {
      var splitted = t.split(",,");
      const objTemp = {
        reportBookmark: splitted[0],
        reportTitle: splitted[1],
      };
      console.println(
        "Looking" + " | " + objTemp.reportBookmark + " | " + objTemp.reportTitle
      );
      bookmarkToTitleMap.push(objTemp);
    });
    // console.log("final", bookmarkToTitleMap);
  }
  // now that page data is available, create page headers on blank pages of TOC;
  for (var m = 0; m < tocpages; m++) {
    t.value = m;
    t.text = "Create TOC pages..." + (m + 1) + " of " + tocpages;
    //console.println("Number of TOC Pages bef: " + m);
    this.newPage({ nWidth: 792, nHeight: 612 });
    //console.println("Allpages:" +this.numPages);
    this.movePage(this.numPages - 1, -1);
    // var f = this.addField("header1", "text", 0, [61, 550, 90, 535]);
    // f.textColor = color.black;
    // f.textSize = 9;
    // f.textFont = font.Cour;
    // f.strokeColor = color.transparent;
    // f.fillColor = color.transparent;
    // f.value = "UCB";
    // f.alignment = "left";
    // var f = this.addField("header2", "text", 0, [670.765, 550, 740, 535]);
    // f.textColor = color.black;
    // f.textSize = 9;
    // f.textFont = font.Cour;
    // f.strokeColor = color.transparent;
    // f.fillColor = color.transparent;
    // f.value = "CONFIDENTIAL";
    // f.alignment = "right";
    // var f = this.addField("header3", "text", 0, [61, 540, 740, 525]);
    // f.textColor = color.black;
    // f.textSize = 9;
    // f.textFont = font.Cour;
    // f.strokeColor = color.transparent;
    // f.fillColor = color.transparent;
    // f.value = projectnam;
    // f.alignment = "left";
    // var f = this.addField("header4", "text", 0, [705.566, 540, 740, 525]);
    // f.textColor = color.black;
    // f.textSize = 9;
    // f.textFont = font.Cour;
    // f.alignment = "right";
    // f.strokeColor = color.transparent;
    // f.fillColor = color.transparent;
    // f.value = version;
    // var f = this.addField("header41", "text", 0, [61, 530, 600, 515]);
    // f.textColor = color.black;
    // f.textSize = 9;
    // f.textFont = font.Cour;
    // f.strokeColor = color.transparent;
    // f.fillColor = color.transparent;
    // f.value = studynam;
    // f.alignment = "left";
    //console.println("Number of TOC Pages mid: " + m);
    if (m == tocpages - 1) {
      //console.println("TOC done at: " + m);
      var f = this.addField("header5", "text", 0, [200, 510, 600, 490]);
      f.textColor = color.black;
      f.textSize = 14;
      f.alignment = "center";
      f.textFont = font.Times;
      f.strokeColor = color.transparent;
      f.fillColor = color.transparent;
      f.value = "TABLE OF CONTENTS";
    }
    //this function converts all text boxes to text
    //this.flattenPages();
    //console.println("Number of TOC Pages end: " + m);
  }
  var TOC_txt = "TOC" + i;
  for (var i = 0; i < ibmLength; i++) {
    t.value = i;
    t.text = "TOC entry " + (i + 1) + " of " + ibmLength;
    var TOC_txt = "TOC" + i;
    var bmToCheck = bm.children[i];
    //retrieve page the bookmark refers to
    this.bookmarkRoot.children[i].execute();
    //console.println(this.bookmarkRoot.children[i].name + " | " +this.pageNum);
    var bmtext = this.bookmarkRoot.children[i].name;
    var TOCpagenum = this.pageNum + 1;
    var bmtextcomplete = this.bookmarkRoot.children[i].name + " " + TOCpagenum;
    console.println("bookmark" + " | " + bmtextcomplete);
    var bmlen = bmtextcomplete.length;
    var splittext = bmtext.split(" ");
    var splittext1 = "";
    var splittext2 = "";
    var splittext3 = "";
    myBookmarktext =
      myBookmarktext +
      "[/Page " +
      TOCpagenum +
      " /View [/Fit] /Title (" +
      bmtext +
      ")/OUT pdfmark \n";
    // Read titles from file
    var titleData = "";
    // fs.readFile("titles.txt", "utf8", function (err, data) {
    //   if (err) throw err;
    //   console.log(data);
    //   titleData = data;
    // });
    // ("");
    // use attachments instead
    // console.println("\n");
    // var oFile = this.getDataObjectContents("sample.xml", true);
    // var cFile = util.stringFromStream(oFile, "utf-8");
    // console.println(cFile);
    if (bmlen <= 121) {
      var currentReport = "";
      var currentReportTitle = "";
      for (var m = 0; m < bookmarkToTitleMap.length; m++) {
        if (bookmarkToTitleMap[m].reportBookmark == bmtext) {
          currentReport = bookmarkToTitleMap[m];
          if (currentReport) {
            currentReportTitle = currentReport.reportTitle;
          }
        }
      }
      console.println("result" + " | " + bmtext + " | " + currentReportTitle);
      if (currentReportTitle.length > 230) {
        currentReportTitle = currentReportTitle.substring(0, 230);
      }
      var trimmedText = currentReportTitle;
      if (currentReportTitle.length > 121) {
        trimmedText = insert(currentReportTitle, 116, " \n ");
      }
      bmtext = bmtext + " " + trimmedText;
      //add loop to add as many points as necesary to fill up TOC line and add finally the page number
      //console.println(bmtext  + " | " +this.pageNum);
      while (bmtext.length < 122) {
        bmtext = bmtext.concat(".");
        bmlen = bmlen + 1;
      }
      // for two lines title
      if (bmtext.length > 122) {
        while (bmtext.length < 245) {
          bmtext = bmtext.concat(".");
          bmlen = bmlen + 1;
        }
      }
    } else {
      var num = 0;
      //retrieve first part of the string
      while (splittext1.length <= 120) {
        splittext2 = splittext1;
        splittext1 = splittext1 + " " + splittext[num];
        if (splittext1.length - 1 <= 120) {
          splittext2 = splittext1;
          num = num + 1;
        }
      }
      //remove first char as this is blank
      splittext2 = splittext2.substr(1);
      //console.println("splittext2=" + splittext2);
      //retrieve second part of string
      for (num1 = num; num1 < splittext.length; num1++) {
        splittext3 = splittext3 + " " + splittext[num1];
      }
      splittext3 = splittext3.substr(1);
      //fill second part with blanks
      while (splittext3.length < splittext2.length) {
        splittext3 = splittext3.concat(" ");
      }
      //fill second part with dots for the remainder of string
      while (splittext3.length < 122) {
        splittext3 = splittext3.concat(".");
      }
      //add pagenum
      splittext3 = splittext3.concat(" ", TOCpagenum);
      //console.println("splittext3=" + splittext3);
    }
    //include the page number
    bmtext = bmtext.concat(" ", TOCpagenum);
    //console.println(bmtext);
    //check, on which page of the TOC the annotation will go
    var locTOC = Math.ceil(i / 15);
    var TOCposition = i - (locTOC - 1) * 15;
    if (i == 0) {
      TOCposition = 0;
    }
    //console.println("TOC page:" + locTOC);
    //console.println("TOC position:" + TOCposition);
    // annotation goes to page 1
    if (i <= 15) {
      if (splittext2 != "") {
        var f = this.addField(TOC_txt + i, "text", 0, [
          61,
          530 - ((TOCposition + i / 3) * 20 + 50),
          790,
          530 - ((TOCposition + i / 3) * 20 + 80),
        ]);
        f.textColor = color.blue;
        f.textSize = 9;
        f.multiline = true;
        f.alignment = "left";
        f.textFont = font.Cour;
        f.strokeColor = color.transparent;
        f.fillColor = color.transparent;
        f.value = splittext2 + "\n" + splittext3;
      } else {
        var f = this.addField(TOC_txt + i, "text", 0, [
          61,
          530 - ((TOCposition + i / 3) * 20 + 50),
          790,
          530 - ((TOCposition + i / 3) * 20 + 80),
        ]);
        f.textColor = color.blue;
        f.textSize = 9;
        f.multiline = true;
        f.alignment = "left";
        f.textFont = font.Cour;
        f.strokeColor = color.transparent;
        f.fillColor = color.transparent;
        f.value = bmtext;
      }
    } else {
      var locTOC = Math.ceil((i - 15) / 16);
      var TOCposition = i - 15 - (locTOC - 1) * 16;
      //console.println("Ceil15=" + locTOC);
      //console.println("pos15=" + TOCposition);
      if (splittext2 != "") {
        var f = this.addField(TOC_txt + i, "text", locTOC, [
          61,
          570 - ((TOCposition + TOCposition / 3) * 20 + 50),
          790,
          570 - ((TOCposition + TOCposition / 3) * 20 + 80),
        ]);
        f.textColor = color.blue;
        f.textSize = 9;
        f.alignment = "left";
        f.textFont = font.Cour;
        f.multiline = true;
        f.strokeColor = color.transparent;
        f.fillColor = color.transparent;
        f.value = splittext2 + "\n" + splittext3;
      } else {
        var f = this.addField(TOC_txt + i, "text", locTOC, [
          61,
          570 - ((TOCposition + TOCposition / 3) * 20 + 50),
          790,
          570 - ((TOCposition + TOCposition / 3) * 20 + 80),
        ]);
        f.textColor = color.blue;
        f.textSize = 9;
        f.multiline = true;
        f.alignment = "left";
        f.textFont = font.Cour;
        f.value = bmtext;
        f.strokeColor = color.transparent;
        f.fillColor = color.transparent;
      }
    }
  }
  //add page numbers, keep these with pre-defined text-box properties, do only if less than 10000 pages;
  var flattenID = 0;
  for (var i = 0; i < this.numPages; i++) {
    t.value = i;
    t.text = "Number page " + (i + 1) + " of " + this.numPages;
    var Page_txt = "page" + i;
    var mypagetext = "Page " + (i + 1) + " of " + this.numPages;
    var f = this.addField("page" + i, "text", i, [0, 50, 790, 35]);
    f.textColor = color.black;
    f.textSize = 9;
    f.alignment = "center";
    f.fillColor = color.transparent;
    f.strokeColor = color.transparent;
    f.textFont = font.Cour;
    f.value = mypagetext;
    flattenID = flattenID + 1;
    if (this.numPages > 10000 && flattenID == 1000) {
      var myfltpage = i - flattenID + 1;
      for (var my = myfltpage; my < i; my++) {
        this.flattenPages(my);
      }
      flattenID = 0;
    }
  }
  //include little house icon in footer and flatten again
  //for (var i = tocpages ; i < this.numPages ; i++)
  //    {
  //        var f = this.addField("header51", "text", i,[80, 50, 110, 35]);
  //            f.textColor=color.black;
  //            f.textSize=14;
  //            f.alignment="center";
  //            f.textFont=font.Times;
  //            f.strokeColor= color.transparent;
  //            f.fillColor= color.transparent;
  //            f.value="\u2302";
  //    }
  //this function converts all annotations to text
  this.flattenPages();
  //Run through pages and add link to top TOC page
  for (var i = tocpages; i < this.numPages; i++) {
    //if less than 10000 pages we already have overall pagination and can add a link;
    if (this.numPages < 10000) {
      t.value = i;
      t.text =
        "Adding link to top page to page " + (i + 1) + " of " + this.numPages;
      var mylink = this.addLink(i, [0, 50, 790, 35]);
      mylink.setAction("this.pageNum = " + 0);
      mylink.highlightMode = "None";
      //uncomment the following line to enable postscript code
      myPages =
        myPages +
        "[/Rect[0 50 790 20]/Rotate 90 /Color [0 0 0] /Border [0 0 0] /SrcPg " +
        (i + 1) +
        " /Page 1 /View [/Fit] /Subtype /Link /ANN pdfmark  \n";
    }
    //add link as pdfmark to  array;
  }
  //loop needs to iterate another time to get links into TOC
  for (var i = 0; i < ibmLength; i++) {
    t.value = i;
    t.text = "Add link " + (i + 1) + " of " + ibmLength;
    var bmToCheck = bm.children[i];
    //retrieve page the bookmark refers to
    this.bookmarkRoot.children[i].execute();
    //console.println(this.bookmarkRoot.children[i].name + " | " +this.pageNum);
    var bmtext = this.bookmarkRoot.children[i].name;
    var TOCpagenum = this.pageNum + 1;
    var bmtextcomplete =
      this.bookmarkRoot.children[i].name + " Check " + TOCpagenum;
    //console.println(bmtext.length );
    //console.println(bmtextcomplete.length );
    var bmlen = bmtextcomplete.length;
    var locTOC = Math.ceil(i / 15);
    var TOCposition = i - (locTOC - 1) * 15;
    if (i == 0) {
      TOCposition = 0;
    }
    //console.println("TOC page:" + locTOC);
    //console.println("TOC position:" + TOCposition);
    // annotation goes to page 1
    if (i <= 15) {
      var mylink = this.addLink(0, [
        61,
        530 - ((TOCposition + TOCposition / 3) * 20 + 50),
        790,
        530 - ((TOCposition + TOCposition / 3) * 20 + 70),
      ]);
      mylink.setAction("this.pageNum = " + this.pageNum);
      mylink.highlightMode = "None";
      //uncomment the following line to enable postscript code
      myTOClinks =
        myTOClinks +
        " [/Rect[ 61 " +
        (530 - ((TOCposition + TOCposition / 3) * 20 + 50)) +
        " 790 " +
        (530 - ((TOCposition + TOCposition / 3) * 20 + 70)) +
        "]/Rotate 90 /Color [0 0 0] /Border [0 0 0] /SrcPg 1 /Page " +
        (this.pageNum + 1) +
        "  /View [/Fit] /Subtype /Link /ANN pdfmark \n";
    } else {
      var locTOC = Math.ceil((i - 15) / 16);
      var TOCposition = i - 15 - (locTOC - 1) * 16;
      var mylink = this.addLink(locTOC, [
        61,
        570 - ((TOCposition + TOCposition / 3) * 20 + 50),
        790,
        570 - ((TOCposition + TOCposition / 3) * 20 + 70),
      ]);
      mylink.setAction("this.pageNum = " + this.pageNum);
      mylink.highlightMode = "None";
      //uncomment the following line to enable postscript code
      myTOClinks =
        myTOClinks +
        " [/Rect[ 61 " +
        (570 - ((TOCposition + TOCposition / 3) * 20 + 50)) +
        " 790 " +
        (570 - ((TOCposition + TOCposition / 3) * 20 + 70)) +
        "]/Rotate 90 /Color [0 0 0] /Border [0 0 0] /SrcPg " +
        (locTOC + 1) +
        " /Page " +
        (this.pageNum + 1) +
        " /View [/Fit] /Subtype /Link /ANN pdfmark \n";
    }
  }
  t.end();
  this.pageNum = 0;
  this.pane = "bookmarks";
  this.zoomType = zoomtype.fitP;
  app.alert({
    cMsg: "TOC included " + bmtextcomplete,
    cTitle: "UCB PDF/PDFmark TOC Generator",
    nIcon: 4,
    cEnable: "event.rc = event.target != null",
  });
  app.endPriv();
});
app.addMenuItem({
  cName: "Generate TOC",
  cParent: "File",
  cExec: "MakeTOC();",
  nPos: 0,
  cEnable: "event.rc = event.target != null",
});
