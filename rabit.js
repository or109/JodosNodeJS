
var net = require("net");
var http = require("http");
var htmlparser = require("htmlparser");
var url = require('url');
var sys = require('sys');

var context = require('rabbit.js').createContext('amqp://localhost');
//var amqp = require('amqp'); 
//var context = require('rabbit.js').createContext(url);
//var url = process.env.CLOUDAMQP_URL || "amqp://ciserzta:DOH8F6QWKx0d9bXr7_TD75zsdZM151_F@tiger.cloudamqp.com/ciserzta"; // default to localhost


var S = require('string');
var fs = require('fs');
var p = 84.49;
var json = [{"Path":"//html/body/div/div/div/div/div/div/form/div/div/div/div/div/b"},{"Price":"84.49","Path":"//html/body/div/div/div/div/div/div/form/div/div/div/div/span"},{"Price":"20","Path":"//html/body/div/div/div/div/div/div/div/div/table/tr/td/div/div/div/div/div/div"},{"Price":"21","Path":"//html/body/div/div/div/div/div/div/div/div/table/tr/td/div/div/div/div/div/div"},{"Price":"35","Path":"//html/body/div/div/div/div/div/div/div/div/table/tr/td/div/div/div/div/div/div"}];
console.log(json);

var pathCount = require("node-hashtable");
var PriceList = [];
json.forEach(function (entry) {
	if (typeof entry.Price != 'undefined'){
		
		if(p * 0.5 < entry.Price & p * 1.5 > entry.Price){
			PriceList.push({'Price':entry.Price,'Path':entry.Path});
		}
		if(pathCount.get(entry.Path) == null ){
			pathCount.set(entry.Path,{'Count': 1});
		}
		else{
			var oldCount = pathCount.get(entry.Path).Count;
			pathCount.update(entry.Path,{'Count': oldCount + 1})
		}
		
	}
});
var Max = -9999;
var Min = 99999;
var index = 0;
PriceList.forEach(function (entry){
	if(pathCount.get(entry.Path) != null)
		if(pathCount.get(entry.Path).Count > 2){
			delete PriceList[index].Price;
		}
		else{
			if(parseFloat(entry.Price) > Max)
				Max = parseFloat(entry.Price);
			if(parseFloat(entry.Price) < Min)
				Min = parseFloat(entry.Price);
		}
			
		
	index++;
	
});

console.log(PriceList + " , " + Min + " - " + Max);

var test = "sad";

if (test.match("\\d+") == null) {console.log("Manzur gay!");}
console.log(test.match("[\\d]."));
