const SVG1 = d3.select("#vis-1").append("svg");
const SVG2 = d3.select("#vis-2").append("svg");
const SVG3 = d3.select("#vis-3").append("svg");

const MARGIN = {
  top: 50,
  bottom: 50,
  left: 50,
  right: 50,
};

const WIDTH_1 = 1000 - MARGIN.left - MARGIN.right;
const HEIGHT_1 = 800 - MARGIN.top - MARGIN.bottom;

const WIDTH_2 = 1000;
const HEIGHT_2 = 1200;


// Editar tamaños como estime conveniente
SVG1.attr("width", WIDTH_1).attr("height", HEIGHT_1);
SVG2.attr("width", WIDTH_2).attr("height", HEIGHT_2);
SVG3.attr("width", WIDTH_1).attr("height", HEIGHT_1);

const contenedorPrimeraVisualizacion = SVG1.append("g").attr(
  "transform",
  `translate(${MARGIN.left}, ${MARGIN.top})`
);

let VGSalesData; // Variable para almacenar los datos JSON parseados

d3.json("vgsales.json")
  .then((datos) => {
    console.log(datos);
    VGSalesData = datos;
  })
  .catch((error) => console.log(error));

function createVGMap() {
  Promise.all([d3.json("world.topojson")])
    .then(([worldData]) => {
      // Hacer algo con los datos cargados
      ready(null, worldData);
    })
    .catch((error) => {
      // Manejar cualquier error de carga
      console.error("Error al cargar los datos:", error);
      ready(error);
    });


  var projection = d3
    .geoMercator()
    .translate([WIDTH_1 / 2, HEIGHT_1 / 2])
    .scale(140);

  var path = d3.geoPath().projection(projection);

  var currentRegion = null;

  function ready(error, worldData) {
    if (error) {
      // Manejar el error de carga de datos
      console.error("Error al cargar los datos:", error);
      // Realizar acciones adicionales si es necesario
      return;
    }

    var countries = topojson.feature(
      worldData,
      worldData.objects.countries
    ).features;

    const excludedCountriesEurope = [
      "Russia",
      "Germany",
      "United Kingdom",
      "France",
      "Italy",
      "Spain",
      "Ukraine",
      "Poland",
      "Romania",
      "Netherlands",
      "Belgium",
      "Greece",
      "Czechia",
      "Portugal",
      "Sweden",
      "Hungary",
      "Austria",
      "Switzerland",
      "Bulgaria",
      "Denmark",
      "Finland",
      "Slovakia",
      "Norway",
      "Ireland",
      "Croatia",
      "Moldova",
      "Bosnia and Herz.",
      "Albania",
      "Lithuania",
      "Macedonia",
      "Slovenia",
      "Latvia",
      "Estonia",
      "Montenegro",
      "Luxembourg",
      "Malta",
      "Iceland",
      "Andorra",
      "Monaco",
      "Liechtenstein",
      "San Marino",
      "Holy See",
      "Serbia",
      "Kosovo",
      "Belarus",
      "Cyprus",
    ];

    const excludedCountriesUSA = ["United States of America"];
    const excludesCountriesJapan = ["Japan"];
    var highlightedRegions = [];

    function getTopGamesByRegion(region) {
      // Filtrar los juegos por región y ordenar por ventas descendentes
      const games = VGSalesData.filter((game) => game[region] > 0).sort(
        (a, b) => b[region] - a[region]
      );

      // Tomar los primeros 30 juegos
      return games.slice(0, 30);
    }

    function getTopGenresByRegion(region) {
      // Filtrar los juegos por región y obtener la cantidad de ventas por género de juego
      const games = VGSalesData.filter((game) => game[region] > 0);
      const genres = {};
      const genresList = [];

      games.forEach((game) => {
        if (genres[game.Genre]) {
          genres[game.Genre] += game[region];
        } else {
          genres[game.Genre] = game[region];
        }
      });

      // Convertir el objeto a una lista de objetos
      for (const genre in genres) {
        genresList.push({ name: genre, sales: genres[genre] });
      }
      console.log(region, genres);
      createPieChart(genresList);
    }

    // Function to create the pie chart
    function createPieChart(genres) {
      console.log(genres);
      // Ordenar la lista por la propiedad "sales" de forma descendente
      genres.sort((a, b) => b.sales - a.sales);

      // Tomar los primeros 10 elementos de la lista ordenada
      genres = genres.slice(0, 7);

      const width = WIDTH_3 - MARGIN.left - MARGIN.right;
      const height = HEIGHT_3 - MARGIN.top - MARGIN.bottom;
      const radius = Math.min(width, height) / 2;

      var ordScale = d3
        .scaleOrdinal()
        .domain(genres.map((d) => d.name))
        .range(['#8E9B90', '#93C0A4', '#B6C4A2', '#D4CDAB', '#DCE2BD', '#BFC1B8', '#99A172', '#808E3B']);

      var pie = d3.pie().value(function (d) {
        return d.sales;
      });

      var arc = SVG2
        .selectAll("arc")
        .data(pie(genres))
        .enter();

      var path = d3.arc()
        .outerRadius(radius)
        .innerRadius(0);

      var arcs = arc.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`); // Translate the group element to the center

      arcs.append("path")
        .attr("d", path)
        .attr("fill", function (d) {
          return ordScale(d.data.name);
        });

      var label = d3.arc()
        .outerRadius(radius)
        .innerRadius(0);

      arcs.append("text")
        .attr("transform", function (d) {
          const pos = label.centroid(d);
          const x = pos[0]; // X position of centroid
          const y = pos[1]; // Y position of centroid
          const h = Math.sqrt(x * x + y * y); // Hypotenuse (distance from centroid to origin)
          const nx = (x / h) * (radius - 100); // New X position with an offset of 10 pixels
          const ny = (y / h) * (radius - 100); // New Y position with an offset of 10 pixels
          const angle = (Math.atan2(y, x) * 180) / Math.PI; // Angle of rotation in degrees
          return `translate(${nx}, ${ny}) rotate(${angle})`; // Translate and rotate the text element
        })
        .text(function (d) {
          return d.data.name;
        })
        .style("font-family", "arial")
        .style("font-size", '15px')
        .style("text-anchor", "middle");
    }

    
    

    contenedorPrimeraVisualizacion
      .selectAll(".country")
      .data(countries)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .on("mouseover", (event, d) => {
        const clickedCountry = d3.select(event.currentTarget);
        const countryName = d.properties.name;

        // Verificar si el país no está en la lista de países excluidos
        if (
          !excludedCountriesEurope.includes(countryName) &&
          !excludedCountriesUSA.includes(countryName) &&
          !excludesCountriesJapan.includes(countryName)
        ) {
          // Aplicar estilos de resaltado a los países no excluidos
          contenedorPrimeraVisualizacion
            .selectAll(".country")
            .classed(
              "highlighted",
              (d) =>
                !excludedCountriesEurope.includes(d.properties.name) &&
                !excludedCountriesUSA.includes(d.properties.name) &&
                !excludesCountriesJapan.includes(d.properties.name)
            );
        }
        if (excludedCountriesEurope.includes(countryName)) {
          // Aplicar estilos de resaltado a todos los países de Europa
          contenedorPrimeraVisualizacion
            .selectAll(".country")
            .classed("highlighted", (d) =>
              excludedCountriesEurope.includes(d.properties.name)
            );
        }

        clickedCountry.classed("highlighted", true);
      })
      .on("mouseout", (event, d) => {
        const clickedCountry = d3.select(event.currentTarget);
        const countryName = d.properties.name;

        // Verificar si el país no está en la lista de países excluidos
        if (
          !excludedCountriesEurope.includes(countryName) &&
          !excludedCountriesUSA.includes(countryName) &&
          !excludesCountriesJapan.includes(countryName)
        ) {
          // Eliminar estilos de resaltado de los países no excluidos
          contenedorPrimeraVisualizacion
            .selectAll(".country")
            .classed("highlighted", false);
        }

        // Verificar si el país es uno de Europa
        if (excludedCountriesEurope.includes(countryName)) {
          // Eliminar estilos de resaltado de todos los países de Europa
          contenedorPrimeraVisualizacion
            .selectAll(".country")
            .classed("highlighted", false);
        }

        clickedCountry.classed("highlighted", false);
      })
      .on("click", (event, d) => {
        
        const countryName = d.properties.name;
      
        let region = "Other_Sales"; // Por defecto, mostrar las ventas globales
        
        // Verificar la región correspondiente al país clickeado
        if (excludedCountriesUSA.includes(countryName)) {
          region = "NA_Sales";
        } else if (excludedCountriesEurope.includes(countryName)) {
          region = "EU_Sales";
        } else if (excludesCountriesJapan.includes(countryName)) {
          region = "JP_Sales";
        }

        getTopGenresByRegion(region);

        currentRegion = region; // Actualizar la región actual
        // Borrar resaltado de los países
        contenedorPrimeraVisualizacion
          .selectAll(".country")
          .classed("highlighted", false)
          .classed("highlighted-region", false);

        // Resaltar los países de la región actual en rojo
        contenedorPrimeraVisualizacion
          .selectAll(".country")
          .filter((d) => {
            const regionCountryName = d.properties.name;
            if (region === "NA_Sales") {
              return excludedCountriesUSA.includes(regionCountryName);
            } else if (region === "EU_Sales") {
              return excludedCountriesEurope.includes(regionCountryName);
            } else if (region === "JP_Sales") {
              return excludesCountriesJapan.includes(regionCountryName);
            }
            return (
              !excludedCountriesEurope.includes(d.properties.name) &&
              !excludedCountriesUSA.includes(d.properties.name) &&
              !excludesCountriesJapan.includes(d.properties.name)
            );
          })
          .classed("highlighted-region", function(d) {
          
            return true;
          });

        const topGames = getTopGamesByRegion(region);

        // Vaciar la lista de juegos
        d3.select("#gameList").html("");

        // Añadir el título
        d3.select("#gameList")
        .append("h2")
        .text("Top 30 juegos más vendidos");

        // Agregar cada juego a la lista
        d3.select("#gameList")
          .selectAll("li")
          .data(topGames)
          .enter()
          .append("li")
          .html((d) => {
            return `<strong>${d.Name}</strong> (${d.Platform}) - ${d.Publisher} - ${d.Genre} - ${d.Year}`;
          });
      });
  }
}

createVGMap();
