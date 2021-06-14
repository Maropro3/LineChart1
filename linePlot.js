export const linePlot = (selection,props) => {


    const {
        title,
        xValue,
        xLabel,
        xColName,
        yValue,
        yLabel,
        yColName,
        margin,
        width,
        height,
        xUnits,
        yUnits,
        dateRange,
        colorScale,
        colorValue,
        data,
        dataP

    } = props;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const dataF = data;
    const dataPure = dataP;

    
   // console.log(data);
    
    const g = selection.selectAll('.container').data([null]);
    const gEnter = g.enter().append('g')
    .attr('class', 'container');

    gEnter.merge(g)
    .attr('transform', `translate(${160},${100})`);

    // var xValue = d => d[xColumn];

    
   // console.log(dataFF);

    var xScale = d3.scaleTime().range([0, innerWidth])
    .domain([dateRange[0],dateRange[1]]);

    var yScale = d3.scaleLinear().range([innerHeight ,0])
    .domain([0, d3.max(dataPure, function(d){
        return d3.max(d.values, function(d){
            return d.value;
        })
    })])
    .nice();
    
    const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickPadding(10);

    const xAxis = d3.axisBottom(xScale)
    .ticks(10)
    .tickSize(-innerHeight)
    .tickPadding(10);
  
    const yAxisG = g.select('.yAxis');
    const yAxisGEnter = gEnter.append('g')
    .attr('class', 'yAxis');
    
    yAxisG.merge(yAxisGEnter)
    .call(yAxis)
    .selectAll('.domain')
    .style('stroke', '#b3aca7')
    // .remove();

    const yAxisText = yAxisGEnter.append('text')
    .attr('class', 'axis-label')
    .attr('transform', `rotate(270)`)
    .attr('y', -70)
    .attr('fill', 'black')
    .attr('text-anchor', 'middle')
    .merge(yAxisG.select('.axis-label'))
    .attr('x', -innerHeight/2)
    .text("Numer of Exoplanets")
    ;
   
    const xAxisG = g.select('.xAxis');
    const xAxisGEnter = gEnter.append('g')
    .attr('class', 'xAxis')
    .attr('transform', `translate(0,${innerHeight})`);
    
    xAxisG.merge(xAxisGEnter)
    .call(xAxis)
    .selectAll('.domain')
    .remove();

    const xAxisText = xAxisGEnter.append('text')
    .attr('class', 'axis-label')
    .attr('y', 50)
    .attr('fill', 'black')
    .attr('text-anchor', 'middle')
    .merge(xAxisG.select('.axis-label'))
    .attr('x', innerWidth/2)
    .text("Years")
;
   
    const titleG = g.select('.title');
    const titleGEnter = gEnter.append('g')
    .attr('class', 'title')

    titleG.merge(titleGEnter)
    .selectAll('.domain')
    .remove();

    const titleGText = titleGEnter
    .append('text')
    .attr('class', 'axis-label')
    .attr('fill', 'black')
    .attr('align', 'center')
    .attr('y', -10)
    .merge(titleG.select('.axis-label'))
    .attr('x', innerWidth/4 -120)
    .text('Exoplanets discoveries per year (1992-Present)');

    //d3.colorScale.domain(nest.map(d => d.key));

    const lineGenerator = d3.line()
    .x(d => xScale(new Date(d.key)))
    .y(d => yScale(d.value))
    .curve(d3.curveBasis);
    

    const lines = g.merge(gEnter).selectAll('.line-path').data(dataPure);

    var linesL = lines.enter().append('path')
    .merge(lines)
      .attr('class', 'line-path')
      .attr('d', d => lineGenerator(d.values))
      .attr('stroke', d => colorScale(d.key))
      ;
    
    lines.exit().remove();

    // linesL.transition()
    // .duration(500)
    // .delay(function(d, i) { return i * 500; })
    // .ease("linear")
  
    // var linesP2 = linesL._groups;

    //  var totalLength = [linesP2[0][0].getTotalLength(), linesP2[0][1].getTotalLength()];

     //console.log(totalLength)

    // d3.select(linesP2[0][0])
    // .attr("stroke-dasharray", totalLength[0] + " " + totalLength[0] ) 
    // .attr("stroke-dashoffset", totalLength[0])
    //   .transition()
    //     .duration(500)
    //     .ease("linear")
    //     .attr("stroke-dashoffset", 0);

    const tooltipLine = g.merge(gEnter).append('line');

    let tipBox = g.merge(gEnter).append('rect')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .attr('opacity', 0)
    .on('mousemove', onTooltip)
    .on('mouseout', offTooltip);

    d3.selectAll('.tooltip').remove();
   
    var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("fill-opacity", 0);
    
    function offTooltip() {
        if (tooltip) tooltip.style('display', 'none');
        if (tooltipLine) tooltipLine.attr('stroke', 'none');
    }


    var bisectDate = d3.bisector(function(d) { 
       var yy = d.values;
        return yy.key; 
    }).left
      
    function onTooltip(event) {

        const year = Math.floor((xScale.invert(d3.pointer(event, tipBox.node())[0])) / 1) * 1;
        
        const yearP = new Date(year);
        const formatter = new Intl.DateTimeFormat('en', { month: 'long' });
        const month = formatter.format(yearP);

        const xM = d3.pointer(event, tipBox.node())[0];
        const x2M = d3.pointer(event, tipBox.node())[0]+1;
        const yM = d3.pointer(event, tipBox.node())[1];

       
        const dataR = dataPure;
        
        const dataRR = dataR.filter(function (v) {
                
            return v.value = d3.max(v.values, function(d){
                if(d.key<yearP){
                    return d.value;
                }
            
            })
        });

      //  console.log(dataRR)

        tooltipLine.attr('stroke', '#f5f0e1')
            .attr('x1', xM)
            .attr('x2', x2M)
            .attr('y1', 0)
            .attr('y2', innerHeight);
        
        tooltip.html( "<b>" + month + "-" + yearP.getFullYear() +"<p>")
            .style('display', 'block')
            .style("left", (event.pageX +20) + "px")
            .style("top", (event.pageY -45) + "px")
            .selectAll()
            .data(dataRR).enter()
            .append('div')
            .style('color', d => colorScale(d.key))
            .html(d => d.key +': ' + d.value
             );
    }

}
