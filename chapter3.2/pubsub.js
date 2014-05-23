var events = require('events'),
    net = require('net');

var channel = new events.EventEmitter();
channel.clients = {};
channel.subscriptions = {};

channel.on('join', function (id, client) {

    this.clients[id] = client;
    //Add a listener for the join event that stores a user's client object, allowing the application to send data back to the user
    this.subscriptions[id] = function (senderId, message) {
        //Ignore data if its been directly broadcast by the user.
        if (id != senderId) {
            this.clients[id].write(message);
        }
    }
    //Add a listner, specific to the current user, for the broadcast event.
    this.on('broadcast', this.subscriptions[id]);
});


channel.on('leave', function(id){
    channel.removeListener('broadcast', this.subscriptions[id]);
    channel.emit('broadcast',id, id + " has left the chat.\n");
});

channel.on('shutdown', function(){
   channel.emit('broadcast','',"Chat has shutdown.\n");
    channel.removeAllListeners('broadcast');
});

channel.on('error', function(err){
    console.log('ERROR:' + err.message);
});
channel.emit('error', new Error('Something is wrong.'));
var server= net.createServer(function(client){
   var id=client.remoteAddress + ':' + client.remotePort;

    console.log(id);
    //http://stackoverflow.com/questions/16903844/node-js-net-events-dont-fire
    channel.emit('join', id, client);
    console.log('join emitted for id :' + id.toString());
    /*client.on('connect', function(){
        console.log('on connect ');
       channel.emit('join',id,client);
        console.log('join emitted');
    });
    */


    client.on('data', function(data){
        console.log('on data ');
        data=data.toString();
        if(data=="shutdown\r\n"){
            channel.emit('shutdown');
        }
        channel.emit('broadcast', id, data);
        console.log('data broadcasted');
    });


    client.on('close', function(){
       channel.emit('leave', id);
    });
});

server.listen(8888);