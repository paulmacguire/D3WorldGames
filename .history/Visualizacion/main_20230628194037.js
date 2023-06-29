const SVG1 = d3.select("#vis-1").append("svg");

const MARGIN = {
  top: 50,
  bottom: 50,
  left: 50,
  right: 50,
};

const WIDTH_1 = 800;
const HEIGHT_1 = 800;


// Editar tamaños como estime conveniente
SVG1.attr("width", WIDTH_1).attr("height", HEIGHT_1);

const contenedorPrimeraVisualizacion = SVG1.append("g").attr(
  "transform",
  `translate(0, 0)`
);

const SVG3 = d3.select("#vis-3").append("svg");
const WIDTH_3 = 1000;
const HEIGHT_3 = 1200;
SVG3.attr("width", WIDTH_3).attr("height", HEIGHT_3);
const contenedorTerceraVisualizacion = SVG3.append("g").attr(
  "transform",
  `translate(${MARGIN.left}, ${MARGIN.top})`
);

let VGSalesData; // Variable para almacenar los datos JSON parseados


d3.json("vgsales.json")
  .then((datos) => {
    console.log(datos);
    VGSalesData = datos;
    getTopGenresByRegion("Global_Sales");
    writeGamesList("Global_Sales");
  })
  .catch((error) => console.log(error));

// SEGMENTO PARA EL GRÁFICO DE PASTEL
const SVG2 = d3.select("#vis-2").append("svg");
const WIDTH_2 = WIDTH_1;
const HEIGHT_2 = HEIGHT_1;
SVG2.attr("width", WIDTH_2).attr("height", HEIGHT_2);

// Paletas de colores para el gráfico de pastel y las distintas regiones
const colorPalettes = { "NA_Sales": ['#703835', '#F2BDBB', '#F07771', '#704D4B', '#BD5E59', '#F0584D', '#F29C96', '#703E3A'] ,
                        "EU_Sales": ['#706324', '#F2E396', '#F0D54D', '#F5E18C', '#BDA73C', '#F2CC50', '#FCEB65', '#BD9206'] ,
                        "JP_Sales": ['#DEA1F5', '#B52CDB', '#EFDCF5', '#8A22A8', '#9967DB', '#6A00F5', '#754EA7', '#7C67DB'] ,
                        "Other_Sales": ['#1D6160', '#78F5F3', '#42DBD9', '#32A8A6', '#25BDDB', '#1C90A8', '#6ED0DB', '#A9EDF5'],
                        "Global_Sales": ['#1D6160', '#78F5F3', '#42DBD9', '#32A8A6', '#25BDDB', '#1C90A8', '#6ED0DB', '#A9EDF5']} 

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
  createPieChart(genresList, region);
}


function getTopGamesByRegion(region) {
  // Filtrar los juegos por región y ordenar por ventas descendentes
  const games = VGSalesData.filter((game) => game[region] > 0).sort(
    (a, b) => b[region] - a[region]
  );

  // Tomar los primeros 30 juegos
  return games.slice(0, 30);
}

// Variable to store the pie chart SVG element
var pieChartSVG = null;

// Function to create or update the pie chart
function createPieChart(genres, region) {
  console.log(genres);
  // Ordenar la lista por la propiedad "sales" de forma descendente
  genres.sort((a, b) => b.sales - a.sales);

  // Tomar los primeros 10 elementos de la lista ordenada
  genres = genres.slice(0, 7);

  var radius = Math.min(WIDTH_2, HEIGHT_2) / 2 - 100;

  // Create or update the pie chart SVG element
  if (!pieChartSVG) {
    // If the SVG element doesn't exist, create it
    pieChartSVG = SVG2.append("g")
      .attr("transform", `translate(${WIDTH_2 / 2 + 40 }, ${HEIGHT_2 / 2 - 40})`);
  } else {
    // If the SVG element exists, clear its contents
    pieChartSVG.selectAll("*").remove();
  }

  let regionName;
  console.log(region);

  // Set the region name
  switch (region) {
    case "NA_Sales":
      regionName = "in North America";
      break;
    case "EU_Sales":
      regionName = "in Europe";
      break;
    case "JP_Sales":
      regionName = "in Japan";
      break;
    case "Other_Sales":
      regionName = "in other countries";
      break;
    case "Global_Sales":
      regionName = "Worldwide";
  }


  // Append the chart title
  pieChartSVG.append("text")
    .attr("x", 0)
    .attr("y", radius + 100)
    .attr("text-anchor", "middle")
    .style("font-size", "30px")
    .attr("font-weight", "bold")
    .text(`Top 7 best-selling genres ${regionName}`)
    .attr("opacity", 0) // Set initial opacity to 0 for transition effect
    .transition()
    .duration(2000)
    .attr("opacity", 1); // Transition the opacity to 1

  var ordScale = d3.scaleOrdinal()
    .domain(genres.map((d) => d.name))
    .range(colorPalettes[region]);

  var pie = d3.pie().value(function(d) {
    return d.sales;
  });

  var arc = pieChartSVG.selectAll("arc")
    .data(pie(genres))
    .enter();

  var path = d3.arc()
    .outerRadius(radius)
    .innerRadius(0);

  var arcs = arc.append("g");

  arcs.append("path")
    .attr("d", path)
    .attr("fill", function(d) {
      return ordScale(d.data.name);
    })
    .style("stroke", "white")
    .transition() // Add transition when creating the paths
    .duration(1000)
    .attrTween("d", function(d) {
      var interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return function(t) {
        return path(interpolate(t));
      };
    });

  var label = d3.arc()
    .outerRadius(radius)
    .innerRadius(0);

  arcs.append("text")
    .attr("transform", function(d) {
      const pos = label.centroid(d);
      const x = pos[0]; // X position of centroid
      const y = pos[1]; // Y position of centroid
      const h = Math.sqrt(x * x + y * y); // Hypotenuse (distance from centroid to origin)
      const nx = (x / h) * (radius - 100); // New X position with an offset of 10 pixels
      const ny = (y / h) * (radius - 100); // New Y position with an offset of 10 pixels

      // Calculate the rotation angle based on the position of the text
      let angle = (Math.atan2(y, x) * 180) / Math.PI; // Angle of rotation in degrees
      if (angle > 90) angle -= 180; // Invert the angle if it's greater than 90 degrees
      if (angle < -90) angle += 180; // Invert the angle if it's smaller than -90 degrees

      return `translate(${nx}, ${ny}) rotate(${angle})`; // Translate and rotate the text element
    })
    .text(function(d) {
      return d.data.name;
    })
    .style("font-family", "Arial")
    .style("font-size", "25px")
    .style("text-anchor", "middle")
    .attr("opacity", 0) // Set initial opacity to 0 for transition effect
    .transition()
    .duration(2000)
    .attr("opacity", 1); // Transition the opacity to 1

  // Mouseover event handler
  arcs.selectAll("path")
    .on("mouseover", function(d) {
      var currentElement = d3.select(this);

      // Increase the size of the hovered element
      currentElement
        .attr("transform", "scale(1.2)");
        

      // Darken and resize the other elements
      arcs.selectAll("path")
        .filter(function() { return this !== currentElement.node(); })
        .attr("transform", "scale(1)")
        .attr("fill", function(d) {
          var currentColor = d3.color(ordScale(d.data.name));
          return currentColor.darker(0.6);
        });
    });

  // Mouseout event handler
  arcs.selectAll("path")
    .on("mouseout", function(d) {
      var currentElement = d3.select(this);

      // Restore the original fill color for all paths
      arcs.selectAll("path")
        .attr("transform", "scale(1)")
        .attr("fill", function(d) {
          return ordScale(d.data.name);
        });
    });
}


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

  let selectedRegion = "Global_Sales";

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

         if (region === selectedRegion) {
            // Clicked region is already selected, remove highlighting and show global sales
            selectedRegion = "Global_Sales";
            contenedorPrimeraVisualizacion
              .selectAll(".country")
              .classed("highlighted", false);
            getTopGenresByRegion("Global_Sales");
            writeGamesList("Global_Sales");
          } else {
            // Clicked region is different, update selected region and show genres by region
            selectedRegion = region;
            contenedorPrimeraVisualizacion
              .selectAll(".country")
              .classed("highlighted", (d) =>
                region === "Global_Sales" ? false : true
              );
            getTopGenresByRegion(region);
            writeGamesList(region);
          }

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
            if (selectedRegion === "Global_Sales") {
              return false;
            } else if (region === "NA_Sales") {
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

      });
  }
}

function writeGamesList(region) {
    const topGames = getTopGamesByRegion(region);

    // Vaciar la lista de juegos
    d3.select("#gameList").html("");

    // Añadir el título
    regionCountryDict = { 
      NA_Sales: "in North America",
      EU_Sales: "in Europe",
      JP_Sales: "in Japan",
      Other_Sales: "in the rest of the world",
      Global_Sales: "worldwide"
    };

    d3.select("#gameList")
    .append("h2")
    .text("Top 30 best-selling games " + regionCountryDict[region] + " (millions of copies)");

    // Agregar cada juego a la lista
    d3.select("#gameList")
      .selectAll("li")
      .data(topGames)
      .enter()
      .append("li")
      .html((d) => {
        return `<strong>${d.Name}</strong> (${d.Platform}) - ${d.Publisher} - ${d.Genre} - ${d.Year}`;
      });
}


function createVGGraph() {
  var VGSalesData; // Variable para almacenar los datos JSON parseados
  var publishers; // Variable para almacenar los nombres de los publishers
  var publisherSelect = d3.select("#publisherSelect");

  d3.json("vgsales.json")
    .then((datos) => {
      VGSalesData = datos;

      publishers = Array.from(
        new Set(VGSalesData.map((game) => game.Publisher))
      );

      publisherSelect
        .selectAll("option")
        .data(publishers)
        .enter()
        .append("option")
        .text((d) => d);
    })
    .catch((error) => console.log(error));

  publisherSelect.on("change", () => {
    const selectedPublisher = publisherSelect.property("value");
    const platformCounts = getPlatformCountsByPublisher(selectedPublisher);
    updateBarChart(platformCounts);
  });

  // Función para obtener la cantidad de juegos por plataforma para un editor determinado
  function getPlatformCountsByPublisher(publisher) {
    const filteredData = VGSalesData.filter(
      (game) => game.Publisher === publisher
    );

    const platformCounts = filteredData.reduce((counts, game) => {
      const platform = game.Platform;
      counts[platform] = (counts[platform] || 0) + 1;
      return counts;
    }, {});

    return platformCounts;
  }

  // Función para actualizar el gráfico de barras con los nuevos datos
  function updateBarChart(data) {
    // Borra el contenido existente del gráfico de barras
    contenedorTerceraVisualizacion.selectAll("*").remove();

    // Crea el contenedor principal
    const contenedor = contenedorTerceraVisualizacion
      .append("g")
      .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

    // Agregar título del gráfico
    contenedor
      .append("text")
      .attr("x", (WIDTH_3 - MARGIN.left - MARGIN.right) / 2)
      .attr("y", 500)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("font-size", "16px")
      .style("color", "black")
      .text(
        `Number of games per ${publisherSelect.property(
          "value"
        )} platform: `
      );

    const barWidth = 50; // Ancho de las barras más pequeño

    const xScale = d3
      .scaleBand()
      .domain(Object.keys(data))
      .range([0, WIDTH_3 - MARGIN.left - MARGIN.right])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(Object.values(data))])
      .range([
        HEIGHT_3 - MARGIN.top - MARGIN.bottom,
        10 + (HEIGHT_3 - MARGIN.top - MARGIN.bottom) / 2,
      ]);

    // Definir escala de color categórica
    const colorScale = d3
      .scaleOrdinal()
      .domain(Object.keys(data))
      .range(d3.schemeCategory10); // Colores distintos para cada barra

    // Agregar barras
    contenedor
      .selectAll("rect")
      .data(Object.entries(data))
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d[0]))
      .attr("y", (d) => HEIGHT_3 - MARGIN.top - MARGIN.bottom) // Inicialmente, establecer la altura de las barras en la parte inferior
      .attr("width", xScale.bandwidth() * 0.8)
      .attr("height", 0) // Inicialmente, establecer la altura de las barras en cero
      .attr("fill", (d) => colorScale(d[0])) // Asignar colores distintos a cada barra
      .transition() // Agregar transición suave para el tamaño y la posición
      .duration(800) // Duración de la animación en milisegundos
      .attr("y", (d) => yScale(d[1])) // Actualizar la posición vertical de las barras
      .attr(
        "height",
        (d) => HEIGHT_3 - MARGIN.top - MARGIN.bottom - yScale(d[1]) // Actualizar la altura de las barras
      );

    // Agregar eje X
    contenedor
      .append("g")
      .attr("transform", `translate(-5, ${HEIGHT_3 - MARGIN.bottom - 50})`)
      .call(d3.axisBottom(xScale));

    // Agregar eje Y
    contenedor
      .append("g")
      .attr("transform", `translate(${MARGIN.left - 50}, 0)`)
      .call(d3.axisLeft(yScale));

    // Agregar título del eje Y
    contenedor
      .append("text")
      .attr("x", -(HEIGHT_3 - MARGIN.top - MARGIN.bottom + 500) / 2)
      .attr("y", -(MARGIN.left -15))
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Cantidad de videojuegos");

    // Agregar título del eje X
    contenedor
      .append("text")
      .attr("x", (WIDTH_3 - MARGIN.left - MARGIN.right) / 2)
      .attr("y", HEIGHT_3 - MARGIN.bottom)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Plataforma");

    // Trasladar todo el contenedor más arriba
    contenedor.attr("transform", `translate(0, -500)`);
    
  }
}

createVGGraph();

createVGMap();


