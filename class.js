var net = require("net");
var http = require("http");
var htmlparser = require("htmlparser");
var url = require('url');
var sys = require('sys');
var limdu = require('limdu');
var fs = require('fs');


var context = require('rabbit.js').createContext('amqp://localhost');

var MyClassifier = new limdu.classifiers.NeuralNetwork();

var obj = JSON.parse(fs.readFileSync('Midgam.json', 'utf8'));

console.log(obj[0].list[0].SearcPlace);


var json= [];
 obj.forEach(function (url) {
 	inner = {};
 	inners = '{';
 	url.list.forEach(function (list) {
 	
   
		inners+= '"'+list.SearcPlace+'-'+list.WordName+'": ' +list.value+',';

 	});
 inners = inners.substring(0, inners.length - 1);
 inners+="}"

 inner = JSON.parse(inners);

 json.push({input : inner, output: url.result});


 });
//console.log(json);

 //console.log(line);
//var jline = JSON.parse(line);
 //var json={input : jline , output : 1 };

//jsons = '{ "o" : 2}';
//console.log(json);
/*
MyClassifier.trainBatch([
    {input: { 'r': 1, g: 42 }, output: 1},  // yes
    {input: { 'r': 0, g: 2}, output: 1}, // no
    {input: { 'r':0 , g: 30}, output: 0},
      // white
    ]);
*/

var pull = context.socket('PULL');
fs.appendFile("example.json", JSON.stringify(json[0].input), function (err) {
    });
MyClassifier.trainBatch(json);
console.log("Server is up!");


pull.setEncoding('utf8');
pull.connect('TEST2');




pull.on('data', function T(m) {


	var result;
	var nresult = MyClassifier.classify(m);
	if (nresult > 0.49999999) {
	result ="yes";

	}
	else{
		result="no"
	}
	console.log(nresult);
	console.log(result);
});