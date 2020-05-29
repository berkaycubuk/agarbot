module.exports = {
  sleep: (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  },
  takeScreenshot: (page, name) => {
    page.screenshot({
      path: "./shots/" + name + ".png",
      type: "png",
    });
  },
  takeBallScreenshot: (page, name) => {
    page.screenshot({
      path: "./shots/" + name + ".png",
      type: "png",
      clip: {
        x: 342,
        y: 321,
        width: 40,
        height: 40
      }
    });
  }
}