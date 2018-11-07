function detail(d) { 
try {
    (async function() {
        d3.selectAll(".node").classed("hide",true);

        if(!d3.select("#chart").select("svg").empty()) {
            d3.select("#chart").select("svg").classed("hide",false);
            return;
        }

        const data = await d3.tsv("data/chord.tsv");

        const matrix = [];
        const name = [];
        const colorRange =[];
        
        for(i = 0; i < data.length - 1; i++) 
            matrix.push([]);

        for(i = 0; i < data.length - 1; i++) {
            for(j = 1; j < data.length;j++)
                matrix[j-1][i] = parseFloat(data[i][j]);
                // matrix[i][j-1] = parseFloat(data[i][j]);
        }

        for(i = data.length - 1, j = 1; j < data.length; j++)
            name.push(data[i][j])
        
        
        // for(i = 0; i < matrix.length; i++) {
        //     let sum = 0;
        //     console.log("name :" + name[i] + " "+ matrix[i]);
        //     for(j = 0; j < matrix[i].length; j++)
        //         sum += matrix[i][j];
        //     console.log("sum : " + sum);   
        // }

        for(i = 0; i < name.length; i++) 
            colorRange.push(d3.interpolateSpectral(i/name.length));
    
        const margin = {top: 30, right: 20, bottom: 30, left: 50},
            width = 1080 - margin.left - margin.right,
            height = 960 - margin.top - margin.bottom;
        
        d3.select("#chart")
            .append("svg:svg")    
            .attr("width", "100%")
            .attr("height", height+"px")
            .attr("float", "left");

        const svg = d3.select("svg"),
            outerRadius = Math.min(width, height) * 0.45 - 80,
            innerRadius = outerRadius - 10;
          
        const formatValue = d3.format("");
    
        const chord = d3.chord()
            .padAngle(0.05)
            .sortChords(d3.descending)
            .sortSubgroups(d3.descending);

        const arc = d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius);
          
        const ribbon = d3.ribbon()
                        .radius(innerRadius);
          
        const color = d3.scaleOrdinal()
                    .domain(d3.range(matrix[0].length))
                    .range(colorRange);

        const g = svg.append("g")
                    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")")
                    .datum(chord(matrix));

        const group = g.append("g")
                    .attr("class", "groups")
                    .selectAll("g")
                    .data(chords => chords.groups)
                    .enter().append("g");
          
        group.append("path")
            .style("fill", function(d) { return color(d.index); })
            .style("stroke", function(d) { return d3.rgb(color(d.index)).darker(); })
            .attr("d", arc);
        
        group.append("svg:text")
            .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .attr("transform", d => `
              rotate(${(d.angle * 180 / Math.PI - 90)})
              translate(${outerRadius + 30})
              ${d.angle > Math.PI ? "rotate(180)" : ""}
            `)
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
            .text(d => name[d.index]);

        group.on("mouseover", fade(.1))
            .on("mouseout", fade(1));
        
        const groupTick = group.selectAll(".group-tick")
            .data(function(d) { return groupTicks(d, 20); })
            .enter().append("g")
            .attr("class", "group-tick")
            .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)"; });
          
        groupTick.append("line")
                .attr("x2", 6);
          
        groupTick
            .filter(function(d) { return d.value; })
            .append("text")

            // .on("mouseover",fade(0.1))
            // .on("mouseout", fade(1))

            .attr("x", 6)
            .attr("dy", ".35em")
            .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-12)" : null; })
            .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .text(function(d) { return formatValue(d.value) + "%"; });
          
        g.append("g")
            .attr("class", "ribbons")
            .selectAll("path")
            .data(function(chords) { return chords; })
            .enter().append("path")
            
            // .on("mouseover",fade(0.1))
            // .on("mouseout", fade(1))

            .attr("d", ribbon)
            .style("fill", function(d) { return color(d.target.index); })
            .style("stroke", function(d) { return d3.rgb(color(d.target.index)).darker(); });
        
        $('.up').click(() => {
            d3.select("svg").classed("hide",true)
        });
          // Returns an array of tick angles and values for a given group and step.
        function groupTicks(d, step) {
            let k;
            if (d.value == 0) {
                k = (d.endAngle - d.startAngle);
            } else {
                k = (d.endAngle - d.startAngle) / d.value;
            }

            return d3.range(0, d.value, step).map(function(value) {
                return {value: value, angle: value * k + d.startAngle};
            });
          }

        function fade(opacity) {
            return function(g, i) {
                svg.selectAll(".ribbons path")
                    .filter(function(d) { return d.source.index != i && d.target.index != i; })
                    .transition()
                    .style("opacity", opacity);
            };
        }

    })();
}catch(e) {
    console.log(e);
}
}