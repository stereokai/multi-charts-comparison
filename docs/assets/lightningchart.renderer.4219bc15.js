import{g as E,c,u as v,d as P,a as z,G as T,b as R}from"./echarts.renderer.fe6422c4.js";import{bp as n,bq as I}from"./vendor.0cc72c00.js";function V(l=new Date){return l.setDate(l.getDate()-1),l.setHours(22)}const L=l=>class f extends l{static CHART_LEFT_PADDING=100;get CHART_LEFT_PADDING(){return f.CHART_LEFT_PADDING}static Y_AXIS_WIDTH=60;get Y_AXIS_WIDTH(){return f.Y_AXIS_WIDTH}static CHART_GAP=10;get CHART_GAP(){return f.CHART_GAP}static addChannel(e,i,s,t,a=!1){const r=e.createChartXY({columnIndex:0,rowIndex:s,columnSpan:1,rowSpan:1,disableAnimations:!0}).setTitle("").setPadding({left:f.CHART_LEFT_PADDING,top:f.CHART_GAP/2,bottom:f.CHART_GAP/2}).setBackgroundStrokeStyle(n.emptyLine).setMouseInteractions(!1).setMouseInteractionPan(!0).setMouseInteractionRectangleFit(!1).setZoomingRectangleStrokeStyle(new n.SolidLine({thickness:2,fillStyle:new n.SolidFill({color:n.ColorCSS("red")})})).setFittingRectangleStrokeStyle(new n.SolidLine({thickness:2,fillStyle:new n.SolidFill({color:n.ColorCSS("blue")})})).setBackgroundFillStyle(new n.SolidFill({color:n.ColorHEX("#f0f0f0")})).setSeriesBackgroundFillStyle(new n.SolidFill({color:n.ColorCSS("white")})),o=r.getDefaultAxisX().setMouseInteractions(!1).setTickStrategy(n.AxisTickStrategies.Empty,u=>!1).setStrokeStyle(n.emptyLine),d=E(i),h=r.getDefaultAxisY().setMouseInteractions(!1).setChartInteractions(!1).setStrokeStyle(n.emptyLine).setTitle(i.name).setInterval(d.min,d.max).setTitleFont(new n.FontSettings({size:12})).setTitleFillStyle(new n.SolidFill({color:n.ColorHEX("#6e7079")})).setTitleRotation(0).setThickness(f.Y_AXIS_WIDTH).setAnimationZoom(void 0).setTickStrategy(n.AxisTickStrategies.Numeric,u=>u.setMajorTickStyle(p=>p.setLabelFillStyle(new n.SolidFill({color:n.ColorHEX("#6e7079")})).setLabelFont(new n.FontSettings({size:6})).setTickStyle(n.emptyLine)).setMinorTickStyle(p=>p.setLabelFont(new n.FontSettings({size:6})).setTickStyle(n.emptyLine)));i.dynamicYAxis||h.setScrollStrategy(void 0);let g;return a||(g=f.addLineSeries(r,typeof t=="number"?t:s)),r.setAutoCursorMode(n.AutoCursorModes.disabled),{chart:r,series:g,xAxis:o,yAxis:h,row:s}}static addLineSeries(e,i=0){return e.addLineSeries({dataPattern:{pattern:"ProgressiveX",regularProgressiveStep:!0,allowDataGrouping:!0},automaticColorIndex:i}).setStrokeStyle(s=>s.setThickness(-1))}addChannel(e,i,s,t){const a=f.addChannel(this.dashboard,e,i,s,t),{chart:r,series:o,xAxis:d,yAxis:h,row:g}=a;return r.onSeriesBackgroundMouseClick((u,p)=>{try{const y=o.solveNearestFromScreen(u.engine.clientLocation2Engine(p.clientX,p.clientY)),F=parseFloat(y.resultTableContent[1][1]),B=parseFloat(y.resultTableContent[2][1]);this.addEvent({x:F,y:B},i)}catch{}this.markers.forEach(y=>{y.setResultTableVisibility(n.UIVisibilityModes.never)})}),a}addLineSeries(e,i){return f.addLineSeries(e,i)}getChannelData(e){const i=[],s=this.graphs[e];for(let t=0;t<s.series.kc[0].La.length;t++)i[t]=s.series.kc[0].La[t].y;return i}};var K=Object.freeze(Object.defineProperty({__proto__:null,default:L},Symbol.toStringTag,{value:"Module"})),C=`<svg id="areazoom-svg" style="position: absolute; z-index: 10000; width: 100%; height: 100%; pointer-events: none;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <!-- <rect id="resize" fill="red" x="190" y="160" width="20" height="20" /> -->
  <rect id="areazoom-rect" fill="rgba(50, 50, 50, 0.5)" />
</svg>`;let m,x;function k(l){l.insertAdjacentHTML("beforeend",C),m=document.getElementById("areazoom-rect")}function G(l){m.setAttribute("height",l)}function w(l){x=l,m.setAttribute("x",l)}function M(l){l>x?m.setAttribute("width",l-x):(m.setAttribute("width",x-l),m.setAttribute("x",l))}function D(){const l=m.getAttribute("x"),S=m.getAttribute("width");return m.setAttribute("width",0),{x:l|0,width:S|0}}var Q=Object.freeze(Object.defineProperty({__proto__:null,svg:C,init:k,setHeight:G,setPosition:w,move:M,hide:D},Symbol.toStringTag,{value:"Module"})),ee=Object.freeze(Object.defineProperty({__proto__:null,svg:C,init:k,setHeight:G,setPosition:w,move:M,hide:D},Symbol.toStringTag,{value:"Module"}));I.init();const H=l=>class b extends l{static visibleGridStyle=new n.SolidLine({thickness:1,fillStyle:new n.SolidFill({color:n.ColorCSS("#dfdfdf")})});static hiddenGridStyle=n.emptyLine;static getNewDashboard(e,i){return n.lightningChart({overrideInteractionMouseButtons:{chartXYPanMouseButton:0,chartXYRectangleZoomFitMouseButton:2}}).Dashboard({container:e,numberOfColumns:1,numberOfRows:i,theme:n.Themes.lightNew}).setBackgroundFillStyle(new n.SolidFill({color:n.ColorCSS("white")})).setSplitterStyle(new n.SolidLine({thickness:2,fillStyle:new n.SolidFill({color:n.ColorCSS("black")})})).setSplitterStyleHighlight(new n.SolidLine({thickness:2,fillStyle:new n.SolidFill({color:n.ColorCSS("black")})}))}get maxVisibleCharts(){return super.maxVisibleCharts*2+1}get mainGraph(){return this.graphGroup||super.mainGraph}get dashboardLeftOffset(){return this.CHART_LEFT_PADDING+this.Y_AXIS_WIDTH}constructor(...e){super(...e),this.pinnedGraphs=[],this.markers=[]}newDashboard(e,i=this.maxVisibleCharts){this.dashboard=b.getNewDashboard(e,i),k(e)}updateDashboardRowHeights(){const{dashboard:e,graphs:i,pinnedGraphs:s,mainGraph:t,maxVisibleCharts:a}=this,r=i.map((u,p)=>p).filter(u=>!c[u].isHidden);t.isGroup&&r.push(t.graphIndex);const o=s.map(u=>u.pinnedIndex),d=r.concat(o),h=t.xAxis.getHeight(),g=(e.engine.container.clientHeight-h)/d.length;for(let u=0;u<a;u++)d.includes(u)?e.setRowHeight(u,Math.round(g)):e.setRowHeight(u,1e-5);e.setRowHeight(t.row,Math.round(g+h)),G(r.length*g)}setXAxisStyle(){this.graphs.forEach((e,i)=>{e.xAxis.setTickStrategy(n.AxisTickStrategies.Empty)}),this.mainGraph.xAxis.setTickStrategy(n.AxisTickStrategies.DateTime,e=>e.setDateOrigin(new Date(V())).setGreatTickStyle(i=>i.setLabelAlignment(0).setTickStyle(n.emptyLine)).setMajorTickStyle(i=>i.setGridStrokeStyle(n.emptyLine).setTickStyle(n.emptyLine)).setMinorTickStyle(i=>i.setGridStrokeStyle(n.emptyLine).setTickStyle(n.emptyLine)))}syncXAxesZoom(){this.axisSyncHandle&&this.axisSyncHandle.remove();const e=this.graphs.map(i=>i.xAxis);this.mainGraph.isGroup&&e.push(this.mainGraph.xAxis),this.axisSyncHandle=n.synchronizeAxisIntervals(...e)}resetView(){const{mainGraph:e,minX:i,maxX:s}=this;e.xAxis.setInterval(i,s,!1,!0)}toggleGrid(e){this.graphs.forEach(i=>{const s=i.yAxis.getTickStrategy();i.yAxis.setTickStrategy(s,t=>t.setMajorTickStyle(a=>a.setGridStrokeStyle(e?b.visibleGridStyle:b.hiddenGridStyle)))})}toggleChannelVisibility(e,i=!1){const s=this.graphs[e];c[e].isHidden?(s.series.dispose(),s.yAxis.dispose()):(s.series.restore(),s.yAxis.restore(),this.toggleZoomBasedData({start:e,end:e+1})),i||this.updateDashboardRowHeights()}toggleChannelSticky(e,i=!1,s=NaN){const{pinnedGraphs:t,graphs:a}=this,r=a[e],o=c[e];if(o.isSticky){const d=isNaN(s)?t.length&&t[t.length-1].pinnedIndex-1||this.maxVisibleCharts-1:s,h=this.addChannel(o,d,e);h.pinnedIndex=d,t.push(h),h.series.add(r.series.kc[0].La),o.pinnedGraph=h}else{if(!o.pinnedGraph)return;const d=o.pinnedGraph;o.pinnedGraph=null,t.splice(t.indexOf(d),1).forEach(h=>{h.chart.dispose();for(let g in h)h[g]=null})}i||this.updateDashboardRowHeights()}addGraphGroup(){const e=Math.floor(this.maxVisibleCharts/2),i=this.addChannel({name:"Channel Group"},e,null,!0);this.graphGroup=i,i.isGroup=!0,i.graphIndex=e,i.series={},i.repositionYAxis=function(){const{yAxis:t}=this;t.setInterval(...Object.values(this.series).reduce((a,r)=>(a[0]=Math.min(a[0],r.__bounds.min),a[1]=Math.max(a[1],r.__bounds.max),a),[1/0,-1/0]),!1,!0)}.bind(i)}toggleChannelGrouped(e,i=!1){const s=c[e];if(s.isGrouped){this.mainGraph.isGroup||this.addGraphGroup();const{graphs:t,mainGraph:a}=this,r=t[e],o=this.addLineSeries(a.chart,e);o.__bounds=E(s),a.series[e]=o,a.repositionYAxis(),o.add(r.series.kc[0].La)}else{if(!this.mainGraph.isGroup)return;const{mainGraph:t}=this,a=t.series[e];if(!a)return;if(a.dispose(),t.series[e]=null,delete t.series[e],Object.keys(t.series).length===0){t.chart.dispose();for(let r in t)t[r]=null;this.graphGroup=null}else t.repositionYAxis()}i||(this.setXAxisStyle(),this.syncXAxesZoom(),requestAnimationFrame(()=>{this.updateDashboardRowHeights()}))}newMontage(){return c.map((e,i)=>({channelIndex:i,isHidden:e.isHidden,isSticky:e.isSticky,isGrouped:e.isGrouped,pinnedGraphIndex:e.pinnedGraph&&e.pinnedGraph.pinnedIndex}))}loadMontage(e){if(this.pinnedGraphs.splice(0).forEach(i=>{i.chart.dispose();for(let s in i)i[s]=null}),this.mainGraph.isGroup){this.graphGroup.chart.dispose();for(let i in this.mainGraph)this.mainGraph[i]=null;this.graphGroup=null}e.forEach((i,s)=>{c[s].isHidden=i.isHidden,c[s].isSticky=i.isSticky,c[s].isGrouped=i.isGrouped,this.toggleChannelVisibility(s,!0),this.toggleChannelSticky(s,!0,i.pinnedGraphIndex),this.toggleChannelGrouped(s)}),this.updateDashboardRowHeights()}panLeft(){const{xAxis:e,series:i}=this.mainGraph,{minX:s}=this,{start:t,end:a}=e.getInterval(),r=i.scale.x.getPixelSize();let o=(t-a)/4;t+o<s&&(o=s-t),e.pan(o/r)}panRight(){const{xAxis:e,series:i}=this.mainGraph,{maxX:s}=this,{start:t,end:a}=e.getInterval(),r=i.scale.x.getPixelSize();let o=(a-t)/4;a+o>s&&(o=s-a),e.pan(o/r)}addEvent(e,i){if(!v.extraFeatures.events)return;const s=this.graphs[i],{chart:t,series:a}=s,r=t.addChartMarkerXY(void 0,t.getDefaultAxisX(),t.getDefaultAxisY()).setPosition({x:e.x,y:e.y});this.markers.push(r),r.getPointMarker().setFillStyle(new n.SolidFill({color:n.ColorHEX("#0075ff")})).onMouseClick(()=>{this.markers.forEach(h=>{h.setResultTableVisibility(n.UIVisibilityModes.never)}),r.setResultTableVisibility(n.UIVisibilityModes.always)}),r.getResultTable().onMouseClick(()=>{I.show("modal-1",{onShow:(h,g,u)=>{h.querySelector("textarea").value=r.__content.reduce((p,y)=>p+y.join(" ")+`
`,"")},onClose:(h,g,u)=>{if(u.target.hasAttribute("ok")){r.__content=h.querySelector("textarea").value.trim().split(`
`).map(p=>[p]),r.setResultTable(p=>p.setContent(r.__content));return}if(u.target.hasAttribute("remove")){r.setResultTableVisibility(n.UIVisibilityModes.never),r.dispose(),this.markers.splice(this.markers.indexOf(r),1);return}}})}),r.__content=[["Custom event"],["Number",this.markers.length.toString()]],r.setResultTableVisibility(n.UIVisibilityModes.never).setResultTable(h=>h.setContent(r.__content)).setDraggingMode(n.UIDraggingModes.notDraggable).setGridStrokeXVisibility(n.UIVisibilityModes.whenDragged).setGridStrokeYVisibility(n.UIVisibilityModes.whenDragged).setTickMarkerXVisibility(n.UIVisibilityModes.whenDragged).setTickMarkerYVisibility(n.UIVisibilityModes.whenDragged)}toggleZoomBasedData(e){const i=e?this.graphs.slice(e.start,e.end):this.graphs;v.extraFeatures.toggleZoomBasedData?P(s=>{i.forEach((t,a)=>{c[a]&&c[a].isHidden||(t.fullData=this.getChannelData(a),t.fullBoundaries=t.series.getBoundaries(),t.fullInterval=t.yAxis.getInterval(),s({name:"limitArray",data:{dataMin:t.fullBoundaries.min.y,dataMax:t.fullBoundaries.max.y,data:t.fullData,limitFactor:.2}}))})}).then(s=>{let t=0;s.forEach((r,o)=>{c[o]&&c[o].isHidden&&t++;const d=this.graphs[o+t];d.limitedData=r.data,d.limitedDataMin=r.dataMin,d.limitedDataMax=r.dataMax});const a=this.mainGraph.xAxis.getInterval();this.zoomBasedDataHandler.call(this,a.start,a.end),this.zoomBasedDataCB=this.graphs[0].xAxis.onScaleChange(this.zoomBasedDataHandler.bind(this))}):(this.graphs[0].yAxis.offScaleChange(this.zoomBasedDataCB),this.zoomBasedDataHandler(0,0),i.forEach(s=>{s.fullData=null,s.fullBoundaries=null,s.fullInterval=null,s.limitedData=null,s.limitedDataMin=null,s.limitedDataMax=null}))}zoomBasedDataHandler(e,i){if(!this.isShowingLimitedZoomBasedData&&Math.abs(i-e)>this.maxX/3){const s=document.querySelector("#label-zoom-based-data");s.classList.add("highlight-flash"),setTimeout(()=>{s.classList.remove("highlight-flash")},1e3),this.isShowingLimitedZoomBasedData=!0,this.graphs.forEach((t,a)=>{c[a]&&c[a].isHidden||(t.series.clear(),t.series.addArraysXY(this.timeSeries,t.limitedData),t.yAxis.setInterval(t.limitedDataMin,t.limitedDataMax),t.yAxis.setMouseInteractions(!1),t.yAxis.setChartInteractions(!1))})}else if(this.isShowingLimitedZoomBasedData&&Math.abs(i-e)<=this.maxX/3){const s=document.querySelector("#label-zoom-based-data");s.classList.add("highlight-flash"),setTimeout(()=>{s.classList.remove("highlight-flash")},1e3),this.isShowingLimitedZoomBasedData=!1,this.graphs.forEach((t,a)=>{c[a]&&c[a].isHidden||(t.series.clear(),t.series.addArraysXY(this.timeSeries,t.fullData),t.yAxis.setInterval(t.fullInterval.start,t.fullInterval.end),t.yAxis.setMouseInteractions(!1),t.yAxis.setChartInteractions(!1))})}}afterUpdate(){requestAnimationFrame(()=>{this.toggleZoomBasedData(),c.forEach((e,i)=>{e.isSticky&&(e.pinnedGraph.series.clear(),e.pinnedGraph.series.add(this.graphs[i].series.kc[0].La)),e.isGrouped&&(this.mainGraph.series[i].clear(),this.mainGraph.series[i].add(this.graphs[i].series.kc[0].La))})}),super.afterUpdate&&super.afterUpdate()}};var te=Object.freeze(Object.defineProperty({__proto__:null,default:H},Symbol.toStringTag,{value:"Module"}));const _=l=>class extends l{constructor(...e){super(...e),this.lastEvent=null,this.hasInitialized=!1,this.graphEvents=z()}markEvent(){this.lastEvent={timestamp:performance.now()}}registerZoomEvents(e){e.chart.onSeriesBackgroundMouseWheel((i,s)=>{let{deltaY:t}=s;const{xAxis:a,yAxis:r}=e,{start:o,end:d}=a.getInterval();t=-t;const h=this.getNewInterval(o,d,t);a.setInterval(h.start,h.end,!1,!0)})}getNewInterval(e,i,s,t=1e4){if(t<1e3)return!1;const{minX:a,maxX:r}=this,o=Math.min(r,Math.max(a,e+s*t)),d=Math.max(a,Math.min(r,i-s*t));return o*2>r?this.getNewInterval(e,i,s,t/2):{start:o,end:d}}reportRenderEvent(){requestAnimationFrame(()=>{const e=(performance.now()-this.lastEvent.timestamp)/1e3;this.hasInitialized?this.graphEvents.render({duration:e,type:T.render}):(this.hasInitialized=!0,this.graphEvents.init({duration:e,type:T.init})),this.lastEvent=null})}toggleAreaZoom(e){e?this.graphs.forEach(i=>{const{chart:s}=i;s.setMouseInteractionPan(!1),i.chartEvents={offSeriesBackgroundMouseDragStart:s.onSeriesBackgroundMouseDragStart((t,a,r)=>{r===0&&w(a.offsetX)}),offSeriesBackgroundMouseDrag:s.onSeriesBackgroundMouseDrag((t,a,r)=>{r===0&&M(a.offsetX)}),offSeriesBackgroundMouseDragStop:s.onSeriesBackgroundMouseDragStop((t,a,r)=>{if(r!==0)return;const o=D(),d=t.getSeries()[0].scale.x.getPixelSize(),g=this.mainGraph.xAxis.getInterval().start/d-this.dashboardLeftOffset;this.mainGraph.xAxis.setInterval((g+o.x)*d,(g+o.x+o.width)*d,!1,!0)})}}):this.graphs.forEach(i=>{const{chart:s}=i;for(const[t,a]of Object.entries(i.chartEvents))s[t](a),i.chartEvents[t]=null;s.setMouseInteractionPan(!0)})}};var se=Object.freeze(Object.defineProperty({__proto__:null,default:_},Symbol.toStringTag,{value:"Module"}));class X{get minX(){return this.timeSeries[0]}get maxX(){return this.timeSeries[this.timeSeries.length-1]}get mainGraph(){return this.graphs[this.graphs.length-1]}get maxVisibleCharts(){return v.channels.max}constructor(){this.graphs=[]}init(S){this.markEvent(),this.newDashboard(S),S.addEventListener("wheel",e=>{e.preventDefault()},{passive:!1})}update(S=[],e){this.hasInitialized&&this.markEvent(),e&&(this.timeSeries=e);const{graphs:i}=this,s=i.length;this.hasChannelsChanged=!1,S.forEach((t,a)=>{let r=i[a],o=a;c.length!==s&&(this.hasChannelsChanged=!0,o=s+a,i.push(this.addChannel(c[o],o)),r=i[o],this.registerZoomEvents(r)),r.series.clear(),r.series.addArraysXY(e,t.data)}),i.splice(c.length,i.length-c.length).forEach(t=>{this.hasChannelsChanged=!0,t.chart.dispose();for(let a in t)t[a]=null}),this.afterUpdate()}afterUpdate(){(!this.hasInitialized||this.hasChannelsChanged)&&(this.setXAxisStyle(),this.syncXAxesZoom()),requestAnimationFrame(()=>{(!this.hasInitialized||this.hasChannelsChanged)&&this.updateDashboardRowHeights(),this.resetView(),this.reportRenderEvent()})}}var ae=Object.freeze(Object.defineProperty({__proto__:null,default:X},Symbol.toStringTag,{value:"Module"}));class O extends H(L(_(X))){}const A=new O,j=0,Y=A.graphEvents;function N(...l){A.init(...l)}function Z(...l){A.update(...l)}function U(){}function q(){}const W=new Proxy(A,R);var re=Object.freeze(Object.defineProperty({__proto__:null,baseDate:j,graphEvents:Y,init:N,update:Z,showLoading:U,hideLoading:q,api:W},Symbol.toStringTag,{value:"Module"}));export{Q as A,re as L,te as a,se as b,ae as c,V as g,ee as i,K as l};