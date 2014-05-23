var http = require('http');
var parse = require('url').parse;
var join =require('path').join;
var fs= require('fs');
var root = __dirname;

var server = http.createServer(function(req,res){

	var url=parse(req.url);
	//COnstruct absolute path
	var path=join(root,url.path);
	//create ReadStream
	var stream = fs.createReadStream(path);
	stream.pipe(res);
	// stream.on('data', function(chunk){
	// 	//write file to response
	// 	res.write(chunk);
	// });
	// stream.on('end', function(){
	// 	//End response when file is complete
	// 	res.end();
	// });
	stream.on('error', function(err){
		res.statusCode=500;
		res.end('Internal Server Error');
	});
});

server.listen(3000);