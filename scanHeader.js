/**
 * Created by mmspaeth on 07.12.15.
 */
var glob = require('glob');
var fs = require('fs');
var inputPath = (process.argv[2] + "/").replace("//", "/"); //.replace(/([ ])/g, '\\$1');
var outputFile= process.argv[3];
var tagAttr = process.argv[4];

checkPath(inputPath, true);

console.log("The file '" + outputFile + "' will be written.");
console.log("The path '" + inputPath + "' will be the directory to scan.");

scanFiles();

function scanFiles() {

	glob(inputPath + '*.h', function(err, files) {
		var out = {};
		if (err) throw err;
		files.forEach(function(fileName) {
			//fileName = fileName.replace(/([ ])/g, '\\$1');
			console.log(fileName);
			fs.readFile(""+fileName, "utf-8", function (err, data) {
				if (err) {
					console.log(err);
					throw err;
				}
				var result = parseHeaderFile(data);
				out[result["type"]] = result;
				if (fileName == files[files.length - 1]) {
					var strOut = "var temp = " + JSON.stringify(out, null, "\t") + ";"
					fs.writeFile(outputFile, strOut, function (err) {
						if (err) {
							return console.log(err);
						}
						console.log("The file '" + outputFile + "' was saved!");
					});
				}
			});
		});
	});
}

function getFunctions(data) {

	var collect = "";
	var count = 0;
	var first = true;
	var result = [];
	var idx = 0;
	var len = data.length;
	for (var i = 0; i < len; i++) {
		collect += data[i];
		if (data[i] == "{") { count++; }
		if (data[i] == "}") { count--; }
		if (count > 0) { first = false; }
		if (count == 0) {
			if (!first || (data[i] == ";")) {
				result[idx++] = collect;
				collect = "";
				first = true;
			}
		}
	}
	return result;
}

function removeCurlyCode(data) {
	var collect = "";
	var curlys = ["{","}"];
	var count = 0;
	var len = data.length;
	for (var i = 0; i < len; i++) {
		var char = data[i];
		if (char == "{") { count++; }
		if (!(char in curlys) && (count === 0)) {
			collect += char;
		}
		if (char == "}") { count--; }
	}
	return collect;
}

function parseHeaderFile(data) {
	var types = ["void", "float", "int16_t", "uint16_t", "uint32_t", "bool", "virtual"];
	if (typeof data !== "string") {
		return { "empty": { "type": "empty" }};
	}
	var lines = data.split("\n");
	var lineBuff = "";
	var result = {  "type": "empty",
					"data": {
						"defaults":  {
							"name":      {
								"value": "empty"
							},
							"getSource": {
								"value": null
							}
						},
						"shortName": "empty",
						"inputs":    0,
						"outputs":   0,
						"category":  "empty",
						"color":     "#E6E0F8",
						"icon":      "arrow-in.png"
					}
				};
	var active = false;
	var skipRest = false;
	var skipLine = false;
	var complete = false;
	var comment = 0;
	var curlies = 0;
	var comCount = 0;
	var curlCount = false;
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i].trim();
		comment += (line.match(/\/\*/g) || []).length - (line.match(/\*\//g) || []).length;
		if (comment > 0 || comCount > 0) {
			comCount = comment ? comCount + 1 : 0;
			continue;
		}
		if (curlCount) {
			curlies += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
			curlCount = curlies > 0;
			continue;
		}
		var start = line.firstWord();
		var matches = [];
		switch (start) {
			case result.type:
				curlies += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
				curlCount = true;
				break;
			case "#define":
			case "#ifndef":
			case "#include":
			case "extern":
			case "//":
			case "":
				skipLine = true;
				break;
			case "class":
				matches = line.match(/(^class\s*)([^ ]*)(.*$)/);
				if (matches) {
					result["type"] = matches[2].trim();
				}
				break;
			case "public:":
				active = true;
				break;
			case "private:":
				active = false;
				skipRest = true;
				break;
			default:
				if (active) {
					lineBuff += line;
				}
				break;
		}
		if (skipRest) {
			var funcs = getFunctions(lineBuff);
			len = funcs.length;
			for (var j = 0; j < len; j++) {
				var fnc = funcs[j];
				if (fnc.indexOf(result["type"]) === 0) {
					funcs[j] = "";
					continue;
				}
				var rest = removeCurlyCode(fnc).trim();
				var braces = rest.match(/(\([^\)]*\))/g);
				braces = braces ? braces[0] : "";
				rest = rest.replace(braces, "").trim();
				var parts = rest.split(/\s/);
				var dataName = "";
				if (parts) {
					if (parts[0].trim() !== result["type"]) {
						dataName = parts[parts.length - 1];
						params = braces.replace("(", "").replace(")", "").split(",");
					}
				}
				len = params.length;
				for (var x = 0; x < len; x++) {
					var par = params[x].split(" ");
					result["data"]["defaults"][dataName] = {"value": "0" };
				}
			}
			break;
		}
	}
	return result;
}

function checkPath(path, doCreate) {
	try {
		var test = fs.statSync(path).isDirectory();
		if (!test && doCreate) {
			fs.mkdirSync(path, 0x755);
			return checkPath(path, false);
		}
	} catch (err) {
		return false;
	}
}

String.prototype.firstWord = function() {
	var split = this.split(/\s/);
	result = (split) ? split[0] : this;
	return result;
}


