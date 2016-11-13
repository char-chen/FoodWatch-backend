var mongodb = require('mongodb');

var db;
var URL_CONNECTION = "mongodb://AUTHENTICATION_INFO/japa";

function init(callback) {
    
    mongodb.MongoClient.connect(URL_CONNECTION,
        {
            db: {
                native_parser: false,
                w: 1,
                journal: true
            },
            server: {
                auto_reconnect: true
            },
            replSet: {},
            mongos: {}
        },
        function(err, newDb) {
            
            if (err) {
                
                console.log("ERROR: db.open : err = " + err.message);
            }
            else {
                
                db = newDb;
                callback();
            }
        }
    );
}

function objectID(hexId) {
    
    if (hexId) {
        
        return new mongodb.ObjectID.createFromHexString(hexId);
    } else {
        
        return new mongodb.ObjectID();
    }
}

function findOne(collectionName, query, projections, callback) {
    
    db.collection(collectionName).findOne(query, projections, function(err, doc) {
        
        if (err) {
            
            callback(err, null);
        } else if (doc) {
            
            callback(null, doc);
        } else {
            
            callback(null, null);
        }
    });
}

function insert(collectionName, doc, callback) {
    
    if (doc instanceof Array) {
        
        db.collection(collectionName).insertMany(doc, {}, function(err, results) {
            
            if (err) {
                
                callback(err, null);
            } else if (results) {
                
                if (1 === results.ops.length) {
                    
                    callback(null, results.ops[0]);
                } else {
                    
                    callback(null, results.ops);
                }
            } else {
                
                callback(null, null);
            }
        });
    }
    else {
        
        db.collection(collectionName).insertOne(doc, {}, function(err, result) {
            
            if (err) {
                
                callback(err, null);
            } else if (result) {
                
                callback(null, result.ops[0]);
            } else {
                
                callback(null, null);
            }
        });
    }
}

function remove(collectionName, query, callback) {
    
    db.collection(collectionName).deleteMany(query, callback);
}

function find(collectionName, query, projections, callback) {
    
    db.collection(collectionName).find(query, projections).toArray(callback);
}

/*
 * NOTE: This uses updateMany which is equivalent to 'multi':true
 */
function update(collectionName, query, update, projections, callback) {
    
    db.collection(collectionName).updateMany(query, update, projections, function(err, res) {
        
        if (err) {
            callback(err, null);
        } else if (res) {
            callback(null, res.result.nModified);
        } else {
            callback(null, null);
        }
    });
}

function updateOne(collectionName, query, update, projections, callback) {
    
    db.collection(collectionName).updateOne(query, update, projections, callback);
}

/*
 * Find one document and update it, requires write lock.
 *
 * parameters: filter, update, projections, callback
 *
 * projections parameter: projection, sort, maxTimeMS, upsert, returnOriginal
 *
 * callback: err, result(obj)
 *
 * result: value(obj), lastErrorObject, ok
 */
function findOneAndUpdate(collectionName, filter, update, projections, callback) {
    
    db.collection(collectionName).findOneAndUpdate(filter, update, projections, function(err, result) {
        
        if (err) {
            callback(err, null);
        } else if (result) {
            callback(null, result.value);
        } else {
            callback(null, null);
        }
    });
}

/*
 * Find one document and delete it, requires write lock.
 *
 * parameters: filter, projections, callback
 *
 * projections parameter: projection, sort, maxTimeMS
 *
 * callback: err, result(obj)
 *
 * result: value(obj), lastErrorObject, ok
 */
function findOneAndDelete(collectionName, filter, projections, callback) {
    
    db.collection(collectionName).findOneAndDelete(filter, projections, function(err, result) {
        
        if (err) {
            
            callback(err, null);
        } else if (result) {
            
            callback(null, result.value);
        } else {
            
            callback(null, null);
        }
    });
}

/*
 * Count the number of documents in a collection
 *
 * Result: number
 */
function count(collectionName, query, projections, callback) {
    
    db.collection(collectionName).count(query, projections, function(err, result) {
        
        if (err) {
            
            callback(err, null);
        } else if (result >= 0) {
            
            callback(null, result);
        } else {
            
            callback(null, null);
        }
    });
}

exports.init = init;
exports.objectID = objectID;
exports.findOne = findOne;
exports.insert = insert;
exports.find = find;
exports.remove = remove;
exports.update = update;
exports.updateOne = updateOne;
exports.findOneAndUpdate = findOneAndUpdate;
exports.findOneAndDelete = findOneAndDelete;
exports.count = count;