var express=require('express');

function saveFile(file,name,headers){
	return Parse.Cloud.httpRequest({
			url:'https://api.parse.com/1/files/'+name,
			method:'post',
			headers:headers,
			body:file
		}).then(function(res){
			console.log('saved '+headers['content-type'])
			return res.data
		})
};

express()
	.post('/', function(req, res) {
		var data=[],headers={},name, isImage=true;
		req.on('end', function(){
			console.log('data end');
			var props=req.headers['props'];
			props && (props=JSON.parse(props));
			switch(req.headers['content-type'].split('/')[0]){
			case 'image':
				data=require('buffer').Buffer.concat(data)
				headers['content-type']='image/jpeg'
				name='a.jpg';
				break
			case 'text':
				isImage=false
				data=data.join('')
				headers['content-type']='text/html'
				name=props.name.replace(/\.docx$/i,'.html')
				break
			default:
				
			}
			
			saveFile(data,name,headers)
			.then(function(file){
				if(isImage){
					return file
				}else{
					var Post=Parse.Object.extend("post")
					return (new Parse.Query(Post)).equalTo('name',props.name)
						.first(function(post){
							post ? post.set(props,{silent:true}) : (post=new Post(props));
							post.set('url', file.url);
							return post.save().then(function(){return file})
						})
				}
			})
			.then(
				function(file){
					res.send(file.url)
				},
				function(error){
					res.send(400,error)
				})
		})
		
		req.on('data', function(chunk){
			data.push(chunk)
		})
	})
	.listen()
;
