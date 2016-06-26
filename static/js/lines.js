	var margin = {top: 20, right: 40, bottom: 20, left: 60},
	    width = 1200 - margin.left - margin.right,
	    height = 400 - margin.top - margin.bottom;

	var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

	var x = d3.time.scale() 
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

	var line = d3.svg.line() 
	            .x(function(d){return x(d.date);})
	            .y(function(d){return y(d.energy);});

	var svg = d3.select("#time-series").append("svg")
				  .attr("width", width + margin.left + margin.right)
    		  .attr("height", height + margin.top + margin.bottom)
    		.append("g")
    		  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
d3.csv("static/csv/1509-1602_10min.csv", function (data) {

	data.forEach(function(d) {
	  d.datetime = parseDate(d.datetime);
    delete d[""]
	});
  
	color.domain(d3.keys(data[0]).filter(function(key) { return key !== "datetime"; }));

    var energies = color.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return {date: d.datetime, energy: parseInt(+d[name])};
        })
      };
    });

	x.domain(d3.extent(data, function(d) { return d.datetime; }));
	y.domain([
    d3.min(energies, function(c) { return d3.min(c.values, function(v) { return v.energy; }); }),
    d3.max(energies, function(c) { return d3.max(c.values, function(v) { return v.energy; }); })
  ]);

	svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
  　  .attr("class", "y axis")
   　 .call(yAxis)
  　.append("text")
    　.attr("transform", "rotate(-90)")
    　.attr("y", 6)
    　.attr("dy", ".71em")
    　.style("text-anchor", "end")
    　.text("Consumption [W]");

  energies.forEach(function(d){
    svg.append("path")
        .datum(d)  
        .attr("d",function(d){return line(d.values);})
        .style("stroke", function(d) { return color(d.name); })
  });
  //var energy = svg.selectAll(".energy")
  //    .data(energies)
  //  .enter().append("g")
  //    .attr("class", "energy")
  //    .attr("id",function(d){return 'tag'+d.name.replace(/¥s+/g, '')});

  //energy.append("path")
  //    .attr("class", "line")
  //    .attr("d", function(d) { return line(d.values); })
  //    .style("stroke", function(d) { return color(d.name); })
      
  console.log(color.domain())
  var legend = svg.selectAll(".legend")
              .data(color.domain())
              .enter().append("g")
              .attr("class","legend")
              .attr("transform", function(d,i){ return "translate(0," +i*20+ ")"; });

  legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color)
        .on("click",function(d){
          var active = d.active ? false : true,
          newOpacity = active ? 0 : 1;
          console.log(active);
          console.log(newOpacity);
          d3.select("#tag"+d.replace(/¥s+/g, ''))
            .transition().duration(100)
            .style("opacity",newOpacity);
          d.active=active;
          console.log("changed!")
          //透明度が変わってくれない
        });         

  legend.append("text")
        .attr("x", width-24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor","end")
        .text(function(d){ return d; });           
});
