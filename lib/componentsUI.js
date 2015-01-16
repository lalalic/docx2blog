function ajax(data,headers,method,url){
	headers=headers||{};
	method=method||'post';
	url=url||'/';
	var Promise=require('apromise')
	var x = new XMLHttpRequest(), p=new Promise();
	x.onreadystatechange=function(e){
		switch(x.readyState){
		case 1:
			Object.keys(headers).forEach(function(k){x.setRequestHeader(k,headers[k])})	
			break
		case 4:
			switch(x.status){
			case 200:
				p.resolve(x.getResponseHeader('content-type').indexOf('json')!=-1 ? JSON.parse(x.responseText) : x.responseText)
				break
			default:
				p.reject(new Error(x.responseText))
			}
		default:
		}
	}
	x.open(method,url, true)
	x.send(data)
	return p;
}
Node.prototype.$1=Element.prototype.querySelector
Node.prototype.$=Element.prototype.querySelectorAll
NodeList.prototype.forEach=Array.prototype.forEach

function extend(a,b){
	for(var i in b)
		b[i]!=undefined && (a[i]=b[i])
	return a
}

Function.prototype.asTemplate=function(input){
	var content=this.toString()
	content=content.substring(content.indexOf('/*')+2, content.lastIndexOf('*/'));
	return !input ? content : content.replace(/\$\{(.*)\}/gm,function(a,b){return input[b]||''})
}

var swap,body=document.body;

if(swap=body.$1('.component.comments')){
	var addComment;
	swap.innerHTML=(function(){/*
		<style>
			#newComment input, #newComment textarea{display:block;width:95%;margin-top:20px; border:0;border-bottom:1px solid lightgray;line-height:2em;outline-style:none}
		</style>
		<ol id="commentList"></ol>	
		<form id="newComment">
			<input name="user" placeholder="your name">
			<textarea name="comment" placeholder="comment here" style="height:70px"></textarea>
			<button type="button">save</button>
		</form>
	*/}).asTemplate();
	ajax(null,null,'get','/comment')
		.then(function(comments){
			comments.forEach(addComment=function(c){
				var li=document.createElement('li');
				this.appendChild(li)
				li.innerHTML=c.user+" said on "+c.createdAt+'<p>'+c.comment+'</p>'
			}.bind(body.$1('#commentList')))
		});
	swap.$1('button').onclick=function(){
		var data={createdAt:new Date(),user:body.$1('#newComment>input').value, comment:body.$1('#newComment>textarea').value}
		ajax(JSON.stringify(data),{'content-type':'application/json'},'post','/comment')
			.then(function(){
				addComment(data)
				body.$1('#newComment').reset()
			},function(e){
				alert('error when saving comment: '+e.message)
			})
	}
}

ajax(null,null,'get','/info')
	.then(function(posts){
		var name=document.title.replace(/\.html$/,''),len=posts.length,index=0;
		for(var i=0;i<len;i++){
			if(posts[i].name==name){
				index=i;
				break
			}
		}
		//#next, #prev
		(swap=body.$('a[href="#next"]')) && swap.forEach(function(a){
			a.onclick=function(){
				len>index+1 && (document.location=posts[index+1]+'.html');
			}
		});

		(swap=body.$('a[href="#prev"]')) && swap.forEach(function(a){
			a.onclick=function(){
				index-1>-1 && (document.location=posts[index-1].name+'.html');
			}
		});
		
		if(swap=body.$1('.component.list')){
			swap.innerHTML=posts.map(function(p){
				return '<h6 data-keywords="'+(p.keywords||'')+'"><a href="'+p.name+'.html">'+p.name+'</a></h6>'
			}).join('')
		}
		
		typeof posts[index].keywords!='undefined' && (swap=body.$('.component.keywords')) && swap.forEach(function(a){
			a.innerHTML=posts[index].keywords.join(',');
		})
	});

(swap=body.$('.component.googleAD')) && swap.forEach(function(a){
	a.innerHTML=(function(){/*
		<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
		<ins class="adsbygoogle"
			 style="display:inline-block;width:${width};height:${height}"
			 data-ad-client="${client}"
			 data-ad-slot="${slot}"></ins>
		<script>
		(adsbygoogle = window.adsbygoogle || []).push({});
		</script>
	*/}).asTemplate(extend({
				client:"ca-pub-8043169935696401",
				slot:"5457625779",
				width:"320px",
				height:"100px"
			},(new Function("a,b,c,d",'return {client:a,slot:b,width:c,height:d}'))(a.getAttribute('data-input').split(','))));
});


if(swap=body.$1('.component.search')){
	swap.innerHTML='<input type="search" style="width:90%;margin:5px auto;padding:5px">'
	swap.$1('input').onchange=function(){
		var list=body.$1('.component.list');
		list.children.forEach(function(a){a.style.display='none'})
		list && list.$('[data-keywords*="'+this.value+'"]').forEach(function(a){a.style.display='block'})
	}
}
/*
(function(){
	function ComponentUI(el){
		this.el=el
		this.input=el.getAttribute('data-input')
	}
	ComponentUI.prototype={
		temlate:null,
		render: function(){
			typeof this.template =='function' && this.el.innerHTML(this.template.asTemplate(this.input))
		}
	}

	body.$('.component').forEach(function(el){
		
	})


	module.exports=ComponentUI
})();
*/


