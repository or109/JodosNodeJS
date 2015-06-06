var net = require("net");
var http = require("http");
var htmlparser = require("htmlparser");
var url = require('url');
var sys = require('sys');
var limdu = require('limdu');
var fs = require('fs');
var BigNumber = require('bignumber.js');


var context = require('rabbit.js').createContext('amqp://localhost');

var MyClassifier = new limdu.classifiers.NeuralNetwork();

var obj = JSON.parse(fs.readFileSync('Midgam.json', 'utf8'));

console.log(obj.length);


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


if (url.result == 1){
	out='Yes';

}
else
{

out='No';
}
 json.push({input : inner, output: url.result });


 });



//console.log(json);
var jjson = JSON.parse(fs.readFileSync('Network.json', 'utf8'));
MyClassifier.fromJSON(jjson);

var pull = context.socket('PULL');
//var TheNetwork = MyClassifier.toJSON();
var TheNetwork = {};
fs.appendFile("ResentNetwok.json", JSON.stringify(TheNetwork), function (err) {
    });
console.log("Server is up!");


pull.setEncoding('utf8');
pull.connect('OUT');

var push = context.socket('PUSH');

push.connect('Testing', function() {
    
    push.write(  JSON.stringify(TheNetwork));
    //push.write("features.list");
});


pull.on('data', function T(m) {


	//console.log(m);
	var toClssify = {};
	toClssify = JSON.parse(m);
	//console.log(toClssify);	
	var result;
	var nresult = MyClassifier.classify(toClssify);
	//if (nresult > 0.49999999) {
	//result ="yes";

	//}
	//else{
//		result="no"
//	}
	console.log(nresult);
	//console.log(result);
});