/**
 *
 * Description here
 *
 * Created : bryan
 * Date    : 2/7/12
 */

var http = require("http");
var htmlparser = require("htmlparser");
var url =  require('url');
var sys = require('sys');
var context = require('rabbit.js').createContext('amqp://localhost');
var S = require('string');
fs = require('fs');

var pull = context.socket('PULL');
//var push = context.socket('PUSH');

//var msg = "http://www.ebay.co.uk/bhp/tobacco-case";

pull.setEncoding('utf8');

pull.connect('TEST1');



pull.on('data', function T(m) {
  //              console.log("message is - " + m);
		var Theurl = url.parse(m);
		var options = {
  		  host: Theurl.host,
 		  port: 80,
 		  path: Theurl.path,
  		  method: 'GET'
		};

var handler = new htmlparser.DefaultHandler(function (error, dom) {
    if (error)
	console.log("error" + error);    
    else
	var as = htmlparser.DomUtils.getElements({tag_name: "meta", name: "description"}, dom);
//	console.log(htmlparser.DomUtils.getElementsByTagName("h1", dom));
//	console.log(as[0].attribs.content);
//	sys.puts(sys.inspect(dom, false, null));
});

var parser = new htmlparser.Parser(handler);

var req = http.request(options, function(res)
{
//    console.log('STATUS: ' + res.statusCode);
//    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');

    //
    // On each chunk
    //
    res.on('data', function (chunk)
    {
	  req.write(chunk);
//	  Rhtml += chunk;
//        console.log('\n\n===========CHUNK===============')
	parser.parseChunk(chunk);
//        console.log(chunk);
    });

    //
    // On End
    //
    res.on('end', function(result)
    {
  //      console.log('\n\n=========RESPONSE END===============');
//        console.log(Rhtml);
	parser.done();
//	sys.puts(sys.inspect(handler.dom, false, null));
	var as = htmlparser.DomUtils.getElements({tag_name: "a", class: "vip"}, handler.dom);
	sys.puts(sys.inspect(as, false, null));
	var result =m + " , " +  as[0].attribs.title + "\n"; 
//	console.log(as[0].attribs.content);
	fs.appendFile("result.csv", result, function (err) {
  		if (err) return console.log(err);
 	 	//console.log(result + ' > result.csv' );
    console.log('fdsfs' );

    var wordslist = ['shop', 'shopping','SHOP','Store', 'ebay','eBay','Ebay'];
    console.log(S(result).count("shop"));

    wordslist.forEach(function(entry) {
        //console.log(entry);
        console.log(entry + ' - '+S(result).count(entry));
    });


    // var a = ["a", "b", "c"];
    // a.forEach(function(entry) {
    //     console.log(entry);
    // });

    	});
    	//console.log(result);

  
//        console.log('\n\n=========RESPONSE END===============');
    });
});

req.on('error', function(e)
{
    console.log('\n\n==========ERROR==============')
    console.log('problem with request: ' + e.message);
    console.log('\n\n==========ERROR==============')
});


req.end();

});

//push.connect('TEST1', function() {
  //   push.write(msg);
//});

var URL = 'http://www.ebay.co.uk/bhp/tobacco-case';



//console.log(Theurl);


//var Rhtml="";


// On initial response
//

//
// On Error
//

// write data to request body
//console.log('\n\n=========REQUEST END===============');



//
//sys.puts(sys.inspect(handler.dom, false, null));i
