const width = height = 100; // % of the parent element
    
let x = d3.scaleLinear().domain([0, width]).range([0, width]);
let y = d3.scaleLinear().domain([0, height]).range([0, height]);
    
let color = d3.scaleOrdinal()
                .range(d3.schemeDark2
                    .map((c)=> { 
                        c = d3.rgb(c); 
                        return c; 
                    })
                );

const treemap = d3.treemap()
        .size([width, height])
        //.tile(d3.treemapResquarify) // doesn't work - height & width is 100%
        .paddingInner(0)
        .round(true); //true

let company;
        
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
            .style("background-color", d => { while (d.depth > 2) d = d.parent; return color(d.data.name)})
            .on("click", zoom)
            .append("p")
            .attr("class", "label")
            .text(d => d.data.name ? Math.round(d.data.value/100) < 10000 ? `${d.data.name} \n ${Math.round(d.data.value/100)} 억` : `${d.data.name} \n ${Math.round(d.value/1000000)} 조` : "---")
            .style("font-size", d => (y(d.y1) - y(d.y0))  +"px")
            .style("overflow", "hidden")
            .style("text-overflow","ellipsis")
            .style("white-space","nowrap");  

        let parent = d3.select(".up")
                        .datum(nodes)
                        .on("click", zoom);
            
        function zoom(d) { // http://jsfiddle.net/ramnathv/amszcymq/
            console.log('clicked: ' + d.data.name + ', depth: ' + d.depth);
            if(d.depth == 0) {
                company = null;
            }

            if(d.depth == 1) {
                company = d.data.name;
            }
            
            currentDepth = d.depth;
            parent.datum(d.parent || nodes);
            
            x.domain([d.x0, d.x1]);
            y.domain([d.y0, d.y1]);
            
            const t = d3.transition()
                .duration(800)
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
    })();
} catch(e) {
    console.log(e);
}

$('.detail').click(() => {
    if(company != null)
        detail(company);
});