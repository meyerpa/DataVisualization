// make list of possible animal choices
var animal_dict = {
  "Grey Wolf": "Canis lupus",
  "Black Bear": "Ursus americanus",
  "North American Bison": "Bison bison",
  "Owl": "Bubo virginianus",
  "Moose": "Alces alces",
  "Cougar": "Puma concolor",
  "Whale": "Megaptera novaeangliae",
  "Seal": "Phoca vitulina",
  "Gecko": "Hemidactylus frenatus",
  "Alligator": "Alligator mississippiensis",
  "Seal": "Phoca vitulina",
};

var animal_color = {
  "Canis lupus": "#1f77b4",
  "Ursus americanus": "#ff7f0e",
  "Bison bison": "#2ca02c",
  "Bubo virginianus": "#F4D03F",
  "Alces alces": "#d62728",
  "Puma concolor": "#9467bd",
  "Megaptera novaeangliae": "#e377c2",
  "Hemidactylus frenatus": "#1ABC9C",
  "Alligator mississippiensis": "#17202A",
  "Phoca vitulina": "#8c564b",
};

// make list of possible animal choices
var animals=Object.keys(animal_dict);
// For use in the Scientific Name column then grab the Park Name
var animal_sci=Object.values(animal_dict);
// Make dictionary of animal


var color = d3.scaleOrdinal(d3["schemeCategory10"]);

// initialize width and height
var width = window.innerWidth;
var height = window.innerHeight;

// Slightly changed legend code from Mike Bostock:
// http://bl.ocks.org/mbostock/3888852
var legend = d3.select("#map").append("svg")
      		.attr("class", "legend")
     			.attr("width", 180)
    			.attr("height", (20*animals.length)+5)
          .attr("align", "center")
   			.selectAll("g")
   				.data(animals)
   			.enter()
   				.append("g")
     			.attr("transform", function(data, i) {
            return "translate(0," + 20*i + ")";
          })
          // Add mouseover to change dots that appear
          .on("mouseover", function(data) {
            showParksWith(animal_dict[data]);
          })
          .on("mouseout", function(data) {
            showAllParks();
          })
          // add click for mobile
          .on("click", function(data) {
            showParksWith(animal_dict[data]);
          });

legend.append("rect")
  .data(animal_sci)
		  .attr("width", 18)
		  .attr("height", 18)
    .attr("fill", function(data) { return animal_color[data]; });

legend.append("text")
	  .data(animals)
  	  .attr("x", 24)
  	  .attr("y", 9)
  	  .attr("dy", ".35em")
  	  .text( function(data) {
        return data;
      })
      // Add mouseover to change dots that appear
      .on("mouseover", function(data) {
        showParksWith(animal_dict[data]);
      })
      .on("mouseout", function(data) {
        showAllParks();
      })
      // add click for mobile
      .on("click", function(data) {
        showParksWith(animal_dict[data]);
      });

// Create svg
var svg = d3.select("#map")
            .append("svg")
            .attr("width", 900)
            .attr("height", 500)
            .call(responsivefy);

// D3 Projection
var projection = d3.geoAlbersUsa();

// create u.s. path
var path = d3.geoPath()
    .projection(projection);

// allows objects to be in front of map
var g = svg.append("g");

// Add tooltip
var div = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

// displays only the parks with a certain animal (scientific name)
function showParksWith(someAnimal) {
  // set all of the parks to be transparent
  svg.selectAll("circle")
    .transition()
    .duration(500)
    .style("opacity", 0);

    // set the specific animal's parks to be opaque
    svg.selectAll("." + someAnimal.replace(/\s+/g, ''))
      .transition()
      .duration(500)
      // this changes the color to coordinate with the legend
      .style("fill", animal_color[someAnimal])
      .style("opacity", 1);
}

// shows all of the parks
function showAllParks(){
  // set all of the parks to be opaque
  svg.selectAll("circle")
    .transition()
    .duration(300)
    .style("opacity", 1);
}

// change text to show that the data loaded.
function dataLoaded() {
  if (width>700) {
    document.getElementById("more-info").innerHTML =
    "Hover over one of the animal's text in the legend to see which U.S. national parks have them.";
  }
  else {
    document.getElementById("more-info").innerHTML =
    "Click on one of the animal's text in the legend to see which U.S. national parks have them.";
  }
}

// makes svg responsivefy
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
        var targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
    }
}

// load in U.S. data and display map
var usJson = "https://gist.githubusercontent.com/mbostock/4090846/raw/07e73f3c2d21558489604a0bc434b3a5cf41a867/us.json";
d3.json(usJson, function(error, us) {
  if (error) throw error;

  g.selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path)
      .attr("class", "feature");

  g.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "mesh")
      .attr("d", path);
});

// load in parks data to display each national park
var parksCsv = "https://gist.githubusercontent.com/meyerpa/1a5b1c3388e73ce2870c70fe2d42e55b/raw/6543d72cf302596850364b24b532bd6d0ab92923/parks.csv";
d3.csv(parksCsv, function(data) {
      return {
        parkName: data['Park Name'],
        latitude: parseInt(data['Latitude']),
        longitude: parseInt(data['Longitude']),
        size: parseInt(data['Acres'])
      };
    }, function(data) {
  svg.selectAll("circle")                 // create virtual circle template
    .data(data)                           // bind data
  .enter()                                // for each row in data
    .append("circle")
    .attr('id', function(data) { return data.parkName.replace(/\s+/g, '' ) })
    .attr("r", function(data) {
      return Math.log(data.size/1000);
    })
    .attr("cx", function(data) {
      // Map longitude and latitude onto map, return null if outside
      var x = projection([data.longitude, data.latitude]);
      return (x == null ? null:  x[0]);
    })
    .attr("cy", function(data) {
      // Map longitude and latitude onto map, return null if outside
      var y = projection([data.longitude, data.latitude]);
      return (y == null ? null:  y[1]);
    })
    .attr("fill", "black")
    // Add tooltip
    .on("mouseover", function(data) {
      div.transition()
        .duration(300)
        .style("opacity", 0.95);
        div.text(data.parkName)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY- 7) + "px");
    })
    .on("mouseout", function(data) {
        div.transition()
           .duration(300)
           .style("opacity", 0);
    })
    // add tooltip click for mobile
    .on("mouseover", function(data) {
      div.transition()
        .duration(300)
        .style("opacity", 0.95);
        div.text(data.parkName)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY- 7) + "px");

    })
  });

// load in species data to update national park objects
// with a class for each speices to be used with the legend
// Also, update national parks' colors to species in legend
var species_csv = "https://gist.githubusercontent.com/meyerpa/dd799c36fe0ee80e1160f9a44c538236/raw/5251e7794f82dafb23384794eecfc9fa3f63bcae/species.csv";
d3.csv(species_csv, function(data) {
    return {
      parkName: data['Park Name'].replace(/\s+/g, ''),
      species: data['Scientific Name']
    };
  }, function(data) {
    for (var i=0; i<data.length; i++) {
      if (animal_sci.includes(data[i].species)) {
        svg.select("#"+data[i].parkName)
          // supposed to change the color of the circles, but isn't working
          .style("fill", animal_color[data[i].species])
          .attr("class",
            // append scientific name to class
            // this will label the obejcts for hover later
            // null doesn't matter so I won't
            // handle the case where it returns null
            svg.select("#"+data[i].parkName).attr("class") + " " +
            data[i].species.replace(/\s+/g, ''));

      }
    };
    // update text to let user know the data was loaded
    dataLoaded();
});
