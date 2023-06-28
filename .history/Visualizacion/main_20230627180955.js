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

const WIDTH_3 = 1000;
const HEIGHT_3 = 1200;

// Editar tamaños como estime conveniente
SVG1.attr("width", WIDTH_1).attr("height", HEIGHT_1);
SVG2.attr("width", WIDTH_2).attr("height", HEIGHT_2);
SVG3.attr("width", WIDTH_3).attr("height", HEIGHT_3);

const WIDTH_4 = 400;
const HEIGHT_4 = 400;

const SVG4 = d3.select("#vis-4").append("svg")
  .attr("width", WIDTH_4)
  .attr("height", HEIGHT_4);

const pieChart = SVG4.append("g")
  .attr("transform", `translate(${WIDTH_4 / 2}, ${HEIGHT_4 / 2})`);

  function updatePieChart(region, genre) {
    console.log(region, genre);
    // Filter the VGSalesData based on the selected region and genre
    const filteredData = VGSalesData.filter(game => game[region] > 0 && game.Genre === genre);
    
    // Group the data by genre and calculate the total sales for each genre
    const genreSales = d3.rollup(filteredData, 
      games => d3.sum(games, game => game[region]),
      game => game.Genre
    );
  
    // Convert the genreSales map to an array of objects
    const genreSalesArray = Array.from(genreSales, ([genre, sales]) => ({ genre, sales }));
  
    // Create a pie layout
    const pie = d3.pie()
      .value(d => d.sales)
      .sort(null);
  
    // Generate the arc data for the pie slices
    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(Math.min(WIDTH_4, HEIGHT_4) / 2 - 10);
  
    // Join the genreSalesArray with pie slices
    const slices = pieChart.selectAll("path")
      .data(pie(genreSalesArray), d => d.data.genre);
  
    // Update existing slices
    slices.attr("d", arc);
  
    // Enter new slices
    slices.enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => d3.schemeCategory10[i % 10]);
  
    // Exit removed slices
    slices.exit().remove();
  }
  

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
      
        let region = "Other_Sales"; // Default to global sales
      
        // Determine the region based on the clicked country
        if (excludedCountriesUSA.includes(countryName)) {
          region = "NA_Sales";
        } else if (excludedCountriesEurope.includes(countryName)) {
          region = "EU_Sales";
        } else if (excludesCountriesJapan.includes(countryName)) {
          region = "JP_Sales";
        }
      
        // Determine the genre based on your logic (replace "Action" with your genre variable)
        const genre = "Action";
      
        // Call the updatePieChart function with the selected region and genre
        updatePieChart(region, genre);
      
        currentRegion = region; // Actualizar la región actual
      
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
            const regionCountryName = d.properties.name;
            if (highlightedRegions.includes(regionCountryName)) {
              // Region is already highlighted, remove highlighting
              const index = highlightedRegions.indexOf(regionCountryName);
              const x = highlightedRegions.splice(index, 1);
              return false;
            }
            // Region is not highlighted, add highlighting
            highlightedRegions.push(regionCountryName);
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
