// Global variables
let currentScene = 0;
const margin = { top: 50, right: 40, bottom: 50, left: 60 };
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// SVG
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("padding", "6px")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "#fff")
    .style("border-radius", "4px")
    .style("font-size", "12px");

// Load games.csv data
d3.csv("games.csv", d3.autoType).then(data => {
    const parseYear = d3.timeParse("%b %d, %Y");
    const yearCount = {};

    data.forEach(d => {
        const date = parseYear(d["Release date"]);
        if (date) {
            const year = date.getFullYear();
            yearCount[year] = (yearCount[year] || 0) + 1;
        }
    });

    const years = Object.keys(yearCount).map(d => +d).sort((a, b) => a - b);
    const counts = years.map(year => ({ year, count: yearCount[year] }));

    // Initialization is scene0
    renderScene0(counts);

    d3.select("#scene0Btn").on("click", () => {
        currentScene = 0;
        d3.selectAll("button").classed("active", false);
        d3.select("#scene0Btn").classed("active", true);
        svg.selectAll("*").remove();
        d3.select("#annotations").html("");
        d3.select("description").html("Hover over the timeline to see exact numbers. Click on an annotation to explore that year further.");
        showSceneText("homeText");
        renderScene0(counts);  
    });

    d3.select("#scene1Btn").on("click", () => {
        currentScene = 1;
        d3.selectAll("button").classed("active", false);
        d3.select("#scene1Btn").classed("active", true);
        svg.selectAll("*").remove();
        d3.select("#annotations").html("");
        showSceneText("scene1Text");
        renderScene1(data);  
    });
        
    d3.select("#scene2Btn").on("click", () => {
        currentScene = 2;
        d3.selectAll("button").classed("active", false);
        d3.select("#scene2Btn").classed("active", true);
        svg.selectAll("*").remove();
        d3.select("#annotations").html("");
        showSceneText("scene2Text");
        renderScene2(data); 
    });

    d3.select("#scene3Btn").on("click", () => {
        currentScene = 3;
        d3.selectAll("button").classed("active", false);
        d3.select("#scene3Btn").classed("active", true);
        svg.selectAll("*").remove();
        d3.select("#annotations").html("");
        showSceneText("scene3Text");
        renderScene3(data);  
    });

});

function renderScene0(data) {
    d3.select("#chart").style("display", "block");
    d3.select("#homeText").style("display", "block");
    d3.select("#overviewTitle").style("display", "block");
    d3.select("#description").style("display", "block");
    d3.select("#dev-chart").selectAll("*").remove();
    d3.select("#pub-chart").selectAll("*").remove();

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)]).nice()
        .range([height, 0]);

    svg.append("g").call(d3.axisLeft(y));
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#007bff")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
        .x(d => x(d.year))
        .y(d => y(d.count))
        );

    // Tooltip
    svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.count))
        .attr("r",5)
        .attr("fill", "#007bff")
        .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`Year: <strong>${d.year}</strong><br>Games: <strong>${d.count}</strong>`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
    .on("mouseout", () => {
        tooltip.transition().duration(300).style("opacity", 0);
    });

    // X Label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text("Release Year");

    // Y Label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -48)
        .attr("text-anchor", "middle")
        .text("Number of Games Released");


    // Annotations for special years
    const specialYears = [2003,2014, 2019, 2024, 2025];
    const labels = {
        2003: "Steam Launch",
        2014: "Start of the Surge",
        2019: "Slight Drop",
        2024: "All-time Peak",
        2025: "Data Incomplete"
    };

    specialYears.forEach(year => {
        const point = data.find(d => d.year === year);
        if (point) {
            const xPos = x(point.year);
            const yPos = y(point.count);
    
            const isRightEdge = year >= 2024; 
            const xTextOffset = isRightEdge ? -5 : 0;
            const anchor = isRightEdge ? "end" : "middle";
    
            // draw a line
            svg.append("line")
                .attr("x1", xPos)
                .attr("x2", xPos)
                .attr("y1", yPos)
                .attr("y2", yPos - 20)
                .attr("stroke", "#333")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "2,2");
    
            // add annotation text
            svg.append("text")
                .attr("x", xPos + xTextOffset)
                .attr("y", yPos - 25)
                .attr("text-anchor", anchor)
                .attr("font-size", "14px")
                .attr("fill", "#444")
                .style("cursor", "pointer")
                .text(labels[year])
                .on("click", () => {
                    if (year === 2014) d3.select("#scene1Btn").dispatch("click");
                    if (year === 2019) d3.select("#scene2Btn").dispatch("click");
                    if (year === 2024) d3.select("#scene3Btn").dispatch("click");
                });
        }
    });
}

function renderScene1(data) {
    d3.select("#homeText").style("display", "none");
    d3.select("#scene1Text").style("display", "block");
    d3.select("#overviewTitle").style("display", "none");
    d3.select("#description").style("display", "none");
    d3.select("#dev-chart").selectAll("*").remove();
    d3.select("#pub-chart").selectAll("*").remove();

    const parseYear = d3.timeParse("%b %d, %Y");

    const filtered = data.filter(d => {
        const date = parseYear(d["Release date"]);
        return date && (date.getFullYear() === 2013 || date.getFullYear() === 2014);
    });

    const yearMap = {
        2013: { devs: new Set(), pubs: new Set() },
        2014: { devs: new Set(), pubs: new Set() }
    };

    filtered.forEach(d => {
        const date = parseYear(d["Release date"]);
        const year = date.getFullYear();
        if (d["Developers"]) yearMap[year].devs.add(d["Developers"]);
        if (d["Publishers"]) yearMap[year].pubs.add(d["Publishers"]);
    });

    const devData = [
        { year: 2013, value: yearMap[2013].devs.size },
        { year: 2014, value: yearMap[2014].devs.size }
    ];

    const pubData = [
        { year: 2013, value: yearMap[2013].pubs.size },
        { year: 2014, value: yearMap[2014].pubs.size }
    ];

    const margin = { top: 30, right: 20, bottom: 40, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    function drawBarChart(containerID, data, titleText) {
        const svg = d3.select(containerID)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(data.map(d => d.year))
            .range([0, width])
            .padding(0.4);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)]).nice()
            .range([height, 0]);

        const color = d3.scaleOrdinal()
            .domain([2013, 2014])
            .range(["#8884d8", "#82ca9d"]);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        svg.append("g").call(d3.axisLeft(y));

        svg.selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", d => x(d.year))
            .attr("y", d => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("fill", d => color(d.year))
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`${d.year}: <strong>${d.value}</strong>`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(300).style("opacity", 0);
            });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .text(titleText);
    }

    drawBarChart("#dev-chart", devData, "Developers (2013 vs 2014)");
    drawBarChart("#pub-chart", pubData, "Publishers (2013 vs 2014)");
}

function renderScene2(data) {
    d3.select("#homeText").style("display", "none");
    d3.select("#scene2Text").style("display", "block");
    d3.select("#overviewTitle").style("display", "none");
    d3.select("#description").style("display", "none");
    d3.select("#dev-chart").selectAll("*").remove();
    d3.select("#pub-chart").selectAll("*").remove();

    const parseYear = d3.timeParse("%b %d, %Y");

    const filtered = data.filter(d => {
        const date = parseYear(d["Release date"]);
        return date && (date.getFullYear() === 2018 || date.getFullYear() === 2019);
    });

    const yearMap = {
        2018: { devs: new Set(), pubs: new Set() },
        2019: { devs: new Set(), pubs: new Set() }
    };

    filtered.forEach(d => {
        const date = parseYear(d["Release date"]);
        const year = date.getFullYear();
        if (d["Developers"]) yearMap[year].devs.add(d["Developers"]);
        if (d["Publishers"]) yearMap[year].pubs.add(d["Publishers"]);
    });

    const devData = [
        { year: 2018, value: yearMap[2018].devs.size },
        { year: 2019, value: yearMap[2019].devs.size }
    ];

    const pubData = [
        { year: 2018, value: yearMap[2018].pubs.size },
        { year: 2019, value: yearMap[2019].pubs.size }
    ];

    const margin = { top: 30, right: 20, bottom: 40, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    function drawBarChart(containerID, data, titleText) {
        const svg = d3.select(containerID)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(data.map(d => d.year))
            .range([0, width])
            .padding(0.4);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)]).nice()
            .range([height, 0]);

        const color = d3.scaleOrdinal()
            .domain([2018, 2019])
            .range(["#8884d8", "#82ca9d"]);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        svg.append("g").call(d3.axisLeft(y));

        svg.selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", d => x(d.year))
            .attr("y", d => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("fill", d => color(d.year))
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`${d.year}: <strong>${d.value}</strong>`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(300).style("opacity", 0);
            });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .text(titleText);
    }

    drawBarChart("#dev-chart", devData, "Developers (2018 vs 2019)");
    drawBarChart("#pub-chart", pubData, "Publishers (2018 vs 2019)");
}

function renderScene3(data) {
    d3.select("#homeText").style("display", "none");
    d3.select("#scene3Text").style("display", "block");
    d3.select("#overviewTitle").style("display", "none");
    d3.select("#description").style("display", "none");
    d3.select("#dev-chart").selectAll("*").remove();
    d3.select("#pub-chart").selectAll("*").remove();

    const parseYear = d3.timeParse("%b %d, %Y");

    const filtered = data.filter(d => {
        const date = parseYear(d["Release date"]);
        return date && (date.getFullYear() === 2023 || date.getFullYear() === 2024);
    });

    const yearMap = {
        2023: { devs: new Set(), pubs: new Set() },
        2024: { devs: new Set(), pubs: new Set() }
    };

    filtered.forEach(d => {
        const date = parseYear(d["Release date"]);
        const year = date.getFullYear();
        if (d["Developers"]) yearMap[year].devs.add(d["Developers"]);
        if (d["Publishers"]) yearMap[year].pubs.add(d["Publishers"]);
    });

    const devData = [
        { year: 2023, value: yearMap[2023].devs.size },
        { year: 2024, value: yearMap[2024].devs.size }
    ];

    const pubData = [
        { year: 2023, value: yearMap[2023].pubs.size },
        { year: 2024, value: yearMap[2024].pubs.size }
    ];

    const margin = { top: 30, right: 20, bottom: 40, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    function drawBarChart(containerID, data, titleText) {
        const svg = d3.select(containerID)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(data.map(d => d.year))
            .range([0, width])
            .padding(0.4);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)]).nice()
            .range([height, 0]);

        const color = d3.scaleOrdinal()
            .domain([2023, 2024])
            .range(["#8884d8", "#82ca9d"]);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        svg.append("g").call(d3.axisLeft(y));

        svg.selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", d => x(d.year))
            .attr("y", d => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("fill", d => color(d.year))
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`${d.year}: <strong>${d.value}</strong>`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(300).style("opacity", 0);
            });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .text(titleText);
    }

    drawBarChart("#dev-chart", devData, "Developers (2023 vs 2024)");
    drawBarChart("#pub-chart", pubData, "Publishers (2023 vs 2024)");
}

// Helper function
function showSceneText(sceneId) {
    // hide all scene texts
    d3.select("#homeText").style("display", "none");
    d3.select("#scene1Text").style("display", "none");
    d3.select("#scene2Text").style("display", "none");
    d3.select("#scene3Text").style("display", "none");
  
    // display the selected scene text
    d3.select(`#${sceneId}`).style("display", "block");
  }
  