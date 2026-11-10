const chartElement = document.querySelector("#tech-stack-chart");

if (chartElement && window.d3) {
    const status = d3.select("#tech-stack-status");

    d3.csv("techstack.csv", (row) => ({
        technology: row.Technology,
        familiarity: Number(row.Familiarity),
    })).then((items) => {
        const size = 560;
        const center = size / 2;
        const innerRadius = 62;
        const radius = d3.scaleRadial().domain([0, 100]).range([0, 124]);
        const angle = d3.scaleBand()
            .domain(items.map((item) => item.technology))
            .range([0, 2 * Math.PI])
            .padding(0.12);
        const plot = d3.select(chartElement)
            .append("svg")
            .attr("viewBox", `0 0 ${size} ${size}`)
            .attr("role", "group")
            .attr("aria-labelledby", "tech-stack-heading")
            .attr("aria-describedby", "tech-stack-status")
            .append("g")
            .attr("transform", `translate(${center}, ${center})`);
        const centerLabel = plot.append("text")
            .attr("class", "tech-center-label")
            .attr("text-anchor", "middle")
            .attr("dy", "-0.15em")
            .text("Tech Stack");
        const centerValue = plot.append("text")
            .attr("class", "tech-center-value")
            .attr("text-anchor", "middle")
            .attr("dy", "1.5em")
            .text(`${items.length} technologies`);

        function showItem(item) {
            centerLabel.text(item.technology);
            centerValue.text(`${item.familiarity}% familiarity`);
            status.text(`${item.technology}: ${item.familiarity}% familiarity`);
        }

        function resetLabel() {
            centerLabel.text("Tech Stack");
            centerValue.text(`${items.length} technologies`);
            status.text("");
        }

        plot.selectAll(".tech-grid")
            .data([25, 50, 75, 100])
            .join("circle")
            .attr("class", "tech-grid")
            .attr("r", (value) => innerRadius + radius(value))
            .attr("fill", "none");

        plot.selectAll(".tech-bar")
            .data(items)
            .join("path")
            .attr("class", "tech-bar")
            .attr("d", d3.arc()
                .innerRadius(innerRadius)
                .outerRadius((item) => innerRadius + radius(item.familiarity))
                .startAngle((item) => angle(item.technology))
                .endAngle((item) => angle(item.technology) + angle.bandwidth())
                .cornerRadius(3))
            .attr("tabindex", 0)
            .attr("role", "img")
            .attr("aria-label", (item) => `${item.technology}: ${item.familiarity}% familiarity`)
            .on("pointerenter focus", function(event, item) {
                d3.select(this).classed("is-active", true);
                showItem(item);
            })
            .on("pointerleave blur", function() {
                d3.select(this).classed("is-active", false);
                resetLabel();
            });

        plot.selectAll(".tech-label")
            .data(items)
            .join("text")
            .attr("class", "tech-label")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("transform", (item) => {
                const midpoint = angle(item.technology) + angle.bandwidth() / 2;
                return `translate(${Math.sin(midpoint) * 207}, ${-Math.cos(midpoint) * 207})`;
            })
            .text((item) => item.technology);
    }).catch(() => {
        status.text("Could not load techstack.csv");
    });
}