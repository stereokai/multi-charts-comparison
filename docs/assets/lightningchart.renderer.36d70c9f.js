import{g as E,c as p,u as _,a as z,G as T,b as R}from"./echarts.renderer.414dafa2.js";import{l as a,a as D}from"./vendor.cdc82bdf.js";function j(l=new Date){return l.setDate(l.getDate()-1),l.setHours(22)}const I=l=>class S extends l{static CHART_LEFT_PADDING=100;get CHART_LEFT_PADDING(){return S.CHART_LEFT_PADDING}static Y_AXIS_WIDTH=60;get Y_AXIS_WIDTH(){return S.Y_AXIS_WIDTH}static addChannel(e,t,s,i,n=!1){const r=e.createChartXY({columnIndex:0,rowIndex:s,columnSpan:1,rowSpan:1,disableAnimations:!0}).setTitle("").setPadding({left:S.CHART_LEFT_PADDING,top:0,bottom:0}).setBackgroundStrokeStyle(a.emptyLine).setMouseInteractions(!1).setMouseInteractionPan(!0).setSeriesBackgroundFillStyle(new a.SolidFill({color:a.ColorCSS("white")})),o=r.getDefaultAxisX().setMouseInteractions(!1).setTickStrategy(a.AxisTickStrategies.Empty,c=>console.log(c)).setStrokeStyle(a.emptyLine),d=E(t),h=r.getDefaultAxisY().setMouseInteractions(!1).setChartInteractions(!1).setStrokeStyle(a.emptyLine).setTitle(t.name).setInterval(d.min,d.max).setTitleFont(new a.FontSettings({size:12})).setTitleFillStyle(new a.SolidFill({color:a.ColorHEX("#6e7079")})).setTitleRotation(0).setThickness(S.Y_AXIS_WIDTH).setAnimationZoom(void 0).setTickStrategy(a.AxisTickStrategies.Numeric,c=>c.setMajorTickStyle(u=>u.setLabelFillStyle(new a.SolidFill({color:a.ColorHEX("#6e7079")})).setLabelFont(new a.FontSettings({size:6})).setTickStyle(a.emptyLine)).setMinorTickStyle(u=>u.setLabelFont(new a.FontSettings({size:6})).setTickStyle(a.emptyLine)));t.dynamicYAxis||h.setScrollStrategy(void 0);let g;return n||(g=S.addLineSeries(r,typeof i=="number"?i:s)),r.setAutoCursorMode(a.AutoCursorModes.disabled),{chart:r,series:g,xAxis:o,yAxis:h,row:s}}static addLineSeries(e,t=0){return e.addLineSeries({dataPattern:{pattern:"ProgressiveX",regularProgressiveStep:!0,allowDataGrouping:!0},automaticColorIndex:t}).setStrokeStyle(s=>s.setThickness(-1))}addChannel(e,t,s,i){window.graphs=this.graphs;const n=S.addChannel(this.dashboard,e,t,s,i),{chart:r,series:o,xAxis:d,yAxis:h,row:g}=n;return r.onSeriesBackgroundMouseClick((c,u)=>{const m=o.solveNearestFromScreen(c.engine.clientLocation2Engine(u.clientX,u.clientY)),P=parseFloat(m.resultTableContent[1][1]),F=parseFloat(m.resultTableContent[2][1]);this.addEvent({x:P,y:F},t),this.markers.forEach(V=>{V.setResultTableVisibility(a.UIVisibilityModes.never)})}),n}addLineSeries(e,t){return S.addLineSeries(e,t)}};var K=Object.freeze(Object.defineProperty({__proto__:null,default:I},Symbol.toStringTag,{value:"Module"})),k=`<svg id="areazoom-svg" style="position: absolute; z-index: 10000; width: 100%; height: 100%; pointer-events: none;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <!-- <rect id="resize" fill="red" x="190" y="160" width="20" height="20" /> -->
  <rect id="areazoom-rect" fill="rgba(50, 50, 50, 0.5)" />
</svg>`;let f,b;function A(l){l.insertAdjacentHTML("beforeend",k),f=document.getElementById("areazoom-rect")}function w(l){f.setAttribute("height",l)}function C(l){b=l,f.setAttribute("x",l)}function G(l){l>b?f.setAttribute("width",l-b):(f.setAttribute("width",b-l),f.setAttribute("x",l))}function M(){const l=f.getAttribute("x"),y=f.getAttribute("width");return f.setAttribute("width",0),{x:l|0,width:y|0}}var Q=Object.freeze(Object.defineProperty({__proto__:null,svg:k,init:A,setHeight:w,setPosition:C,move:G,hide:M},Symbol.toStringTag,{value:"Module"})),ee=Object.freeze(Object.defineProperty({__proto__:null,svg:k,init:A,setHeight:w,setPosition:C,move:G,hide:M},Symbol.toStringTag,{value:"Module"}));D.init();const L=l=>class x extends l{static visibleGridStyle=new a.SolidLine({thickness:1,fillStyle:new a.SolidFill({color:a.ColorCSS("#dfdfdf")})});static hiddenGridStyle=a.emptyLine;static getNewDashboard(e,t){return a.lightningChart({overrideInteractionMouseButtons:{chartXYPanMouseButton:0,chartXYRectangleZoomFitMouseButton:2}}).Dashboard({container:e,numberOfColumns:1,numberOfRows:t,theme:a.Themes.lightNew}).setBackgroundFillStyle(new a.SolidFill({color:a.ColorCSS("white")})).setSplitterStyle(a.emptyLine).setSplitterStyleHighlight(a.emptyLine)}get maxVisibleCharts(){return super.maxVisibleCharts*2+1}get mainGraph(){return this.graphGroup||super.mainGraph}get dashboardLeftOffset(){return this.CHART_LEFT_PADDING+this.Y_AXIS_WIDTH}constructor(...e){super(...e);this.pinnedGraphs=[],this.markers=[]}newDashboard(e,t=this.maxVisibleCharts){this.dashboard=x.getNewDashboard(e,t),A(e)}updateDashboardRowHeights(){const{dashboard:e,graphs:t,pinnedGraphs:s,mainGraph:i,maxVisibleCharts:n}=this,r=t.map((c,u)=>u).filter(c=>!p[c].isHidden);i.isGroup&&r.push(i.graphIndex);const o=s.map(c=>c.pinnedIndex),d=r.concat(o),h=i.xAxis.getHeight(),g=(e.engine.container.clientHeight-h)/d.length;for(let c=0;c<n;c++)d.includes(c)?e.setRowHeight(c,Math.round(g)):e.setRowHeight(c,1e-5);e.setRowHeight(i.row,Math.round(g+h)),window.dashboard=e,w(r.length*g)}setXAxisStyle(){this.graphs.forEach((e,t)=>{e.xAxis.setTickStrategy(a.AxisTickStrategies.Empty)}),this.mainGraph.xAxis.setTickStrategy(a.AxisTickStrategies.DateTime,e=>e.setDateOrigin(new Date(j())).setMajorTickStyle(t=>t.setGridStrokeStyle(a.emptyLine).setTickStyle(a.emptyLine)).setMinorTickStyle(t=>t.setGridStrokeStyle(a.emptyLine).setTickStyle(a.emptyLine)))}syncXAxesZoom(){this.axisSyncHandle&&this.axisSyncHandle.remove();const e=this.graphs.map(t=>t.xAxis);this.mainGraph.isGroup&&e.push(this.mainGraph.xAxis),this.axisSyncHandle=a.synchronizeAxisIntervals(...e)}resetView(){const{mainGraph:e,minX:t,maxX:s}=this;e.xAxis.setInterval(t,s,!1,!0)}toggleGrid(e){this.graphs.forEach(t=>{const s=t.yAxis.getTickStrategy();t.yAxis.setTickStrategy(s,i=>i.setMajorTickStyle(n=>n.setGridStrokeStyle(e?x.visibleGridStyle:x.hiddenGridStyle)))})}toggleChannelVisibility(e,t=!1){const s=this.graphs[e];p[e].isHidden?(s.series.dispose(),s.yAxis.dispose()):(s.series.restore(),s.yAxis.restore()),t||this.updateDashboardRowHeights()}toggleChannelSticky(e,t=!1,s=NaN){const{pinnedGraphs:i,graphs:n}=this,r=n[e],o=p[e];if(o.isSticky){const d=isNaN(s)?i.length&&i[i.length-1].pinnedIndex-1||this.maxVisibleCharts-1:s,h=this.addChannel(o,d,e);h.pinnedIndex=d,i.push(h),h.series.add(r.series.kc[0].La),o.pinnedGraph=h}else{if(!o.pinnedGraph)return;const d=o.pinnedGraph;o.pinnedGraph=null,i.splice(i.indexOf(d),1).forEach(h=>{h.chart.dispose();for(let g in h)h[g]=null})}t||this.updateDashboardRowHeights()}addGraphGroup(){const e=Math.floor(this.maxVisibleCharts/2),t=this.addChannel({name:"Channel Group"},e,null,!0);this.graphGroup=t,t.isGroup=!0,t.graphIndex=e,t.series={},t.repositionYAxis=function(){const{yAxis:i}=this;i.setInterval(...Object.values(this.series).reduce((n,r)=>(n[0]=Math.min(n[0],r.__bounds.min),n[1]=Math.max(n[1],r.__bounds.max),n),[1/0,-1/0]),!1,!0)}.bind(t)}toggleChannelGrouped(e,t=!1){const s=p[e];if(s.isGrouped){this.mainGraph.isGroup||this.addGraphGroup();const{graphs:i,mainGraph:n}=this,r=i[e],o=this.addLineSeries(n.chart,e);o.__bounds=E(s),n.series[e]=o,n.repositionYAxis(),o.add(r.series.kc[0].La)}else{if(!this.mainGraph.isGroup)return;const{mainGraph:i}=this,n=i.series[e];if(!n)return;if(n.dispose(),i.series[e]=null,delete i.series[e],Object.keys(i.series).length===0){i.chart.dispose();for(let r in i)i[r]=null;this.graphGroup=null}else i.repositionYAxis()}t||(this.setXAxisStyle(),this.syncXAxesZoom(),requestAnimationFrame(()=>{this.updateDashboardRowHeights()}))}newMontage(){return p.map((e,t)=>({channelIndex:t,isHidden:e.isHidden,isSticky:e.isSticky,isGrouped:e.isGrouped,pinnedGraphIndex:e.pinnedGraph&&e.pinnedGraph.pinnedIndex}))}loadMontage(e){if(this.pinnedGraphs.splice(0).forEach(t=>{t.chart.dispose();for(let s in t)t[s]=null}),this.mainGraph.isGroup){this.graphGroup.chart.dispose();for(let t in this.mainGraph)this.mainGraph[t]=null;this.graphGroup=null}e.forEach((t,s)=>{p[s].isHidden=t.isHidden,p[s].isSticky=t.isSticky,p[s].isGrouped=t.isGrouped,this.toggleChannelVisibility(s,!0),this.toggleChannelSticky(s,!0,t.pinnedGraphIndex),this.toggleChannelGrouped(s)}),this.updateDashboardRowHeights()}panLeft(){const{xAxis:e,series:t}=this.mainGraph,{minX:s}=this,{start:i,end:n}=e.getInterval(),r=t.scale.x.getPixelSize();let o=(i-n)/4;i+o<s&&(o=s-i),e.pan(o/r)}panRight(){const{xAxis:e,series:t}=this.mainGraph,{maxX:s}=this,{start:i,end:n}=e.getInterval(),r=t.scale.x.getPixelSize();let o=(n-i)/4;n+o>s&&(o=s-n),e.pan(o/r)}addEvent(e,t){if(!_.extraFeatures.events)return;const s=this.graphs[t],{chart:i,series:n}=s,r=i.addChartMarkerXY(void 0,i.getDefaultAxisX(),i.getDefaultAxisY()).setPosition({x:e.x,y:e.y});this.markers.push(r),r.getPointMarker().setFillStyle(new a.SolidFill({color:a.ColorHEX("#0075ff")})).onMouseClick(()=>{this.markers.forEach(h=>{h.setResultTableVisibility(a.UIVisibilityModes.never)}),r.setResultTableVisibility(a.UIVisibilityModes.always)}),r.getResultTable().onMouseClick(()=>{D.show("modal-1",{onShow:(h,g,c)=>{h.querySelector("textarea").value=r.__content.reduce((u,m)=>u+m.join(" ")+`
`,"")},onClose:(h,g,c)=>{if(c.target.hasAttribute("ok")){r.__content=h.querySelector("textarea").value.trim().split(`
`).map(u=>[u]),r.setResultTable(u=>u.setContent(r.__content));return}if(c.target.hasAttribute("remove")){r.setResultTableVisibility(a.UIVisibilityModes.never),r.dispose(),this.markers.splice(this.markers.indexOf(r),1);return}}})}),r.__content=[["Custom event"],["Number",this.markers.length.toString()]],r.setResultTableVisibility(a.UIVisibilityModes.never).setResultTable(h=>h.setContent(r.__content)).setDraggingMode(a.UIDraggingModes.notDraggable).setGridStrokeXVisibility(a.UIVisibilityModes.whenDragged).setGridStrokeYVisibility(a.UIVisibilityModes.whenDragged).setTickMarkerXVisibility(a.UIVisibilityModes.whenDragged).setTickMarkerYVisibility(a.UIVisibilityModes.whenDragged)}};var te=Object.freeze(Object.defineProperty({__proto__:null,default:L},Symbol.toStringTag,{value:"Module"}));const H=l=>class extends l{constructor(...e){super(...e);this.lastEvent=null,this.hasInitialized=!1,this.graphEvents=z()}markEvent(){this.lastEvent={timestamp:performance.now()}}registerZoomEvents(e){e.chart.onSeriesBackgroundMouseWheel((t,s)=>{let{deltaY:i}=s;const{xAxis:n,yAxis:r}=e,{start:o,end:d}=n.getInterval();i=-i;const h=this.getNewInterval(o,d,i);n.setInterval(h.start,h.end,!1,!0)})}getNewInterval(e,t,s,i=1e4){if(i<1e3)return!1;const{minX:n,maxX:r}=this,o=Math.min(r,Math.max(n,e+s*i)),d=Math.max(n,Math.min(r,t-s*i));return o*2>r?this.getNewInterval(e,t,s,i/2):{start:o,end:d}}reportRenderEvent(){requestAnimationFrame(()=>{const e=(performance.now()-this.lastEvent.timestamp)/1e3;this.hasInitialized?this.graphEvents.render({duration:e,type:T.render}):(this.hasInitialized=!0,this.graphEvents.init({duration:e,type:T.init})),this.lastEvent=null})}toggleAreaZoom(e){e?this.graphs.forEach(t=>{const{chart:s}=t;s.setMouseInteractionPan(!1),t.chartEvents={offSeriesBackgroundMouseDragStart:s.onSeriesBackgroundMouseDragStart((i,n,r)=>{r===0&&C(n.offsetX)}),offSeriesBackgroundMouseDrag:s.onSeriesBackgroundMouseDrag((i,n,r)=>{r===0&&G(n.offsetX)}),offSeriesBackgroundMouseDragStop:s.onSeriesBackgroundMouseDragStop((i,n,r)=>{if(r!==0)return;const o=M(),d=i.getSeries()[0].scale.x.getPixelSize(),g=this.mainGraph.xAxis.getInterval().start/d-this.dashboardLeftOffset;this.mainGraph.xAxis.setInterval((g+o.x)*d,(g+o.x+o.width)*d,!1,!0)})}}):this.graphs.forEach(t=>{const{chart:s}=t;for(const[i,n]of Object.entries(t.chartEvents))s[i](n),t.chartEvents[i]=null;s.setMouseInteractionPan(!0)})}};var se=Object.freeze(Object.defineProperty({__proto__:null,default:H},Symbol.toStringTag,{value:"Module"}));class X{get minX(){return this.timeSeries[0]}get maxX(){return this.timeSeries[this.timeSeries.length-1]}get mainGraph(){return this.graphs[this.graphs.length-1]}get maxVisibleCharts(){return _.channels.max}constructor(){this.graphs=[]}init(y){this.markEvent(),this.newDashboard(y),y.addEventListener("wheel",e=>{e.preventDefault()},{passive:!1})}update(y=[],e){this.hasInitialized&&this.markEvent(),e&&(this.timeSeries=e);const{graphs:t}=this,s=t.length;this.hasChannelsChanged=!1,y.forEach((i,n)=>{let r=t[n],o=n;p.length!==s&&(this.hasChannelsChanged=!0,o=s+n,t.push(this.addChannel(p[o],o)),r=t[o],this.registerZoomEvents(r)),r.series.clear(),r.series.addArraysXY(e,i.data)}),t.splice(p.length,t.length-p.length).forEach(i=>{this.hasChannelsChanged=!0,i.chart.dispose();for(let n in i)i[n]=null}),this.afterUpdate()}afterUpdate(){(!this.hasInitialized||this.hasChannelsChanged)&&(this.setXAxisStyle(),this.syncXAxesZoom()),requestAnimationFrame(()=>{(!this.hasInitialized||this.hasChannelsChanged)&&this.updateDashboardRowHeights(),this.resetView(),this.reportRenderEvent()})}}var re=Object.freeze(Object.defineProperty({__proto__:null,default:X},Symbol.toStringTag,{value:"Module"}));class O extends L(I(H(X))){}const v=new O,Y=0,N=v.graphEvents;function B(...l){v.init(...l)}function U(...l){v.update(...l)}function Z(){}function W(){}const q=new Proxy(v,R);var ne=Object.freeze(Object.defineProperty({__proto__:null,baseDate:Y,graphEvents:N,init:B,update:U,showLoading:Z,hideLoading:W,api:q},Symbol.toStringTag,{value:"Module"}));export{Q as A,ne as L,te as a,se as b,re as c,j as g,ee as i,K as l};
