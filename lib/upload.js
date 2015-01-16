var docx2html=require('docx2html');
require('./components');

Function.prototype.asTemplate=function(input){
	var content=this.toString()
	content=content.substring(content.indexOf('/*')+2, content.lastIndexOf('*/'));
	return !input ? content : content.replace(/\$\{(.*)\}/gm,function(a,b){return input[b]||''})
}

var parsed=null, uploadedImages=null;
function ajax(data,headers,method,url){
	headers=headers||{};
	method=method||'post';
	url=url||'/';
	var x = new XMLHttpRequest(), p=new $.Deferred();
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

function getUploadedImages(){
	if(uploadedImages)
		return $.Deferred.as(uploadedImages)
	return ajax(null,{},'get','/uploadedImages')
		.then(function(data){
			data.forEach(function(a){
				this[a.crc32]=a.url
			},uploadedImages={})
			return uploadedImages
		})
}

document.$1('#save').onclick=function save(){
	var me=this;
	me.classList.add('doing');
	parsed.save({
		saveImage:function(data, docProps){
			return getUploadedImages()
			.then(function(uploadedImages){
				if(uploadedImages[data.crc32])
					return uploadedImages[data.crc32]
				return ajax(data,{'content-type':'image/jpeg','crc32':data.crc32})
					.then(function(file){
						return uploadedImages[data.crc32]=file.url
					})
			})
		},
		saveHtml: function(data, docProps){
			return ajax(JSON.stringify($.extend({content:data},docProps)), {'content-type':'application/json'})
		},
		template: function(style, content, props){
			return (function(){/*
				<!doctype html>
				<html>
					<head>
						<title>${name}</title>	
						<meta key="generator" value="docx2blog">
						<link type="text/stylesheet" href="/css/custom.css">
						<style>
							#A .component{padding:5px}
							${style}
						</style>
					<head>
				<body>
				${content}
				</body>
				<script src="/js/extend.js"></script>
				<script src="/js/custom.js"></script>
				</html>
			*/}).asTemplate({style:style,content:content,name:props.name})
		}
	}).then(
		function(post){
			me.classList.remove('doing')
			alert('saved')
		},
		function(error){
			me.classList.remove('doing')
			alert(error)
		})
}

document.$1('#file').onchange=function load(){
	parsed=null
	docx2html(this.files[0])
	.then(function(doc){
		parsed=doc
	})
	this.value='';
}
			
			