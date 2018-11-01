try {
    (async function() {
        const data = await d3.tsv("data/chord.tsv");

        const matrix = [];
        const name = [];
        const colorRange =[];
        
        for(i = 0; i < data.length - 1; i++) 
            matrix.push([]);
        
        console.log(data[0].length);

        for(i = 0; i < data.length - 1; i++) {
            for(j = 1; j < data.length;j++)
                matrix[j-1][i] = parseFloat(data[i][j]);
                // matrix[i][j-1] = parseFloat(data[i][j]);
        }

        for(i = data.length - 1, j = 1; j < data.length; j++)
            name.push(data[i][j])
        
        
        for(i = 0; i < matrix.length; i++) {
            let sum = 0;
            console.log("name :" + name[i] + " "+ matrix[i]);
            for(j = 0; j < matrix[i].length; j++)
                sum += matrix[i][j];
            console.log("sum : " + sum);   
        }

        for(i = 0; i < name.length; i++) 
            colorRange.push(d3.interpolateSpectral(i/name.length));
        
        const width = 1280,
              height = 960;
        
        d3.select("#chart")
            .append("svg:svg")
            .attr("width", "1280px")
            .attr("height", "1080px");

        var svg = d3.select("svg"),
            outerRadius = Math.min(width, height) * 0.5 - 80,
            innerRadius = outerRadius - 30;
          
        var formatValue = d3.format(".3");
    
        var chord = d3.chord()
            .padAngle(0.05)
            .sortChords(d3.descending)
            .sortSubgroups(d3.descending);

        var arc = d3.arc()
                    .innerRadius(innerRadius)
                    .outerRadius(outerRadius);
          
        var ribbon = d3.ribbon()
                        .radius(innerRadius);
          
        var color = d3.scaleOrdinal()
                    .domain(d3.range(matrix[0].length))
                    .range(colorRange);

        var g = svg.append("g")
                    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")")
                    .datum(chord(matrix));

        var group = g.append("g")
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
              translate(${outerRadius + 20})
              ${d.angle > Math.PI ? "rotate(180)" : ""}
            `)
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
            .text(d => name[d.index]);
        
        var groupTick = group.selectAll(".group-tick")
            .data(function(d) { return groupTicks(d, 20); })
            .enter().append("g")
            .attr("class", "group-tick")
            .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)"; });
          
        groupTick.append("line")
                .attr("x2", 6);
          
        groupTick
            .filter(function(d) { return d.value; })
            .append("text")
            .attr("x", 6)
            .attr("dy", ".35em")
            .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
            .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .text(function(d) { return formatValue(d.value) + "%"; });
          
        g.append("g")
            .attr("class", "ribbons")
            .selectAll("path")
            .data(function(chords) { return chords; })
            .enter().append("path")
            .attr("d", ribbon)
            .style("fill", function(d) { return color(d.target.index); })
            .style("stroke", function(d) { return d3.rgb(color(d.target.index)).darker(); });
          
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
    })();
}catch(e) {
    console.log(e);
}





