var EventEmitter = require("events");
EventEmitter = EventEmitter.EventEmitter;

module.exports = function Tag(type,cls,content){
    if(typeof type == "string"){
        var tag = document.createElement(type);
		if(cls){
			if(cls[0] == "#"){
				var classes = cls.split(" ");
				tag.setAttribute("id",classes.splice(0,1));
				tag.className = classes.join(" ");
			}else{
				tag.className = cls;
			}
		}
		if(content){
			if(typeof content == "string"){
				tag.innerHTML = content;
			}else{
				for(var i = 2; i < arguments.length; i++){
					tag.appendChild.call(tag,arguments[i]);
				}
			}
		}
	}else{
		tag = type;
	}
    

	if(!tag.setId){
    
		tag.setId = function(id){  
			tag.setAttribute("id",id);
		}
		tag.getId = function(id){
			return tag.getAttribute("id");
		}
		
		tag.addClass = function(cls){
			var classes = tag.className.split(" ");
			for(var i = 0; i < classes.length; i++){
				if(classes[i] == cls){
					return;
				}
			}
			classes.push(cls);
			tag.className = classes.join(" ");
		}
		tag.removeClass = function(cls){
			var classes = tag.className.split(" ");
			for(var i = 0; i < classes.length; i++){
				if(classes[i] == cls){
					classes.splice(i,1);
				}
			}
			tag.className = classes.join(" ");
		}
		tag.hasClass = function(cls){
			var classes = tag.className.split(" ");
			for(var i = 0; i < classes.length; i++){
				if(classes[i] == cls){
					return true;
				}
			}
			return false;
		}
		tag.toggleClass = function(cls){
			(tag.hasClass(cls)?tag.removeClass:tag.addClass)(cls);			
		}
		tag.swapClass = function(before,after){
			tag.removeClass(before);
			tag.addClass(after);
		}
		
		tag.getIndex = function(){
			return Array.prototype.slice.call(tag.parentNode.childNodes).indexOf(tag);
		}
		tag.setIndex = function(i){
			try{
				var p = tag.parentNode;
				p.removeChild(tag);
				if(p.childNodes.length <= i-1){
					p.appendChild(tag);
				}else{
					p.insertBefore(tag,p.childNodes[i]);
				}
			}catch(e){}
		}
		tag.setVisible = function(v){
			tag.style.display = v?"":"none";
		}
		tag.isVisible = function(){
			return tag.style.display != "none";		
		}
		tag.contains = function(c,r,p){
			p = p?p:tag;
			var childs = p.childNodes;
			for(var i = 0; i < childs.length; i++){
				if(childs[i] == c ||(r&&tag.contains(c,r,childs[i]))){
					return true;
				}
			}
		}
		tag.isIn = function(p){
			var t = tag;
			while(t.parentNode){
				if(t.parentNode == p){
					return true;
				}else{
					t = t.parentNode;
				}
			}
			return false;
		}
		tag.getX = function(absolute){
			var x = 0;
			var current = tag;
			while(true){
				x += current.offsetLeft;
				if(current.offsetParent && absolute){
					current = current.offsetParent;
				}else{
					break;
				}
			}
			return x;
		}
		tag.getY = function(absolute){
			var y = 0;
			var current = tag;
			while(true){
				y += current.offsetTop;
				if(current.offsetParent && absolute){
					current = current.offsetParent;
				}else{
					break;
				}
			}
			return y;
		}


		tag.css = function(css){
		    for(var property in css){
		        tag.style[property] = css[property];
		    }
		    return tag;
		}





		var eventemitter = new EventEmitter();
        
        for(var a in eventemitter){
            tag[a] = eventemitter[a];
        }
        

	    var listenertable = {};
	    var listenerfuncs = {};   
		
	    function isDomEvent(e){
		    switch(e){
			    case "click":
			    case "dblclick":
			    case "mousedown":
			    case "mouseup":
			    case "mousemove":
			    case "mouseout":
			    case "mouseover":
			    case "mousewheel":
			    case "keydown":
			    case "keyup":
			    case "focus":
			    case "blur":
			    case "change":
			    case "dragstart":
			    case "dragleave":
			    case "dragover":
			    case "dragenter":
			    case "drop":
			    case "dragend":
			    case "drag":
			    case "load":
			    case "contextmenu":
		        case "scroll":
                case "error":
				    return true;
		    }
		    return false;
	    }
        
        tag._on = tag.on;
	    tag.on = function(e,listener){
            tag._on(e,listener);
		    if(isDomEvent(e)){
			    if(!listenertable[e]){
				    listenertable[e] = [];			    
				    listenerfuncs[e] = function(ev){
					    if (!ev){
						    ev = window.event;
					    }
					    if(!ev.target){
					        ev.target = ev.srcElement;
					    }

					    if(ev.relatedTarget){
					        ev.toElement = ev.relatedTarget;
					    }

						if(!ev.preventDefault){
							ev.preventDefault = function(){
								ev.returnValue = false;
							}
						}
                        
					    tag.emit(e,ev);
				    }
					if(tag.addEventListener){
						tag.addEventListener(e,listenerfuncs[e],false);
					}else if(tag.attachEvent){
						tag.attachEvent("on"+e,listenerfuncs[e]);
					}
			    }
                listenertable[e].push(listener);
		    }
	    }
        tag.addListener = tag.on;
        
        
        tag.once = function(e,listener){
            tag.on(e,listener);
            eventemitter.once(e,function(){
                tag.off(e,listener);
            });
        }
        
        
        tag._off = eventemitter.removeListener;
	    tag.off = function(e,listener){
            tag._off(e,listener);
		    if(isDomEvent(e)&& listenertable[e]){
			    listenertable[e].splice(listenertable[e].indexOf(listener),1);
			    if(!listenertable[e].length){
				    delete listenertable[e];
					if(tag.removeEventListener){
						tag.removeEventListener(e,listenerfuncs[e],false);
					}else if(tag.detachEvent){
						tag.detachEvent("on"+e,listenerfuncs[e]);
					}
			    }                      
		    }
	    }
        
        
        tag.removeListener = tag.off;
        tag._removeAllListeners = eventemitter.removeAllListeners;
        tag.removeAllListeners = function(e){
            var events = [];
            if(e){
                events.push(e);   
            }else{
                for(var ev in listenertable){
                    events.push(ev);
                }
            }
            
            for(var i = 0; i< events.length; i++){
                while(listenertable[events[i]]){
                    tag.off(events[i],listenertable[events[i]][0]);
                }
            }
            tag._removeAllListeners(e);            
        }
    }

	return tag;
}