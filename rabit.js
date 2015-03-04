var context = require('rabbit.js').createContext('amqp://localhost');


//var pull = context.socket('PULL');
var push = context.socket('PUSH');

//pull.setEncoding('utf8');

//pull.connect('TEST1');




//pull.on('data', function T(m) {
//                console.log("message is - " + m);
//        });

push.connect('TEST1', function() {
     push.write("http://www.ebay.com/sch/i.html?_from=R40&_trksid=m570.l1313.TR0.TRC0.H0.Xcools&_nkw=cools&_sacat=0");
//     push.write("http://www.barbiecollector.com/shop/browse/term/12");
//     push.write("http://www.barbiecollector.com/shop/browse/term/12");
});

