var restify = require("restify");
var mongo = require('./mongo');

var server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser({ mapParams: false }));

server.get("/", function(req,res) {
    res.send("Yo FOOOD WATCH!", 200);
});

var frequency = {};
//call this for every single tag
server.get('/api/v1/service', function (req, res) {
    
    var food = req.query.food;
    
    if (!Array.isArray(food)) {
        food = [food];
    }
    
    mongo.find("food", {"tag" : { $in : food } }, {"food" : 1}, function (err, food) {
    
        if (err) {
            res.send(500, "ERROR: getActivityV1 : getActivities : DB ERROR");
            console.log("ERROR: getActivityV1 : getActivities : err : ", err.message);
        } else if (food) {
            // returns list of food associated with tag

            for (var i = 0; i < food_list.length; i++) {
                if (!(food_list[i] in frequency)) {
                    frequency[food_list[i]] = 1;
                } else {
                    frequency[food_list[i]] = frequency[food_list[i]] + 1;
                }
            }
            res.send(200, food);
        } else {
            res.send(500, "ERROR: getActivityV1 : getActivities  : No Activities");
            console.log("ERROR: getActivityV1 : getActivities  : No Activities");
        }
    });
});

mongo.init(function() {
    
    console.log("INFO: MongoDB is ready");
    server.listen(8000);
});


var found = "";
var max = 0;
for (var food in frequency) {
    if (frequency[food] > max) {
        found = food;
        max = frequency[food];
    }
}

// Do some server shit to return found :D

// USDA Database stuff
