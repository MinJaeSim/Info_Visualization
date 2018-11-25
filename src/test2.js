function detail(d) { 
    try {
        (async function() {
            d3.selectAll(".node").classed("hide",true);
            d3.select(".detail").classed("hide",true);
            
            if(!d3.select("#chart").select("svg").empty()) {
                d3.select("#chart").select("svg").classed("hide",false);
                return;
            }

            console.log(d);

            let chordData;
            let subData;
            switch(d) {
                case "삼성" :
                    chordData = await d3.tsv("data/samsungCircos.tsv");
                    subData = await d3.json("data/samsungSub.json");
                    break;
                case "현대자동차" :
                    chordData = await d3.tsv("data/hyundaiCircos.tsv");
                    subData = await d3.json("data/hyundaiSub.json");
                    break;
            }

            const tsvMatrix = [];
            const chordMatrix = [];
            const companyName = [];
            const colorRange =[];
            const subCompany = [];
            
            for(i = 0; i < subData.children.length; i++) {
                subCompany.push(subData.children[i]);
            }

            for(i = 0; i < chordData.length - 1; i++) {
                chordMatrix.push([]);
                tsvMatrix.push([]);
            }

            for(i = 0; i < chordData.length - 1; i++) 
                for(j = 1; j < chordData.length; j++) 
                    chordMatrix[j-1][i] = 0;
            
            for(i = 0; i < chordData.length - 1; i++) 
                for(j = 1; j < chordData.length; j++) {
                    tsvMatrix[i][j-1] = parseFloat(chordData[i][j]);
                    chordMatrix[i][j-1] += parseFloat(chordData[i][j]);
                    if(j-1 == i) 
                        continue;
                    chordMatrix[j-1][i] += parseFloat(chordData[i][j]);
                }

            for(i = chordData.length - 1, j = 1; j < chordData.length; j++)
                companyName.push(chordData[i][j])

            for(i = 0; i < companyName.length; i++) 
                colorRange.push(d3.interpolateRainbow(i/companyName.length));
        
            const margin = {top: 30, right: 30, bottom: 30, left: 30},
                width = 1080 - margin.left - margin.right,
                height = 920 - margin.top - margin.bottom;
            
            d3.select("#chart")
                .append("svg:svg")    
                .attr("width", width + "px")
                .attr("height", height + "px")
                .attr("margin-right", margin.right + "px")
                .attr("margin-left", margin.left + "px")
                .attr("margin-top", margin.top + "px")
                .attr("margin-bottm", margin.bottom + "px")
                .attr("float", "left");

            d3.select("#chart")
                .append("div")
                .attr("class","sub");

            const svg = d3.select("svg"),
                outerRadius = Math.min(width, height) * 0.45 - 100,
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
                        .domain(d3.range(chordMatrix.length))
                        .range(colorRange);

            const g = svg.append("g")
                        .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")")
                        .datum(chord(chordMatrix));

            const group = g.append("g")
                        .attr("class", "groups")
                        .selectAll("g")
                        .data(chords => chords.groups)
                        .enter().append("g");
            
            group.append("path")
                .style("fill", d => color(d.index) )
                .style("stroke", d => d3.rgb(color(d.index)).darker())
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
                .text(d => companyName[d.index]);

            group.on("mouseover", fade(.1))
                .on("mouseout", fade(1));
            
            const groupTick = group.selectAll(".group-tick")
                .data(d => groupTicks(d, 20))
                .enter().append("g")
                .attr("class", "group-tick")
                .attr("transform", d => "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)");
            
            groupTick.append("line")
                    .attr("x2", 6);
            
            groupTick
                .filter(d => d.value)
                .append("text")
                .attr("x", 6)
                .attr("dy", ".35em")
                .attr("transform", d => d.angle > Math.PI ? "rotate(180) translate(-12)" : null)
                .style("text-anchor", d => d.angle > Math.PI ? "end" : null)
                .text(d => formatValue(d.value) + "%");
            
            g.append("g")
                .attr("class", "ribbons")
                .selectAll("path")
                .data(chords => chords)
                .enter().append("path")
                .attr("d", ribbon)
                .style("fill", d => { if(tsvMatrix[d.source.index][d.target.index] == d.source.value)
                                        return color(d.source.index);   
                                    else 
                                        return color(d.target.index);})
                .style("stroke", d => { if(tsvMatrix[d.source.index][d.target.index] == d.source.value)
                                            return d3.rgb(color(d.source.index)).darker();   
                                        else 
                                            return d3.rgb(color(d.target.index)).darker();
                                        });

            $('.up').click(() => {
                d3.select("svg").classed("hide",true)
            });
            
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
                    d3.select(".sub").selectAll("div").remove();
                    if(opacity == 0.1) {

                        d3.select(".sub")
                                .append("div")
                                .attr("class","sub_title myself")
                                .text(`자기 지분 : ${tsvMatrix[i][i]}%`);

                        d3.select(".sub").select(".myself")
                            .style("color", colorRange[i])
                            .attr("margin", 5);

                        d3.select(".sub")
                                .append("div")
                                .attr("class","sub_title")
                                .text(`${companyName[i]}(이)가 지분을 가지고 있는 계열사`);
                        let haveSum = 0;
                        for(j = 0; j < tsvMatrix.length; j++) {
                            if(tsvMatrix[i][j] == 0 || i == j)
                                continue;
                            
                            haveSum += tsvMatrix[i][j];

                            d3.select(".sub")
                                .append("div")
                                .attr("class","sub_text have")
                                .text(`${companyName[j]} : ${tsvMatrix[i][j]}%`)
                                .style('color',colorRange[j]);
                        }
                        d3.select(".sub")
                                .append("div")
                                .attr("class","sub_sum")
                                .text(`총 합 : ${Math.round(haveSum)}%`);

                        d3.select(".sub")
                                .append("div")
                                .attr("class","sub_title")
                                .text(`${companyName[i]}의 지분을 가지고 있는 계열사`);
                        
                        let hadppSum =0;
                        for(j = 0; j < tsvMatrix.length; j++) {
                            if(tsvMatrix[j][i] == 0 || i == j)
                                continue;
                            
                            hadppSum += tsvMatrix[j][i];
                            
                            d3.select(".sub")
                                .append("div")
                                .attr("class","sub_text hadpp")
                                .text(`${companyName[j]} : ${tsvMatrix[j][i]}%`)
                                .style("color", colorRange[j]);
                        }

                        d3.select(".sub")
                                .append("div")
                                .attr("class","sub_sum")
                                .text(`총 합 : ${Math.round(hadppSum)}%`);
                        
                        for(j = 0; j < subCompany.length; j++)
                            if(companyName[i] == subCompany[j].name) {
                                d3.select(".sub")
                                    .append("div")
                                    .attr("class","sub_title")
                                    .text(`${companyName[i]}만 지분을 가지고 있는 계열사`);
                                for(k = 0; k < subCompany[j].children.length; k++) {
                                    d3.select(".sub")
                                        .append("div")
                                        .attr("class","sub_text onlyhave")
                                        .text(`${subCompany[j].children[k].name} : ${subCompany[j].children[k].value}%`)
                                }
                                break;
                            }
                                
                    }
                    
                    svg.selectAll(".ribbons path")
                        .filter(d => d.source.index != i && d.target.index != i)
                        .transition()
                        .style("opacity", opacity);
                };
            }
        })();
    }catch(e) {
        console.log(e);
    }
}