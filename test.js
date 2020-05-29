const cv = require('opencv4nodejs');

//while(true) {
  var img = cv.imread('./shots/fullscreen.png');
  //var mat = new cv.Mat(img);

  /*var hsv = img.cvtColor(cv.COLOR_BGR2HSV);

  var lower_range = new cv.Vec(90, 0, 0);
  var upper_range = new cv.Vec(255, 255, 255);

  var mask = hsv.inRange(lower_range, upper_range);
  //var res = img.bitwiseAnd(mask);

  //cv.imshow('frame', img);
  //cv.imshow('frame', red);

  cv.imshow('frame', mask);*/

  
  var gray = img.gaussianBlur(new cv.Size(5, 5), 1.2);
  gray = gray.cvtColor(cv.COLOR_BGR2GRAY);

  var thresh = gray.threshold(0, 255, cv.THRESH_BINARY+cv.THRESH_OTSU);

  var centerPoint = new cv.Point(400, 300);

  var contours = thresh.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_NONE, new cv.Point2(0, 0));

  contours = contours.sort((c0, c1) => c1.area - c0.area);
  /*const imgContours = contours.map((contour) => {
    if(contour.area < 250) {
      //console.log(contour);
      return contour.getPoints();
    } else {
      var falseContour = new cv.Point2(0, 0);
      return falseContour;
    }
  });

  //img.drawRectangle(centerPoint, centerPoint, new cv.Vec3(0, 0, 0), 5);
  // img.drawLine(centerPoint, imgContours[4][2], new cv.Vec3(0, 0, 0), 2); // distance
  img.drawContours(imgContours, -1, new cv.Vec3(41, 176, 218), 1);*/

  for(const cnt of contours) {
    if(cnt.area < 250) {
      var cntArray = cnt.getPoints();
      var moveX = cntArray[0].x;
      var moveY = cntArray[0].y;
      console.log(moveX + " " + moveY);
      break;
    }
  }

  cv.imshow('frame', img);
  
  var key = cv.waitKey(1);
  if(key == 27) {
   //break;
  }
//}

cv.destroyAllWindows();