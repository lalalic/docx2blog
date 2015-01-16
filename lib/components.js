var docx2html=require('docx2html')
var docx4js=docx2html.parser
var factory=docx4js.factory

var Super=factory.map['control.text']
var _parse=Super.prototype.parse
Super.prototype.parse=function(){
	var text=this.getTag();
	if(text.charAt(0)=='{' && text.charAt(text.length-1)=='}'){
		var info=text.substring(1,text.length-1).split(':'),
			componentName=info[0],
			params=info.length>1 ? info[1] : "";
		this.type="component."+componentName
		this._getValidChildren=function(){return []}
		this.getDirectStyle=function(){return null}
		this.getParams=function(){
			return params
		}
	}
	return _parse.apply(this,arguments)
}

var Component=docx2html.converters['*'].extend({
	wordType:'component',
	tag:'span',
	convertStyle: function(el){
		el.attr('class',this.wordType.split('.').join(' '));
		el.appendChild(this.doc.createTextNode(this.wordType));
		el.attr('data-input',this.wordModel.getParams());
		if(this.wordModel.isInline())
			el.style.display='inline'
		else
			el.style.display='block'
	}
});
	
$.extend(docx2html.converters,{
	'component.comments': Component.extend({wordType:'component.comments'}),
	'component.googleAD': Component.extend({wordType:'component.googleAD'}),
	'component.list':Component.extend({wordType:'component.list'}),
	'component.keywords':Component.extend({wordType:'component.keywords'}),
	'component.search':Component.extend({wordType:'component.search'})
});


