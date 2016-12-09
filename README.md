node-elasticsearch-forwarder  
=================
* http server handles http post JSON and transfer to ES

* make it easier to handle http req and write to ES

* multi thread and overload protected

# Req  
HTTP POST Json:  
{  
        "index": your index name in ES //MUST  
        "timestamp": your timestamp format in ES //NOT MUST,without it,Server will fill with a millisecond timestamp  
        ...... //other fields u want.  
}  

# Res  
Http Status:  
200 // req accepted  
403 // overloaded, req not accepted  


# How to Use  
Server  
        $ npm install  
        fill config.js as comments.  
        $ ./start.sh  


# NOTE  
1. mainly install express/elasticsearch-js,if u haven't install node yet,u may use the node process within this project.  
but u have relink npm/forever.Do as the follow:  
        $ cd v6.2.0/bin/  
        $ ln -s ../lib/node_modules/forever/bin/forever forever  
        $ ln -s ../lib/node_modules/npm/bin/npm-cli.js  
2. timestamp format should specify.If u are not sure,try this:  
(1)do not put timestamp in ur req json,or fill it with millisecond.  
(2)specify it with a template:  
        curl -XPUT "http://ur_es_host:ur_es_port/_template/t1" -d'{"template" : "*","order" : 0,"settings": {"index.refresh_interval": "1m","number_of_shards":"2"},"mappings":{"log":{"properties":{"timestamp": {"type": "date","format" : "epoch_millis"}}}}}'  
  
* Any Comment or Question, Contact Me through : yuzyang11@foxmail.com
* 欢迎来撩
