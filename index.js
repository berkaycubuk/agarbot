// imports
const puppeteer = require('puppeteer');
const fs = require('fs');
const {installMouseHelper} = require('./mouseHelper');
const ColorThief = require('color-thief');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
//const imageToSlices = require('image-to-slices');
const cv = require('opencv4nodejs');

// local imports
const core = require('./functions/core');

// settings and configs
var username = 'agarbot_0.1.1';
var mouseX = 400;
var mouseY = 300;
var currentX = 0;
var currentY = 0;
var mass = 10;
var rgbR = 0;
var rgbG = 0;
var rgbB = 0;

const colorThief = new ColorThief();

// puppeteer
(async () => {
  // const browser = await puppeteer.launch({ headless: false }); // chromium
  const wsChromeEndpointurl = 'ws://127.0.0.1:9222/devtools/browser/9ee013da-5aa8-4cdc-927f-9ff12fda7de0'; // chrome
  const browser = await puppeteer.connect({
    browserWSEndpoint: wsChromeEndpointurl,
  });
  const page = await browser.newPage();

  await installMouseHelper(page);
  
  await page.setViewport({ width: 800, height: 600 });
  await page.goto('https://agar.io', {
    waitUntil: 'networkidle0'
  });

  // wait to load it properly
  await core.sleep(5000);

  main(page);

  //await browser.close(); // close the browser
})();

/* function takeScreenshot(page) {
  page.screenshot({
    path: "./shots/image.png",
    type: "png",
    clip: {
      x: 342,
      y: 321,
      width: 40,
      height: 40
    }
  });
}

function fullShot(page, name) {
  page.screenshot({
    path: "./shots/" + name + ".png",
    type: "png",
  });
} */

function scoreShot(page) {
  page.screenshot({
    path: "./shots/score.png",
    type: "png",
    clip: {
      x: 0,
      y: 560,
      width: 100,
      height: 40
    }
  });
}

async function main(page) {
  console.log("✅ Main started");
  // clean input
  page.keyboard.down('Control');
  page.keyboard.press('A');
  page.keyboard.up('Control');
  page.keyboard.press('Backspace');

  // type username
  page.keyboard.type(username, { delay: 50 });
  await core.sleep(1000);
  page.keyboard.press('Enter');

  console.log("✅ You joined");
  await core.sleep(1000);

  // main loop
  while(1) {
    // stop
    //page.mouse.move(400, 300);

    // take screenshot
    core.takeScreenshot(page, 'fullscreen');

    await core.sleep(100);

    var screen = cv.imread('./shots/fullscreen.png');

    var gray = screen.gaussianBlur(new cv.Size(5, 5), 1.2);
    gray = gray.cvtColor(cv.COLOR_BGR2GRAY);

    var thresh = gray.threshold(0, 255, cv.THRESH_BINARY+cv.THRESH_OTSU);

    var contours = thresh.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_NONE, new cv.Point2(0, 0));

    contours = contours.sort((c0, c1) => c1.area - c0.area);
    /*const imgContours = contours.map((contour) => {
      if(contour.area < 250) {
        return contour.getPoints();
      }
    });*/

    //page.mouse.move(400, 300);

    for(const cnt of contours) {
      // make calculations for all enemies
      if(cnt.area > 300 && cnt.area < 2000) {
        var enmyArray = cnt.getPoints();
        var enmyX = enmyArray[0].x;
        var enmyY = enmyArray[0].y;
      }
      if(cnt.area < 200) {
        var cntArray = cnt.getPoints();
        var moveX = cntArray[0].x;
        var moveY = cntArray[0].y;
        var difX = enmyX - moveX;
        var difY = enmyY - moveY;
        var plyEnmyDifX = enmyX - 400;
        var plyEnmyDifY = enmyY - 300;
        if(Math.pow(difX, 2) > Math.pow(300, 2) || Math.pow(difY, 2) > Math.pow(300, 2)) {
          if(Math.pow(plyEnmyDifX, 2) > Math.pow(300, 2) || Math.pow(plyEnmyDifY, 2) > Math.pow(300, 2)) {
            break;
          } else {
            moveX = 345;
            moveY = 245;
            if(plyEnmyDifX < 0 && plyEnmyDifY < 0) { // plus or minus
              moveX = 400 - plyEnmyDifX;
              moveY = 300 - plyEnmyDifY;
            } else {
              moveX = 400 + plyEnmyDifX;
              moveY = 300 + plyEnmyDifY;
            }
          }
        } else {
          moveX = 345;
          moveY = 245;
          if(difX < 0 && difY < 0) { // plus or minus
            moveX = 400 - difX;
            moveY = 300 - difY;
          } else {
            moveX = 400 + difX;
            moveY = 300 + difY;
          } 
        }
      }
    }

    console.log("DifX: " + difX + " DifY: " + difY);
    console.log("MoveX: " + moveX + " MoveY: " + moveY);

    page.mouse.move(moveX, moveY);

    await core.sleep(200);
    await isDied(page);
    await core.sleep(200);
  }
}

async function isDied(page) {
  core.takeBallScreenshot(page, 'ball');
  await core.sleep(500);
  var image = fs.readFileSync('./shots/ball.png');
  var rgb = colorThief.getColor(image);
  rgbR = rgb[0];
  rgbG = rgb[1];
  rgbB = rgb[2];
  // console.log("R: " + rgbR + " G: " + rgbG + " B: " + rgbB);

  if(rgbR == 244 && rgbG == 4 && rgbB == 44) {
    console.log("☠️ You Died!");

    // restart
    page.mouse.move(400, 235);
    page.mouse.down();
    page.mouse.up();
    await core.sleep(3000);
    page.mouse.move(400, 190);
    page.mouse.down();
    page.mouse.up();
    console.log("✅ You rejoined");
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function waitForCommand(page) {
  readline.question(`Waiting for command...`, (cmd) => {
    console.log("Ok, starting...");
    isDied(page);
    readline.close();
  });
}