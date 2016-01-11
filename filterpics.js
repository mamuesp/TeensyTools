/**
 * Created by mmspaeth on 07.12.15.
 */
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');
const readChunk = require('read-chunk');  
const fileType = require('file-type');
const jimp = require('jimp');
const async = require('async');
const sharp = require('sharp');

var inputDir = (process.argv[2] + "/").replace("//", "/");
var longSize = process.argv[3] ? process.argv[3] : 1080; 

fs.readdir(inputDir, function (err, files) {
	async.forEach(files, function (item, callback) {
		var imgFile = inputDir + item;
		var test = fs.statSync(imgFile).isFile();
		if (test) {
			var imgOut = inputDir + "opt/" + item;
			console.log("File: " + imgFile);
			var image = sharp(imgFile);
			image.metadata().then(function(metadata) {
				var f = longSize / ((metadata.width < metadata.height) ? metadata.width : metadata.height);
				var newWidth = Math.ceil(metadata.width * f);
				var newHeight = Math.ceil(metadata.height * f);
				return image
					.interpolateWith(sharp.interpolator.vertexSplitQuadraticBasisSpline)
					.resize(newWidth, newHeight)
					.sharpen(2, 0.8, 1.5)
					.gamma(1.4)
					.normalize()
					.jpeg()
					.quality(100)
					.toFile(imgOut);
  			});
  		}
   	}, function () {
       	//This function is called when the whole forEach loop is over
           finished() //--> This is the point where i call the callback because the iteration is over
    });
});

function finished() {
	console.log("Trash: " + trash);
}