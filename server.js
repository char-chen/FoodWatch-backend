var restify = require("restify");
var mongo = require('./mongo');

var server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser({ mapParams: false }));

server.get("/", function(req,res) {
    res.send("Yo FOOOD WATCH!", 200);
});

//call this for every single tag
server.get('/api/v1/service', function (req, res) {
    
    var food = req.query.food;
    
    if (!Array.isArray(food)) {
        food = [food];
    }

    var frequency = {};
    mongo.find("food", {"tag" : { $in : food } }, {"_id" : 0}, function (err, foods) {
    
        if (err) {
            res.send(500, "ERROR: getActivityV1 : getActivities : DB ERROR");
            console.log("ERROR: getActivityV1 : getActivities : err : ", err.message);
        } else if (foods) {
            // returns list of food associated with tag
            for (var i = 0; i < foods.length; i++) {
                //console.log(foods[i].food);
                for (var j = 0; j < foods[i].food.length; j++) {
                    if (!(foods[i].food[j] in frequency)) {
                        frequency[foods[i].food[j]] = 1;
                    } else {
                        frequency[foods[i].food[j]] = frequency[foods[i].food[j]] + 1;
                    }
                }
            }
            console.log(frequency);
            var found = "";
            var max = 0;
            for (var food_item in frequency) {
                if (frequency[food_item] > max) {
                    found = food_item;
                    max = frequency[food_item];
                }
            }
            res.send(200, found);
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

// Do some server shit to return found :D

// USDA Database stuff
