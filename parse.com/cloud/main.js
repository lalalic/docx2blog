var express=require('express');
var parseExpressRawBody = require('parse-express-raw-body');
var config=require('cloud/config');

function getPostName(req){
	return decodeURI(req.get('Referrer').split('/').pop().replace(/\.html$/,''));
}

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
				var Post=Parse.Object.extend("post");
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
	.get('/(:title.html)?', function(req,res){
		var Post=Parse.Object.extend("post"),
			q=new Parse.Query(Post);
		req.params.title && q.equalTo('name',decodeURI(req.params.title));
		q.select(['content'])
			.first()
			.then(function(p){
				if(p){
					res.set('Content-Type','text/html')
					res.send(p.get('content'))
				}else
					res.send(404)
			}, function(){
				res.send(404)
			})
	})
	.get('/info',function(req,res){
		var Post=Parse.Object.extend("post"),
			q=new Parse.Query(Post);
		q.select(['name','keywords'])
			.find()
			.then(function(posts){
				res.send(posts||[])
			},function(e){
				res.send(400,e)
			})
	})
	.get('/comment', function(req, res){
		var name=getPostName(req)
		var Post=Parse.Object.extend("post"),
			q=new Parse.Query(Post);
		q.equalTo('name',name)
			.select(['comment'])
			.first()
			.then(function(p){
				res.send(p && p.get('comment')||[])
			}, function(){
				res.send([])
			})
	})
	.post('/comment', function(req,res){
		var name=getPostName(req)
		var Post=Parse.Object.extend("post"),
			q=new Parse.Query(Post);
		q.equalTo('name',name)
			.first()
			.then(function(p){
				if(p){
					p.add('comment',req.body)
					return p.save()
				}else
					return new Error('no post named : '+name)
			}).then(function(){res.send('ok')},function(e){res.send(400,e)})
	})
	.listen();
