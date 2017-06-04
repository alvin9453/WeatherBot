var linebot = require('linebot');
var express = require('express');
var request = require('request');
var libxmljs = require("libxmljs");

var areaToCode = [];
areaToCode['南投'] = 'F-C0032-026';
areaToCode['基隆'] = 'F-C0032-011';
areaToCode['新北'] = 'F-C0032-010';
areaToCode['台中'] = 'F-C0032-021';
areaToCode['台北'] = 'F-C0032-009';
areaToCode['花蓮'] = 'F-C0032-012';
areaToCode['宜蘭'] = 'F-C0032-013';
areaToCode['金門'] = 'F-C0032-014';
areaToCode['澎湖'] = 'F-C0032-015';
areaToCode['嘉義'] = 'F-C0032-019';
areaToCode['桃園'] = 'F-C0032-022';
areaToCode['新竹'] = 'F-C0032-024';
areaToCode['屏東'] = 'F-C0032-025';
areaToCode['台東'] = 'F-C0032-027';
areaToCode['雲林'] = 'F-C0032-029';
areaToCode['連江'] = 'F-C0032-030';
areaToCode['苗栗'] = 'F-C0032-020';
areaToCode['高雄'] = 'F-C0032-017';
areaToCode['彰化'] = 'F-C0032-028';
areaToCode['台南'] = 'F-C0032-016';

var bot = linebot({
	channelId : '1517205304',
	channelSecret : 'd813564fe699c362077fa3e9140f23c3',
	channelAccessToken : '31WyXDhpzJueapzwRryhfbgC7geBnIV/eLkwTG9ltKutnNWHTlKFSMrvCrYSPW9bEKW1tJcZO3P8APGckeRJ0yca3UXToqO5kxgipSbBjgWXihxiU65L6egtAtUFu4M9xQwOCW7I9M4KygYjhAUsywdB04t89/1O/w1cDnyilFU='
});

var weather = [];
var timer;

TimeToGetData();

function TimeToGetData(){
	clearTimeout(timer);
	for( var x in areaToCode)
		getData(x);
	timer = setInterval(TimeToGetData, 1800000); // per 30 minutes

}

function getData(area){
	url = 'http://opendata.cwb.gov.tw/opendataapi?dataid=' + areaToCode[area] + '&authorizationkey=CWB-85A09E81-CAEE-4E25-8170-2D049F54968C';
	request(url, function (error , response , body){
		console.log('error:', error);
	
		var xmlDoc = libxmljs.parseXml(body);

		var children = xmlDoc.root().childNodes();
		var dataset = children[17].childNodes();
		var parameterSet = dataset[5].childNodes();
		if( area.search('基隆') != -1 ){  // 只有基隆的格式特別不一樣...
			weather['基隆'] = parameterSet[7].text();
			console.log('K : ' + weather['基隆'])
		}
		else{
			weather[area] = parameterSet[5].text();
		}

	});
};

bot.on('message', function(event) {
	if( event.message.type = 'text'){
		var msg = event.message.text;
		var replyMsg = '';
		var flag = 0;
		var sameWord = msg.search('臺');
		if( sameWord != -1 )
			msg = '台' + msg[1];
		console.log(msg);
		for( var x in areaToCode){
			if( msg.search(x) != -1 ){
				var city = x;
				replyMsg = city + '天氣小幫手 : \n' + weather[city];
				flag = 1;
				break;
			}
		}
		
		if ( flag == 0){
			replyMsg = '請輸入臺灣縣市名，如 : 基隆、台北、台中、南投、高雄...';
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


var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});

