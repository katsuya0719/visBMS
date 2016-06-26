d3.helper = {};

d3.helper.tooltip = function(){
    var tooltipDiv;
    var bodyNode = d3.select("#brush").node();

    function tooltip(selection){

        selection.on('mouseover.tooltip', function(pD, pI){
            // Clean up lost tooltips
            d3.select('#brush').selectAll('div.tooltip').remove();
            // Append tooltip
            tooltipDiv = d3.select('#brush')
                           .append('div')
                           .attr('class', 'tooltip')
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style({
                left: (absoluteMousePos[0] + 10)+'px',
                top: (absoluteMousePos[1] - 40)+'px',
                'background-color': '#d8d5e4',
                width: '65px',
                height: '30px',
                padding: '5px',
                position: 'absolute',
                'z-index': 1001,
                'box-shadow': '0 1px 2px 0 #656565'
            });

            var first_line = '<p>X-Value: ' + pD.index + '</p>'
            var second_line = '<p>Y-Value: ' + pD.value + '</p>'

            tooltipDiv.html(first_line + second_line)
        })
        .on('mousemove.tooltip', function(pD, pI){
            // Move tooltip
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style({
                left: (absoluteMousePos[0] + 10)+'px',
                top: (absoluteMousePos[1] - 40)+'px'
            });
        })
        .on('mouseout.tooltip', function(pD, pI){
            // Remove tooltip
            tooltipDiv.remove();
        });

    }

    tooltip.attr = function(_x){
        if (!arguments.length) return attrs;
        attrs = _x;
        return this;
    };

    tooltip.style = function(_x){
        if (!arguments.length) return styles;
        styles = _x;
        return this;
    };

    return tooltip;
};
  var margin = {top: 20, right: 40, bottom: 100, left: 60},
	    width = 1200 - margin.left - margin.right,
	    height = 600 - margin.top - margin.bottom;

	var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

	var x = d3.scale.linear() 
	        .range([0,width]),
	    y = d3.scale.linear() 
	        .range([height,0]);

	var color = d3.scale.category20();

	var xAxis = d3.svg.axis()
	            .scale(x)
	            .orient("bottom");      
	                
	var yAxis = d3.svg.axis()
	            .scale(y)
	            .orient("left");

  var brush = d3.svg.brush()
              .x(x)
              .on("brush", brushmove)
              .on("brushend", brushend);

	var line = d3.svg.line() 
	            .x(function(d){return x(d.date);})
	            .y(function(d){return y(d.energy);});

	var svg = d3.select("#brush").append("svg")
				.attr("width", width + margin.left + margin.right)
    			.attr("height", height + margin.top + margin.bottom)
    		　.append("g")
    			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
    .attr("class", "brush")
    .call(brush)
  .selectAll('rect')
    .attr('height', height);

  svg.append("defs").append("clipPath")
      .attr("id","clip")
      .append("rect")
      .attr("width",width)
      .attr("height",height+20);
	
d3.csv("static/csv/1509-1602climate_H.csv", function (data) {

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
  
  x.domain(d3.extent(data, function(d) { return d.rad; }));
  y.domain(d3.extent(data, function(d) { return d.pv; }));
  console.log(data)

  points = svg.selectAll(".point")
    .data(data)
  .enter().append("circle")
    .attr("class", "point")
    //.attr("clip-path", "url(#clip)")
    .attr("r", 5)
    .attr("cx", function(d) { return x(d.rad); })
    .attr("cy", function(d) { return y(d.pv); })
    .call(d3.helper.tooltip());

	svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .style("text-anchor", "start")
      .text("Solar Radiation[W/m2]");

  svg.append("g")
  　  .attr("class", "y axis")
   　 .call(yAxis)
  　.append("text")
    　.attr("transform", "rotate(-90)")
    　.attr("y", 6)
    　.attr("dy", ".71em")
    　.style("text-anchor", "end")
    　.text("PV generation [W]");

  svg.append("g")
    .attr("class", "brush")
    .call(brush)
  .selectAll('rect')
    .attr('height', height);

});

function brushmove() {
  var extent = brush.extent();
  points.classed("selected", function(d) {
    is_brushed = extent[0] <= d.index && d.index <= extent[1];
    return is_brushed;
  });
}

function brushend() {
  get_button = d3.select(".clear-button");
  if(get_button.empty() === true) {
    clear_button = svg.append('text')
      .attr("y", 460)
      .attr("x", 825)
      .attr("class", "clear-button")
      .text("Clear Brush");
  }

  x.domain(brush.extent());

  transition_data();
  reset_axis();

  points.classed("selected", false);
  d3.select(".brush").call(brush.clear());

  clear_button.on('click', function(){
    x.domain([0, 50]);
    transition_data();
    reset_axis();
    clear_button.remove();
  });
}

function transition_data() {
  svg.selectAll(".point")
    .data(data)
  .transition()
    .duration(500)
    .attr("cx", function(d) { return x(d.index); });
}

function reset_axis() {
  svg.transition().duration(500)
   .select(".x.axis")
   .call(xAxis);
}