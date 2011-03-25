/**
 * Lightweight MobileUserInterface library for high-end smartphone
 * 
 * @author Wireless front-end group Alipay UED
 * 
 * Include data parse engine JSON.js  http://http://www.json.org/
 * 
 * @global MUI
 * @version 1.0
 * @Date October 2010.
 */

(function (){
	var doc = document,
	    toString = Object.prototype.toString,
	    types = {},
		slice = Array.prototype.slice,
		push = Array.prototype.push,
		splice = Array.prototype.splice,
		trim = String.prototype.trim,
		delSpacs_reg = /(?:\s)/g,
		trim_reg = /^\s+|\s+$/g,
		//事件类型字符集合
		eventTypes = "blur focus focusin focusout load resize scroll unload click dblclick " +
	                 "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	                 "change select submit keydown keypress keyup error touchstart touchend touchmove orientationchange webkitTransitionEnd webkitAnimationEnd",
		domNode = ['parent'],
		JSON,
		toString = Object.prototype.toString,
		rwebkit = /(AppleWebKit)[ \/]([\w.]+)/,
		ripad = /(ipad).+\sos\s([\d+\_]+)/i,
		rwindows = /(windows\d*)\snt\s([\d+\.]+)/i,
		riphone = /(iphone)\sos\s([\d+\_]+)/i,
		ripod = /(ipod).+\sos\s([\d+\_]+)/i,
		randroid = /(android)\s([\d+\.]+)/i,
		rmacos = /(mac)\sos\s?x\s([\d+\_]+)/i,
		rspaces = /\s+/,
		rclass = /[\n\t\r]/g,
		rreturn = /\r/g;
		
	var MUI = function (s){
		//每调用一次MUI，将返回一个MUI实例
		return s === null ? null : new MUI.fn.init(s);
	};
	
	MUI.fn = MUI.prototype = {
		constructor : MUI,
		init : function (s){
			//确保返回MUI实例
			if(!s){return this;}
			
			return this.toArray(s);
		},
		item : function (i){
			return this.length <= 1 || !i
			        ? null 
					: i === -1 
					       ? this.slice(i) 
						   : this.slice(i,+i+1);
		},
		get : function (i){
			if(i === undefined){MUI.error('get method accept int,Please provide a param.');}
			
			return i<0 ? this[this.length+i] : this[i];
		},
		size:function (){
			return this.length;
		},
		/**
		 * 内部使用，将MUI对象转换为数组对象
		 * @param {Object} s
		 * @return MUI
		 */
		toArray : function (s){
			if(MUI.isArray(s)){
				s = s;
			}else{
				s = [s];
			}
			
			push.apply(this,s);
			return this;
		},
		/**
		 * 在MUI数组中的每一项中执行回调函数
		 * @param (Function) fn callback
		 * @return MUI
		 */
		each : function (fn/*,context*/){
			return MUI.each(this,fn,arguments[1]);
		},
		slice : function (start,end){
			return this.pushStack(slice.call(this,start,end));
		},
		/**
		 * 将新元素push栈
		 * @param {Object} elem 由slice返回的元素
		 * @param {Object} name 
		 * @param {Object} selector
		 */
		pushStack : function (elem,name,selector){
			if(MUI.isArray(elem)){
				//返回MUI实例。元素永远是数组的第一项
				return MUI(elem[0]);
			}
		}
	};
	
	//将MUI的原型赋给初始化函数，以便每个MUI实例都有MUI的方法及MUI.fn的方法
	MUI.fn.init.prototype = MUI.fn;
	
	//MUI类和MUI实例的extend方法，主要用于开发插件
	MUI.extend = MUI.fn.extend = function (){
		var target = arguments[0]||{},
		    length = arguments.length,
			i = 1,
			options,
			name,
			copy;
		
		//为MUI对象添加静态方法	
		if(length === i){
			target = this;
			--i;
		}

		for(;i<length;i++){
			if((options = arguments[i]) !== null){
				for(name in options){
					copy = options[name];
					//处理无限制的拷贝
					if(copy === target){continue;}
					if(copy !== undefined){
						target[name] = copy;
					}
				}
			}
		}
		
		return target;
	};
	
	MUI.extend({
		only : function (selector){
			if(MUI.isFunction(selector)){
				throw(selector + 'is Function! '+'MUI only method dont\'t accept Funtion.');
			}
			
			var s;
			
			if(MUI.isObject(selector)){
				s = selector;
			}else{
				s = doc.querySelector(selector);
			}
			
			return this(s);
		},
		all : function (selectors){
			var s,results;
			
			if(MUI.isObject(selectors)){
				s = selectors;
			}else{
				s = doc.querySelectorAll(selectors);
			}
			
			results = slice.call(s,0);
			
			return this(results);
		},
		//所有MUI对象将拥有唯一的ID
		id : 0,
		//MUI对象的数据缓存
		cache : {},
		//为MUI对象存储数据
		data : function (elem){
			var events;
			
			events = elem.events;
			
			//如果当前MUI对象已经拥有事件的数据,将直接返回事件数据，反之则创建事件数据
			if(!events){
				elem.events = events = {};
				events['functions'] = events['functions'] = [];
			}
			
			return elem.events;
		},
		clearData : function (nodes){
			if(nodes.length && nodes.length > 0){
				for(var i=0,l=nodes.length;i<l;i++){
					if(nodes[i].nodeType === 1 && nodes[i]['events']){
						this.clearData(nodes[i]);
					}
				}
			}else{
				nodes.events = null;
			}
		},
		cloning : function (elem){
			var clone;
			
			clone = elem.cloneNode(true);
			
			//如果当前对象中已注册事件，则不拷贝
			if(elem.events){
				clone = elem;
			}

			return clone;
		},
		nodeName : function (elem,name){
			return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
		}
	});
	
	MUI.extend({
		error : function (mes){
			throw (mes);
		},
		VERSION : 1.0,
		each : function (o,fn/*,context*/){
			if(!o){return;}
			
			if(!fn){throw('Callback must be define.');}else if(toString.call(fn) !== '[object Function]'){throw(fn+'must be Function.');}
			
			//使用javascript 1.6 Array iterator method
			if('forEach' in []){
				Array.prototype.forEach.call(o,fn,arguments[2]);
				return o;
			}
			
            return o;
		},
		type : function (o){
			return o == null ? String(o) : types[toString.call(o)] || 'object';
		},
		isFunction : function (o){
			return MUI.type(o) === 'function';
		},
		isArray : function (o){
			return MUI.type(o) === 'array';
		},
		isString : function (o){
			return MUI.type(o) === 'string';
		},
		isNumber : function (o){
			return MUI.type(o) === 'number';
		},
		isObject : function (o){
			return MUI.type(o) === 'object';
		},
		isWindow : function (o){
			return o && this.isObject(o) && 'setInterval' in o;
		},
		isEmptyObject : function (o){
			var k;
			
			for(k in o){
				return false;
			}
			
			return true;
		},
		trim : function (t){
			return t.replace(trim_reg,'');
		},
		/**
		 * 合并数据
		 * @param {Object/Array} first 将合并second的数据
		 * @param {Object/Array} second 数据合并到first中
		 * @return first;
		 */
		merge : function (first,second){
			var i = first.length || 0,
			    j = 0;

			if(!this.isArray(second) && !this.isFunction(second) && this.isObject(second) && second != '[object NodeList]'){
				for(var k in second){
					first[i++] = second[k];
				}
				return first;
			}
				
			if(this.isNumber(i)){
				for(l=second.length;j<l;j++){
					first[i++] = second[j];
				}
			}else{
				while(second[j] !== undefined){
					first[i++] = second[j++];
				}
			}
			
			return first;
		},
		inArray : function (elem,i,array){
			var start = 0,
				array = array;
			
			if(arguments.length === 2){
				array = arguments[--arguments.length];
				i = 0;
			}
			
			if('indexOf' in array){
				return Array.prototype.indexOf.call(array,elem,i);
			}
		},
		map : function (o,callback/*,context*/){
			if(!o){return;}
			
			if(!callback){throw('Callback must be define.');}else if(toString.call(fn) !== '[object Function]'){throw(callback+'must be Function.');}
			
			//使用javascript 1.6 Array iterator method
			if('map' in []){
				return Array.prototype.map.call(o,callback,arguments[2]);
			}
		},
		UA : function (){
			if(MUI.UA){return ;}
			
			var ua = navigator.userAgent,
			    match = rwebkit.exec(ua),
				browser = rwebkit.exec(ua),
				result = {},
				r;
				
			r = (ripod.exec(ua) || ripad.exec(ua) || riphone.exec(ua) || randroid.exec(ua) || rmacos.exec(ua) || rwindows.exec(ua) || '');
			
			if(!r[1]){return;}
			
			result['system'] = r[1].toLowerCase();
			result['version'] = r[2].replace(/(\_|\.)/ig,'.').toLowerCase();
			result['browser'] = browser[1].toLowerCase();
			
			//减少对MUI.UA的访问
			MUI.UA = result;
		}(),
		makeArray : function (array,result){
			var ret = result || [];
			
			if(array){
				var type = this.type(array);
				if(!array.length || type === 'string' || type === 'function' || type === 'regexp' || this.isWindow(array)){
					push.call(ret,array);
				}else{
					this.merge(ret,array);
				}
			}
			
			return ret;
		}
	});
	
	MUI.extend({
		addEvent : function (elem,type,fn,context,args){
			var cache = MUI.cache || {},
			    events,
				types,
				id = ++MUI.id,
				handlerObj = {},
				handler,
				args,
				context;
			
			events = MUI.data(elem);
			types = events[type];
			
			if(types === undefined){
				types = events[type] = [];
			}
			
			//第一次注册事件时，为MUI对象添加handlerObj数据
			if(!handlerObj['handler']){
				handler = function (e){
					//为回调函数添加ID，这个ID将留作日后卸载事件
					fn.id = id;
					var _fn = fn.call(context || elem,e,args);
					if(_fn === false){
						e.preventDefault();
						e.stopPropagation();
					}
					return _fn;
				}
			}
			
			handlerObj['fid'] = id;
			handlerObj['elem'] = elem;
			handlerObj['arguments'] = args;
			handlerObj['context'] = context;
			handlerObj['handler'] = handler;
			handler['id'] = id;
			events['id'] = id;
			//将每个回调函数push到事件对象中
			events['functions'].push({fn:fn,id:id})
			//将触发器数据push到事件类型
			push.call(types,handlerObj);
			
			elem.addEventListener(type,handler,false);
		},
		removeEvent : function (elem,type,fn){
			var events,
			    handler,
				types,
				fid,
				id;
				
			//取回MUI对象的数据	
			events = MUI.data(elem); 
			id = events.id
			types = events[type];
			
			/**
			 * 清除指定事件类型的所有事件
			 * MUI.unbind(eventType)
			 */
			if(fn === undefined){
				var fns = [],
				    f;
				if(!events[type]){MUI.error('Dont\'t special '+ type +' event!');}
				
				for(var i = 0,l = events[type].length;i<l;i++){
					fns.push(events['functions'][i]);
				};
				
				for(i=0;i<fns.length;i++){
					f = fns[i].fn;

					MUI.removeEvent(elem,type,f);
				}
			}
			
			MUI.each(types,function(handlerObj,i){
				//如果当前的事件已经完全卸载，则直接返回
				if(!handlerObj){return;}
				
				handler = handlerObj['handler'];
				//console.log(events['functions'][i]['fn']);
				if(events['functions'][i]['fn'] === fn){
					if(events['functions'][i]['id'] === handler.id){
						elem.removeEventListener(type,handler,false);
						//清除已经卸载的事件数据
						splice.call(events['functions'],i,1);
						//清除已经卸载的事件类型
						splice.call(types,i,1);
					}
				}
				
				//如果当前MUI对象的事件数据全部卸载，我们将清除当前MUI对象的事件数据
				if(types.length === 0){
					elem.events = null;
					return;
				}
			});
		},
		buildFragment : function (args,nodes){
			var fragment,
			    doc = nodes && nodes[0] ? nodes[0].ownerDocument || nodes[0] : document,
				div,
				value,
				ret=[];

			div = document.createElement('div');
			fragment = document.createDocumentFragment();
			!MUI.isObject(args[0]) ? div['innerHTML'] = (value = args[0]) : div['appendChild'](value = args[0])
			
			if(div.firstChild){
				ret = MUI.merge(ret,div.childNodes);
			}
			
			MUI.each(ret,function (node){
				fragment.appendChild(node);
			});
			
			//阻止内存泄漏
			div = null;

			return fragment;
		},
		attr : function (nodes,name,value){
			var i,
			    rspecialurl = /^(?:src|href|style)$/i,
				rtype = /^(?:button|input)$/i,
				elem = nodes.length ? nodes[0] : nodes,
				special,
				set,
				attr;

			set = value !== undefined;
			
			if(elem && elem.nodeType === 1){
				special = rspecialurl.test(name);
				
				if(this.isObject(name)){
					for(i in name){
						this.attr(elem,i,name[i]);
					}
				}
                
				/**
				 * 获取特殊的节点属性
				 * checked disabled className
				 */
                if (name in elem && elem[name] !== undefined && name !== 'style') {
					//不能修改button|input的type属性
                    if (rtype.test(elem.nodeName) && name === 'type') {
                        MUI.error(elem + '\'s ' +'type property can\'t be changed!');
                    }
					
					if(set){
                        if (value === null) {
                            elem.removeAttribute(name);
                        }
                        else {
                            elem[name] = value;
                        }
					}
					
					if(MUI.nodeName(elem,'form') && elem.getAttributeNode(name)){
						return elem.getAttributeNode(name)['nodeValue'];
					}
					
					return elem[name];
                }
				
				if(name === 'style'){
					if(set){
						elem.style.cssText = value;
					}
					
					return elem.style.cssText;
				}
				
				if(set){
					elem.setAttribute(name,value);
				}
				
				attr = special ? elem.getAttribute(name,2) : elem.getAttribute(name);
				
				return attr === null ? undefined : attr;
			}
			
			//非DOM处理
			if(set){
				elem[name] = value;
			}
			
			return elem[name];
		},
		style : function (name,value){
			var rdashAlpha = /-([a-z])/gi,
			    fcamelCase = function (all,letter){
					return letter.toUpperCase();
				},
				name = name.replace(rdashAlpha,fcamelCase) || name,
				cssNumber = {
					zIndex : true,
					opacity : true,
					lineHeight : true,
					fontWeight : true,
					zoom : true
				};

			if(value !== undefined){
				if(MUI.isNumber(value) && !cssNumber[name]){
					value += 'px';
				}
				
				try{
					this.style[name] = value;
				}catch(e){}
			}else{
				return window.getComputedStyle(this)[name];
			}
		},
		parent : function (elem){
			var parent = elem.parentNode;
			
			//父节点不是文档片段
			return parent && parent.nodeType !== 11 ? parent : null;
		}
	});
	
	MUI.each('Boolean Number String Function Array Date RegExp Object'.split(' '),function (name,i){
		types['[object '+name+']'] = name.toLowerCase();
	});
	
	MUI.each(eventTypes.split(' '),function (name,i){
		MUI.fn[name] = function (fn,context,args){
			this.bind(name,fn,context,args);
		}
	});
	
	MUI.fn.extend({
		after : function(){
			if(this[0] && this[0].parentNode){
				return this.domManip(arguments,function (elem){
					this.parentNode.insertBefore(elem,this.nextSibling);
				});
			}
		},
		append : function (){
			return this.domManip(arguments,function (elem){
				if(this.nodeType === 1){
					this.appendChild(elem);
				}
			});
		},
		prepend : function (){
			return this.domManip(arguments,function (elem){
				if(this.nodeType === 1){
					this.insertBefore(elem,this.firstChild);
				}
			});
		},
		before : function (){
			if(this[0] && this[0].parentNode){
				return this.domManip(arguments,function (elem){
					this.parentNode.insertBefore(elem,this);
				});
			}
		},
		html : function (html){
			if(!html){
				if(this[0] && this[0].nodeType === 1){
					return this[0].innerHTML;
				}
			}else if(html && MUI.isString(html)){
				try{
					for(var i=0,l=this.length;i<l;i++){
						if(this[i].nodeType === 1){
							MUI.clearData(this[i].querySelectorAll('*'));
							this[i].innerHTML = html;
						}
					}
				}catch(e){
					this.empty().append(html);
				}
			}else{
				this.empty().append(html);
			}
			
			return this;
		},
		empty : function (){
			for(var i=0,elem;(elem = this[i]) != null;i++){
				if(elem.nodeType === 1){
					MUI.clearData(elem.querySelectorAll('*'));
				}
				
				while(elem.firstChild){
					elem.removeChild(elem.firstChild);
				}
			}
			
			return this;
		}
	});
	
	MUI.fn.extend({
		domManip : function (args,callback){
			var results,
			    i = 0;
				
			results = MUI.buildFragment(args,this);
			
			this.each(function (elem){
				callback.call(elem,MUI.cloning(results.firstChild));
			});
			
			return this;
		},
		attr : function (name,value){
			return MUI.attr(this,name,value);
		},
		removeAttr : function (name){
			this.attr(name,'');
			
			return this.each(function (elem,i,o){
				if(elem.nodeType === 1){elem.removeAttribute(name);}
			});
		},
		css : function (){
			if(arguments.length === 0){return this;}
			
			var name = arguments[0],
			    value = arguments[1],
				l = arguments.length;
			
			if(l == 2){
				return this.each(function (elem){
					MUI.style.call(elem,name,value);
				});
			}
			
			if(l === 1 && l < 2){
				if(MUI.isObject(name)){
					for(var i in name){
						this.css(i,name[i]);
					}
					return this;
				}
				
				for(var i=0,nodeL = this.length;i<nodeL;i++){
					return MUI.style.call(this[i],name);
				}
			}
		},
		hasClass : function (s){
			var className = ' ' + s + ' ';
			
			if(s){
				for(var i=0,l=this.length;i<l;i++){
					if(
					  this[i].nodeType === 1
					  &&
					  (' ' + this[i].className + ' ').replace(rclass,' ').indexOf(className) > -1
					  ){
						return true;
					}
				}
			}
			
			return false;
		},
		toggleClass : function (s){
			if(!s){return this};
			
			return this.each(function (elem){
				if(elem.nodeType === 1){
					var self = MUI(elem),
					    b = self.hasClass(s);

					self[b ? 'removeClass' : 'addClass'](s);
				}
			});
		},
		addClass : function (s){
			if(s){
				var newClass = (s || '').split(rspaces);
				this.each(function (elem){
					if(elem.nodeType === 1){
						if(!elem.className){
						  elem.className = s;
						  return;
					    }
						
						var currentClass = ' '+elem.className+' ',
						    setClass = elem.className,
							i = 0,
							cl = newClass.length;
							
						for(;i<cl;i++){
							if(currentClass.indexOf(' '+newClass[i]+ ' ') < 0){
								setClass += ' ' + newClass[i];
							}
						}

						elem.className = MUI.trim(setClass);
					}
				});
			}
		},
		removeClass : function (s){
			if(s || s === undefined){
				var oldClass = (s || '').split(rspaces);
				
				this.each(function (elem){
					if(s && elem.nodeType === 1 && elem.className){
						var className = (' ' + elem.className + ' ').replace(rclass,' ');
						
						for(var i=0,cl = oldClass.length;i<cl;i++){
							className = className.replace(' '+oldClass[i]+' ',' ');
						}
						
						elem.className = MUI.trim(className);
					}else{
						elem.className = '';
						elem.removeAttribute('class');
					}
				});
			}
		},
		replaceClass : function (old/*,new*/){
			   var newClassname = arguments[1];
			
				return this.each(function (elem){
					var self = MUI(elem),
					    b = self.hasClass(old),
						currentClass = ' ' + elem.className + ' ',
						reg = new RegExp(' ' + old + ' '),
						newClass;
					
					if(b){
						if(currentClass.indexOf(' ' + old + ' ') != -1){
							newClass = currentClass.replace(reg,newClassname ? ' '+newClassname+' ' : ' ');
						}
						
						elem.className = MUI.trim(newClass);
					}else{return false;}
				});
		},
		bind : function (type,fn,context,args){
			for(var i = 0,l = this.length;i<l;i++){
				MUI.addEvent(this[i],type,fn,context,args);
			}
		},
		unbind: function(type,fn) {
            for(var i = 0,l = this.length;i<l;i++){
				MUI.removeEvent(this[i],type,fn,i);
			}
      	},
		query : function (node){
			if(!node){return false;}
			
			var result;
			
			this.each(function (el){
				if(MUI.isObject(node)){
					result = node;
				}else{
					result = el.querySelector(node);
				}
				
				if(result){
					result = result;
				}else{
					result = false;
				}
			});
			
			return result;
		},
		querySelectorAll : function (node){
			if(!node){return false;}
			
			var result;
			
			this.each(function (el){
				 result = el.querySelectorAll(node);
				if(result){
					result = result;
				}else{
					result = false;
				}
			});
			
			return result;
		},
		val : function (){
			var rradiocheckbox = /^(?:radio|checkbox)$/i;
			
			//get value;
			if(!arguments.length){
				var elem = this[0];
				
				if(elem){
					//option
					if(MUI.nodeName(elem,'option')){
						var val = elem.attributes.value;
						return !val || val.specified ? elem.value : elem.text;
					}
					
					//select
					if(MUI.nodeName(elem,'select')){
						var index = elem.selectedIndex,
						    options = elem.options,
							one = elem.type === 'select-one',
							option,
							value;

						if(index < 0){return null;}
						
						if(one){
							for(var i= one ? index : 0,max = one ? index+1 : options.length;i<max;i++){
								option = options[i];
								
								if(option.selected && !option.parentNode.disabled && !option.disabled){
									value = MUI(option).val();
								}
							}
						}
						
						return value;
					}
					
					//radio/checkbox
					if(rradiocheckbox.test(elem.type)){
						return elem.getAttribute('value') === null ? 'on' : elem.value;
					}
					
					//other
					return (elem.value || '').replace(rreturn,'');
				}
				
				return undefined;
			}
			
			//set value;
			var value = arguments[0];
			
			return this.each(function (elem){
				var self = MUI(elem);
				
				if(elem.nodeType !== 1){return ;}
				
				//null
				if(value === null){
					value = '';
				//value = 1/2/3/4....
				}else if(MUI.isNumber(value)){
					value += '';
				//value = []可用于设置radio或checkbox表单控件的checked属性
				}else if(MUI.isArray(value)){
					var val = MUI.map(value,function (v){
						return v == null ? '' : v + '';
					});
					
					if(MUI.isArray(val) && rradiocheckbox.test(elem.type)){
						elem.checked = MUI.inArray(self.val(),val) >= 0;
					}
				//如果是对select操作
				}else if(MUI.nodeName(elem,'select')){
					var val = MUI.makeArray(value);
					
					MUI.all(elem.querySelectorAll('option')).each(function (elem){
						elem.selected = MUI.inArray(MUI(elem).val(),val) >= 0;
					});
					
					if(!val.length){
						elem.selectedIndex = -1;
					}
				//other
				}else{
					elem.value = value;
				}
			});
		}
	});
	
	MUI.each(domNode,function (method){
		MUI.fn[method] = function (){
			for(var i=0;i<this.length;i++){
				return MUI(MUI[method](this[i]));
			}
		}
	});

	MUI.extend({
		scope : function (fn,c,args){
			fn.apply(c || fn,args ? args : null);
		},
		extension : function (sub,sup/*,subMethods*/){
			var F = function (){},
			    subMethods = arguments[2] || {};
			
			F.prototype = sup.prototype;
			sub.prototype = new F();
			sub.prototype.constructor = sub;
			sub.superClass = sup.prototype;
			
			if(sup.prototype.constructor == Object.prototype.constructor){
				sup.prototype.constructor = sup;
			}

			//为子类添加额外的方法 
			for(var i in subMethods){
				if(!sub.prototype[i]){
					sub.prototype[i] = subMethods[i];
				}
			}
		},
		clone : function (obj){
			if(obj instanceof Function || obj instanceof String){
				throw('argument must be literal object.');
			}
			
			function F(){}
			F.prototype = obj;
			
			return new F();
		},
		augment : function (reveivingClass,givingClass){
			//如果提供了白名单，那么仅扩充白名单中的方法
			if(arguments[2]){
				for(var i=2,l = arguments.length;i<l;i++){
					reveivingClass.prototype[arguments[i]] = givingClass.prototype[arguments[i]];
				}
			}else{
			//将所有的方法扩充到接受类中	
				for(var method in givingClass.prototype){
					if(givingClass.prototype[method]){
						reveivingClass.prototype[method] = givingClass.prototype[method];
					}
				}
			}
		}
	});
	/**
	 * MUI的ajax方法
	 * @param (String) uri 请求的地址
	 * @param (Object) cfg 当前请求所需的参数
	 */
	MUI.extend({
		AJAX : function (uri,cfg){
			var obj = cfg ? cfg : {},
			    xhr = new XMLHttpRequest(),
				method = obj.method || 'GET',
				async = obj.async || true,
				data = obj.data || null,
				args = obj.args || null,
				context = obj.context,
				success = obj.on.success,
				failure = obj.on.failure,
				complete = obj.on.complete,
				start = obj.on.start,
				timeout = obj.timeout,
				headers = obj.headers || [{name:'Content-Type',value:'application/x-www-form-urlencoded;charset=UTF-8'}],
				i=0,
				timer;
				
			/*如果用户使用了GET方法，但是忘记了将查询参数追加到URI或者用户少写了?或者URI中带有?，
			  但是用户忘记了将参数追加到?后面，MUI都将自动帮助用户将参数追加到URI，以保证GET方法的正常请求*/
			if(
			    (/get/i.test(method) && !/\?/gi.test(uri)) 
			    || 
			    (/\?/gi.test(uri) && !uri.split(/\?/gi)[1])){
				  uri = uri+(/\?/gi.test(uri) ? '' : '?')+data;
			}
			if(/\?\w+/i.test(uri)){
				uri+="&";
			}
			
			xhr.open(method,uri,async);
			
			//设置请求头
			if(headers){
				for(;i<headers.length;i++){
					xhr.setRequestHeader(headers[i].name,headers[i].value);
				}
			}
			
			var fn = function (){
				if(xhr.readyState === 2 && start || xhr.readyState === 1){
					MUI.scope(start,context ? context : start,[xhr,args]);
				}
				
				if(xhr.readyState === 4 && xhr.status >= 200 && xhr.status <= 300 && success || xhr.status === 304){
					if(timer){
						clearTimeout(timer);
					}
					
					MUI.scope(success,context ? context : success,[xhr,args]);
				}
				
				if(xhr.readyState != 4 && xhr.status != 200 && xhr.readyState === 2 && failure){
					if(timer){
						clearTimeout(timer);
					}
					
					MUI.scope(failure,context ? context : failure,[xhr,args]);
				}
				
				if(xhr.readyState === 4 && complete){
					if(timer){
						clearTimeout(timer);
					}
					
					if(xhr.status === 0 || !xhr.status){
						MUI.scope(failure,context ? context : failure,[xhr,args]);
					}
					
					MUI.scope(complete,context ? context : complete,[xhr,args]);
				}
			};
			
			if(timeout){
				timer = setTimeout(function (){
					xhr.abort();
					MUI.scope(failure,context ? context : failure,[xhr,args]);
				},timeout);
			}
			
			//如果允许异步
			if(async){
				xhr.onreadystatechange = fn;
			}
			
			xhr.send(data || null);
			
			return this;
		}
	});

	MUI.extend({
		JSON : {
			parse : function (s){
				this.JSON = JSON;
				
				return this.JSON.parse(s);
			},
			stringify : function (o){
				if(!this.JSON){
					this.JSON = JSON;
				}
				
				return this.JSON.stringify(o);
			}
		}
	});

	window.MUI = window.M = MUI;
	
	
	/*
    json.js
    2011-01-18

    Public Domain

    No warranty expressed or implied. Use at your own risk.

    This file has been superceded by http://www.JSON.org/json2.js

    See http://www.JSON.org/js.html

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.

    This file adds these methods to JavaScript:

        object.toJSONString(whitelist)
            This method produce a JSON text from a JavaScript value.
            It must not contain any cyclical references. Illegal values
            will be excluded.

            The default conversion for dates is to an ISO string. You can
            add a toJSONString method to any date object to get a different
            representation.

            The object and array methods can take an optional whitelist
            argument. A whitelist is an array of strings. If it is provided,
            keys in objects not found in the whitelist are excluded.

        string.parseJSON(filter)
            This method parses a JSON text to produce an object or
            array. It can throw a SyntaxError exception.

            The optional filter parameter is a function which can filter and
            transform the results. It receives each of the keys and values, and
            its return value is used instead of the original value. If it
            returns what it received, then structure is not modified. If it
            returns undefined then the member is deleted.

            Example:

            // Parse the text. If a key contains the string 'date' then
            // convert the value to a date.

            myData = text.parseJSON(function (key, value) {
                return key.indexOf('date') >= 0 ? new Date(value) : value;
            });

    This file will break programs with improper for..in loops. See
    http://yuiblog.com/blog/2006/09/26/for-in-intrigue/

    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the object holding the key.

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, parseJSON, prototype, push, replace, slice,
    stringify, test, toJSON, toJSONString, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.


if (!JSON) {
    JSON = {};
}

//(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }

// Augment the basic prototypes if they have not already been augmented.
// These forms are obsolete. It is recommended that JSON.stringify and
// JSON.parse be used instead.

    /*if (!Object.prototype.toJSONString) {
        Object.prototype.toJSONString = function (filter) {
            return JSON.stringify(this, filter);
        };
        Object.prototype.parseJSON = function (filter) {
            return JSON.parse(this, filter);
        };
    }*/
//}());
window.JSON = window.JSON || JSON;
})();


