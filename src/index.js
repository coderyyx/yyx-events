import {isFunction,isNumber,isObject,isUndefined} from './checkTypes/check.js';

function EventEmitter() {
  this._events = this._events || new Map();

  this._maxListeners = this._maxListeners || undefined;
}


//此处保留兼容旧业务代码

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;


EventEmitter.prototype._events = undefined;

EventEmitter.prototype._maxListeners = undefined;


// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.

EventEmitter.defaultMaxListeners = 10;


// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.

// 可设置监听事件上限

EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};


//触发一个监听的事件
EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  //初始化已做容错处理
  // if (!this._events)
  //   this._events = {};

  //对于error 类型的事件抛异常
  if (type === 'error') {
    if (!this._events.has('error') ||
        (isObject(this._events.get('error')) && !this._events.get('error').length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  //
  handler = this._events.get(type);//[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      /*
          call调用传入this在某种情况下并没有什么用
          当监听函数 通过bind指定this指向时，this的值已经固定，函数内部保留this值&arguements&目标函数
          若bind传参，call后此参数会并入call的参数。
      */
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = new Map();

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.has('newListener'))
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);
  /*
  *新增事件监听
  1、不存在的类型 直接保存监听函数的引用
  2、新增监听函数数组
  3、新增同类型第二个事件监听函数 
  *
  */
  if (!this._events.has(type))
    this._events.set(type,listener);//维护内部的Object
  else if (isObject(this._events.get(type)))
    this._events.get(type).push(listener);
  else
    // 新增同类型第二个事件监听函数 使这一类监听函数成为监听数组
    this._events.set(type,[this._events.get(type), listener]);
  // Check for listener leak
  if (isObject(this._events.get(type)) && !this._events.get(type).warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    //事件监听函数超过最大值 警告 可通过提升最大值解决
    if (m && m > 0 && this._events.get(type).length > m) {
      this._events.get(type).warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events.get(type).length);
      
    }
  }

  return this;
};

//增加事件监听
EventEmitter.prototype.on = EventEmitter.prototype.addListener;


//一次性事件监听   监听响应完毕直接移除
EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  //闭包 函数执行上下文保存对listener和fired的引用
  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};


//修复移除事件监听器的寄存bugs 重写
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events.has(type))
    return this;

  list = this._events.get(type);
  length = list.length;
  position = -1;

  //原来有问题的地方
  //在调用bind的时候引用有问题， 不是全等
  //list === listener or this._events[type]
  //调整为传入的类型，在事件对象中有维护即可删除事件监听
  if (isFunction(list) || isObject(list) || (isFunction(list.listener) && list.listener === listener)) {
    this._events.delete(type);
    if (this._events.has('removeListener'))
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      this._events.delete(type);
    } else {
      list.splice(position, 1);
    }

    if (this._events.has('removeListener'))
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.has('removeListener')) {
    if (arguments.length === 0)
      this._events = new Map();
    else if (this._events.has(type))
      this._events.delete(type);
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (let [key, value] of this._events.entries()) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = new Map();
    return this;
  }

  listeners = this._events.get(type);

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  this._events.delete(type);

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events.has(type))
    ret = [];
  else if (isFunction(this._events.get(type)))
    ret = [this._events.get(type)];
  else
    ret = this._events.get(type).slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events.get(type);

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

module.exports = EventEmitter;

