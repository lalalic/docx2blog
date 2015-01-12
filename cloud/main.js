var express=require('express');
var parseExpressRawBody = require('parse-express-raw-body');
var config=require('cloud/config');

var app=express();
app.use(express.bodyParser())
app.use(parseExpressRawBody())
app.post('/', function(req, res) {
		(function(){
			switch(typeof req.body.content){
			case 'undefined':
				return Parse.Cloud.httpRequest({
						url:'https://api.parse.com/1/files/a.jpg',
						method:'post',
						headers:{
							"X-Parse-Application-Id":config.appId,
							"X-Parse-REST-API-Key":config.restKey,
						},
						body:req.body
					}).then(function(r){
						var Image=Parse.Object.extend("image")
						var image=new Image({crc32:req.get('crc32')})
						var data=r.data
						data.__type="File"
						image.set('url', data.url)
						image.set('file',data)
						image.save()						
						return r.data
					})
			case 'string':
				var Post=Parse.Object.extend("post")
				return (new Parse.Query(Post))
					.equalTo('name',req.body.name)
					.first()
					.then(function(post){
						post ? post.set(req.body,{silent:true}) : (post=new Post(req.body));
						return post.save()
							.then(function(){return 'ok'})
					})
				break
			default:
				return Parse.Promise.error("Unsupported content")
			}
		})().then(function(a){res.send(a)},function(error){res.send(400,error)})
	})
	.get('/uploadedImages', function(req, res){
		(new Parse.Query(Parse.Object.extend("image")))
			.select(['crc32','url'])
			.find()
			.then(function(images){
				res.send(images||[])
			},function(e){
				res.send(400,e)
			})
	})
	.get('/', function(req,res){
		var Post=Parse.Object.extend("post");
		(new Parse.Query(Post))
			.first()
			.then(function(p){
				res.set('Content-Type','text/html')
				res.send(p.get('content'))
			},function(error){
				res.send(400,error)
			})
	})

	.listen();
