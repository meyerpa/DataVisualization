function updateFirstElement(value) {
  console.log(value);
  // TODO: insert code to update value
}

function updateLoadElement(value) {
  console.log(value);
  // TODO: insert code to update load value
}

function findPower(V, R, length) {
  var r_load = d3.range(0, length, 1); // resistance for the variable load
  // compute power corresponding to each load's resistance
  var power = r_load.map(x => Math.pow(V, 2) * x / Math.pow((x + R), 2));
  // change data into a form that d3 expects
  var data = [];
  for (var i = 0; i < r_load.length; i++) {
    data.push({"resistance": r_load[i], "power": power[i]})
  }

  return {
    power: power,
    data: data,
    r_load: r_load,
  };
}


var length = 1000;
const V = 20;         // voltage (Volts)
const R = 800;        // resistance (Ohms)
var tmp = findPower(V, R, length);
var data = tmp.data;
var power = tmp.power;
var r_load = tmp.r_load;

// create Circuit schematic
// Create svg
var schematic = d3.select("#schematic")
            .attr("width", window.innerWidth)
            .attr("height", 200)
            .call(responsivefy);

// create battery
var battery_container = schematic.append("g");
battery_container.append("rect")
         .attr("class", "circuit-element battery")
         .attr("x", 30)
         .attr("y", 50)
         .attr("width", 50)
         .attr("height", 100);

var v_text = battery_container.append("text")
        .attr("x", 40)
        .attr("y", 100)
        .text(V.toString() + " V");

// create resistor #1
var r1_container = schematic.append("g")
        .attr("transform", "translate(160)");
r1_container.append("polyline")
        .attr("id", "element1")
        .attr("class", "circuit-element")
        .attr("points", "00,20 30,50 60,20 90,50 120,20");
var r1_text = r1_container.append("text")
        .attr("x", 0)
        .attr("y", 13)
        .text("Resistor 1: 150 Ohm");

// create resistor #2 for the load
var r2_container = schematic.append("g")
        .attr("transform", "translate(400, 40)");
r2_container.append("polyline")
        .attr("id", "element2")
        .attr("class", "circuit-element")
        .attr("points", "00,00 30,30 00,60 30,90 00,120");
r2_container.append("text")
        .attr("x", 10)
        .attr("y", -40)
        .attr("transform", "rotate(90)")
        .text("Load Resistor: ?");

// draw lines connecting all parts of schematic
var wires = schematic.append("g")
        .attr("class", "wires");
wires.append("polyline")
      .attr("class", "schematic-wire")
      .attr("points", "55,50 55,20 161,20");
wires.append("polyline")
      .attr("class", "schematic-wire")
      .attr("points", "279,20 401,20 401,41");
wires.append("polyline")
      .attr("class", "schematic-wire")
      .attr("points", "401,158 401,180 55,180 55,150");

var legendHeight = 200;

// Create svg
var svg = d3.select("#chart-svg")
            .attr("width", window.innerWidth)
            .attr("height", window.innerHeight - 80)
            .call(responsivefy);
var margin = {top: 10, right: 20, bottom: 30, left: 50};
var width = +svg.attr("width") - margin.left - margin.right;
var height = +svg.attr("height") - margin.top - margin.bottom;
var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// set x and y to be scaled linearly
var x = d3.scaleLinear()
    .rangeRound([0, width]);
var y = d3.scaleLinear()
    .rangeRound([height, 0]);

// create a line
var line = d3.line()
    .x(function(data) { return x(data.resistance); })
    .y(function(data) { return y(data.power); });

var bisectData = d3.bisector(function(data) { return data.resistance; }).left;

// Add tooltip
var div = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

// change text to show that the data loaded.
function updateIntro(v, r) {
  document.getElementById("more-info").innerHTML =
  "The chart shows the power through a load with a " + v.toString()
  + " Volt power source, a " + r.toString() + " Ohm resistor, and a load with"
  + " varying resistance.";
}

// makes svg responsive
// credit Brendan Sudol https://brendansudol.com/writing/responsive-d3
function responsivefy(svg) {
    // get container + svg aspect ratio
    var container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        aspect = width / height;

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);

    // to register multiple listeners for same event type,
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you call invoke this function for multiple svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on("resize." + container.attr("id"), resize);

    // get width of container and resize svg to fit it
    function resize() {
        var targetWidth = parseInt(container.style("width"))-60;
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
    }
}

// set x and y domains
x.domain(d3.extent(r_load));
y.domain(d3.extent(power));

// x-axis
g.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

// y-axis
g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));

// make the voltage line
g.append("path")
    .datum(data)
    .attr("class", "voltage-line")
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 3)
    .attr("d", line);

// x-axis title
svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom)
    .attr("dy", "1em")
    .text("Resistance (Ohms)");

// y-axis title
svg.append("text")
    .attr("x", -(height / 2))
    .attr("y", 0)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .text("Power (Watts)");

// add hover behavior
// I followed Alan Dunning’s example closely for the hover
// source: https://bl.ocks.org/alandunning/cfb7dcd7951826b9eacd54f0647f48d3
var focus = g.append("g")
    .attr("class", "focus")
    .attr("background-color", "white")
    .style("display", "none");

focus.append("line")
    .attr("class", "x-hover-line hover-line")
    .attr("y1", 0)
    .attr("y2", height);

focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", 0);

focus.append("circle")
    .attr("r", 7.5);

focus.append("text")
    .attr("x", 15)
    .attr("y", -5)
  	.attr("dy", ".5em");

svg.append("rect")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .on("mouseover", function() { focus.style("display", null); })
    .on("mouseout", function() { focus.style("display", "none"); })
    .on("mousemove", mousemove)
    .on("click", mousemove);

function mousemove() {
  var x0 = x.invert(d3.mouse(this)[0]),
      i = bisectData(data, x0, 1),
      d0 = data[i - 1],
      d1 = data[i];
  var d = x0 - d0.resistance > d1.resistance - x0 ? d1 : d0;
  focus.attr("transform", "translate(" + x(d.resistance) + "," + y(d.power) + ")");
  focus.select("text").text(function() {
    return "Resistance: " + d.resistance.toFixed(0).toString() + " Ohms;"
     + "\nPower: " + d.power.toFixed(4).toString() + " Watts";
  });
  focus.select(".y-hover-line")
        .attr("x2", -x(d.resistance));
  focus.select(".x-hover-line")
        .attr("y2", height - y(d.power));
}

updateIntro(12, 150);

function handleClick(event) {
  var v = parseFloat(document.getElementById("voltage-input").value);
  var r = parseFloat(document.getElementById("resistance-input").value);
  return updatePage(v, r);
}

function updatePage(voltage, resistance) {
  // update text
  updateIntro(voltage, resistance);
  v_text.text(voltage.toString() + " V");
  r1_text.text("Resistor 1: " + resistance.toString() + " Ohm");
  var tmp = findPower(voltage, resistance, 1000);
  //update axes
  // set x and y domains
  x.domain(d3.extent(tmp.r_load));
  y.domain(d3.extent(tmp.power));
  svg.select(".x-axis")
      .transition()
      .duration(750)
      .call(d3.axisBottom(x));
  svg.select(".y-axis")
      .transition()
      .duration(750)
      .call(d3.axisLeft(y));
  //update line
  svg.select(".voltage-line")
      .transition()
      .duration(750)
      .attr("d", line(tmp.data));
    return tmp.data;        // return to update hover behavior
}
