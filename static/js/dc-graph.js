var timeChart = dc.lineChart("#dc-time-chart");
var radbyMonthChart = dc.barChart("#dc-rad-month");
var PVbyMonthChart = dc.barChart("#dc-pv-month");

d3.csv("static/csv/1509-1602climate_H.csv", function (data) {

  // format our data
  var dtgFormat = d3.time.format("%Y/%m/%e %H:%M").parse;
  var dtgFormat2 = d3.time.format("%m/%d");
  
  data.forEach(function(d) { 
    d.dtg = dtgFormat(d.time);
    d.day = d.dtg.getDate();
    d.month = d.dtg.getMonth()+1;
    d.date = dtgFormat2(d.dtg);
    d.temp = +d.Temp;
    d.rad   = +d.Radiation;
    d.pv  = +d.PV;
  });
  
  // Run the data through crossfilter and load our 'facts'
  var facts = crossfilter(data);
  var all = facts.groupAll();

  // time chart
  var ByHour = facts.dimension(function(d) {
    return d.dtg;
  });

  var ByMonth = facts.dimension(function(d) {
    return d.month;
  });

  var radByHourGroup = ByHour.group()
    .reduceSum(function(d) { return d.rad; });

  var radByMonthGroup = ByMonth.group()
    .reduceSum(function(d) { return d.rad; });

  var PVByMonthGroup = ByMonth.group()
    .reduceSum(function(d) { return d.PV; });

  timeChart.width(1200)
    .height(300)
    .transitionDuration(500)
//    .mouseZoomable(true)
    .margins({top: 10, right: 10, bottom: 20, left: 40})
    .dimension(ByHour)
    .group(radByHourGroup)
//    .brushOn(false)			// added for title
    .title(function(d){
      return dtgFormat2(d.data.key)
      + "\nNumber of Events: " + d.data.value;
      })
	.elasticY(true)
    .x(d3.time.scale().domain(d3.extent(data, function(d) { return d.dtg; })))
    .xAxis();

  // Magnitide Bar Graph Counted
  radbyMonthChart.width(600)
    .height(150)
    .margins({top: 10, right: 50, bottom: 20, left: 40})
    .dimension(ByMonth)
    .group(radByMonthGroup)
	.transitionDuration(500)
    .centerBar(true)	
	.gap(10)  // 65 = norm
 //   .filter([3, 5])
    .x(d3.scale.linear().domain([1, 12]))
	.elasticY(true)
	.xAxis().tickFormat();	

  // Depth bar graph
  PVbyMonthChart.width(600)
    .height(150)
    .margins({top: 10, right: 50, bottom: 20, left: 40})
    .dimension(ByMonth)
    .group(PVByMonthGroup)
	.transitionDuration(500)
    .centerBar(true)	
	.gap(10)  
    .x(d3.scale.linear().domain([1, 12]))
	.elasticY(true)
	.xAxis().tickFormat(function(v) {return v;});

  // Render the Charts
  dc.renderAll();

  });