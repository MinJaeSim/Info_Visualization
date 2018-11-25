const width = height = 100; // % of the parent element
    
let x = d3.scaleLinear().domain([0, width]).range([0, width]);
let y = d3.scaleLinear().domain([0, height]).range([0, height]);
    
// let color = d3.scaleOrdinal()
//                 .range(d3.schemeDark2
//                     .map((c)=> { 
//                         c = d3.rgb(c); 
//                         return c; 
//                     })
//                 );

const treemap = d3.treemap()
        .size([width, height])
        //.tile(d3.treemapResquarify) // doesn't work - height & width is 100%
        .paddingInner(0)
        .round(true); //true

let company;
let samsung = d3.rgb(20,40,160),
    hyundai = d3.rgb(0,44,95),
    sk = d3.rgb(234,0,44),
    lotte = d3.rgb(218,41,28),
    lg = d3.rgb(165,0,52),
    posco = d3.rgb(0,87,136), 
    nh = d3.rgb(0,178,95), 
    hanwha = d3.rgb(243,115,33), 
    gs = d3.rgb(0,169,157);
        
try {
    (async function(){
        const data = await d3.json("data/capital.json");
        const nodes = d3.hierarchy(data)
                        .sum(d =>  d.value)
                        .sort((a, b)=>  b.height - a.height || b.value - a.value );
    
        let currentDepth;
        treemap(nodes);

        const chart = d3.select("#chart");
        const cells = chart
            .selectAll(".node")
            .data(nodes.descendants())
            .enter()
            .append("div")
            .attr("class", d =>  "node level-" + d.depth)
            .attr("title", d =>  d.data.name ? d.data.name : "null");

        cells
            .style("left", d =>  x(d.x0) + "%")
            .style("top", d =>  y(d.y0) + "%")
            .style("width", d =>  x(d.x1) - x(d.x0) + "%")
            .style("height", d =>  y(d.y1) - y(d.y0) + "%")
            .style("background-color", d => { if(d.depth == 2)  return getColor(d.parent.data.name); 
                                                else return getColor(d.data.name); })
            .on("click", zoom)
            .append("p")
            .attr("class", "label")
            .text(d => d.data.name ? Math.round(d.data.value/100) < 10000 ? `${d.data.name} \n ${Math.round(d.data.value/100)} 억` : `${d.data.name} \n ${Math.round(d.value/1000000)} 조` : "---")
            .style("font-size", d => (y(d.y1) - y(d.y0))  +"px")
            .style("overflow", "hidden")
            .style("text-overflow","ellipsis")
            .style("white-space","nowrap");  

        d3.select(".up").classed("hide",true);
        d3.select(".detail").classed("hide",true);

        let parent = d3.select(".up")
                        .datum(nodes)
                        .on("click", zoom);
            
        function zoom(d) { // http://jsfiddle.net/ramnathv/amszcymq/
            console.log('clicked: ' + d.data.name + ', depth: ' + d.depth);
            if(d.depth == 0) {
                company = null;
                d3.select(".up").classed("hide",true);
                d3.select(".detail").classed("hide",true);
            }

            if(d.depth == 1) {
                d3.select(".up").classed("hide",false);
                d3.select(".detail").classed("hide",false);
                company = d.data.name;
            }
            
            currentDepth = d.depth;
            parent.datum(d.parent || nodes);
            
            x.domain([d.x0, d.x1]);
            y.domain([d.y0, d.y1]);
            
            const t = d3.transition()
                .duration(200)
                .ease(d3.easeCubicOut);
            
            cells
                .transition(t)
                .style("left", d => x(d.x0) + "%")
                .style("top", d =>  y(d.y0) + "%")
                .style("width", d =>  x(d.x1) - x(d.x0) + "%")
                .style("height", d =>  y(d.y1) - y(d.y0) + "%")
                .style("overflow", "hidden")
                .style("text-overflow","ellipsis")
                .style("white-space","nowrap");
                
            cells // hide this depth and above
                .filter(d =>  d.ancestors())
                .classed("hide", d =>  d.children ? true : false );
            
            cells // show this depth + 1 and below
                .filter(d =>  d.depth > currentDepth)
                .classed("hide", false);
        };

        function getColor (p) {
            switch(p) {
                case "삼성" :
                    samsung.r -= 0.2;
                    samsung.g -= 0.5;
                    samsung.b -= 2;
                    return samsung;
                case "현대자동차" :
                    hyundai.g -= 0.2;
                    hyundai.b -= 0.5;
                    return hyundai;
                case "SK" :
                    sk.r -= 1;
                    return sk;
                case "롯데" :
                    lotte.r -= 1;
                    lotte.g -= 0.2;
                    lotte.b -= 0.1;
                    return lotte;
                case "LG" :
                    lg.r -= 1;
                    lg.b -= 0.2;
                    return lg;
                case "포스코" :
                    posco.g -= 0.2;
                    posco.b -= 2;
                    return posco;
                case "농협" :
                    nh.g -= 1;
                    nh.b -= 0.2;
                    return nh;
                case "한화" :
                    hanwha.r -= 1;
                    hanwha.g -= 0.5;
                    hanwha.b -= 0.1;
                    return hanwha;
                case "GS" :
                    gs.g -= 1;
                    gs.b -=1;
                    return gs;
            } 
        }
    })();
} catch(e) {
    console.log(e);
}

$('.detail').click(() => {
    if(company != null)
        switch (company) {
            case "삼성" :
                detail(company);
                break;
            case "현대자동차" :
                detail(company);
                break;
            case "SK" : 
                detail(company);
                break;
            default :
                alert("업데이트 예정입니다.")
                break;
        }
    
});