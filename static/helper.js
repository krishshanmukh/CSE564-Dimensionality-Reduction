
function freq(arr) {
    var a = [], b = [], prev, data = [];

    arr.sort();
    console.log(arr);
    for ( var i = 0; i < arr.length; i++ ) {
        if ( arr[i] !== prev ) {
            a.push(arr[i]);
            b.push(1);
        } else {
            b[b.length-1]++;
        }
        prev = arr[i];
    }

    for ( var i = 0; i < a.length; i++ ) {
        data.push({"x": a[i], "y": b[i]});
    }

    return data;
}


function updateBarChart(data, title) {

    document.getElementById("my_dataviz").innerHTML = ""

    console.log(data)
    // set the dimensions and margins of the graph
    var margin = {top: 100, right: 100, bottom: 100, left: 100},
        width = 1000 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    
    
    // set the parameters for the histogram
    // A function that builds the graph for a specific value of bin
    // X axis: scale and draw:
    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(function(d) { return d.x; }))
        .padding(0.2);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        // .attr("transform", "translate(-10,0)rotate(-45)")
        .attr("transform", "translate(0,5)")
        .style("text-anchor", "middle");

    // Y axis: initialization
    var y = d3.scaleLinear()
        .range([height, 0]);
    var yAxis = svg.append("g")

    // Y axis: update now that we know the domain
    // y.domain([0, d3.max(data, function(d) { return d.y; })]);   
    y.domain([0, 1]);   
    yAxis
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y))
    
    // Add X axis label:
    svg.append("text")
        .attr('x', width / 2)
        .attr('y', height + margin.top/2)
        .attr('text-anchor', 'middle')
        .style("font-size", "20px")
        .text("Component");

    // Y axis label:
    svg.append("text")
        .attr('x', -(height / 2))
        .attr('y', - margin.top / 2.4)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .style("font-size", "20px")
        .text("Value")
    
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -30)
        .attr('text-anchor', 'middle')
        .style("font-size", "34px")
        .text(title)

    // Bars
    svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.x); })
        .attr("width", x.bandwidth())
        .attr("fill", "orange")
        // no bar at the beginning thus:
        .attr("height", function(d) { return height - y(0); }) // always equal to 0
        .attr("y", function(d) { return y(0); })

    // Animation
    svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", function(d) { return y(d.y); })
        .attr("height", function(d) { return height - y(d.y); })
        .delay(function(d,i){console.log(i) ; return(i*100)})

    // Add the line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", d3.line()
        .x(function(d) { return x(d.x)+x.bandwidth()/2 })
        .y(function(d) { return y(d.z) })
        )
    var intrinsic_dim = []
    
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if (element.z >= 0.75) {
            console.log(index)
            // console.log(data[intrinsic_dim])
            intrinsic_dim.push({"x": 0, "y":data[index].z})
            intrinsic_dim.push({"x": data[index].x, "y":data[index].z})
            intrinsic_dim.push({"x": data[index].x, "y": 0})
            console.log(intrinsic_dim)
            break
        }
    }
    
    // Add the line
    // Add the line
    svg.append("path")
      .datum(intrinsic_dim)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", d3.line()
        .x(function(d) { if (d.x == 0) return 0; return x(d.x) + x.bandwidth()/2 })
        .y(function(d) { return y(d.y) })
        )
    
    
    // Add the points
    svg
      .append("g")
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
        .attr("cx", function(d) { return x(d.x) +x.bandwidth()/2 } )
        .attr("cy", function(d) { return y(d.z) } )
        .attr("r", 5)
        .attr("fill", "#69b3a2")
    
    var tool_tip = d3.tip()
                .attr("class", "d3-tip")
                .offset([-8, 0])
                .html(function(d) { return  d.y; });
                d3.selectAll("svg").call(tool_tip);
    
    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    var showTooltip = function(d) {
        d3.select(this).style("fill", "orangered")
        tool_tip.show(d)
    }
    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    var hideTooltip = function(d) {
        tool_tip.hide(d)
        d3.select(this).style("fill", "orange")
    }

    // Manage the existing bars and eventually the new ones:
    svg.selectAll("rect")
        // Show tooltip on hover
        .on("mouseover", showTooltip )
        // .on("mousemove", moveTooltip )
        .on("mouseleave", hideTooltip )

    console.log(data)
}


function updateScatterPlot(data, meta_data, plot="Scree") {

    document.getElementById("my_dataviz").innerHTML = ""

    // set the dimensions and margins of the graph
    var margin = {top: 100, right: 100, bottom: 100, left: 100},
        width = 1000 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
                .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    // .domain([d3.min(data, function(d) { return d.x; }), d3.max(data, function(d) { return d.x; })])
    if (plot == "Scree") {
        var x = d3.scaleLinear()
            .domain([-5,6])
            .range([ 0, width ]);
    } else if ( plot == "MDS euclidean"){
        var x = d3.scaleLinear()
            // .domain([d3.min(data, function(d) { return d.x; }), d3.max(data, function(d) { return d.x; })])
            .domain([-7, 7])
            .range([ 0, width ]);
    } else {
        var x = d3.scaleLinear()
            .domain([-1,1])
            .range([ 0, width ]);
    }
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    // .domain([d3.min(data, function(d) { return d.y; }), d3.max(data, function(d) { return d.y; })])
    if (plot == "Scree") {
        var y = d3.scaleLinear()
            .domain([-5,6])
            .range([ height, 0]);
    } else if ( plot == "MDS euclidean"){
        var y = d3.scaleLinear()
        // .domain([d3.min(data, function(d) { return d.y; }), d3.max(data, function(d) { return d.y; })])
        .domain([-7, 7])
        .range([ height, 0]);
    } else {
        var y = d3.scaleLinear()
        .domain([-1,1])
        .range([ height, 0]);
    }
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.x); } )
        .attr("cy", function (d) { return y(d.y); } )
        .attr("r", 3)
        .style("fill", "#69b3a2")
    
        // Add X axis label:
    svg.append("text")
    .attr('x', width / 2)
    .attr('y', height + margin.top/2)
    .attr('text-anchor', 'middle')
    .style("font-size", "20px")
    .text(meta_data.x_label);

    // Y axis label:
    svg.append("text")
        .attr('x', -(height / 2))
        .attr('y', - margin.top / 2.4)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .style("font-size", "20px")
        .text(meta_data.y_label)

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -30)
        .attr('text-anchor', 'middle')
        .style("font-size", "34px")
        .text(meta_data.title)

}


function updateScatterPlotMatrix(data, title) {
    var width = 960,
    size = 230,
    padding = 50;

    var x = d3.scaleLinear()
        .range([padding / 2, size - padding / 2]);

    var y = d3.scaleLinear()
        .range([size - padding / 2, padding / 2]);

    var xAxis = d3.axisBottom()
        .scale(x)
        .ticks(6);

    var yAxis = d3.axisLeft()
        .scale(y)
        .ticks(6);

    var domainByTrait = {},
        traits = d3.keys(data[0]),
        n = traits.length;

    traits.forEach(function(trait) {
        domainByTrait[trait] = d3.extent(data, function(d) { return d[trait]; });
    });

    xAxis.tickSize(size * n);
    yAxis.tickSize(-size * n);
    document.getElementById("my_dataviz").innerHTML = ""
    

    var svg = d3.select("#my_dataviz").append("svg")
        .attr("width", size * n + padding + 200)
        .attr("height", size * n + padding + 100)
        .append("g")
        .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

    svg.selectAll(".x.axis")
        .data(traits)
        .enter().append("g")
        .attr("class", "x axis")
        .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
        .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

    svg.selectAll(".y.axis")
        .data(traits)
        .enter().append("g")
        .attr("class", "y axis")
        .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
        .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

    var cell = svg.selectAll(".cell")
        .data(cross(traits, traits))
        .enter().append("g")
        .attr("class", "cell")
        .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
        .each(plot);

    // Titles for the diagonal.
    cell.filter(function(d) { return d.i === d.j; }).append("text")
        .attr("x", padding)
        .attr("y", padding)
        .attr("dy", ".71em")
        .text(function(d) { return d.x; });

    function plot(p) {
        var cell = d3.select(this);

        x.domain(domainByTrait[p.x]);
        y.domain(domainByTrait[p.y]);

        cell.append("rect")
            .attr("class", "frame")
            .attr("x", padding / 2)
            .attr("y", padding / 2)
            .attr("width", size - padding)
            .attr("height", size - padding);

        cell.selectAll("circle")
            .data(data)
        .enter().append("circle")
            .attr("cx", function(d) { return x(d[p.x]); })
            .attr("cy", function(d) { return y(d[p.y]); })
            .attr("r", 4)
  }
  function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
  }
  
}