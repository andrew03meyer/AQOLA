"use client";

import * as d3 from "d3";
import { useRef, useEffect } from "react";

export default function LineChart({
  data,
  width = 1000,
  chartWidth = 700,
  height = 400,
  marginTop = 100,
  marginRight = 50,
  marginBottom = 40,
  marginLeft = 100,
}) {
  // Json passed in with x and y values for line chart

  let xVals = data.chart.lines
    .map((line) => line.coords.map((coord) => coord[0]))
    .flat();
  let yVals = data.chart.lines
    .map((line) => line.coords.map((coord) => coord[1]))
    .flat();

  const svg = useRef();
  const xLabel = useRef();
  const yLabel = useRef();

  // create the x and y scales for the chart, using the max x and y values from the data input
  const isDate = xVals[0] instanceof Date;
  const isSchoolData = data.type === "school_data";
  const x = isDate
    ? d3.scaleTime(
      [d3.min(xVals), d3.max(xVals)],
      [marginLeft, chartWidth - marginRight]
    )
    : d3.scaleLinear(
      [d3.min(xVals), d3.max(xVals)],
      [marginLeft, chartWidth - marginRight]
    );
  const y = d3.scaleLinear(
    isSchoolData ? [4, 1] : [0, d3.max([...yVals])],
    [height - marginBottom, marginTop],
  );

  // generates the line path for each line in the data input
  const lineGen = d3
    .line()
    .x((d) => x(d[0]))
    .y((d) => y(d[1]));

 // create the x & y axis, title, and x & y labels using d3
  useEffect(() => {
    // Wipe the slate completely clean
    d3.select(xLabel.current).selectAll("*").remove();
    d3.select(yLabel.current).selectAll("*").remove();
    d3.select(svg.current).selectAll(".chart-title").remove();

    // Define the exact axes 
    const xAxis = d3.axisBottom(x);
    const yAxis = isSchoolData 
      ? d3.axisLeft(y).tickValues([1, 2, 3, 4]).tickFormat(d => {return {1: "Outstanding ", 2: "Good ", 3: "Satisfactory ", 4: "Inadequate "}[d]}) // Strict 1,2,3,4
      : d3.axisLeft(y);
    const axisOffset = isSchoolData ? -40 : 0;

    // Draw X Axis
    d3.select(xLabel.current)
      .call(xAxis)
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", 35)
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("font-weight", "normal")
      .text(data.chart.xlabel);

    // Draw Y Axis
    d3.select(yLabel.current)
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -35 + axisOffset) 
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("font-weight", "normal")
      .text(data.chart.ylabel);

  }, [x, y, data, chartWidth, height, isSchoolData, marginLeft, marginTop]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
      >

      {/* add title */}
        <text 
          x={chartWidth / 2} 
          // y={marginTop / 2} 
          fill="white" 
          textAnchor="middle" 
          fontSize="20px">
            { data.chart.title }
        </text>

      {/* add the axis to the chart */}
      <g ref={xLabel} transform={`translate(0,${height - marginBottom})`} fill="white" />
      <g ref={yLabel} transform={`translate(${marginLeft},0)`} fill="white" />

      {/* for each line in the data input */}
      {data.chart.lines.map((line, i) => (
        <g key={i}>
          {/* make a line */}
          <path
            d={lineGen(line.coords)}
            fill="none"
            // add the line's colour from data
            stroke={line.color}
            strokeWidth="4px"
          >
            {/* add the line's name on hover */}
            <title>{line.line_name}</title>
          </path>

          {/* add the circles at each co-ord */}
          {line.coords.map((d, j) => (
            <circle
              key={j}
              cx={x(d[0])}
              cy={y(d[1])}
              r="3"
              fill="white"
              // add the circle's colour from data
              stroke={line.color}
            >
              {/* add the point's co-ords on hover */}
              <title>{`x: ${d[0]}, y: ${d[1]}`}</title>
            </circle>
          ))}
          {/* Legend */}
          <g>
            <circle
              cx={width - 250}
              cy={marginTop + (i * 15)}
              r="6"
              fill={line.color}
            />
            <text
              x={width - 240}
              y={marginTop + (i * 15)}
              fill="white"
              dominantBaseline="middle"
            >
              {line.line_name}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
}
