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
  const wsChromeEndpointurl = 'ws://127.0.0.1:9222/devtools/browser/cb285c05-6062-434b-8dbc-6ac0927148f9'; // chrome
  const browser = await puppeteer.connect({
    browserWSEndpoint: wsChromeEndpointurl,
  });
  const page = await browser.newPage();

  await installMouseHelper(page);
  
  //await page.setViewport({ width: 800, height: 600 });
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

    for(const cnt of contours) {
      if(cnt.area > 500 && cnt.area < 1800) {
        var enmyArray = cnt.getPoints();
        var enmyX = enmyArray[0].x;
        var enmyY = enmyArray[0].y;
      }
      if(cnt.area < 230) {
        var cntArray = cnt.getPoints();
        var moveX = cntArray[0].x;
        var moveY = cntArray[0].y;
        var difX = enmyX - moveX;
        var difY = enmyY - moveY;
        var plyEnmyDifX = enmyX - 400;
        var plyEnmyDifY = enmyY - 300;
        if(Math.pow(difX, 2) > Math.pow(150, 2) && Math.pow(difY, 2) > Math.pow(150, 2)) {
          if(Math.pow(plyEnmyDifX, 2) > Math.pow(150, 2) && Math.pow(plyEnmyDifY, 2) > Math.pow(150, 2)) {
            break;
          }
        }
      }
    }

    
    /* core.takeScreenshot(page, 'shot1');

    await core.sleep(400);

    imageToSlices('./shots/shot1.png', [300], [400], {
        saveToDir: './',
        clipperOptions: {
            canvas: require('canvas')
        }    
    }, function() {
        
    }); 

    await sleep(200);

    var state1 = false;
    var state2 = false;
    var state3 = false;
    var state4 = false;

    var image1 = fs.readFileSync('./shots/section-1.png');
    var rgb1 = colorThief.getColor(image1);

    if(rgb1[0] > 240 && rgb1[1] > 240  && rgb1[2] > 240 ) {
      state1 = true;
    } else {
      state1 = false;
    }

    var image2 = fs.readFileSync('./shots/section-2.png');
    var rgb2 = colorThief.getColor(image2);

    if(rgb2[0] > 240 && rgb2[1] > 240  && rgb2[2] > 240 ) {
      state2 = true;
    } else {
      state2 = false;
    }

    var image3 = fs.readFileSync('./shots/section-3.png');
    var rgb3 = colorThief.getColor(image3);

    if(rgb3[0] > 240 && rgb3[1] > 240  && rgb3[2] > 240 ) {
      state3 = true;
    } else {
      state3 = false;
    }

    var image4 = fs.readFileSync('./shots/section-4.png');
    var rgb4 = colorThief.getColor(image4);

    if(rgb4[0] > 240 && rgb4[1] > 240  && rgb4[2] > 240 ) {
      state4 = true;
    } else {
      state4 = false;
    }

    await sleep(500);

    if(state1 && state2 && !state3 && !state4) { // up
      page.mouse.move(400, 0);
      console.log("up");
    } else if(state1 && state3 && !state2 && !state4) { // left
      page.mouse.move(0, 300);
      console.log("left");
    } else if(state2 && state4 && !state3 && !state1) { // right
      page.mouse.move(800, 300);
      console.log("right");
    } else if(state2 && state4 && !state3 && !state1) { // bottom
      page.mouse.move(400, 600);
      console.log("bottom");
    } else if(state1) {
      page.mouse.move(0, 0);
      console.log("top left");
    } else if(state2) {
      page.mouse.move(800, 0);
      console.log("top right");
    } else if(state3) {
      page.mouse.move(0, 600);
      console.log("bottom left");
    } else if(state4) {
      page.mouse.move(800, 600);
      console.log("bottom right");
    } else {
      page.mouse.move(getRandomInt(800), getRandomInt(600));
      console.log("random");
    } */

    page.mouse.move(moveX, moveY);
    await core.sleep(100);
    await isDied(page);
    await core.sleep(100);
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