/*
  从Flux中抽出核心的事件处理模块
  用来处理层级较深组件间通信
  从应用来看效果不错

  但是随着系统越来越庞大，维护性日渐衰退，所以Flux必将被redux代替，但这种组件信息交互方式却不会变
*/

module.exports=require('./lib/bundle.js');