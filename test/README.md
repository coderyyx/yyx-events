# 依据路由测试事件监听卸载功能

```js
<App>       {/*  /          */}
  <Repos>   {/*  /repos     */}
    <Repo/> {/*  /repos/123 */}
  </Repos>
</App>
```

```js
import React from 'react';
var Events =require('../../index.js');
var event = new Events();

export default React.createClass({
  componentWillUnmount(){
    console.log('unmount');
    event.removeListener('onChange',this.onChange);
  },
  componentDidMount(){
    console.log('didmout');
    event.addListener('onChange',this.onChange);
  },
  onChange(){
    console.log(111111);
  },
  click(){
    event.emit('onChange');
  },
  render() {
    return <div>
      <button onClick={this.click}>click</button>
    </div>
  }
})
```


And our UI something like:

```
         +-------------------------------------+
         | Home Repos About                    | <- App
         +------+------------------------------+
         |      |                              |
Repos -> | repo |  Repo 1                      |
         |      |                              |
         | repo |  Boxes inside boxes          |
         |      |  inside boxes ...            | <- Repo
         | repo |                              |
         |      |                              |
         | repo |                              |
         |      |                              |
         +------+------------------------------+
```


