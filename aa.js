// var Sender = require('./sender.js');
// var amqpAddress = 'amqp://localhost';
// var sender = new Sender( amqpAddress, 2000, 3, sendMessageCallback );
var S = require('string');
// function sendMessageCallback( ) {
//     console.error('Message can NOT be sent due to MessageBus error');
// }

// // send message every 5 seconds
// var CronJob = require('cron').CronJob;
// var send_message_job = new CronJob({
//     cronTime: '*/5 * * * * *',
//     onTick: function(){
//          sender.deliverMessage( key, msg );
//     },
//     start: true,
// });

// send_message_job.start();
text ='sadsadsadsatrackordersadsadsa';
word='track order';
var count = S(text.toUpperCase()).count(word.toUpperCase());
console.log(count);