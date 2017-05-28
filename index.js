var linebot = require('linebot');
var express = require('express');
var request = require('request');
var libxmljs = require("libxmljs");

var areaToCode = [];
areaToCode['南投'] = 'F-C0032-026';
areaToCode['基隆'] = 'F-C0032-011';
areaToCode['台中'] = 'F-C0032-021';
areaToCode['台北'] = 'F-C0032-009';
areaToCode['高雄'] = 'F-C0032-017';

var bot = linebot({
	channelId : 'Line Channel ID',
	channelSecret : 'Line channel Secret',
	channelAccessToken : 'Line channel Access Token'
});

var weather = [];
var timer;

TimeToGetData();

function TimeToGetData(){
	clearTimeout(timer);
	for( var x in areaToCode)
		getData(x);
	timer = setInterval(getData, 7200000); // per 2 hours

}

function getData(area){
	url = 'http://opendata.cwb.gov.tw/opendataapi?dataid=' + areaToCode[area] + '&authorizationkey=<Your Opendata AuthKey>';
	request(url, function (error , response , body){
		console.log('error:', error);
	
		var xmlDoc = libxmljs.parseXml(body);

		var children = xmlDoc.root().childNodes();
		var dataset = children[17].childNodes();
		var parameterSet = dataset[5].childNodes();
		if( area.search('基隆') != -1 ){
			weather['基隆'] = parameterSet[7].text();
			console.log('K : ' + weather['基隆'])
		}
		else{
			weather[area] = parameterSet[5].text();
			console.log('N : ' + weather[area])
		}

	});
};

bot.on('message', function(event) {
	if( event.message.type = 'text'){
		var msg = event.message.text;
		var replyMsg = '';
		var flag = 0;
		for( var x in areaToCode){
			if( msg.search(x) != -1 ){
				var city = x;
				replyMsg = city + '天氣小幫手 : \n' + weather[city];
				flag = 1;
				break;
			}
		}
		
		if ( flag == 0){
			replyMsg = '請輸入以下地名 : 基隆、台北、台中、南投、高雄';
		}

		event.reply(replyMsg).then(function(data){
			console.log(replyMsg);
		}).catch(function(error){
			// error
			console.log('error...');
		});
	}
});


const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);



//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});

