(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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




},{"apromise":2}],2:[function(require,module,exports){
(function(define){
	define(['extend'], function(Extend){
		var _={
			extend: Extend,
			isFunction: function(a){return typeof a == 'function' || false;},
			isUndefined: function(a){return a === void 0;},
			clone: function(a){return this.extend(true,{},a)},
			arrayEach: function(a,f){
				for(var i=0, len=a.length; i<len; i++)
					f(a[i]);
			},
			isNullOrUndefined: function(a){return a===null || this.isUndefined()}
		};
		/**
		* A Promise is returned by async methods as a hook to provide callbacks to be
		* called when the async task is fulfilled.
		*
		* <p>Typical usage would be like:<pre>
		*    query.find().then(function(results) {
		*      results[0].set("foo", "bar");
		*      return results[0].saveAsync();
		*    }).then(function(result) {
		*      console.log("Updated " + result.id);
		*    });
		* </pre></p>
		*
		* @see Promise.prototype.next
		* @class
		*/
		var Promise = function() {
		this._resolved = false;
		this._rejected = false;
		this._resolvedCallbacks = [];
		this._rejectedCallbacks = [];
		};

		_.extend(Promise, /** @lends Promise */ {

			/**
			 * Returns true iff the given object fulfils the Promise interface.
			 * @return {Boolean}
			 */
			is: function(promise) {
			  return promise && promise.then && _.isFunction(promise.then);
			},

			/**
			 * Returns a new promise that is resolved with a given value.
			 * @return {Promise} the new promise.
			 */
			as: function() {
			  var promise = new Promise();
			  promise.resolve.apply(promise, arguments);
			  return promise;
			},

			/**
			 * Returns a new promise that is rejected with a given error.
			 * @return {Promise} the new promise.
			 */
			error: function() {
			  var promise = new Promise();
			  promise.reject.apply(promise, arguments);
			  return promise;
			},

			/**
			 * Returns a new promise that is fulfilled when all of the input promises
			 * are resolved. If any promise in the list fails, then the returned promise
			 * will fail with the last error. If they all succeed, then the returned
			 * promise will succeed, with the result being an array with the results of
			 * all the input promises.
			 * @param {Array} promises a list of promises to wait for.
			 * @return {Promise} the new promise.
			 */
			when: function(promises) {
			  // Allow passing in Promises as separate arguments instead of an Array.
			  var objects;
			  if (promises && _.isNullOrUndefined(promises.length)) {
				objects = arguments;
			  } else {
				objects = promises;
			  }

			  var total = objects.length;
			  var hadError = false;
			  var results = [];
			  var errors = [];
			  results.length = objects.length;
			  errors.length = objects.length;

			  if (total === 0) {
				return Promise.as.apply(this, results);
			  }

			  var promise = new Promise();

			  var resolveOne = function() {
				total = total - 1;
				if (total === 0) {
				  if (hadError) {
					promise.reject(errors);
				  } else {
					promise.resolve.apply(promise, results);
				  }
				}
			  };

			  _.arrayEach(objects, function(object, i) {
				if (Promise.is(object)) {
				  object.then(function(result) {
					results[i] = result;
					resolveOne();
				  }, function(error) {
					errors[i] = error;
					hadError = true;
					resolveOne();
				  });
				} else {
				  results[i] = object;
				  resolveOne();
				}
			  });

			  return promise;
			},

			/**
			 * Runs the given asyncFunction repeatedly, as long as the predicate
			 * function returns a truthy value. Stops repeating if asyncFunction returns
			 * a rejected promise.
			 * @param {Function} predicate should return false when ready to stop.
			 * @param {Function} asyncFunction should return a Promise.
			 */
			_continueWhile: function(predicate, asyncFunction) {
			  if (predicate()) {
				return asyncFunction().then(function() {
				  return Promise._continueWhile(predicate, asyncFunction);
				});
			  }
			  return Promise.as();
			}
		});

		_.extend(Promise.prototype, /** @lends Promise.prototype */ {
			/**
			 * Marks this promise as fulfilled, firing any callbacks waiting on it.
			 * @param {Object} result the result to pass to the callbacks.
			 */
			resolve: function(result) {
			  if (this._resolved || this._rejected) {
				throw "A promise was resolved even though it had already been " +
				  (this._resolved ? "resolved" : "rejected") + ".";
			  }
			  this._resolved = true;
			  this._result = arguments;
			  var results = arguments;
			  _.arrayEach(this._resolvedCallbacks, function(resolvedCallback) {
				resolvedCallback.apply(this, results);
			  });
			  this._resolvedCallbacks = [];
			  this._rejectedCallbacks = [];
			},

			/**
			 * Marks this promise as fulfilled, firing any callbacks waiting on it.
			 * @param {Object} error the error to pass to the callbacks.
			 */
			reject: function(error) {
			  if (this._resolved || this._rejected) {
				throw "A promise was rejected even though it had already been " +
				  (this._resolved ? "resolved" : "rejected") + ".";
			  }
			  this._rejected = true;
			  this._error = error;
			  _.arrayEach(this._rejectedCallbacks, function(rejectedCallback) {
				rejectedCallback(error);
			  });
			  this._resolvedCallbacks = [];
			  this._rejectedCallbacks = [];
			},

			/**
			 * Adds callbacks to be called when this promise is fulfilled. Returns a new
			 * Promise that will be fulfilled when the callback is complete. It allows
			 * chaining. If the callback itself returns a Promise, then the one returned
			 * by "then" will not be fulfilled until that one returned by the callback
			 * is fulfilled.
			 * @param {Function} resolvedCallback Function that is called when this
			 * Promise is resolved. Once the callback is complete, then the Promise
			 * returned by "then" will also be fulfilled.
			 * @param {Function} rejectedCallback Function that is called when this
			 * Promise is rejected with an error. Once the callback is complete, then
			 * the promise returned by "then" with be resolved successfully. If
			 * rejectedCallback is null, or it returns a rejected Promise, then the
			 * Promise returned by "then" will be rejected with that error.
			 * @return {Promise} A new Promise that will be fulfilled after this
			 * Promise is fulfilled and either callback has completed. If the callback
			 * returned a Promise, then this Promise will not be fulfilled until that
			 * one is.
			 */
			then: function(resolvedCallback, rejectedCallback) {
			  var promise = new Promise();

			  var wrappedResolvedCallback = function() {
				var result = arguments;
				if (resolvedCallback) {
				  result = [resolvedCallback.apply(this, result)];
				}
				if (result.length === 1 && Promise.is(result[0])) {
				  result[0].then(function() {
					promise.resolve.apply(promise, arguments);
				  }, function(error) {
					promise.reject(error);
				  });
				} else {
				  promise.resolve.apply(promise, result);
				}
			  };

			  var wrappedRejectedCallback = function(error) {
				var result = [];
				if (rejectedCallback) {
				  result = [rejectedCallback(error)];
				  if (result.length === 1 && Promise.is(result[0])) {
					result[0].then(function() {
					  promise.resolve.apply(promise, arguments);
					}, function(error) {
					  promise.reject(error);
					});
				  } else {
					// A Promises/A+ compliant implementation would call:
					// promise.resolve.apply(promise, result);
					promise.reject(result[0]);
				  }
				} else {
				  promise.reject(error);
				}
			  };

			  if (this._resolved) {
				wrappedResolvedCallback.apply(this, this._result);
			  } else if (this._rejected) {
				wrappedRejectedCallback(this._error);
			  } else {
				this._resolvedCallbacks.push(wrappedResolvedCallback);
				this._rejectedCallbacks.push(wrappedRejectedCallback);
			  }

			  return promise;
			},

			/**
			 * Run the given callbacks after this promise is fulfilled.
			 * @param optionsOrCallback {} A Backbone-style options callback, or a
			 * callback function. If this is an options object and contains a "model"
			 * attributes, that will be passed to error callbacks as the first argument.
			 * @param model {} If truthy, this will be passed as the first result of
			 * error callbacks. This is for Backbone-compatability.
			 * @return {Promise} A promise that will be resolved after the
			 * callbacks are run, with the same result as this.
			 */
			_thenRunCallbacks: function(optionsOrCallback, model) {
			  var options;
			  if (_.isFunction(optionsOrCallback)) {
				var callback = optionsOrCallback;
				options = {
				  success: function(result) {
					callback(result, null);
				  },
				  error: function(error) {
					callback(null, error);
				  }
				};
			  } else {
				options = _.clone(optionsOrCallback);
			  }
			  options = options || {};

			  return this.then(function(result) {
				if (options.success) {
				  options.success.apply(this, arguments);
				} else if (model) {
				  // When there's no callback, a sync event should be triggered.
				  model.trigger('sync', model, result, options);
				}
				return Promise.as.apply(Promise, arguments);
			  }, function(error) {
				if (options.error) {
				  if (!_.isUndefined(model)) {
					options.error(model, error);
				  } else {
					options.error(error);
				  }
				} else if (model) {
				  // When there's no error callback, an error event should be triggered.
				  model.trigger('error', model, error, options);
				}
				// By explicitly returning a rejected Promise, this will work with
				// either jQuery or Promises/A semantics.
				return Promise.error(error);
			  });
			},

			/**
			 * Adds a callback function that should be called regardless of whether
			 * this promise failed or succeeded. The callback will be given either the
			 * array of results for its first argument, or the error as its second,
			 * depending on whether this Promise was rejected or resolved. Returns a
			 * new Promise, like "then" would.
			 * @param {Function} continuation the callback.
			 */
			_continueWith: function(continuation) {
			  return this.then(function() {
				return continuation(arguments, null);
			  }, function(error) {
				return continuation(null, error);
			  });
			}

		});

		return Promise;
	})
})(typeof define !== "undefined" ? define
	// try to define as a CommonJS module instead
	: typeof module !== "undefined" ? function(deps, factory) {
		module.exports = factory(require('extend'));
	}
	// nothing good exists, just define on current context (ie window)
	: function(deps, factory) { this.Promise = factory(); }
);
},{"extend":3}],3:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;
var undefined;

var isPlainObject = function isPlainObject(obj) {
	'use strict';
	if (!obj || toString.call(obj) !== '[object Object]') {
		return false;
	}

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {}

	return key === undefined || hasOwn.call(obj, key);
};

module.exports = function extend() {
	'use strict';
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];
					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);

				// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}]},{},[1]);
