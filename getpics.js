/**
 * Created by mmspaeth on 07.12.15.
 */
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');

var inputHost = process.argv[2];
var inputProfile = process.argv[3];
var inputStart = process.argv[4];
var downDir = process.argv[5].trim();

var inputURL = inputHost + inputProfile + inputStart;

if (checkPath(downDir, true)) {
	request(inputURL, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var data = body;
			var $ = cheerio.load(data);
			$('a').each(function(i, element) {
				if ($(this).attr("class") == "blk_galleries") {
					var subAddr = inputHost + $(this).attr("href").trim();
					collectImgs(subAddr);
				}
			});
		}
	});

	function collectImgs(uri) {
		request(uri, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var $ = cheerio.load(body);
				$('a').each(function(i, element) {
					if ($(this).attr("href").indexOf("photo") >= 0) {
						//console.log(inputHost + $(this).attr("href").trim());
						getImage(inputHost + $(this).attr("href").trim());
					}
				});
			}
		});
	}

	function getImage(uri) {
		request(uri, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var $ = cheerio.load(body);
				var picSrc = $('#mainPhoto').attr("src");
				request(picSrc, {encoding: 'binary'}, function(error, response, body) {
					var baseName = picSrc.split("/").pop(); 
					var test = false;
					try {
						test = fs.statSync(downDir + baseName).isFile();
					} catch (err) {}
					if (!test) {
						fs.writeFile(downDir + baseName, body, 'binary', function (err) {});
						console.log("Downloaded: " + baseName);
					} else {
						console.log("Skipped: " + baseName);
					}
				});
			}
		});
	}
} else {
	console.log("Error! Directory '" + downDir + "' not available!");
}

function checkPath(path, doCreate) {
	try {
		var test = fs.statSync(path).isDirectory();
		if (!test && doCreate) {
			fs.mkdirSync(path, 0o755);
			return checkPath(path, false);
		} else {
			return test;
		}
	} catch (err) {
		console.log(err);
		return false;
	}
}

/*
var outputPath= (process.argv[3] + "/").replace("//", "/");
var tagAttr = process.argv[4];
checkPath(outputPath, true);

console.log("The file '" + inputFile + "' will be processed.");
console.log("The path '" + outputPath + "' will be the output directory.");

fs.readFile(inputFile, function (err, data) {
	if (err) throw err;
	extractScripts(data);
});

function checkPath(path, doCreate) {
	try {
		var test = fs.statSync(path).isDirectory();
		if (!test && doCreate) {
			fs.mkdirSync(path, 0o755);
			return checkPath(path, false);
		}
	} catch (err) {
		return false;
	}
}

function extractScripts(data) {
	var $ = cheerio.load(data);
	$('script').each(function(i, element){
		var name = $(this).attr(tagAttr);
		if (name) {
			var fileName = outputPath + name + ".html";
			fs.writeFile(fileName, $(this).text(), function (err) {
				if (err) {
					return console.log(err);
				}
				console.log("The file '" + fileName + "' was saved!");
			});
		}
	});
}

*/

