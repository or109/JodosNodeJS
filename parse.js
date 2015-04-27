/**
 *
 * Description here
 *
 * Created : bryan
 * Date    : 2/7/12

 */

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

var pull = context.socket('PULL');
//var push = context.socket('PUSH');

//var msg = "http://www.ebay.co.uk/bhp/tobacco-case";

pull.setEncoding('utf8');
pull.connect('TEST1');

ForSell = 1;

function CountString(text, word) {
    //var count = (text.match(word/g)  || []).length;
    var count = S(text.toUpperCase()).count(word.toUpperCase());
    
    return count;
}

function CountWordsInText(textToSearch,place,wordslist) {
   // var wordslist = ['cart', 'shop', 'sell', 'busket', 'sale', 'wish list', 'order', 'price', '$', 'ils', 'pay', 'store', 'buy', 'offers', 'deals', 'basket', 'product', 'item', 'deal', 'market', 'itm', 'bag', 'visa', 'mastercard', 'paypal', 'condision', 'sort', 'PAYMENT', 'buy now', 'add to cart', 'add to basket', 'add to wishlist', 'track order', 'usd', 'euro', 'wishlist'];    
    var countWordslist=[];


    wordslist.forEach(function (entry) {
        countWordslist.push({SearcPlace: place, WordName: entry, value: CountString(textToSearch, entry)});
 
    });

    return countWordslist;
}

function Sinay(countWordslist, fileName, URL) {


  
    var result;

    
        result = '"' + countWordslist.url +'"' + " , ";
        countWordslist.list.forEach(function(feature){
            result += feature.value + ",";
        });
        result+= countWordslist.result +"\n"
        
        
    fs.appendFile(fileName, result, function (err) {
        if (err) return console.log(err);
        console.log(result + ' >' + fileName);
    });
}

function writeJson(json) {

    var write = JSON.stringify(json) + ",";

    fs.appendFile("list.json", write , function (err) {
        if (err) return console.log(err);
        console.log("json" + ' >' + "list.json");
    });
}


function findAllTextInDom(currentNode) {
    
    var TheTexts = "";
    if (typeof currentNode === 'undefined'){}
    else{
    currentNode.forEach(function (entry) {
        
     
        if ("text" == entry.type) {
            TheTexts += entry.data + " ";
            }
        else{
            if ("tag" == entry.type) {
                 TheTexts += findAllTextInDom(entry.children)
            }
        }
     });
    }
        return TheTexts;
 } 

function findAllClassesInDom(currentNode) {
    
    var TheTexts = "";
    if (typeof currentNode === 'undefined'){}
    else{
    currentNode.forEach(function (entry) {
        if ("tag" == entry.type) {
            if (entry.attribs)
                 if ( entry.attribs.class)
             {TheTexts += entry.attribs.class + " ";}
            TheTexts += findAllClassesInDom(entry.children);
        }
     });
    }
        return TheTexts;
 } 

pull.on('data', function T(m) {
    //              console.log("message is - " + m);
    var Theurl = url.parse(m);
    var options = {
        host: Theurl.host,
        port: 80,
        path: Theurl.path,
        method: 'GET'
    };
    options.headers = {
        'User-Agent': 'javascript'
    };
    
    
    var handler = new htmlparser.DefaultHandler(function (error, dom) {
        if (error)
            console.log("error" + error);
    });
    
    var parser = new htmlparser.Parser(handler);
    
    var req = http.request(options, function (res) {
        //    console.log('STATUS: ' + res.statusCode);
        //    console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        
        //
        // On each chunk
        //
        res.on('data', function (chunk) {
            req.write(chunk);
            //	  Rhtml += chunk;
           // console.log('\n\n===========CHUNK===============')
            parser.parseChunk(chunk);
           // console.log(chunk);
        });
        
        //
        // On End
        //
        res.on('end', function (result) {
            //      console.log('\n\n=========RESPONSE END===============');
            //        console.log(Rhtml);
            parser.done();
            //sys.puts(sys.inspect(handler.dom, false, null));
			// meta description
            var description = htmlparser.DomUtils.getElements({ tag_name: "meta", name: "description" }, handler.dom);
			
			//meta keywords
			var keywords = htmlparser.DomUtils.getElements({tag_name: "meta", name: "keywords" }, handler.dom);
			
			//menu header
			//var header1 = htmlparser.DomUtils.getElements({ id : "header" }, handler.dom);
			
			//title
			var title = htmlparser.DomUtils.getElements({ tag_name : "title" }, handler.dom);
			
			// all links a
			var links = htmlparser.DomUtils.getElements({ tag_name: "a" }, handler.dom);
			
			//head lines 
			var h1 = htmlparser.DomUtils.getElements({ tag_name: "h1" }, handler.dom);
			var h2 = htmlparser.DomUtils.getElements({ tag_name: "h2" }, handler.dom);
			var h3 = htmlparser.DomUtils.getElements({ tag_name: "h3" }, handler.dom);
			
			// Footer
			//var footer1 = htmlparser.DomUtils.getElements({ id : "footer" }, handler.dom);
			//URL
			theUrl = m;
			
            Success = true;


			features={url : m, list:[], result: ForSell};

            if (typeof description[0] === 'undefined'){
                console.log(" error connect to  description - " + m + "data" + description); 
                var arr = CountWordsInText("",'description',[ 'shop', 'sale', 'price', 'store', 'buy', 'deal']);

               arr.forEach(function (entry) {
                    features.list.push(entry);
                });
            //    Success=false;
            }
            else {
                var text = description[0].attribs.content;
                 console.log("OK description - " + text);
                var arr = CountWordsInText(text,'description',[ 'shop', 'sale', 'price', 'store', 'buy', 'deal']);
//                WriteToFile(arr,'meta-description-result.csv',m);


               arr.forEach(function (entry) {
                    features.list.push(entry);
                });
            }

              if (typeof keywords[0] === 'undefined'){
                console.log(" error connect to  keywords - " + m); 
                var arr = CountWordsInText("",'keywords',[ 'shop','sale', 'store', 'buy']);
                   arr.forEach(function (entry) {
                    features.list.push(entry);
                });
               // Success=false;
            }
            else {
                
                var text = keywords[0].attribs.content;
              //  console.log("OK keywords - " + text);
                var arr = CountWordsInText(text,'keywords',[ 'shop','sale', 'store', 'buy']);
                //WriteToFile(arr,'meta-keywords-result.csv',m);

                     arr.forEach(function (entry) {
                    features.list.push(entry);
                });
            }
/*
                if (typeof header1 === 'undefined')
                console.log(" error connect to  header1 - " + m); 
            else {
                
                // sys.puts(sys.inspect(header1, false, null));
                // text =JSON.st ringify(header1); 
                text = findAllTextInDom(header1); 
              //   console.log("OK header1 - " + text);
                var arr = CountWordsInText(text,'header1');
                WriteToFile(arr,'meta-header1-result.csv',m);

                     arr.forEach(function (entry) {
                    features.list.push(entry);
                });
            }
*/


                if (typeof title[0] === 'undefined'){
                console.log(" error connect to  title - " + m); 
                Success=false;
            }
            else {
                
                 //sys.puts(sys.inspect(title, false, null));
                text = title[0].children[0].raw; 
              //  console.log("OK title - " + text);
                var arr = CountWordsInText(text,'title',[ 'shop', 'sale', 'price', 'buy']);
//                WriteToFile(arr,'meta-title-result.csv',m);

                     arr.forEach(function (entry) {
                    features.list.push(entry);
                });
            }

            if (typeof links === 'undefined'){
                console.log(" error connect to  links - " + m); 
                Success=false;
            }
            else {
                
                 
                text = findAllTextInDom(links); 
                //console.log("OK links - " + text);
                var arr = CountWordsInText(text,'links',['cart', 'shop', 'sell', 'sale', 'wish list', 'order', 'price', '$', 'ils', 'pay', 'store', 'buy', 'offers',  'product',  'deal',  'bag', 'PAYMENT',  'add to cart', 'add to basket', 'add to wishlist', 'track order', 'wishlist']);
  //              WriteToFile(arr,'meta-links-result.csv',m);

                     arr.forEach(function (entry) {
                    features.list.push(entry);
                });
            }
            
              if (typeof h1 === 'undefined'){
                console.log(" error connect to  h1 - " + m); 
                Success=false;
            }
            else {
                
                 
                text = findAllTextInDom(h1); 
              //  console.log("OK h1 - " + text);
                var arr = CountWordsInText(text,'h1', [ 'sale', 'wish list', 'order',  'ils', 'store']);
    //            WriteToFile(arr,'meta-h1-result.csv',m);

                    arr.forEach(function (entry) {
                    features.list.push(entry);
                });
            }

               if (typeof h2 === 'undefined'){
                console.log(" error connect to  h2 - " + m); 
                Success=false;
            }
            else {
                
                 
                text = findAllTextInDom(h2); 
              //  console.log("OK h2 - " + text);
                var arr = CountWordsInText(text,'h2',[ 'sell', 'buy', 'product', 'item']);
      //          WriteToFile(arr,'meta-h2-result.csv',m);

                     arr.forEach(function (entry) {
                    features.list.push(entry);
                });
            }   

            if (typeof h3 === 'undefined'){
                console.log(" error connect to  h3 - " + m); 
                Success=false;
            }
            else {
                
                 
                text = findAllTextInDom(h3); 
               // console.log("OK h3 - " + text);
                var arr = CountWordsInText(text,'h3',['shop', 'order','pay', 'buy',  'product']);
//                WriteToFile(arr,'meta-h3-result.csv',m);

                     arr.forEach(function (entry) {
                    features.list.push(entry);
                });
            } 

  /*           if (typeof footer1 === 'undefined')
                console.log(" error connect to  footer1 - " + m); 
            else {
                text = findAllTextInDom(footer1); 
                // console.log("OK footer1 - " + text);
                var arr = CountWordsInText(text,'footer1');
                WriteToFile(arr,'meta-footer1-result.csv',m);

                     arr.forEach(function (entry) {
                    features.list.push(entry);
                });
            }
*/
            {
                text = m; 
                var arr = CountWordsInText(text,'URL',['shop',  'product']);
  //              WriteToFile(arr,'meta-url-result.csv',m);
                     arr.forEach(function (entry) {
                    features.list.push(entry);
                });
            }

            
            //console.log(findAllClassesInDom(handler.dom));

            if (typeof handler.dom === 'undefined'){
                console.log(" error searching in classes in handler.dom - " + m); 
                Success=false;
            }
            else {
                text = findAllTextInDom(handler.dom); 
                var arr = CountWordsInText(text,'classes',['cart', 'shop', 'sell',  'sale', 'wish list', 'order', 'price', '$', 'ils', 'pay', 'store', 'buy', 'offers', 'deals', 'basket', 'product', 'item',  'bag', 'visa',  'paypal', 'PAYMENT',  'add to cart', 'add to basket', 'add to wishlist', 'track order',  'wishlist']);
    //            WriteToFile(arr,'meta-classes-result.csv',m);

                     arr.forEach(function (entry) {
                    features.list.push(entry);
                });
            }
           
         //   console.log(features);

            if (Success){
                writeJson(features);
                Sinay(features,'Midgam.csv',m);
           
            var push = context.socket('PUSH');
            var inners = "{";
            features.list.forEach(function (entry) {
    
            
                inners+= '"'+entry.SearcPlace+'-'+entry.WordName+'": ' +entry.value+',';

            });
             inners = inners.substring(0, inners.length - 1);
            inners+="}";


            push.connect('OUT', function() {
                

                console.log('Write url ' + features.url + 'To Queue');
                push.write( inners);
                //push.write("features.list");
            });
             }
            else{
                console.log("Url - " + m + " Faild in one of the places!");

            }
            // ====== TESTING THE CONTACT URL   TODO:
            /*var Theurl = url.parse(m);
            var options = {
            host: Theurl.host,
            port: 80,
            path: '/contact',
            method: 'GET'
        };
        options.headers = {
            'User-Agent': 'javascript'
        };
    */
    //===========


        });
        
        
        req.on('error', function (e) {
            
        });
    
    });
    req.end();

});