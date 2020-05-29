/*
find red ball to know is dead
clip: {
  x: 342,
  y: 321,
  width: 40,
  height: 40
}
*/

module.exports = {
  takeScreenshot: function(page, name) {
    page.screenshot({
      path: "./shots/" + name + ".png",
      type: "png",
    });
  }
};