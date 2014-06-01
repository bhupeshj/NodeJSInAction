var qs= require('querystring');
var jade =require('jade');



var path = __dirname + '/../views/workHitList.jade';
var str = require('fs').readFileSync(path, 'utf8');
console.log(str);
var fn = jade.compile(str, { filename: path, pretty: true });



exports.sendHtml = function(res, html){
	res.setHeader('content-type', 'text/html');
	res.setHeader('content-length', Buffer.byteLength(html));
	res.end(html);
};

exports.parseReceivedData = function(req,cb){
	var body ='';
	req.setEncoding('utf8');
	req.on('data', function(chunk){
		body += chunk;
	});
	req.on('end', function(){
		var data =qs.parse(body);
		cb(data);
	});
};

// exports.actionForm =function(id, path, label){

// 	var options ={};
// 	options.globals=[id, path, label];
// 	var html = jade.renderFile('views/actionform.jade', options);
// 	return html;
// };


exports.add =function(db,req,res){
	exports.parseReceivedData(req,function(work){
		db.query(
				"INSERT INTO work(hours,date,description) " +
				" VALUES(?,?,?)",
				[work.hours,work.date,work.description],
				function(err){
					if(err) throw err;
					exports.show(db,res);
				}
			);
	});
};

exports.delete =function(db,req,res){
	exports.parseReceivedData(req,function(work){
		db.query(
				"DELETE FROM work where id=?",
				[work.id],
				function(err){
					if(err) throw err;
					exports.show(db,res);
				}
			);
	});
};

exports.archive =function(db,req,res){
	exports.parseReceivedData(req,function(work){
		db.query(
				"UPDATE work set archived=1 where id=?",
				[work.id],
				function(err){
					if(err) throw err;
					exports.show(db,res);
				}
			);
	});
};


exports.show=function(db,res,showArchived){
	var query = " SELECT * from work where archived=? " +
				" ORDER BY date desc"; 
	var archiveValue=(showArchived)?1:0;

	db.query(query,[archiveValue], function(err,rows){
		if(err) throw err;
		var options = {
			
		};
		var locals = {
				showArchived:true,
				x : rows
		};
		
		var html=fn(locals );

		exports.sendHtml(res,html);

	});

};

exports.showArchived = function(db,res){
	exports.show(db,res,true);
};