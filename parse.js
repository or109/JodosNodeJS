/**
 *
 * Description here
 *
 * Created : bryan
 * Date    : 2/7/12

 */

var net = require("net");
// var http = require("http");
var https = require('follow-redirects').https;
var http = require('follow-redirects').http
var request = require('request');
var htmlparser = require("htmlparser");
var url = require('url');
var sys = require('sys');
var limdu = require('limdu');
var fx = require("money");
var zlib = require('zlib');
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

options = {
    //  normalizeOutputProbabilities : true,
    //calculateRelativeProbabilities : true

}
var MyClassifier = new limdu.classifiers.NeuralNetwork(options);




var jjson = JSON.parse(fs.readFileSync('Network.json', 'utf8'));
MyClassifier.fromJSON(jjson);
var Counter = 0;

function RegexPage(currentNode, Path) {
    PriceMaxlength = 25;
    //sys.puts(sys.inspect(currentNode, false, null));    
    var TheTexts = "";
    var RegexResults = [];
    if (typeof currentNode === 'undefined') {} else {


        currentNode.forEach(function(entry) {
            if (typeof entry === 'undefined') {} else {
                if ("text" == entry.type) {
                    var DollarPat = /\$\s*(\d+([.]\d+)?)|(\d+([.]\d+)?)\s*\$|\&\#36\;\s*(\d+([.]\d+)?)|(\d+([.]\d+)?)\s*\&\#36\;/;
                    var EuroPat = /\€\s*(\d+([.]\d+)?)|(\d+([.]\d+)?)\s*\€/;
                    var ShekelPat = /\₪\s*(\d+([.]\d+)?)|(\d+([.]\d+)?)\s*\₪|ILS\s*(\d+([.]\d+)?)|(\d+([.]\d+)?)\s*ILS/;
                    var PoundPat = /[\£\₤]\s*(\d+([.]\d+)?)|(\d+([.]\d+)?)\s*[\£\₤]/;
                    var Price = entry.data.match(DollarPat);
                    //console.log("Checking (" + entry.data + " )  " + entry.data.length );
                    if (Price != null & entry.data.length <= PriceMaxlength) {
                        if (Price[1] != null)
                            RegexResults.push({
                                'Price': Price[1],
                                'Path': Path
                            });
                        else if (Price[5] != null)
                            RegexResults.push({
                                'Price': Price[5],
                                'Path': Path
                            });
                        TheTexts += " " + Price;
                        console.log("Found - " + entry.data + " | " + Price);
                        console.log("Path - " + Path);
                    }
                } else if ("tag" == entry.type) {


                    var results = RegexPage(entry.children, Path + "/" + entry.name);

                    results.forEach(function(P) {
                        RegexResults.push(P);
                    });

                }
            }
        });
    }
    return RegexResults;
}

function CountString(text, word) {
    //var count = (text.match(word/g)  || []).length;
    if (typeof text === 'undefined' | typeof word === 'undefined') {
        count = 0
    } else
        var count = S(text.toUpperCase()).count(word.toUpperCase());

    return count;
}

function CountWordsInText(textToSearch, place, wordslist) {
    // var wordslist = ['cart', 'shop', 'sell', 'busket', 'sale', 'wish list', 'order', 'price', '$', 'ils', 'pay', 'store', 'buy', 'offers', 'deals', 'basket', 'product', 'item', 'deal', 'market', 'itm', 'bag', 'visa', 'mastercard', 'paypal', 'condision', 'sort', 'PAYMENT', 'buy now', 'add to cart', 'add to basket', 'add to wishlist', 'track order', 'usd', 'euro', 'wishlist'];    
    var countWordslist = [];


    wordslist.forEach(function(entry) {
        countWordslist.push({
            SearcPlace: place,
            WordName: entry,
            value: CountString(textToSearch, entry)
        });

    });

    return countWordslist;
}

function Sinay(countWordslist, fileName, URL) {



    var result;


    result = '"' + countWordslist.url + '"' + " , ";
    countWordslist.list.forEach(function(feature) {
        result += feature.value + ",";
    });
    result += countWordslist.result + "\n"


    fs.appendFile(fileName, result, function(err) {
        if (err) return console.log(err);
        // console.log(result + ' >' + fileName);
    });
}

function writeJson(json) {

    var write = JSON.stringify(json) + ",";

    fs.appendFile("list.json", write, function(err) {
        if (err) return console.log(err);
        //   console.log("json" + ' >' + "list.json");
    });
}


function findAllTextInDom(currentNode) {

    var TheTexts = "";
    if (typeof currentNode === 'undefined') {} else {
        currentNode.forEach(function(entry) {


            if ("text" == entry.type) {
                TheTexts += entry.data + " ";
            } else {
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
    if (typeof currentNode === 'undefined') {} else {
        currentNode.forEach(function(entry) {
            if ("tag" == entry.type) {
                if (entry.attribs)
                    if (entry.attribs.class) {
                        TheTexts += entry.attribs.class + " ";
                    }
                TheTexts += findAllClassesInDom(entry.children);
            }
        });
    }
    return TheTexts;
}

pull.on('data', function T(m) {
    //  console.log("message is - " + m);
    try {

        var message = JSON.parse(m);
        Counter++;
    } catch (error) {
        // An error has occured, handle it, by e.g. logging it
        console.log("message - " + m + " is not a json! " + error);
    }




    //console.log(message);

    var Theurl = url.parse(message.Url);
    // console.log(Theurl);
    var port = 80;
    var Protocol = http;
    if (Theurl.protocol == "http:") {
        port = 80;
        Protocol = http;
    } else if (Theurl.protocol == "https:") {

        port = 443;
        Protocol = https;

    }
    var options = {
        followAllRedirects: true,
        host: Theurl.host,
        port: port,
        path: Theurl.path,
        method: 'GET'
    };
    options.headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.81 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'sdch'
    };


    var handler = new htmlparser.DefaultHandler(function(error, dom) {
        if (error)
            console.log("error" + error);
    });

    var parser = new htmlparser.Parser(handler);

    var req = Protocol.request(options, function(res) {
        //    console.log('STATUS: ' + res.statusCode);
        //    console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        var rawHtml = "";

        //
        // On each chunk
        //
        res.on('data', function(chunk) {

            rawHtml += chunk;
            //    Rhtml += chunk;
            // console.log('\n\n===========CHUNK===============')
            parser.parseChunk(chunk);
            //console.log(chunk);
        });

        //
        // On End
        //
        res.on('end', function() {
            //      console.log('\n\n=========RESPONSE END===============');

            parser.done();

            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            console.log(res.statusCode);

            //console.log(message);
            // sys.puts(sys.inspect(handler.dom, false, null));
            // meta description

            //console.log(Theurl);
            var description = htmlparser.DomUtils.getElements({
                tag_name: "meta",
                name: "description"
            }, handler.dom);

            //meta keywords
            var keywords = htmlparser.DomUtils.getElements({
                tag_name: "meta",
                name: "keywords"
            }, handler.dom);

            //menu header
            //var header1 = htmlparser.DomUtils.getElements({ id : "header" }, handler.dom);

            //title
            var title = htmlparser.DomUtils.getElements({
                tag_name: "title"
            }, handler.dom);

            // all links a
            var links = htmlparser.DomUtils.getElements({
                tag_name: "a"
            }, handler.dom);

            //head lines 
            var h1 = htmlparser.DomUtils.getElements({
                tag_name: "h1"
            }, handler.dom);
            var h2 = htmlparser.DomUtils.getElements({
                tag_name: "h2"
            }, handler.dom);
            var h3 = htmlparser.DomUtils.getElements({
                tag_name: "h3"
            }, handler.dom);

            // Footer
            //var footer1 = htmlparser.DomUtils.getElements({ id : "footer" }, handler.dom);
            //URL


            Success = true;

            // REGEX TEST
            console.log("-------------------------------------");

            var sitePricesList = RegexPage(handler.dom, "/");
            //console .log(JSON.stringify(sitePricesList))
            console.log("-------------------------------------");
            var regex1 = JSON.stringify(handler.dom);

            fs.writeFile("RecentSite.html", rawHtml, function(err) {
                if (err) return console.log(err);
                //console.log('regex done');
            });

             fs.writeFile("RecentSite.json", regex1, function(err) {
                if (err) return console.log(err);
                //console.log('regex done');
            });

            features = {
                url: message.Url,
                list: [],
                result: ForSell
            };

            if (typeof description[0] === 'undefined') {
                console.log(" error connect to  description - " + message.Url + "data" + description);
                var arr = CountWordsInText("", 'description', ['shop', 'sale', 'price', 'store', 'buy', 'deal']);

                arr.forEach(function(entry) {
                    features.list.push(entry);
                });
                //    Success=false;
            } else {
                var text = description[0].attribs.content;
                // console.log("OK description - " + text);
                var arr = CountWordsInText(text, 'description', ['shop', 'sale', 'price', 'store', 'buy', 'deal']);
                //                WriteToFile(arr,'meta-description-result.csv',message.Url);


                arr.forEach(function(entry) {
                    features.list.push(entry);
                });
            }

            if (typeof keywords[0] === 'undefined') {
                console.log(" error connect to  keywords - " + message.Url);
                var arr = CountWordsInText("", 'keywords', ['shop', 'sale', 'store', 'buy']);
                arr.forEach(function(entry) {
                    features.list.push(entry);
                });
                // Success=false;
            } else {

                var text = keywords[0].attribs.content;
                //  console.log("OK keywords - " + text);
                var arr = CountWordsInText(text, 'keywords', ['shop', 'sale', 'store', 'buy']);
                //WriteToFile(arr,'meta-keywords-result.csv',message.Url);

                arr.forEach(function(entry) {
                    features.list.push(entry);
                });
            }
            /*
                            if (typeof header1 === 'undefined')
                            console.log(" error connect to  header1 - " + message.Url); 
                        else {
                            
                            // sys.puts(sys.inspect(header1, false, null));
                            // text =JSON.st ringify(header1); 
                            text = findAllTextInDom(header1); 
                          //   console.log("OK header1 - " + text);
                            var arr = CountWordsInText(text,'header1');
                            WriteToFile(arr,'meta-header1-result.csv',message.Url);

                                 arr.forEach(function (entry) {
                                features.list.push(entry);
                            });
                        }
                        */


            if (typeof title[0] === 'undefined') {

                console.log(" error connect to  title - " + message.Url);
                Success = false;
            } else {
                if (typeof title[0].children === 'undefined') {
                    console.log(" error connect to  title - " + message.Url);
                    Success = false;
                } else {
                    //sys.puts(sys.inspect(title, false, null));
                    text = title[0].children[0].raw;
                    //  console.log("OK title - " + text);
                    var arr = CountWordsInText(text, 'title', ['shop', 'sale', 'price', 'buy']);
                    //                WriteToFile(arr,'meta-title-result.csv',message.Url);

                    arr.forEach(function(entry) {
                        features.list.push(entry);
                    });
                }
            }
            if (typeof links === 'undefined') {
                console.log(" error connect to  links - " + message.Url);
                Success = false;
            } else {


                text = findAllTextInDom(links);
                //console.log("OK links - " + text);
                var arr = CountWordsInText(text, 'links', ['cart', 'shop', 'sell', 'sale', 'wish list', 'order', 'price', '$', 'ils', 'pay', 'store', 'buy', 'offers', 'product', 'deal', 'bag', 'PAYMENT', 'add to cart', 'add to basket', 'add to wishlist', 'track order', 'wishlist']);
                //              WriteToFile(arr,'meta-links-result.csv',message.Url);

                arr.forEach(function(entry) {
                    features.list.push(entry);
                });
            }

            if (typeof h1 === 'undefined') {
                console.log(" error connect to  h1 - " + message.Url);
                Success = false;
            } else {


                text = findAllTextInDom(h1);
                //  console.log("OK h1 - " + text);
                var arr = CountWordsInText(text, 'h1', ['sale', 'wish list', 'order', 'ils', 'store']);
                //            WriteToFile(arr,'meta-h1-result.csv',message.Url);

                arr.forEach(function(entry) {
                    features.list.push(entry);
                });
            }

            if (typeof h2 === 'undefined') {
                console.log(" error connect to  h2 - " + message.Url);
                Success = false;
            } else {


                text = findAllTextInDom(h2);
                //  console.log("OK h2 - " + text);
                var arr = CountWordsInText(text, 'h2', ['sell', 'buy', 'product', 'item']);
                //          WriteToFile(arr,'meta-h2-result.csv',message.Url);

                arr.forEach(function(entry) {
                    features.list.push(entry);
                });
            }

            if (typeof h3 === 'undefined') {
                console.log(" error connect to  h3 - " + message.Url);
                Success = false;
            } else {


                text = findAllTextInDom(h3);
                // console.log("OK h3 - " + text);
                var arr = CountWordsInText(text, 'h3', ['shop', 'order', 'pay', 'buy', 'product']);
                //                WriteToFile(arr,'meta-h3-result.csv',message.Url);

                arr.forEach(function(entry) {
                    features.list.push(entry);
                });
            }

            /*           if (typeof footer1 === 'undefined')
                          console.log(" error connect to  footer1 - " + message.Url); 
                      else {
                          text = findAllTextInDom(footer1); 
                          // console.log("OK footer1 - " + text);
                          var arr = CountWordsInText(text,'footer1');
                          WriteToFile(arr,'meta-footer1-result.csv',message.Url);

                               arr.forEach(function (entry) {
                              features.list.push(entry);
                          });
                      }
                      */
            {
                text = message.Url;
                var arr = CountWordsInText(text, 'URL', ['shop', 'product']);
                //              WriteToFile(arr,'meta-url-result.csv',message.Url);
                arr.forEach(function(entry) {
                    features.list.push(entry);
                });
            }


            //console.log(findAllClassesInDom(handler.dom));

            if (typeof handler.dom === 'undefined') {
                console.log(" error searching in classes in handler.dom - " + message.Url);
                Success = false;
            } else {
                text = findAllClassesInDom(handler.dom);
                var arr = CountWordsInText(text, 'classes', ['cart', 'shop', 'sell', 'sale', 'wish list', 'order', 'price', '$', 'ils', 'pay', 'store', 'buy', 'offers', 'deals', 'basket', 'product', 'item', 'bag', 'visa', 'paypal', 'PAYMENT', 'add to cart', 'add to basket', 'add to wishlist', 'track order', 'wishlist']);
                //            WriteToFile(arr,'meta-classes-result.csv',message.Url);

                arr.forEach(function(entry) {
                    features.list.push(entry);
                });
            }

            //   console.log(features);

            if (Success) {
                //writeJson(features);
                //Sinay(features,'Midgam.csv',message.Url);

                var push = context.socket('PUSH');
                var inners = "{";
                features.list.forEach(function(entry) {


                    inners += '"' + entry.SearcPlace + '-' + entry.WordName + '": ' + entry.value + ',';

                });
                inners = inners.substring(0, inners.length - 1);
                inners += "}";
                var finalResult = {
                    'Url': message.Url
                };


                // console.log(inners);
                var classifyResult = MyClassifier.classify(JSON.parse(inners));


                if (classifyResult > 0.50000000) {
                    finalResult.isSellSite = "yes";
                } else {
                    finalResult.isSellSite = "no";
                }
                var p = parseFloat(message.Price);

                var pathCount = [];
                var PriceList = [];
                sitePricesList.forEach(function(entry) {
                    if (typeof entry.Price != 'undefined') {

                        if (p * 0.5 < entry.Price & p * 1.5 > entry.Price) {
                            PriceList.push({
                                'Price': entry.Price,
                                'Path': entry.Path
                            });
                        }
                        if (typeof pathCount[entry.Path] === 'undefined') {
                            pathCount[entry.Path] = 1;

                        } else {
                            var oldCount = pathCount[entry.Path];
                            pathCount[entry.Path] = oldCount + 1;
                        }

                    }
                });
                var Max = -99999;
                var Min = 99999;
                var index = 0;
                console.log(pathCount);
                console.log(PriceList);
                PriceList.forEach(function(entry) {
                    if (typeof pathCount[entry.Path] != 'undefined')
                        if (pathCount[entry.Path] > 3) {
                            delete PriceList[index].Price;
                        } else {
                            if (parseFloat(entry.Price) > Max)
                                Max = parseFloat(entry.Price);
                            if (parseFloat(entry.Price) < Min)
                                Min = parseFloat(entry.Price);
                        }


                    index++;

                });
                console.log("Finish! - ");
                console.log(PriceList);
                console.log("Counter -" + Counter);
                console.log("Url - " + message.Url);
                console.log("Price -" + message.Price);
                console.log(Min + " - " + Max);
                console.log(classifyResult);



                finalResult.predictMinPrice = Min;
                finalResult.predictMaxPrice = Max;
                finalResult.Token = message.Token;

                //TO_CHANGE > 0.4999999
                if (Min != 99999 & classifyResult > 0) {
                    // if (true) {
                    console.log("YES!!!!!!");
                    push.connect('FinalOUT', function() {


                        //console.log('Write  -' + JSON.stringify(finalResult) + ' To Queue');
                        push.write(JSON.stringify(finalResult));
                        //push.write("features.list");
                    });
                } else
                    console.log("NO!!!!!!!");

            } else {
                console.log("Url - " + message.Url + " Faild in one of the places!");


            }
            console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            // ====== TESTING THE CONTACT URL   TODO:
            /*var Theurl = url.parse(message.Url);
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

    });
    req.end();

    req.on('error', function(e) {
        console.log("Url -" + message.Url + " Error!" + e);
    });

});
