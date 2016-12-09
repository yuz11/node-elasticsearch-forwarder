var http = require('http');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
function processHttpPost(host,port,path,data,callback){
    var putOptions = {
        host: host,
        port: port,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'Content-Length': data.length
        }
    };
	
    var req = http.request(putOptions,function(response) {
        var message = '';
        response.on('data',function(chunk){
            message += chunk;

        });
        response.on('end',function(){
            return callback(message);
        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    // write data to request body 
    console.log(data);
    req.write(data);
    req.end();

}

if (cluster.isMaster) {
	var worker = null;
	// Fork workers.
	for (var i = 0; i < numCPUs; i++) {
		worker = cluster.fork();
	}

	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
		//重启worker进程
		worker = cluster.fork();
	});

} else {
	var cnt = 0;
	setInterval(function(){
		++cnt;
		var test_data = {
			"index": "es_test",
			"cnt": cnt,
			"msg": "this is a test!!!"
		}
		processHttpPost('localhost',8082,'/',JSON.stringify(test_data),function(msg){
			console.log(cnt);
		});
	}, 1*1000);
}