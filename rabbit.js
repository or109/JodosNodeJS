var context = require('rabbit.js').createContext('amqp://localhost');


//var pull = context.socket('PULL');
var push = context.socket('PUSH');

//pull.setEncoding('utf8');

//pull.connect('TEST1');




//pull.on('data', function T(m) {
//                console.log("message is - " + m);
//        });

push.connect('TEST1', function() {
     push.write("http://www.bestbuy.com/site/mobile-phone-accessories/cases-covers-clips/abcat0811006.c?id=abcat0811006");
     push.write("http://www.barbiecollector.com/shop/browse/term/12");
     push.write("http://www.bestbuy.com/site/mobile-cell-phones/iphone/pcmcat305200050000.c?id=pcmcat305200050000");
     push.write("http://www.dx.com/p/protective-pet-matte-screen-protector-guard-film-for-samsung-galaxy-s3-i9300-5-piece-pack-138749");
     //push.write("http://www.amazon.com/chargers-charging-cables/b/ref=amb_link_431284302_8/184-2817189-6637110?ie=UTF8&node=2407761011&pf_rd_m=ATVPDKIKX0DER&pf_rd_s=merchandised-search-6&pf_rd_r=0JNZGV8D18EZTRZWR738&pf_rd_t=101&pf_rd_p=2058528562&pf_rd_i=2335752011");
	push.write("http://www.amazon.com/AmazonBasics-Bluetooth-Keyboard-Android-Devices/dp/B005OOKNP4");
	push.write("http://www.jabong.com/Flying_Machine-Grey-Melange-Round-Neck-T-Shirt-1080133.html?pos=2");
	push.write("http://www.jcpenney.com/shoes/nike-flex-2015-womens-running-shoes/prod.jump?ppId=pp5005090380&catId=cat100420086&&_dyncharset=UTF-8&colorizedImg=DP0210201505073197M.tif");
 });

