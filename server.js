var restify = require("restify");
var mongo = require('./mongo');

var server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser({ mapParams: false }));

server.get("/", function(req,res) {
    res.send("Yo FOOOD WATCH!", 200);
});

var found = "";

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
                for (var j = 0; j < foods[i].food.length; j++) {
                    if (!(foods[i].food[j] in frequency)) {
                        frequency[foods[i].food[j]] = 1;
                    } else {
                        frequency[foods[i].food[j]] = frequency[foods[i].food[j]] + 1;
                    }
                }
            }
            var max = 0;
            for (var food_item in frequency) {
                if (frequency[food_item] > max) {
                    found = food_item;
                    max = frequency[food_item];
                }
            }
            // USDA Database stuff
            var http = require('http');
            var querystring = require('querystring');

            var ndbno_num = '';

            var data = {
                q: found,
                sort: 'n',
                max: '10',
                offset: '0',
                format: 'json',
                api_key: 'gSICsF7KdH8nmOuEBYnAQAXVKH9by1yIStw5IzC0',
                ds: 'Standard Reference'
            };
            var api_key = 'gSICsF7KdH8nmOuEBYnAQAXVKH9by1yIStw5IzC0';
            http.get({
                    host: 'api.nal.usda.gov',
                    path: '/ndb/search/?' + querystring.stringify(data),
                }, function(response) {
                    var body = '';
                    response.on('data', function(d) {
                        body += d;
                    });
                    response.on('end', function() {
                        var parsed = JSON.parse(body);
                        var food_arr = parsed.list.item;
                        ndbno_num = food_arr[1].ndbno;

                        var food_nutrients = {};
                        var id_data = {
                            ndbno: ndbno_num,
                            type: 'b',
                            format: 'json',
                            api_key: 'gSICsF7KdH8nmOuEBYnAQAXVKH9by1yIStw5IzC0'
                        };
                        console.log(querystring.stringify(id_data));
                        http.get({
                                host: 'api.nal.usda.gov',
                                path: '/ndb/reports/?' + querystring.stringify(id_data),
                            }, function(response) {
                                var body = '';
                                response.on('data', function(d) {
                                    body += d;
                                });
                                response.on('end', function() {
                                    var parsed = JSON.parse(body);
                                    console.log(parsed);
                                    food_name = parsed.report.food.name;
                                    food_nutrients["name"] = found;
                                    var nutrient_arr = parsed.report.food.nutrients;
                                    food_nutrients["calories"] = nutrient_arr[1].value;
                                    food_nutrients["protein"] = nutrient_arr[2].value;
                                    food_nutrients["total_fat"] = nutrient_arr[3].value;
                                    food_nutrients["carbs"] = nutrient_arr[4].value;
                                    food_nutrients["fiber"] = nutrient_arr[5].value;
                                    food_nutrients["sugars"] = nutrient_arr[6].value;
                                    food_nutrients["calcium"] = nutrient_arr[7].value;
                                    food_nutrients["iron"] = nutrient_arr[8].value;
                                    food_nutrients["potassium"] = nutrient_arr[11].value;
                                    food_nutrients["sodium"] = nutrient_arr[12].value;
                                    food_nutrients["vit_c"] = nutrient_arr[14].value;
                                    res.send(200, food_nutrients);
                                });
                        });
                    });
                }
            );
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
