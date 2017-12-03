var https = require('https');
var http = require('http');

//file system

var fs = require('fs');

var options = {
    hostname: "93.103.121.2",
    port:8083,
    path: "/JS/Run/zway.devices[2].instances[1].commandClasses[37].Set(255)",
    method: "GET"
};

var req = http.request(options, function(res){
    //kaj nrdimo z respondom
    console.log("SPROŽEN URL");
});

req.on("error",function(err){
    console.log('problem with request: ${err.message}');
});