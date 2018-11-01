try {
    (async function() {
        // const name = ["삼성 물산","삼성 전자","삼성 SDI","삼성 전기","삼성 중공업","제일 기획","호텔 신라","에스원","삼성 경제 연구소","삼성 SDS","삼성  생명  보험","삼성화재  해상보험","삼성  증권","삼성  카드","삼성 디스플레이","삼성 바이오 로직스","삼성  자산운용","미라콤  아이앤씨","씨브이네트","시큐아이","삼성벤처  투자","삼성 엔지니어링","멀티 캠퍼스","에스코어","이재용","친족","임원","삼성 비영리 재단","기타"];
        const data = await d3.tsv("data/chord.tsv");

        const matrix = [];
        const name = [];
        const colorRange =[];

        for(i = 0; i < data.length - 1; i++) {
            matrix.push([]);
            for(j = 1; j <= data.length;j++)
                matrix[i][j-1] = parseFloat(data[i][j]);
        }

        for(i = 0; i < matrix.length; i++) {    
            for(j = 0; j < matrix.length;j++)
                matrix[i][j] = matrix[j][i];
        }

        for(i = data.length - 1, j = 1; j < data.length; j++) {
            name.push(data[i][j])
        }


        for(i = 0; i < name.length; i++) 
            colorRange.push(d3.interpolateSpectral(i/name.length));
        
        const width = 960,
              height = 800;
        
        d3.select("#chart")
            .append("svg:svg")
            .attr("width", "1280px")
            .attr("height", "960px");

        var svg = d3.select("svg"),
            outerRadius = Math.min(width, height) * 0.5 - 40,
            innerRadius = outerRadius - 30;
          
        var formatValue = d3.formatPrefix(",.0", 1e3);
          
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
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
                .datum(chord(matrix));

        var group = g.append("g")
                    .attr("class", "groups")
                    .selectAll("g")
                    .data(function(chords) { return chords.groups; })
                    .enter().append("g");
          
        group.append("path")
            .style("fill", function(d) { return color(d.index); })
            .style("stroke", function(d) { return d3.rgb(color(d.index)).darker(); })
            .attr("d", arc);
        
        group.append("text")
            .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .attr("transform", d => `
              rotate(${(d.angle * 180 / Math.PI - 90)})
              translate(${innerRadius + 26})
              ${d.angle > Math.PI ? "rotate(180)" : ""}
            `)
            .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
            .text(d => name[d.index]);
        
        var groupTick = group.selectAll(".group-tick")
            .data(function(d) { return groupTicks(d, 1e3); })
            .enter().append("g")
            .attr("class", "group-tick")
            .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)"; });
          
        groupTick.append("line")
                .attr("x2", 6);
          
        groupTick
            .filter(function(d) { return d.value % 5e3 === 0; })
            .append("text")
            .attr("x", 8)
            .attr("dy", ".35em")
            .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
            .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .text(function(d) { return formatValue(d.value); });
          
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
            var k = (d.endAngle - d.startAngle) / d.value;
            return d3.range(0, d.value, step).map(function(value) {
                return {value: value, angle: value * k + d.startAngle};
            });
          }
    })();
}catch(e) {
    console.log(e);
}





