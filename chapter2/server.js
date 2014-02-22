/**
 * Created by bhupesh on 2/17/14.
 */
var http = require('http');
var fs=require('fs');
var path= require('path');
var mime =require('mime');
var cache = {};

function send404(response){
    //write 404 response in the header
    response.writeHead(404,{'Content-Type':'text/plain'});
    //write 404 text in content
    response.write('Error 404: resource not found.');
    //send response.
    response.end();
}
function sendFile(response, filepath,fileContents){
    //write found header along with the mime type for the file
    response.writeHead(200,{"content-type":mime.lookup(path.basename(filepath))});
    //write the file contents and send
    response.end(fileContents);

}


function serveStatic(response,cache,absPath){
    if (cache[absPath]){
        sendFile(response,absPath,cache[absPath]);
    }else{
        //Check if file exists
        fs.exists(absPath,function(exists){
            //if it exists
            if(exists){
                //read the contents of the File if it exists
                fs.readFile(absPath, function(err,data){
                    if(err){
                        //error occurred send 404
                        send404(response);
                    }else{
                        //cache the file content
                        cache[absPath] = data;
                        sendFile(response,absPath,data);
                    }
                } )
            }
            else // file does not exist
            {
                //Send 404 response
                send404(response);
            }
        })
    }
}

//Create HTTP server, using anonymous function to define per request behavior
var server= http.createServer(function(request,response){
   var filepath=false;
    //serve root
    if(request.url=='/'){
        filepath ='public/index.html';
    }
    else{
        filepath ='public' + request.url;
    }
    var absPath='./'+ filepath;
    serveStatic(response,cache,absPath);
});

server.listen(3000,function(){
    console.log("Server listening on port 3000");
})

var chatServer = require('./lib/chat_server');
chatServer.listen(server);