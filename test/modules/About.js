import React from 'react';
var Events =require('../../src/index.js');
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
