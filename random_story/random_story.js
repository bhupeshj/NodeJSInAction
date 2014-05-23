var fs =require('fs');
var request=require('request');
var htmlparser =require('htmlparser');
var configFileName ='./rss_feeds.txt';

//TASK 1: Make sure file containing the list of RSS feed URLs exists.
function checkForRSSFile() {
    fs.exists(configFileName, function (exists) {

        //whenever there is an error return early.
        if (!exists) {
            return next(new Error('Missing RSS file:' + configFileName));
        }
        next(null, configFileName);

    });

}


//TASK 2: read and parse file containing the feed URLs
function readRSSFile(configFilename){
    fs.readFile(configFilename, function(err, feedList){
       if(err) return next(err);

        //conver list of feed URLS to a string and then into an array of feed URLS
        feedList = feedList.toString()
            .replace(/^\s+|\s+$/g, '')
            .split("\n");
        var random =Math.floor((Math.random()*feedList.length));
        next(null, feedList[random]);
    });

}

//TASK 3: DO an HTTP request and get data for the selected feed.
function downloadRSSFeed(feedUrl){
    request({uri:feedUrl}, function(err,res, body){
       if(err) return next(err);
        if(res.statusCode!=200){
            return next(new Error('Abnormal response status code'))
        }
        next(null,body);
    });
}


//TASK 4: parse rss data into array of items
function parseRSSFeed(rss){
    var handler =new htmlparser.RssHandler();
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(rss);

    if(!handler.dom.items.length){
        return next(new Error('No RSS items found'));
    }
    var item = handler.dom.items.shift();
    //Display title and link of the first line feed item, if it exists
    console.log(item.title);
    console.log(item.link);
}

//Add each task to be performed to an array in execution order.
var tasks = [checkForRSSFile, readRSSFile, downloadRSSFeed, parseRSSFeed];
function next(err, result){
    if(err) throw err;
    //next task comes from array of tasks
    var currentTask = tasks.shift();
    if(currentTask){
        //execute current task
        currentTask(result);
    }
}

//Start serial execution of tasks
next();