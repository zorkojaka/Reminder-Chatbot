/*
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* jshint node: true, devel: true  */
'use strict';

const 
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),  
  request = require('request');

var app = express();
app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));


/*
 * Be sure to setup your config values before running this code. You can 
 * set them using environment variables or modifying the config file in /config.
 *
 */

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ? 
  process.env.MESSENGER_APP_SECRET :
  config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');

// URL where the app is running (include protocol). Used to point to scripts and 
// assets located at this address. 
const SERVER_URL = (process.env.SERVER_URL) ?
  (process.env.SERVER_URL) :
  config.get('serverURL');
  console.log("serverURL: "+SERVER_URL);

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}

/*
 * Use your own validation token. Check that the token used in the Webhook 
 * setup is the same token used here.
 *
 */
 
app.get('/predstavitev',function(req, res) {
  //console.log("V MOJI FUNKCIJI");
    res.send(HTMLgen());
}); 
 
 app.get('/test',function(req, res) {
  //console.log("V MOJI FUNKCIJI");
    res.send(HTMLgentest());
});
 
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});


/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook', function (req, res) {
  var data = req.body;
  console.log("data"+data);

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else if (messagingEvent.read) {
          receivedMessageRead(messagingEvent);
        } else if (messagingEvent.account_linking) {
          receivedAccountLink(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've 
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});

/*
 * This path is used for account linking. The account linking call-to-action
 * (sendAccountLinking) is pointed to this URL. 
 * 
 */
app.get('/authorize', function(req, res) {
  var accountLinkingToken = req.query.account_linking_token;
  var redirectURI = req.query.redirect_uri;

  // Authorization Code should be generated per user by the developer. This will 
  // be passed to the Account Linking callback.
  var authCode = "1234567890";

  // Redirect users to this URI on successful login
  var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

  res.render('authorize', {
    accountLinkingToken: accountLinkingToken,
    redirectURI: redirectURI,
    redirectURISuccess: redirectURISuccess
  });
});

/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *

 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an 
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}


function HTMLgen(){
  var a;
  var page="<html><head><title>Prikaz</title><meta http-equiv='refresh' content='2'/></head><h1>TABELA ELEMENTOV</h1><table><tr border='1'><th>ID</th><th>Instanca</th><th>Ime</th><th>Soba</th><th>Vrednost</th><th>Enota</th></tr>";
  for(a=0;a<ElementID.length;a++){
    page+="<tr><th>"+ElementID[a]+"</th><th>1</th><th>"+ElementName[a]+"</th><th>"+RoomName[a]+"</th><th>"+nastavljenavrednost[a]+"</th><th>"+enota[a]+"</th></tr>";
  }
  page+="</table></html>"
  return page;
}

function HTMLgentest(){
  var a;
  var page="<html><head><title>Prikaz</title><meta http-equiv='refresh' content='2'/></head><h1>TABELA ELEMENTOV</h1><table><tr border='1'><th>ID</th><th>Instanca</th><th>Ime</th><th>Soba</th><th>Vrednost</th><th>Enota</th><th>Željena vrednost</th></tr>";
  for(a=0;a<ElementID.length;a++){
    page+="<tr><th>"+ElementID[a]+"</th><th>1</th><th>"+ElementName[a]+"</th><th>"+RoomName[a]+"</th><th>"+nastavljenavrednost[a]+"</th><th>"+enota[a]+"</th><th tyle='color:red'>"+zeljenavrednost[a]+"</th></tr>";
  }
  page+="</table></html>"
  return page;
}

function sestavizeljenavrednost(){
  var x;
  var vr=0;
  for(x=0;x<zeljenavrednost.length;x++){
    if(enota[x]=="on/off"){
      vr=ran(1,2);
        if(vr==1){
          zeljenavrednost[x]="on";
        }else{
          zeljenavrednost[x]="off";
        }
    }else if(enota[x]=="%"){
        vr=ran(1,100);
          zeljenavrednost[x]=vr;
    }else if(enota[x]=="°C"){
            vr=ran(16,25);
          zeljenavrednost[x]=vr;
        
    }
  }
}

function ran(zac,kon){
  return Math.floor((Math.random() * kon) + zac);
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to 
 * Messenger" plugin, it is the 'data-ref' field. Read more at 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the 
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger' 
  // plugin.
  var passThroughParam = event.optin.ref;

  console.log("Received authentication for user %d and page %d with pass " +
    "through param '%s' at %d", senderID, recipientID, passThroughParam, 
    timeOfAuth);

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  sendTextMessage(senderID, "Authentication successful");
}








  //              HERE MAGIC HAPPENS
  
    //ID ji elemntov    * 1
  var lucID=1;
  var zaluzijaID=2;
  var alarmID=3;
  var termostatID=4;
  var klimaID=5;
  var radioID=6;
  var zalivanjeID=7;
  var prezracevanjeID=8;
  
  //ID ji Sob 
  var dnevnaID=1000;
  var kuhinjaID=2000;
  var vhodID=3000;
  var wcID=4000;
  var jedilnicaID=5000;
  var spalnicaID=6000;
  
  
  
  
  // VNOS VSE SESTAVNIH DELOV SISTEMA = AKCIJE, ELEMENTI, SOBE
  
  //                  ALARM     TERMOSTAT     KLIMA     LUČ       LUČ      LUČ          LUČ       LUČ       LUČ           LUČ         LUČ           ŽALUZIJA     ŽALUZIJA    ŽALUZIJA     ŽALUZIJA    ŽALUZIJA    ŽALUZIJA    ŽALUZIJA    ŽALUZIJA      ŽALUZIJA        RADIO          PREZRAČEVANJE     ZALIVANJE
  var ElementID =     [1,       2,            3,        4,        5,        6,          7,        8,        9,           10,           11,            12,          13,         14,        15,          16,         17,         18,         19,          20,             21,          22,               23          ];  // na sistemu realnem
  var ElementInstance=[1,       1,            1,        1,        1,        1,          1,        1,        1,            1,            1,            1,           1,          1,          1,           1,          1,          1,          1,          1,              1,           1,                1           ];  //na realnem sistemu
  var ElementName=    ["alarm", "termostat",  "klima",  "luč",    "luč",    "luč",      "luč",    "luč",    "luč",        "luč",        "luč",        "žaluzija",  "žaluzija", "žaluzija", "žaluzija",  "žaluzija", "žaluzija", "žaluzija", "žaluzija", "žaluzija", "radio",     "prezračevanje",  "zalivanje"  ];  //ime
  var ElementIDE=     [alarmID, termostatID,  klimaID,  lucID,    lucID,    lucID,      lucID,    lucID,    lucID,        lucID,        lucID,        zaluzijaID,  zaluzijaID, zaluzijaID,  zaluzijaID,  zaluzijaID, zaluzijaID, zaluzijaID, zaluzijaID,  zaluzijaID, radioID,     prezracevanjeID,  zalivanjeID ];  //v programu
  var ElementRoom=    [0,       0,            0,        vhodID,   vhodID,   wcID,       kuhinjaID,dnevnaID, jedilnicaID,  jedilnicaID,  spalnicaID,   vhodID,      wcID,       kuhinjaID,  jedilnicaID,    dnevnaID,   dnevnaID,   dnevnaID,  spalnicaID,  spalnicaID, 0,           0,                0           ];  //v programu
  var RoomName=       ["hiša",  "hiša",       "dnevna", "hodnik", "hodnik", "kopalnica","kuhinja","dnevna", "jedilnica",  "jedilnica",  "spalnica",   "hodnik",    "kopalnica","kuhinja",   "jedilnica",  "dnevna",   "dnevna",   "dnevna",   "spalnica",   "spalnica", "jedilnica", "hiša",           "zunaj"     ];
  var ElementDimmable=[0,       1,            0,        1,        1,        1,          1,        1,        1,            1,            1,            1,           1,          1,          1,             1,          1,          1,          1,          1,          0,           0,                0           ];  // 0=on/off  1=lahko nastavimo tudi vrednost
var nastavljenavrednost=["off", 20,           "off",    0,        0,        0,          0,        0,        0,            0,            0,            0,           80,         0,          0,             0,          0,          0,          0,          0,          "off",       "off",            "off"       ];
  var enota =         ["on/off","°C",         "on/off", "on/off", "on/off", "on/off",   "on/off", "%",      "%",          "%",          "%",         "%",          "%",        "%",        "%",           "%",        "%",        "%",        "%",        "%",        "on/off",    "on/off",         "on/off"    ];
 
 
 var zeljenavrednost=["off", 20,           "off",    20,        0,        0,          0,        0,        0,            0,            0,            0,           80,         0,          0,             0,          0,          0,          0,          0,          "off",       "off",            "off"       ];

 
  //AKCIJE
  
  //ID ji akcij   *100
  var onID=100;
  var offID=200;
  var setID=300;
  var getID=400;
  
  var IDA=[onID,offID,setID,getID];
  
  //meje akcij    kje so meje za nove akcije, po temu jih določam kera je
  var mon = 8;
  var moff=mon+10;
  var mnastavi=moff+6;
  var mstanje=mstanje+7;
  var mejeA=[mon,moff,mnastavi,mstanje];

  //Možne besede    OB SPREMEMBAH POPRAVI MEJE!!!
  var Akcije = 
  ["on","prizgi","przgi", "vklop", "vkljuc", "dvign","odpri","osvetl", "odgrn",     //ON
  "off", "ugasn", "izklop", "izkljuc", "spust","zapri", "zasenc", "zatemn",  "zagrn", "zastri",      //OFF
  "nastav", "vecaj", "manjsaj", "odrolaj", "naj", "nared",   //nastavi vrednost  
  "stanje", "vrednost", "info", "koliko", "ali", "kakš", "kok"      //stanje
  ];



  //ELEMENTI

  

  var IDE=[lucID,zaluzijaID,alarmID,termostatID,klimaID,radioID,prezracevanjeID,zalivanjeID];
  
  
  //MEJE E
  var mluc=2;
  var mzaluzija=mluc+8;
  var malarm=mzaluzija+2;
  var mtermostat=malarm+5;
  var mklima=mtermostat+2;
  var mradio=mklima+4;
  var mprezracevanje=mradio+2;
  var mzalivanje=mprezracevanje+2;
  
  var mejeE=[mluc,mzaluzija,malarm,mtermostat,mklima,mradio,mprezracevanje,mzalivanje];
  
  
  //Možne besede    (ce spreminjaš popravi meje !!!!)
  var Elementi = ["luc", "svetil", "lamp",      //luc
                  "zaluzij", "lamel", "polkn", "sencil", "rolo", "rule", "role", "zaves",  //zaluzije
                  "alarm", "varovanj",      //alarm
                  "termostat", "gretj", "ogrevanj", "greje", "temperatur",    //termostat
                  "klim", "hlajenj",  //klima
                  "radio","radijo","musko","glasb", //radio
                  "zrace", "ventila", //zračenje 
                  "zaliva", "skrop",  //zalivanje
                  ];
  
  //SOBE
  

  
  var IDS=[dnevnaID,kuhinjaID,vhodID,wcID,jedilnicaID,spalnicaID];
  
  
  //MEJE S  (za vsako dodano možno besedo je treba zadnjo številko povečat kokr besed smo dodal za to sobo)
  var mdnevna=0;
  var mkuhinja=mdnevna+2;
  var mvhod=mkuhinja+3;
  var mwc=mvhod+4;
  var mjedilnica=mwc+3;
  var mspalnica=mjedilnica+1;
  
  var mejeS=[mdnevna,mkuhinja,mvhod,mwc,mjedilnica,mspalnica];
  
  //Možne besede  (ce spreminjaš popravi meje !!!!)
  var Sobe = ["dnevn",    //dnevna
              "kuhin","kuhn",   //kuhinja
              "vhod", "hodni","prehod",      //vhod
              "wc", "stranisc", "kopalnic", "toalet",
              "jediln", "jemo", "obed",
              "spaln", 
              ];
              
  //elementi v sobah
  
  var originalnielementi=[3,4,5];
  
  
  
  
  //STANJE???????????????''
  //var Stanja = ["on","off","przgan","prizgan","ugasnjen","odprt","zaprt"]
  var najdeno=[];
  var value=-1;
  
  var najdeneAkcije=[];
  var najdeneAkcijeIndex=[];
  
  var najdeniElementi=[];
  var najdeniElementiIndex=[];
  
  var najdeneSobe=[];
  var najdeneSobeIndex=[];
  
  var Akcija=[];
  var Element=[];
  var vrednosti=[];
  var stevcakcij=-1;
  
  var kriptGeslo="Basic YWRtaW46U2FsdXNkZDE=";



/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message' 
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
 *
 * For this example, we're going to echo any text that we get. If we get some 
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've 
 * created. If we receive a message with an attachment (image, video, audio), 
 * then we'll simply confirm that we've received the attachment.
 * 
 */
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
  


  console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  if (isEcho) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s", 
      messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s",
      messageId, quickReplyPayload);

    sendTextMessage(senderID, "Quick reply tapped");
    return;
  }



  
  //PREJETO SPOROCILO
  console.log('ZACNEMO');
  

  
  
  if (messageText) {

    //incializacija od prej
  
    najdeno=[];
    
    najdeneAkcije=[];
    najdeneAkcijeIndex=[];
    
    najdeniElementi=[];
    najdeniElementiIndex=[];
  
    najdeneSobe=[];
    najdeneSobeIndex=[];
    
    
    stevcakcij=-1;
    Akcija=[];
    Element=[];
    vrednosti=[];
    
    
    
    
  var tekst = JSON.stringify(messageText);
  
  tekst=tekst.toLowerCase();
  
  tekst=tekst.replace( /\"/g, "").
              replace( /\./g, "").
              replace( /\,/g, "").
              replace( /\?/g, "").
              replace( /\!/g, "").
              replace( /č/g, "c").
              replace( /ć/g, "c").
              replace( /š/g, "s").
              replace( /ž/g, "z");
              
  var tabelaBesed = tekst.split(" ");
  
  //Sporocilo razdeljeno na besede v tabelo
  
  

  //ZANKA za obdelavo prejetega sporocila: razdelim na besede in vsako besedo posebej pogledam kaj je
  
  //pregledam vse in najdem besede, ki so pomembne= spadajo v eno od grup AKCIJE, ELEMENTI, SOBE
  
  console.log("PRED-FUNKCIJAM");
 
 // najdivse(tabelaBesed);
 // dolociakcijo();//napolne tabelo akcija
 // dolociElement();//napolne tabelo element

/*
for(var aa=0; aa<najdeno.length;aa++){
  console.log(najdeno[aa]);
}
*/

  najdi2(tabelaBesed, Akcije, Elementi, Sobe, najdeno);
  //console.log("po najdu2.");
  
  /*
  for(var aaa=0; aaa<najdeno.length;aaa++){
    console.log(najdeno[aaa]);
  }
  */
  
  sestavizeljenavrednost();
  izvediUkaze2(senderID);
  console.log("po izvediukaze2");
  //izvediUkaze(senderID);
}
//KONC IF messageText

}



//FUNKCIJE ZA PREDSTAVITEV____________________________

function runosvezi(id,instanca,vrednost){
  //app.getElementById('v'+id).innerHTML=vrednost;
  //app.osvezi(1,1,3);
  console.log("vrunosvezi");

}

//_________________________________________________
//preveri če se koren nahaja v besedi
function alijekorenvbesedi(koren, beseda){
    //index ofvrne -1 ce ni korena v besed
    return beseda.indexOf(koren) != -1;
} 

// grem čez vsako besedo sporočila posebej in pogledam čez vse besede Akcij, ELementov, Sob  če se ujema, če se, dodam v najdeno.
// najdeno je seznam besed po vrsti
// vrednosti je seznam vrednosti za akcije

function najdi2(sporocilo,tabMoznihA,tabMoznihE,tabMoznihS){
  var i =0;
  var j=0;
  //cez vse besede
  for(i =0; i<sporocilo.length;i++){
  
    //cez vse akcije
    for(j =0; j<tabMoznihA.length;j++){
      if(alijekorenvbesedi(tabMoznihA[j],sporocilo[i])){
        
        //če smo najdl akcijo
        //grem čez vse grupe omejene z mejam
          for(var mma=0; mma<mejeA.length;mma++){
            // če ej v tej grupi
            if(j<=mejeA[mma]){
              

              stevcakcij++;
              //dodej id ot te grupe
              if(IDA[mma]==onID){
                vrednosti.push(255);
              }else if(IDA[mma==offID]){
                vrednosti.push(0);
              }else{
                vrednosti.push(-1);
              }
              najdeno.push(IDA[mma]);
              break;
            }
          }
      }
    }//konc najdeno A
    
    //cez vse E
    for(j =0; j<tabMoznihE.length;j++){
      if(alijekorenvbesedi(tabMoznihE[j],sporocilo[i])){
       
       //če smo najdl element
          for(var mme=0; mme<mejeE.length;mme++){
            if(j<=mejeE[mme]){
              najdeno.push(IDE[mme]);
              break;
            }
          }
        
      }
    }//konc najdeno E
    
    //cez vse S
    for(j =0; j<tabMoznihS.length;j++){
      if(alijekorenvbesedi(tabMoznihS[j],sporocilo[i])){
        
         
        for(var mms=0; mms<mejeS.length;mms++){
            if(j<=mejeS[mms]){
              console.log("SOBA najdena");
              najdeno.push(IDS[mms]);
              break;
            }
          }
        
      }
    }//konc najdeno S
    
    //preverm če se začne s številko če je je to value
    if(sporocilo[i].charAt(0) >= '0' && sporocilo[i].charAt(0) <= '9'){
      
      var numstr=sporocilo[i];
      value = parseInt(numstr.replace(/\D/g,''));
      vrednosti[stevcakcij]=value;
    }
    
  }//konc sporocila
  for(var c=0; c<najdeno.length;c++){
    console.log(najdeno[c]);
  }
  
}



//pripravljeno za preverit vrednosti na sistemu
function httpGetInfo(napravaID,napravaI,command, senderID){
  
  var http = require('http');


  var options = {
    hostname: '93.103.121.2',
    port: 8083,
    path: '/JS/Run/zway.devices['+napravaID+'].instances['+napravaI+'].commandClasses['+command+'].data[1].val.value',
    method: 'GET',
    headers: {
     'Authorization': 'Basic YWRtaW46U2FsdXNkZDE='
    } 
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
       sendTextMessage(senderID, "Vrednost iskane naprave je "+odgovor);
    });
  }).end();
    
    
    http.request(options, function(response){
      console.log("CALLback"+response);
    }).end();


}

//potrebno nastaviti globalni IP naslov PAMETNEGA SISTEMA

function httpGet(napravaID,napravaI,command,value)
{
  
  var http = require('http');


  var options = {
    hostname: '93.103.121.2',
    port: 8083,
    path: '/JS/Run/zway.devices['+napravaID+'].instances['+napravaI+'].commandClasses['+command+'].Set('+value+')',
    method: 'GET',
    headers: {
     'Authorization': 'Basic YWRtaW46U2FsdXNkZDE='
    } 
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
    
    
    http.request(options, function(response){
      console.log("CALLback"+response);
    }).end();


}



//podam akcijo element in sobo in se izvedejo ukazi
function ukaz(akcija,element,soba, senderID, zaporednaakcija){
  
  var valueforthiselproc=vrednosti[zaporednaakcija];
  
  
  if(!(vrednosti[zaporednaakcija]>0) || !(vrednosti[zaporednaakcija]<256)){
    if(akcija==onID){
      vrednosti[zaporednaakcija]=255;
    }else if(akcija==offID){
      vrednosti[zaporednaakcija]=0;
    }else if(akcija==setID){
      vrednosti[zaporednaakcija]=0;
    }
  }
  
  
  var valueforthisel=vrednosti[zaporednaakcija];
  
  /*
  if(akcija==setID){
    valueforthisel=255*(valueforthisel/100);
  }*/
  
  
  //za vsako sobo za ta element
  for(var sobaindex=0;sobaindex<soba.length;sobaindex++){
  
  
  for(var x=0; x<ElementIDE.length;x++){
   // console.log("ROom:"+ElementRoom[x]+"Soba:" + soba+"  tab Ele IDE:"+ElementIDE[x]);
    


      if(element==ElementIDE[x] && (soba[sobaindex]==ElementRoom[x] || 0===ElementRoom[x] || 0===soba[sobaindex])){
          
          /* za smarthome pretvorba v 255
          
          if(ElementDimmable[x]===0){
            if(value>0){
              valueforthisel=255;
            }
          }else{
            if(value>0){
              
            }
          }
          */
          
          
         // if(akcija==setID){ }else{}
           // httpGetInfo(ElementID[x],0,49,senderID);
           
            //http://77.111.7.178:8083/JS/Run/zway.devices[50].instances[0].commandClasses[67].Set(1,X)
            
            
          
          
 
          
            
            
            //PRILAGODITVE ZA ENOTE - enako za pametni sistem s pretvorbo v 255
            
            if(enota[x]=="°C"){
              nastavljenavrednost[x]=valueforthisel;
            }else if(enota[x]=="on/off"){
              if(valueforthisel==0){
                nastavljenavrednost[x]="off";
              }else{
                nastavljenavrednost[x]="on";
              }
            }else{
              if(valueforthisel>100){
                nastavljenavrednost[x]=100;
              }else{
                nastavljenavrednost[x]=valueforthisel;
              }  
            }
            
            if(ElementIDE[x]==zaluzijaID && !(akcija==setID)){
              console.log("zzzzzzaluzija"+akcija);
              nastavljenavrednost[x]=100-nastavljenavrednost[x];
            }
          
            
            
            //ODGOVORIMS S SPOROČILOM IN IZVEDEM UKAZ
            sendTextMessage(senderID, "Nastavljam element z ID-jem: "+ElementID[x]+"("+ElementName[x]+" iz sobe: "+RoomName[x]+") na vrednost: "+nastavljenavrednost[x]+".");
            // valueforthisel je za 255 vrednpsti
            //sendTextMessage(senderID, "Nastavljam element z ID-jem: "+ElementID[x]+"("+ElementName[x]+" iz sobe: "+RoomName[x]+") na vrednost: "+valueforthisel+".");

            //httpGet(ElementID[x],ElementInstance[x],37,255);
            //http://77.111.7.178:8083/JS/Run/zway.devices[50].instances[0].commandClasses[67].Set(1,X)
            
          
      }
    
      
    }
  }
}


function izvediUkaze2(senderID){
  
  var akcija=0;
  var elementi=[];
  var soba=[];
  var stevecakcij=0;
  
  for(var i=0; i<najdeno.length;i++){
    
    if(najdeno[i]<99){
      //elemnt
      elementi.push(najdeno[i]);
      
    }else if(najdeno[i]<999){
      //akcija
      if(akcija==0){
        //prva akcija
        akcija=najdeno[i];
      }else{
        //izvedi prejšno
        for(var u=0;u<elementi.length;u++){
          console.log("Ukaz od akcije");
          
          //će ni podana soba velja za vse sobe
          if(soba.length==0){
            soba.push(0);
          }
          
          ukaz(akcija,elementi[u],soba,senderID,stevecakcij);
          stevecakcij++;
        }
        elementi=[];
        soba=[];
        value=-1;
        
        //nova akcija
        akcija=najdeno[i];
      }
      
    }else{
        //soba
        soba.push(najdeno[i]);
        //console.log("NAJDENO dodam sobo");
    
      
    }
  }
  
  //ukaz na koncu
  if(elementi.length>0){
    for(var u=0;u<elementi.length;u++){
      //console.log("Ukaz  na koncu");
      
      if(soba.length==0){
        soba.push(0);
      }
      
      ukaz(akcija,elementi[u],soba,senderID,stevecakcij);
      stevecakcij++;
    }
    elementi=[];
    soba=[];
    value=-1;
    
  }  
    
  
  
}

/*
function izvediUkaze(senderID){
  var j=0;
  var i=0
  
  var napravaID = 2;
  var napravaI = 1;
  var command = 37;
  var value=255;
  
  
  for(i=0; i< najdeneAkcije.length; i++){
    //akcija najdeneAkcije[i]
    
    //ALI JE TO ZADNJA AKCIJA?
    if(i>=(najdeneAkcije.length-1)){
      //ZADNA AKCIJA
      // sendTextMessage(senderID, "zadna Akcija: "+Akcija.length+Akcija[i]+i);
    
      while(j<najdeniElementi.length){
        sendTextMessage(senderID, "Akcija: "+Akcija[i]+ " Element: "+Element[j]);
        
        //ON
        if(Akcija[i]<1){
          value=255;
        }else{
          value=0;
        }
        httpGet(napravaID,napravaI,command,value);
        //OFF
        //http://192.168.0.108:8083/JS/Run/zway.devices[2].instances[0].commandClasses[37].Set(255)
        j++;
        
      } 
      
    }else{
      //NEZADNA AKCIJA
     // sendTextMessage(senderID, "nezadna Akcija: "+Akcija.length+Akcija[i]+i);
      
      while(najdeniElementiIndex[j]<najdeneAkcijeIndex[i+1]){
        sendTextMessage(senderID, "Akcija: "+Akcija[i]+ " Element: "+Element[j]);
        j++;
      
        
      }
      
    }
    
  }
    
  }
  
  */

 
function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log("Received delivery confirmation for message ID: %s", 
        messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
}


/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 * 
 */
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}

/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 * 
 */
function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log("Received message read event for watermark %d and sequence " +
    "number %d", watermark, sequenceNumber);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 * 
 */
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log("Received account link event with for user %d with status %s " +
    "and auth code %s ", senderID, status, authCode);
}

/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/rift.png"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a Gif using the Send API.
 *
 */
function sendGifMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/instagram_logo.gif"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send audio using the Send API.
 *
 */
function sendAudioMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "audio",
        payload: {
          url: SERVER_URL + "/assets/sample.mp3"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 *
 */
function sendVideoMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: SERVER_URL + "/assets/allofus480.mov"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a file using the Send API.
 *
 */
function sendFileMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "file",
        payload: {
          url: SERVER_URL + "/assets/test.txt"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: "DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "This is test text",
          buttons:[{
            type: "web_url",
            url: "https://www.oculus.com/en-us/rift/",
            title: "Open Web URL"
          }, {
            type: "postback",
            title: "Trigger Postback",
            payload: "DEVELOPER_DEFINED_PAYLOAD"
          }, {
            type: "phone_number",
            title: "Call Phone Number",
            payload: "+16505551234"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: SERVER_URL + "/assets/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: SERVER_URL + "/assets/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

/*
 * Send a receipt message using the Send API.
 *
 */
function sendReceiptMessage(recipientId) {
  // Generate a random receipt ID as the API requires a unique ID
  var receiptId = "order" + Math.floor(Math.random()*1000);

  var messageData = {
    recipient: {
      id: recipientId
    },
    message:{
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: "Peter Chang",
          order_number: receiptId,
          currency: "USD",
          payment_method: "Visa 1234",        
          timestamp: "1428444852", 
          elements: [{
            title: "Oculus Rift",
            subtitle: "Includes: headset, sensor, remote",
            quantity: 1,
            price: 599.00,
            currency: "USD",
            image_url: SERVER_URL + "/assets/riftsq.png"
          }, {
            title: "Samsung Gear VR",
            subtitle: "Frost White",
            quantity: 1,
            price: 99.99,
            currency: "USD",
            image_url: SERVER_URL + "/assets/gearvrsq.png"
          }],
          address: {
            street_1: "1 Hacker Way",
            street_2: "",
            city: "Menlo Park",
            postal_code: "94025",
            state: "CA",
            country: "US"
          },
          summary: {
            subtotal: 698.99,
            shipping_cost: 20.00,
            total_tax: 57.67,
            total_cost: 626.66
          },
          adjustments: [{
            name: "New Customer Discount",
            amount: -50
          }, {
            name: "$100 Off Coupon",
            amount: -100
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "What's your favorite movie genre?",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Action",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
        },
        {
          "content_type":"text",
          "title":"Comedy",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
        },
        {
          "content_type":"text",
          "title":"Drama",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId) {
  console.log("Sending a read receipt to mark message as seen");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "mark_seen"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
  console.log("Turning typing indicator on");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {
  console.log("Turning typing indicator off");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}

/*
 * Send a message with the account linking call-to-action
 *
 */
function sendAccountLinking(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Welcome. Link your account.",
          buttons:[{
            type: "account_link",
            url: SERVER_URL + "/authorize"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s", 
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s", 
        recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });  
}

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;