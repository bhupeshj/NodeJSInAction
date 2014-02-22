/**
 * Created by bhupesh on 2/22/14.
 */
var http = require('http');
var fs =require('fs');
http.createServer(function(req,res){

        getTitles(req,res);


}).listen(8000,'127.0.0.1');


function getTitles(req, res){
    if(req.url=='/'){
        fs.readFile('./titles.json', function(err,data){
            if(err){
                handleError(err,res);
            }
            else{

                getTemplate(JSON.parse(data.toString()),res);
            }
        });
    }
}


function getTemplate(titles,res){
    fs.readFile('./template.html', function(err,data){

        if(err){
            handleError(err,res);
        }
        else{
            var tmpl = data.toString();
            var html = tmpl.replace('%', titles.join('</li><li>'));
            res.writeHead(200,({'Content-Type':'text/html'}));
            res.end(html);
        }
    });
}

function handleError(err,res){

        console.error(err);
        res.end('Server Error');

}