var http =require('http');
var work = require('./lib/timetrack');
var mysql =require('mysql');
var db = mysql.createConnection({
	host: '127.0.0.1',
	user: 'nodetest',
	password:'nodetest',
	database: 'timetrack'
});


var server =http.createServer(function(req,res){
switch(req.method){
	case 'POST':
		switch(req.url){
			case '/':
				work.add(db,req,res);
				break;
			case '/archive':
				work.archive(db,req,res);
				break;
			case '/delete':
				work.delete(db,req,res);
				break;
            default:
                res.statusCode=404;
                res.end('Page Not Found');
		}
		break;
	case 'GET':
		switch(req.url){
			case '/':
				work.show(db,res);
				break;
			case '/archived':
				work.showArchived(db,res);
				break;
            default:
                res.statusCode=404;
                res.end('Page Not Found');
		}
		break;

}
});


db.query("CREATE TABLE IF nOT EXISTs work ( "
		+ "id int(10) not null auto_increment, "
		+ "hours Decimal(5,2) DEfault 0, "
		+ "date DATE, "
		+ "archived int(1) default 0, "
		+ "description longtext, "
		+ "PRIMARY KEY (id) )",
		function(err){
			if(err) throw err;
			console.log('Server started....');
			server.listen(3000, '127.0.0.1');
		}
	);

