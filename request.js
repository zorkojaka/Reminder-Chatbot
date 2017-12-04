  var https = require('https');
  var http = require('http');
  var request=require('request');

  //file system

  var fs = require('fs');

  var options = {
    hostname: '93.103.121.2',
    content_type: 'application/json',
    port:8083,
    authorization: kriptGeslo,
    path: '/JS/Run/zway.devices[2].instances[1].commandClasses[37].Set(255)',
    method: 'GET',
  };

  var req = http.get(options, function(res){
    console.log("SPROŽEN URL");
    
    var odgovor="";
    
    res.on('data', function(chunk){
      odgovor+=chunk;
      console.log(chunk);
    });
    
    res.on('error', function(e) {
        console.error(e);
    });
    
    res.on('end', function(){
      console.log(odgovor);
    });
  }).end();