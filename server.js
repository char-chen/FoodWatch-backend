var restify = require("restify");
var mongo = require('./mongo');

var server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser({ mapParams: false }));

server.get("/", function(req,res) {
    res.send("Yo FOOOD WATCH!", 200);
});

server.get('/api/v1/service', function (req, res) {
    
    var food = req.query.food;
    mongo.find("food", {"tag" : food}, {}, function (err, food) {
    
        if (err) {
            res.send(500, "ERROR: getActivityV1 : getActivities : DB ERROR");
            console.log("ERROR: getActivityV1 : getActivities : err : ", err.message);
        } else if (food) {
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