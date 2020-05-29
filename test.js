const fs = require('fs');
const ColorThief = require('color-thief');
const colorThief = new ColorThief();

var image = fs.readFileSync('./section-1.png');
var rgb = colorThief.getColor(image);
console.log("R: " + rgb[0] + " G: " + rgb[1] + " B: " + rgb[2]);