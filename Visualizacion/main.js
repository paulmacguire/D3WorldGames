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

const contenedorPrimeraVisualizacion = SVG1.append("g").attr(
  "transform",
  `translate(${MARGIN.left}, ${MARGIN.top})`
);

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
            .classed("selected", (d) =>
              excludedCountriesEurope.includes(d.properties.name)
            );
        }

        clickedCountry.classed("selected", true);
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
            .classed("selected", false);
        }

        clickedCountry.classed("selected", false);
      });

    // Hacer algo con los datos cargados
    console.log(worldData);
    console.log(countries);
  }
}

createVGMap();
