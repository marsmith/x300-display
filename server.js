var express    = require("express");
var app        = express();
var mysql      = require('mysql');
var async      = require('async');
var proxy      = require('express-http-proxy');
var bodyParser = require("body-parser");
var dbInfo     = require('./dbInfo.js');
const url = require('url');

// Constants
var PORT = 8083;
var HOST = '0.0.0.0';
var x300url = 'http://104.228.21.202:8080';

//need parser to read POST requests
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//enable crossdomain
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

//define static path for hosting html/JS site
app.use(express.static(__dirname + '/x300'));

//forward paths from route
app.get('/', (req, res) => {
    res.sendFile('index.html');
});

//proxy to get to x300 url
app.use('/data', proxy(x300url));

// Retrieve all juicefeed infos
app.get('/getlog', function (req, res) {
    
    var queryTerm = req.query.query;
    //query base
    var logQuery = "SELECT * FROM " + dbInfo.database.table + " WHERE logtime ";

    //append
    if (queryTerm.indexOf('HOUR') != -1) {
        logQuery += "> DATE_SUB(NOW(), INTERVAL " + queryTerm + ")";
    }
    else if ($queryDate) {
        logQuery += "LIKE '" + queryTerm + "%'";
    }

    //console.log('logQuery:',logQuery);

    dbInfo.credentials.database = dbInfo.database.name;
    var connection = mysql.createConnection(dbInfo.credentials); 
    connection.connect();

    connection.query(logQuery, function (error, results, fields) {
        if (error) throw error;
        //console.log('The response is: ', results);
        res.json(results);
      });

    connection.end();

});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);