var mysql = require( 'mysql' );
var Promise = require('bluebird');
var async   = require('async');
var dbInfo = require('./dbInfo.js');
var getCSV = require('get-csv');
var weather = require('weather-js');

var dbName = dbInfo.database.name;
var x300tableName =  dbInfo.database.table;
var daysToExpire = 999999999;
//var x300url = 'http://localhost:8080/data/';
var x300url = 'http://104.228.21.202:8080/';

var cleanupTable = function() {

    return new Promise(function(resolve, reject){ 

        var createDBSQL = "CREATE DATABASE IF NOT EXISTS `" + dbName + "`";
        var useDBSQL = "USE `" + dbName + "`";
        var createTableSQL = "CREATE TABLE IF NOT EXISTS `" + x300tableName  + "` (logtime DATETIME NOT NULL PRIMARY KEY, temp decimal(4,1) NULL, sensor1 decimal(4,1) NULL, sensor2 decimal(4,1) NULL, sensor3 decimal(4,1) NULL, sensor4 decimal(4,1) NULL,sensor5 decimal(4,1) NULL, sensor6 decimal(4,1) NULL, sensor7 decimal(4,1) NULL,sensor8 decimal(4,1) NULL) DEFAULT CHARSET=utf8 DEFAULT COLLATE utf8_unicode_ci";

        var db; //database variable
        async.series([
        //creates DB connection and connects
        function(callback){
            db = mysql.createConnection(dbInfo.credentials); 

            db.connect(function(err){
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }
            callback(); //goes to the next function
            }); 
        },

        //performs the Query 1
        function(callback){
            console.log('creating DB')
            db.query(createDBSQL, function(){
            callback(); //goes to the next function
            });    
        },

        //performs the Query 2
        function(callback){
            console.log('use DB')
            db.query(useDBSQL, function(){
            callback(); //goes to the next function
            });    
        },

        //performs the Query 3
        function(callback){
            console.log('creating Table')
            db.query(createTableSQL, function(){
            db.end(); //closes connection
            resolve({"result": "Finished x300 DB cleanup"});
            callback();
            });    
        }
        ]);
    });
};

var getLog = function() {

    return new Promise(function(resolve, reject){ 

        var currentOutsideTemp;
        weather.find({search: '12123', degreeType: 'F'}, function(err, result) {
            if(err) console.log(err);
           
            currentOutsideTemp = result[0].current.temperature;
            console.log('weather:', currentOutsideTemp);

            //do database insert inside get weather callback
            dbInfo.credentials.database = dbName;
            var connection = mysql.createConnection(dbInfo.credentials); 
            connection.connect();
    
            console.log('requesting log:', x300url  + 'log.txt')
            getCSV(x300url  + 'log.txt', {headers: false})
                .then(rows => {
    
                    rows.forEach(function (value) {
                        var date = formatDate(new Date(value[0]));
                        console.log('processing log entry for:',date, value.join(','));
                        //var data = [0,0,0,0,0,0,0,0,0];
                        var data = value;
    
                        var updateQuery = "INSERT INTO `" + x300tableName  + "` (logtime,temp,sensor1,sensor2,sensor3,sensor4,sensor5,sensor6,sensor7,sensor8) VALUES('" + date + "','" + currentOutsideTemp + "','" + data[1] + "','" + data[2] + "','" + data[3] + "','" + data[4] + "','" + data[5] + "','" + data[6] + "','" + data[7] + "','"+ data[8] + "') ON DUPLICATE KEY UPDATE logtime = '" + date + "'";
                        connection.query(updateQuery);
                    });
                    connection.end();
            });
    
            //erase log
            //getCSV(x300url  + 'log.txt?erase=1', {headers: false}).then(rows => console.log('erased log'));
        });
    });
}

var formatDate = function(d) {
    return (d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2)) + "-" + ("00" + d.getDate()).slice(-2) + " " + ("00" + d.getHours()).slice(-2) + ":" + ("00" + d.getMinutes()).slice(-2) + ":" + ("00" + d.getSeconds()).slice(-2);
}


cleanupTable().then(function(result){
    console.log(result.result);

    getLog().then(function(result){
        console.log('Finished getting log');
    })
    .catch(function(err){
        console.log('there was an error');
    });

});
