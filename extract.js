/**
 * Created by mmspaeth on 07.12.15.
 */
var fs = require('fs');
var cheerio = require('cheerio');
var inputFile = process.argv[2];
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



