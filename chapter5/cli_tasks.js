var fs =require('fs');
var path=require('path');
//splice out node cli_tasks.js to leave arguments
var args = process.argv.splice(2);

//pull the first argument(the command)
var command = args.shift();
//join the remaining arguments
var taskDescription = args.join(' ');
//resolve database path relative to current working directory
var file = path.join(process.cwd(), '/.tasks');


switch(command){
	case 'list':
		listtasks(file);
		break;
	case 'add':
		addtasks(file);
	break;
	default:
	console.log('Usage: ' + process.argv[0] + ' list|add  [taskdescription]');
}


function loadOrInitializeTaskArray(file,cb){
	fs.exists(file, function(exists){
		var tasks=[];
		if(exists){
			fs.readFile(file,'utf8', function(err,data){
				if(err) throw err;
				var data = data.toString();
				var tasks =JSON.parse(data||'[]');
				cb(tasks);
			});
		}
		else{
			cb([]);
		}
	});
}

function listTasks(file){
	loadOrInitializeTaskArray(file, function(tasks){
		for(var i in tasks){
			console.log(tasks[i]);
		}
	});
}

function storeTasks(file,tasks){
	fs.WriteFile(file,JSON.stringify(tasks), 'utf8', function(err){
		if(err) throw err;
		console.log('Saved');
	});
}


function addTask(file, taskDescription){
	loadOrInitializeTaskArray(file, function(tasks){
		tasks.push(taskdescription);
		storeTasks(file, tasks);
	})
}