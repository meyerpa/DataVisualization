var filter_languages = {
  "Ada": true,
  "C": false,
  "Chapel": true,
  "C#": true,
  "C++": false,
  "Dart": true,
  "Erlang": true,
  "F#": true,
  "Fortran": true,
  "Go": true,
  "Hack": true,
  "Haskell": true,
  "Java": false,
  "Javascript": true,
  "Lisp": true,
  "Lua": true,
  "Ocaml": true,
  "Pascal": true,
  "Perl": true,
  "PHP": true,
  "Python": false,
  "Racket": true,
  "Ruby": true,
  "Rust": true,
  "Smalltalk": true,
  "Swift": true,
  "TypeScript": true,
};

// Followed Mike Bostock’s example of donut multiples closely
// source: https://bl.ocks.org/mbostock/3888852
// 26 visually distinct colors source: http://epub.wu.ac.at/1692/1/document.pdf
var color = d3.scaleOrdinal()
    .range([
      d3.rgb(2,63,165),
      d3.rgb(125,135,185),
      d3.rgb(190,193,212),
      d3.rgb(214,188,192),
      d3.rgb(187,119,132),
      d3.rgb(142,6,59),
      d3.rgb(74,111,227),
      d3.rgb(133,149,225),
      d3.rgb(181,187,227),
      d3.rgb(230,175,185),
      d3.rgb(224,123,145),
      d3.rgb(211,63,106),
      d3.rgb(17,198,56),
      d3.rgb(141,213,147),
      d3.rgb(198,222,199),
      d3.rgb(234,211,198),
      d3.rgb(240,185,141),
      d3.rgb(239,151,8),
      d3.rgb(15,207,192),
      d3.rgb(156,222,214),
      d3.rgb(213,234,231),
      d3.rgb(243,225,235),
      d3.rgb(246,196,225),
      d3.rgb(247,156,212),
    ]);
    //.range(["#ffff99", "#ccff99", "#99ff99", "#99ffff", "#99ccff", "#d580ff", "#e6ccff", "#ff99ff", "#ff9999", "#ffcc99"]);
var test_description = {
  "n-body": "Double-precision N-body simulation",
  "fannkuch-redux": "Indexed-access to tiny integer-sequence",
  "spectral-norm": "Eigenvalue using the power method",
  "mandelbrot": "Generate Mandelbrot set portable bitmap file",
  "pidigits": "Streaming arbitrary-precision arithmetic",
  "regex-redux": "Match DNA 8-mers and substitute magic patterns",
  "fasta": "Generate and write random DNA sequences",
  "k-nucleotide": "Hashtable update and k-nucleotide strings",
  "reverse-complement": "Read DNA sequences - write their reverse-complement",
  "binary-trees": "Allocate and deallocate many many binary trees"
};

var test_link = {
  "n-body": "https://benchmarksgame.alioth.debian.org/u64q/nbody-description.html#nbody",
  "fannkuch-redux": "https://benchmarksgame.alioth.debian.org/u64q/fannkuchredux-description.html#fannkuchredux",
  "spectral-norm": "https://benchmarksgame.alioth.debian.org/u64q/spectralnorm-description.html#spectralnorm",
  "mandelbrot": "https://benchmarksgame.alioth.debian.org/u64q/mandelbrot-description.html#mandelbrot",
  "pidigits": "https://benchmarksgame.alioth.debian.org/u64q/pidigits-description.html#pidigits",
  "regex-redux": "https://benchmarksgame.alioth.debian.org/u64q/regexredux-description.html#regexredux",
  "fasta": "https://benchmarksgame.alioth.debian.org/u64q/fasta-description.html#fasta",
  "k-nucleotide": "https://benchmarksgame.alioth.debian.org/u64q/knucleotide-description.html#knucleotide",
  "reverse-complement": "https://benchmarksgame.alioth.debian.org/u64q/revcomp-description.html#revcomp",
  "binary-trees": "https://benchmarksgame.alioth.debian.org/u64q/binarytrees-description.html#binarytrees"
};

// initialize width and height
var width = window.innerWidth;
var height = window.innerHeight;

var radius = 120,
    padding = 60;

var arc = d3.arc()
    .outerRadius(radius)
    .innerRadius(radius - 45);

var pie = d3.pie()
    .sort(null)
    .value(function(d) { if (!filter_languages[d.name]) {return d.time;} });

// Add tooltip for each language
var path_div = d3.select("body")
            .append("div")
            .attr("class", "tooltip lang-tooltip")
            .style("opacity", 0);

// Add tooltip for each test
var test_div = d3.select("body")
            .append("div")
            .attr("class", "tooltip test-tooltip")
            .style("opacity", 0);

// change text to show that the data loaded.
function dataLoaded() {
  if (width>700) {
    document.getElementById("more-info").innerHTML =
    "Click on one of the languages in the legend on the top or in the chart " +
    "to show/hide the execution time in seconds. Each donut chart shows a " +
    "program ran in various languages. Hover over the text in the middle " +
    "of the donut to get further information regarding the test.";
  }
  else {
    document.getElementById("more-info").innerHTML =
    "Click on one of the languages in the legend on the top or in the chart " +
    "to show/hide the execution time in seconds. Each donut chart shows a " +
    "program ran in various languages. Click on the text in the middle " +
    "of the donut to get further information regarding the test.";
  }
}

// load in parks data to display each national park
var speedsCsv = "https://gist.githubusercontent.com/meyerpa/d49344c5b38b3ffc8fada78207faac4d/raw/d9d403e01a63f990242410513b37b9f2303c3b95/speeds.csv";
d3.csv(speedsCsv, function(data) {
      return {
        "language": data['Language (simple)'],
        "n-body": +(data['n-body']),
        "spectral-norm": +(data['spectral-norm']),
        "pidigits": +(data['pidigits']),
        "fannkuch-redux": +(data['fannkuch-redux']),
        "reverse-complement": +(data['reverse-complement']),
        "k-nucleotide": +(data['k-nucleotide']),
        "fasta": +(data['fasta']),
        "binary-trees": +(data['binary-trees']),
        "mandelbrot": +(data['mandelbrot']),
        "regex-redux": +(data['regex-redux']),
      };
    }, function(data) {
  color.domain(data.map(x => x.language));

  var columns = data.columns.filter(function(d) {
    return (d != "Language" && d != "Language (simple)")
  });

  // change columns into array of json
  for (var i=0; i<columns.length; i++) {
    columns[i] = {test: columns[i],};
  }

  columns.forEach(function(name) {
    name.languages = data.map(function(d) {
      return {name: d.language, time: +d[name.test]};
    });
  });

  var item_width = radius*2;
  // add legend
  var legend = d3.select("#chart").append("svg")
      .attr("class", "legend")
      .attr("width", width-50)
      .attr("height", 20 * (data.length+2) / Math.floor(width/item_width))
    .selectAll("g")
      .data(color.domain().slice().reverse())
    .enter().append("g")
      .attr("class", function(d) { return "legend-" + d;})
      .attr("opacity", function(d) { return filter_languages[d]? 0.2: 1; })
      .attr("transform", function(d, i) {
        return "translate(" + (i % (Math.floor(width/item_width))) * item_width + "," +
                Math.floor(i / (Math.floor(width/item_width)))*20 + ")"; })
      .on("click", function(d) {
        // change legend opacity on click
        if (d3.select(this).style("opacity") == 1) {
          d3.select(this).style("opacity", 0.2);
        }
        else {
          d3.select(this).style("opacity", 1);
        }

        var value = d3.select(this).selectAll("text").text();
        change_pie(value);
      });

  // update pie chart to include/disclude the value (prog. language string)
  function change_pie(value) {
    var new_filter = !filter_languages[value];
    filter_languages[value] = new_filter;

    svg.selectAll(".arc")
        .data(function(d) { return pie(d.languages); });
    d3.selectAll("path").attr("d", arc);

    // update test completion time in path
    svg.selectAll("text")
      .data(function(d) { return pie(d.languages); })
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .text(function(d) {
          // show time to complete for larger, visible arcs
          if (Math.abs(d.startAngle-d.endAngle)>0.3 && !filter_languages[d.data.name]) {
            return (d.data.time.toString());
          }
        });
  }

  legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text(function(d) { return d; });

  // add each donut
  var svg = d3.select("#chart").selectAll(".pie")
      .data(columns)
    .enter().append("svg")
      .attr("class", "pie")
      .attr("width", radius * 2)
      .attr("height", radius * 2)
    .append("g")
      .attr("transform", "translate(" + radius + "," + radius + ")");

  // add each arc
  var g = svg.selectAll(".arc")
      .data(function(d) { return pie(d.languages); });

  var path = g.enter().append("path")
      .attr("class", function(d) {
        return "arc " + d.data.name;
      })
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.name); })
      .on("mouseover", function(d) {
        path_div.transition()
          .duration(300)
          .style("opacity", 0.95);
          path_div.text(d.data.name + ": " + d.data.time.toString() + " seconds")
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY) + "px");
      })
      .on("mouseout", function(d) {
        path_div.transition()
          .duration(300)
          .style("opacity", 0);
      })
      .on("click", function(d) {
        // on click, make legend item transluscent
        var value = d.data.name;
        d3.select(".legend-"+value)
              .attr("opacity", 0.2);
        change_pie(value);
      })

  // adds change in charts at the beginning
  path.transition()
      .duration(1000)
      .attrTween('d', function(d) {
          var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
          return function(t) {
              return arc(interpolate(t));
          };
      });

  // add seconds to complete each test if larger than a threshold
  g.enter().append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .text(function(d) {
        // show time to complete for larger, visible arcs
        if (Math.abs(d.startAngle-d.endAngle)>0.3 && !filter_languages[d.data.name]) {
          return (d.data.time.toString());
        }
      });

  // add text in the center of each donut
  svg.append("text")
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.test; })
      .on("mouseover", function(d) {
        test_div.transition()
          .duration(600)
          .style("opacity", 0.90);
          test_div.text(test_description[d.test])
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY) + "px");
      })
      .on("mouseout", function(d) {
        test_div.transition()
          .duration(600)
          .style("opacity", 0);
      })
      .on("click", function(d) {
        test_div.transition()
          .duration(600)
          .style("opacity", 0.90);
          test_div.text(test_description[d.test])
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY) + "px");
      });

    // Update text above svg to tell user what they are supposed to do.
    dataLoaded();
  });
