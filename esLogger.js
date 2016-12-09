var config = require('./config');
var esHost = config.es_host + ":" + config.es_port;
var elasticsearch = require('elasticsearch');
var esClient = new elasticsearch.Client({
	apiVersion: config.es_version,
	host: esHost,
	log: 'error'
});

var indexBackFix = '';

var msgArr = [];
var rttCnt = 0;
var rttAvg = 0;

function getCurrTime() {
	var date = new Date();
	var y = date.getFullYear();
	var M = "0" + (date.getMonth() + 1);
	M = M.substring(M.length - 2);
	var d = "0" + date.getDate();
	d = d.substring(d.length - 2);
	var h = "0" + Math.round(date.getHours() / 2) * 2;
	h = h.substring(h.length - 2);

	indexBackFix = (y + M + d);
}

var msgArr = [];

module.exports.es_log = function(message) {
	if (indexBackFix == '') {
		getCurrTime();
	}
	if (msgArr.length / 2 <= config.max_queue) {
		var UUID = require('uuid');
		if(typeof message.timestamp == undefined){
			message.timestamp = new Date().getTime();
		}
		msgArr.push({
			"index": {
				_index: (message.index + '_' + indexBackFix), //Add GroupId As Index to balance Disk load
				_type: 'log',
				_id: UUID.v1()
			}
		});
		msgArr.push(message);
		return 200;
	} else {
		return 403;
	}

}

//定期更新日期后缀
setInterval(getCurrTime, 60 * 1000);

//定期发送
setInterval(function() {
	var cluster = require('cluster');
	if (msgArr.length == 0) {
		return;
	}
	var start = new Date();
	var startTime = start.getTime();
	console.log(start + ", start sending " + msgArr.length/2 + " msgs to es");
	esClient.bulk({
		body: msgArr
	}, function(err, resp) {
		//Rtt计算
		var end = new Date();
		var endTime = end.getTime();
		var rtt = endTime - start;
		//Count Avg;
		var total = rttAvg * rttCnt + rtt;
		rttCnt += 1;
		rttAvg = total / rttCnt;

		if (rttCnt == 10) {
			rttCnt = 0; //Reset
		}
		console.log(end + ", rtt: " + rtt + ", rttAvg: " + rttAvg);

		if (err) {
			console.log("Error Status:" + err.status);
			console.log(err.message);
			//Retry
			if (esRetryCnt > 0) {
				esRetryCnt -= 1;
				return;
			}
		}

		esRetryCnt = 3;
		msgArr = [];

	});
}, 1000);