# yyx-event
在使用Flux库的时候遇到其中融合的events库出现问题，导致监听的事件删除不掉，监听事件存在重复调用的情况下，自行基于events开发事件库
替换flux框架中的相关事件库
___________________________________________

In the use of Flux library encountered in the fusion of the events library problems, leading to the incident can not be deleted eavesdropping, there are two occasions to monitor the event call, based on the event development event library
Replaces the related event library in the flux framework

[![travis][travis-image]][travis-url]
[![dep][dep-image]][dep-url]
[![npm][npm-image]][npm-url]
[![downloads][downloads-image]][downloads-url]

[travis-image]: https://img.shields.io/travis/then/yyx-event.svg?style=flat
[travis-url]: https://travis-ci.org/then/yyx-event
[dep-image]: https://img.shields.io/david/then/yyx-event.svg?style=flat
[dep-url]: https://david-dm.org/then/yyx-event
[npm-image]: https://img.shields.io/npm/v/yyx-event.svg?style=flat
[npm-url]: https://npmjs.org/package/yyx-event
[downloads-image]: https://img.shields.io/npm/dm/yyx-event.svg?style=flat
[downloads-url]: https://npmjs.org/package/yyx-event

##install:
<code>npm install yyx-event</code>

## Tips

___________________________________________
## Usage yyx-event

```javascript
var EventEmitter = require('yyx-event');
var event = new EventEmitter();


//监听事件回调
//Monitor event callbacks
let listenFun = function(){};


//监听
//listenging 
event.addListener('listen',listenFun);

//触发监听事件
//trigger listening event
event.emit('listen');


//卸载事件监听
//remove listening event
event.removeListener('listen',listenFun);

//设置最大监听事件数量
//set the maximum number of listening events
event.setMaxListeners(maxNumbers);

```
___________________________________________

