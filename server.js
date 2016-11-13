var restify = require("restify");

var server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser({ mapParams: false }));

server.get("/", function(req,res) {
    res.send("Yo FOOOD WATCH!", 200);
});

server.get('/api/v1/service', function (req, res) {
    
    var food = req.query.food;
    res.send(food, 200);
});

server.listen(8000);