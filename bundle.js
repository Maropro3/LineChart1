(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  const linePlot = (selection,props) => {


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
      .style('stroke', '#b3aca7');
      // .remove();

      yAxisGEnter.append('text')
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

      xAxisGEnter.append('text')
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
      .attr('class', 'title');

      titleG.merge(titleGEnter)
      .selectAll('.domain')
      .remove();

      titleGEnter
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

      lines.enter().append('path')
      .merge(lines)
        .attr('class', 'line-path')
        .attr('d', d => lineGenerator(d.values))
        .attr('stroke', d => colorScale(d.key))
        ;
      
      lines.exit().remove();

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


      d3.bisector(function(d) { 
         var yy = d.values;
          return yy.key; 
      }).left;
        
      function onTooltip(event) {

          const year = Math.floor((xScale.invert(d3.pointer(event, tipBox.node())[0])) / 1) * 1;
          
          const yearP = new Date(year);
          const formatter = new Intl.DateTimeFormat('en', { month: 'long' });
          const month = formatter.format(yearP);

          const xM = d3.pointer(event, tipBox.node())[0];
          const x2M = d3.pointer(event, tipBox.node())[0]+1;
          d3.pointer(event, tipBox.node())[1];

         
          const dataR = dataPure;
          
          const dataRR = dataR.filter(function (v) {
                  
              return v.value = d3.max(v.values, function(d){
                  if(d.key<yearP){
                      return d.value;
                  }
              
              })
          });

          dataRR.sort((a,b) => (a.value < b.value) ? 1:(b.value < a.value) ? -1:0);

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

  };

  const colorLegend = (selection, props) => {
    const { colorScale, circleRadius, spacing, textOffset, onLegendChange} = props;

    var contClick = 0;
    var methodsF = [];
    let select = selection.selectAll('select').data([null]);

    const onCLick = function(event, d){
      if(contClick == 0) {
        d3.selectAll('.gLegend')
        .attr('opacity', 0.2);
        d3.select(this)   
        .attr('opacity', 1);
        contClick++;
        methodsF.push(d3.select(this).selectAll('text').text());
        onLegendChange(methodsF);
      }
      else if(methodsF.length === 6) {
        d3.selectAll('.gLegend')
        .attr('opacity', 0.2);
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
        .attr('opacity', 1);
        methodsF = ["Pulsar Timing", "Radial Velocity", "Transit", "Microlensing", "Imaging", "Transit Timing Variations"];
        onLegendChange(methodsF);
      
     
     
    };

    const onMouseover = function(event, d){

      d3.select(this).selectAll('rect')
      .attr("stroke", "white")
      .attr('stroke-width', '2');
    };

    const onMouseout = function(event, d){

      d3.select(this).selectAll('rect')
      .attr("stroke", "none")
      .attr('stroke-width', '2');
      
    };

    select.enter()
    .merge(select)
    .append('rect')
    .attr('class', 'legendBack')
    .attr('width', '254px')
    .attr('height', '224px')
    .attr('transform', 'translate(0, -25)');

    select.enter()
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

  entries.append('rect')
    .attr('width', circleRadius) 
    .attr('height', circleRadius)
    .attr('fill',colorScale);



  entries.append('text')
    .attr('x', textOffset +5) 
    .attr('dy', '0.78em') 
    .attr('fill', 'black')
    .attr('font-family', 'Helvetica Neue, Arial')
    .attr('font-size', '9px')
    .attr('class', 'legendText')
    .style('user-select', 'none') 
    .text(d => d);
  };

  const svg = d3.select('svg');

  // const width = document.body.clientWidth;
  // const height = document.body.clientHeight;


   const width = d3.select('#svgM').attr('width');
   const height = d3.select('#svgM').attr('height');
  var dataP = [];
  var methods = ["Pulsar Timing", "Radial Velocity", "Transit", "Microlensing", "Imaging", "Transit Timing Variations"];
  var colorScale;

  const onLegendChange = (methodsF) => {
      methods = methodsF;
      console.log(methods);
      render();
  };

  // svg
  // .attr("width", innerWidth)
  // .attr("height", innerHeight);
  let dateRange = [new Date("1992"), new Date()]; 

  //SLIDER 1
  var sliderRangeDate = d3
  .sliderBottom()
  .min(new Date("1992"))
  .max(new Date())
  .step(1000 * 60 * 60 * 24 * 30)
  .width(850)
  .height(50)
  .tickPadding(3)
  .tickFormat(d3.timeFormat('%Y'))
  .ticks(12)
  .default([new Date("1992"), new Date()])
  .fill('#2196f3')
  .on('onchange', val => {
      dateRange = sliderRangeDate.value();
      render();
  });

  var gRange = d3
  .select('div#slider-range')
  .append('svg')
  .attr('width', 5000)
  .attr('height', 100)
  .append('g')
  .attr('transform', `translate(${width/4},8)`);

  gRange.call(sliderRangeDate)
  .append('text')
  .attr('width', '10px')
  .attr('height', '10px')
  .attr('transform', `translate(-90,11)`)
  .text("Years:");

   //END SLIDER 1


  const render = () => {

      

      const dataFM = dataP;

      const data = dataFM.filter(
          
          v => methods.includes(v.discoverymethod)
      );
      
      data.sort(function(a,b){
          return a.disc_pubdate - b.disc_pubdate;
      });
      //console.log(data);

      for(var i = 0, len = data.length; i < len-4; i++){

          if (Object.prototype.toString.call(data[i].disc_pubdate) === "[object Date]"){
              if (isNaN(data[i].disc_pubdate.getTime())) {  
                  data.splice(i,1);
                } 
          }
      }

      data.sort(function(a,b){
          return a.disc_pubdate - b.disc_pubdate;
      });

      //console.log(data)
      var nest = d3.nest()
      .key(function(d) { return d.discoverymethod; })
      .key(function(d) { return d.disc_pubdate; })
      .rollup(function(values) { return +values.length; })
      .entries(data);
     // console.log(dataTest)
      for(var i = 0, len = nest.length; i < nest.length; i++){
          var tt = nest[i].values;
          var acum = 0;
          for(var c = 0, len = tt.length; c < len; c++) {
              tt[c].key = new Date(tt[c].key);
              acum += tt[c].value;
              tt[c].value = acum;
          }
      }

     
      for(var i = 0, len = nest.length; i < len; i++){
          acum += nest[i].value;
          nest[i].value = acum;
      }
      //console.log(nest)
      const dataRR = nest.filter(function (v) {
              var tt = v.values;
               var aa = tt.filter( function(d) {
                  if (d.key < dateRange[1] && d.key > dateRange[0]) {
                      return d
                  }
              });
             
              return v.values=aa;

      });
     // console.log(nest)

      svg.call(linePlot, {
          title: 'Exoplanets Discoveries',
         // xValue: d => d[xColumn],
          xLabel: 'Year',
          //xColName: xColumn,
          //yValue: d => d[yColumn],
          yLabel: 'Total number of exoplanets discovered',
          //yColName: yColumn,
          margin: { top:70, right: 80, bottom: 150, left:180},
          width,
          height,
          //xUnits,
          //yUnits,
          dateRange: dateRange,
          colorScale: colorScale,
         // colorValue: d => d.discoverymethod,
          data: dataRR,
          dataP: dataRR
          
     });

     const gLegendEnter = svg.append('g')
     .attr('class', 'legend');

     const gLegend = svg.selectAll('.legend').data([null]);

     gLegendEnter
     .attr('transform', `translate(${180},${140 })`)
     .merge(gLegendEnter)
     .call(colorLegend, {
         colorScale,
         circleRadius: 20,
         spacing: 30,
         textOffset: 20,
         onLegendChange: onLegendChange,
     });

     gLegend.exit().remove();
      
  };

  d3.csv('https://raw.githubusercontent.com/Maropro3/DataUpload/main/ExoplanetsLine.csv').then(loadedData => {
  //     let dataC = data.filter(d => d.disc_pubdate !== "" );
  //    // let dataC2 = data.filter(d => d.pl_bmasse !== "" );
  //     let dataC3 = dataC.filter(d => d.pl_rade !== "" );
  //     let dataF = dataC3.filter(d => d.st_teff !== "" );

      loadedData.forEach(d => { 

          d.pl_bmasse = +d.pl_bmasse;
          d.pl_rade = +d.pl_rade;
          d.st_mass = +d.st_mass;
          d.st_teff = +d.st_teff;
          d.disc_year = +d.disc_year;
          d.disc_pubdate = new Date(d.disc_pubdate);

      });
      var loadedData2 = loadedData.filter(
          
          v => methods.includes(v.discoverymethod)
      );


      dataP = loadedData2;
      colorScale =  d3.scaleOrdinal()
      .domain(["Pulsar Timing", "Radial Velocity", 
      "Transit", "Microlensing", 
      "Imaging", "Transit Timing Variations"])
      .range(['#f2d977', '#f27777', 
      '#77d3f2','#77f2bb',
      '#d577f2', '#777ff2'
     ]);
     

      render();
  });

})));
