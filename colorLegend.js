export const colorLegend = (selection, props) => {
  const { colorScale, circleRadius, spacing, textOffset, onLegendChange} = props;

  var contClick = 0;
  var methodsF = [];
  let select = selection.selectAll('select').data([null]);

  const onCLick = function(event, d){
    if(contClick == 0) {
      d3.selectAll('.gLegend')
      .attr('opacity', 0.2)
      d3.select(this)   
      .attr('opacity', 1);
      contClick++;
      methodsF.push(d3.select(this).selectAll('text').text());
      onLegendChange(methodsF);
    }
    else if(methodsF.length === 6) {
      d3.selectAll('.gLegend')
      .attr('opacity', 0.2)
      d3.select(this)   
      .attr('opacity', 1);
      methodsF = [];
      methodsF.push(d3.select(this).selectAll('text').text());
      onLegendChange(methodsF);
     }
    else {
      if ( d3.select(this).attr('opacity') == 1) { 

        d3.select(this)   
        .attr('opacity', 0.2);
        methodsF = methodsF.filter (
           v => v !== d3.select(this).selectAll('text').text()
        );
        onLegendChange(methodsF);
        }
      else {
        d3.select(this)   
      .attr('opacity', 1);
      methodsF.push(d3.select(this).selectAll('text').text());
      onLegendChange(methodsF);
      }
    }
   
 
  };

  const onDBCLick = function(event, d){
    
   
      d3.selectAll('.gLegend')
      .attr('opacity', 1)
      methodsF = ["Pulsar Timing", "Radial Velocity", "Transit", "Microlensing", "Imaging", "Transit Timing Variations"];
      onLegendChange(methodsF);
    
   
   
  };

  const onMouseover = function(event, d){

    d3.select(this).selectAll('rect')
    .attr("stroke", "white")
    .attr('stroke-width', '2');
  }

  const onMouseout = function(event, d){

    d3.select(this).selectAll('rect')
    .attr("stroke", "none")
    .attr('stroke-width', '2');
    
  }

  const background = select.enter()
  .merge(select)
  .append('rect')
  .attr('class', 'legendBack')
  .attr('width', '254px')
  .attr('height', '224px')
  .attr('transform', 'translate(0, -25)');

  const title = select.enter()
  .merge(select)
  .append('text')
  .attr('x', 0)
  .attr('y', 0)
  .attr('fill', 'black')
  .attr('font-family', 'Helvetica Neue, Arial')
  .attr('font-weight', 'bold')
  .attr('font-size', '10px')
  .text('Discovery Method:');

 
  const entries = select.enter()
  .merge(select).selectAll('g')
  .data(colorScale.domain())
  .join('g')
  .attr('transform', (d, i) =>
  `translate(0, ${i * spacing + 28})`)
  .attr('class', 'gLegend')
  .on('click', onCLick)
  .on('dblclick', onDBCLick)
  .on('mouseover', onMouseover)
  .on('mouseout', onMouseout);

const symbols = entries.append('rect')
  .attr('width', circleRadius) 
  .attr('height', circleRadius)
  .attr('fill',colorScale);



const labels = entries.append('text')
  .attr('x', textOffset +5) 
  .attr('dy', '0.78em') 
  .attr('fill', 'black')
  .attr('font-family', 'Helvetica Neue, Arial')
  .attr('font-size', '9px')
  .attr('class', 'legendText')
  .style('user-select', 'none') 
  .text(d => d);
}
