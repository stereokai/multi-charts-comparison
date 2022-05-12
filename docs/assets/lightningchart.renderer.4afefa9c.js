import{g as v,c as r,G as x}from"./echarts.renderer.f3f0968d.js";import{l as t}from"./vendor.285b38b1.js";function A(e=new Date){return e.setDate(e.getDate()-1),e.setHours(22)}const w={channels:{label:"Channels",min:10,max:25,value:10},period:{label:"Sleep period (h)",min:8,max:14,value:8},samples:{label:"Samples per second",min:1,max:100,value:1},total:{label:"Total samples"},lastEvent:{label:"Last event"}};let s=[],c,g,d,f;const E=0,m=()=>s[s.length-1];let p=null,y=!1;const S=v();function L(...e){S.on(...e)}const b=()=>{const e=m().xAxis.getHeight(),i=(c.engine.container.clientHeight-e)/s.length;for(let n=0;n<w.channels.max;n++)n<s.length?c.setRowHeight(n,Math.round(i)):c.setRowHeight(n,1e-5);c.setRowHeight(m().row,Math.round(i+e))};function F(e){p={timestamp:performance.now()},c=t.lightningChart({overrideInteractionMouseButtons:{chartXYPanMouseButton:0,chartXYRectangleZoomFitMouseButton:2}}).Dashboard({container:e,numberOfColumns:1,numberOfRows:w.channels.max,theme:t.Themes.lightNew}).setBackgroundFillStyle(new t.SolidFill({color:t.ColorCSS("white")})).setSplitterStyle(t.emptyLine).setSplitterStyleHighlight(t.emptyLine),s=r.map((i,n)=>T(c,i,n)),M(e)}function C(e=[],i){y&&(p={timestamp:performance.now()});const n=s.length;e.forEach((o,a)=>{let h=s[a],l=a;r.length!==n&&(l=n+a,s.push(T(c,r[l],l)),h=s[l]),h.series.clear(),h.series.addArraysXY(i,o.data),r[l].min=o.min,r[l].max=o.max}),s.splice(r.length,s.length-r.length).forEach(o=>{o.chart.dispose();for(let a in o)o[a]=null}),i&&H(i),f&&f.remove(),f=t.synchronizeAxisIntervals(...s.map(o=>o.xAxis)),m().xAxis.setInterval(g,d,!1,!0),requestAnimationFrame(b),I(),window.dashboard=c,window.graphs=s}function H(e){s.forEach((i,n)=>{i.xAxis.setTickStrategy(t.AxisTickStrategies.Empty)}),m().xAxis.setTickStrategy(t.AxisTickStrategies.DateTime,i=>i.setDateOrigin(new Date(A())).setMajorTickStyle(n=>n.setGridStrokeStyle(t.emptyLine)).setMinorTickStyle(n=>n.setGridStrokeStyle(t.emptyLine))),e&&(g=e[0],d=e[e.length-1])}function T(e,i,n){const o=e.createChartXY({columnIndex:0,rowIndex:n,columnSpan:1,rowSpan:1,disableAnimations:!0}).setTitle("").setPadding({left:100,top:0,bottom:0}).setBackgroundStrokeStyle(t.emptyLine).setSeriesBackgroundFillStyle(new t.SolidFill({color:t.ColorCSS("white")})),a=o.getDefaultAxisX().setTickStrategy(t.AxisTickStrategies.Empty,u=>console.log(u)).setStrokeStyle(t.emptyLine),h=o.getDefaultAxisY().setMouseInteractions(!1).setChartInteractions(!1).setStrokeStyle(t.emptyLine).setTitle(i.name).setTitleFont(new t.FontSettings({size:12})).setTitleFillStyle(new t.SolidFill({color:t.ColorHEX("#6e7079")})).setTitleRotation(0).setThickness(60).setAnimationZoom(void 0).setTickStrategy(t.AxisTickStrategies.Numeric,u=>u.setMajorTickStyle(k=>k.setLabelFillStyle(new t.SolidFill({color:t.ColorHEX("#6e7079")})).setLabelFont(new t.FontSettings({size:8})).setTickStyle(!1))),l=o.addLineSeries({dataPattern:{pattern:"ProgressiveX",regularProgressiveStep:!0,allowDataGrouping:!0},automaticColorIndex:n}).setStrokeStyle(u=>u.setThickness(-1));return{chart:o,series:l,xAxis:a,yAxis:h,row:n}}function M(e){s[0].xAxis.onScaleChange((i,n)=>{(i<g||n>d)&&requestAnimationFrame(()=>{s.forEach(o=>o.chart.setMouseInteractionWheelZoom(!1)),m().xAxis.setInterval(g,d,!1,!0),setTimeout(()=>{s.forEach(o=>o.chart.setMouseInteractionWheelZoom(!0))},1e3)}),s.forEach((o,a)=>{o.yAxis.setInterval(r[a].min,r[a].max)})}),e.addEventListener("wheel",i=>{i.preventDefault()},{passive:!1})}function I(){requestAnimationFrame(()=>{const e=(performance.now()-p.timestamp)/1e3;y?S.render({duration:e,type:x.render}):(y=!0,S.init({duration:e,type:x.init})),p=null})}function D(){}function X(){}var G=Object.freeze(Object.defineProperty({__proto__:null,baseDate:E,graphEvents:S,on:L,init:F,update:C,showLoading:D,hideLoading:X},Symbol.toStringTag,{value:"Module"}));export{G as L,A as g,w as u};
