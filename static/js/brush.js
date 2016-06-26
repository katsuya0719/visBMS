	var margin = {top: 20, right: 40, bottom: 100, left: 60},
      margin2 = {top: 530, right: 40, bottom: 20, left: 60},
	    width = 1200 - margin.left - margin.right,
	    height = 600 - margin.top - margin.bottom,
      height2 = 600 - margin2.top - margin2.bottom;

	var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

	var x = d3.time.scale() 
	        .range([0,width]),
      x2 = d3.time.scale() 
          .range([0,width]),
	    y = d3.scale.linear() 
	        .range([height,0]),
      y2 = d3.scale.linear() 
          .range([height2,0]);


	var color = d3.scale.category20();

	var xAxis = d3.svg.axis()
	            .scale(x)
	            .orient("bottom"),
      xAxis2 = d3.svg.axis()
              .scale(x2)
              .orient("bottom");          
	                
	var yAxis = d3.svg.axis()
	            .scale(y)
	            .orient("left");

  var brush = d3.svg.brush()
              .x(x2)
              .on("brush",brushed)

	var line = d3.svg.line() 
	            .x(function(d){return x(d.date);})
	            .y(function(d){return y(d.energy);});

  var line2 = d3.svg.line() 
              .x(function(d){return x2(d.date);})
              .y(function(d){return y2(d.energy);});

	var svg = d3.select("#brush").append("svg")
				.attr("width", width + margin.left + margin.right)
    			.attr("height", height + margin.top + margin.bottom)
    		　//.append("g")
    			//.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("defs").append("clipPath")
      .attr("id","clip")
      .append("rect")
      .attr("width",width)
      .attr("height",height)

  var focus = svg.append("g")
              .attr("class","focus")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var context = svg.append("g")
              .attr("class","context")
              .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

function setData(month){
  d3.csv("static/csv/1509-1602_1h.csv", function (data) {
  	data.forEach(function(d) {
  	  d.datetime = parseDate(d.datetime);
      d.month = d.datetime.getMonth()+1;
      delete d[""]
  	});

    data=data.filter(function(d){
      return d.month == month
    })
    drawGraph(data)
  });
};

function drawGraph(data){
	color.domain(d3.keys(data[0]).filter(function(key) { return key !== "datetime"; }));

    var energies = color.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return {date: d.datetime, energy: parseInt(+d[name])};
        })
      };
    });
  //console.log(energies)
  	x.domain(d3.extent(data, function(d) { return d.datetime; }));
    //console.log(x.domain())
  	y.domain([
      d3.min(energies, function(c) { return d3.min(c.values, function(v) { return v.energy; }); }),
      d3.max(energies, function(c) { return d3.max(c.values, function(v) { return v.energy; }); })
    ]);
    x2.domain(x.domain());
    y2.domain(y.domain());
  //};

	focus.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  focus.append("g")
  　  .attr("class", "y axis")
   　 .call(yAxis)
  　.append("text")
    　.attr("transform", "rotate(-90)")
    　.attr("y", 6)
    　.attr("dy", ".71em")
    　.style("text-anchor", "end")
    　.text("Consumption [W]");

  context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  context.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", -6)
      .attr("height", height2 + 7);

  energies.forEach(function(d){
    focus.append("path")
        .datum(d)  
        .attr("class","line")
        .attr("d",function(d){return line(d.values);})
        .style("stroke", function(d) { return color(d.name); });

    context.append("path")
        .datum(d)  
        .attr("class","line")
        .attr("d",function(d){return line2(d.values);})
        .style("stroke", function(d) { return color(d.name); });
    
  });

  var legend = focus.selectAll(".legend")
              .data(color.domain())
              .enter().append("g")
              .attr("class","legend")
              .attr("transform", function(d,i){ return "translate(0," +i*20+ ")"; });

  legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color); 

  legend.append("text")
        .attr("x", width-24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor","end")
        .text(function(d){ return d; });  
};

setData(9)

function changeRadio(){
    var radio = document.myForm.myRadio;
    if(radio.value==9){
      changeData(9);
    }else if(radio.value==10){
      changeData(10);
    }else if(radio.value==11){
      changeData(11);
    }else if(radio.value==12){
      changeData(12);
    }else if(radio.value==1){
      changeData(1);
    }else if(radio.value==2){
      changeData(2);
    };
};

function changeData(month){
  d3.csv("static/csv/1509-1602_1h.csv", function (data) {
    data.forEach(function(d) {
      d.datetime = parseDate(d.datetime);
      d.month = d.datetime.getMonth()+1;
    });

    data=data.filter(function(d){
      return d.month == month
    })
    console.log(month)

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

    
    //energies.forEach(function(d){
      updateGraph(energies);
    //});
  });
};

function updateGraph(energies){
  var svg = d3.select("#brush").transition();
  console.log(energies)
  energies.forEach(function(d){
    svg.select(".line") 
            //.datum(d)    // change the line
            //.data(d)
            //.enter()
            .duration(750)
            .attr("d",function(d){return line(d.values);})
            .style("stroke", function(d) { return color(d.name); });
        svg.select(".x.axis") // change the x axis
            .duration(750)
            .call(xAxis);
        svg.select(".y.axis") // change the y axis
            .duration(750)
            .call(yAxis);
  });
};

function brushed() {
  x.domain(brush.empty() ? x2.domain() : brush.extent());
  console.log(x.domain())
  //xがupdate
  //focus.select(".line").attr("d",function(d){return line(d.values);});
  focus.select(".line").attr("d",line);
  focus.select(".x.axis").call(xAxis);
};