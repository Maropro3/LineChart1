import {linePlot} from './linePlot'
import {colorLegend} from './colorLegend'

const svg = d3.select('svg');

// const width = document.body.clientWidth;
// const height = document.body.clientHeight;


 const width = d3.select('#svgM').attr('width');
 const height = d3.select('#svgM').attr('height');

const margin = { top:50, right: 80, bottom: 70, left:90};
// const innerWidth = width- width/4 ;
// const innerHeight = height -height/4;
var dataL = [];
var dataP = [];
var methods = ["Pulsar Timing", "Radial Velocity", "Transit", "Microlensing", "Imaging", "Transit Timing Variations"];
var colorScale;

const onLegendChange = (methodsF) => {
    methods = methodsF;
    console.log(methods)
    render();
}

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
    })
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
    })

    //console.log(data)
    var nest = d3.nest()
    .key(function(d) { return d.discoverymethod; })
    .key(function(d) { return d.disc_pubdate; })
    .rollup(function(values) { return +values.length; })
    .entries(data);

    const dataTest = nest;
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
            })
           
            return v.values=aa;

    });

    dataL = nest;
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
    
}

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
    const colorValue = d => d.key;
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


