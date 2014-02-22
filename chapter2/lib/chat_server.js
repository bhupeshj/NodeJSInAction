var socketio =require('socket.io');
var io;
var guestNumber=1;
//This is where we store the nicknames by socketId
var nickNames={};
//An array to store all the current names in use
var namesUsed=[];
//this is where we store which room a user is in by his socketId
var currentRoom={};

exports.listen=function(server){
    io=socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection',function(socket){
        guestNumber =assignGuestNumber(socket, guestNumber,nickNames,namesUsed);
        joinRoom(socket,'Lobby');
        handleMessageBroadcasting(socket,nickNames);
        handleNameChangeAttempts(socket,nickNames,namesUsed);
        handleRoomJoining(socket);
        socket.on('rooms', function(){
            socket.emit('rooms', io.sockets.manager.rooms);
        });
        handleClientDisconnection(socket,nickNames,namesUsed);
    })


};

function assignGuestNumber(socket,guestNumber,nickNames,namesUsed){
    //Generate new guest name
    var name='Guest' + guestNumber;
    //Associate guest name with client connection id
    nickNames[socket.id]=name;
    //let the user know their guest name
    socket.emit('nameResult',{success:true,name:name});
    //Note that the guestname has now been used
    namesUsed.push(name);
    //increment counter used to generate guest names
    return guestNumber + 1;
}
//Logic related to joining a room
function joinRoom(socket,room){
    //Make user join room
    socket.join(room);
    //Note that user is now in this room
    currentRoom[socket.id]=room;
    //Let user know that they are in the room
    socket.emit('joinResult',{room:room});
    //Let other users in the room know that another user has joined the room
    socket.broadcast.to(room).emit('message',
        {text:nickNames[socket.id] + ' has joined ' + room +'.'});
    //Determine what other users are in same room as user
    var usersInRoom = io.sockets.clients(room);
    //If other users exist, summarize who they are
    if(usersInRoom.length>1){
        var usersInRoomSummary ='Users currently in '+ room +': ';
        for (var index in usersInRoom){
            var userSocketId = usersInRoom[index].id;
            //check if the socket id is not the same as the user who is joining the room
            if(userSocketId!=socket.id){

                if(index>0){
                    usersInRoomSummary+=',';
                }
                usersInRoomSummary += nickNames[userSocketId];

            }

        }
        usersInRoomSummary+='.';
        //send summary of other users in the room to the user
        socket.emit('message',{text:usersInRoomSummary});
    }

}

function handleNameChangeAttempts(socket,nickNames,namesUsed){
    //Add listener for nameAttempt events
    socket.on('nameAttempt',function(name){
       //Dont allow nicknames to begin with Guest
        if(name.indexOf('Guest')==0){
           socket.emit('nameResult',{success:false, message:'Names cannot begin with "Guest".'});
       } else{
            //If name isnt already registered.
            if(namesUsed.indexOf(name)==-1){
                //get the previous name from the nickNames
                var previousName =nickNames[socket.id];
                //get the index of the name Used in the namesUsed array
                var previousNameIndex=namesUsed.indexOf(previousName);
                //add the new name to the names Used array
                namesUsed.push(name);
                //set the new name in the nickNames array for that socket
                nickNames[socket.id] =name;
                //delete the old name from the namesUsed array so that it can be used by someone else
                delete namesUsed[previousNameIndex];
                //let user know of the successful name change
                socket.emit('nameResult',{
                    success:true,
                    name:name
                });
                //let others in the room know that the user has changed his name to newName
                socket.broadcast.to(currentRoom[socket.id]).emit('message',{
                   text: previousName + ' is now known as ' + name +'.'
                });
            }else{
                //the name is already used by someone else, let user know
                socket.emit('nameResult',{
                    success:false,
                    message: 'That name is already in use.'
                });
            }
        }
    });
}

function handleMessageBroadcasting(socket){
    socket.on('message', function(message){
       socket.broadcast.to(message.room).emit('message',{
           text: nickNames[socket.id]+ ': ' + message.text
       }) ;
    });
}

function handleRoomJoining(socket){
    socket.on('join', function(room){
       socket.leave(currentRoom[socket.id]);
       joinRoom(socket,room.newRoom);

    });
}

function handleClientDisconnection(socket){
    socket.on('disconnect', function(){
       var nameIndex =namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    });
}