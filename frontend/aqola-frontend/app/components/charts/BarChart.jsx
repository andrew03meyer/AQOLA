"use client";

import * as d3 from "d3";
import { useRef, useEffect } from "react";
import { COLOR } from "../../lib/constants"

export default function BarChart({
  data,
  marginTop = 60,
  marginRight = 120,
  marginBottom = 40,
  marginLeft = 60,
  width = 800,
  height = 400,
}) {
  const gx = useRef();
  const gy = useRef();
  const subgx = useRef();

  const innerWidth = width - marginLeft - marginRight;
  const innerHeight = height - marginTop - marginBottom;

  // subgroups are the labels of the bars IN the bar graph groups (i.e. high risk, low risk)
  const subgroups = d3.map(data.groups[0].bars, (bar) => bar.bar_name);
  // groups are the labels of bar groups (in this case postcodes)
  const groups = d3.map(data.groups, (group) => group.name);

  //Create the data scale for the x axis
  const xScale = d3
    .scaleBand()
    .domain(groups)
    .range([0, innerWidth])
    .padding(0.2);

  // symlog is used instead of log to include 0
  const isSymlog = data.scaleType === "symlog";

  //Create the data scale for the y axis
  const yScale = isSymlog ? d3.scaleSymlog().constant(1) : d3.scaleLinear();
  yScale
    .domain([
      0,
      d3.max(data.groups, (group) => d3.max(group.bars, (bar) => bar.value)),
    ])
    .range([innerHeight, 0]);

  //Create the subgroup data scale
  const xSubgroupScale = d3
    .scaleBand()
    .domain(subgroups)
    .range([0, xScale.bandwidth()])
    .padding(0.1);

  //Color scale helps picks colours base on another group (this case subgroups)
  const colourScale = d3
    .scaleOrdinal()
    .domain(subgroups)
    .range(COLOR);

  useEffect(
    () => void d3.select(gx.current).call(d3.axisBottom(xScale)),
    [gx, xScale],
  );
  useEffect(
    () => void d3.select(gy.current).call(d3.axisLeft(yScale)),
    [gy, yScale],
  );
  useEffect(
    () => void d3.select(subgx.current).call(d3.axisBottom(xSubgroupScale)),
    [subgx, xSubgroupScale],
  );

  const maxVal = d3.max(data.groups, (g) => d3.max(g.bars, (b) => b.value));
  const logTicks = [
    0,
    ...d3
      .ticks(1, Math.log10(maxVal), 6)
      .map((d) => Math.round(Math.pow(10, d))),
  ];

  // Pull the tick values into a shared constant
  const yTickValues = isSymlog ? logTicks : yScale.ticks();

  useEffect(() => {
    const axis = d3.axisLeft(yScale);
    if (isSymlog) {
      axis.tickValues(yTickValues);
    }
    d3.select(gy.current).call(axis.tickFormat(d3.format(",.0f")));
  }, [gy, yScale, isSymlog]);

  return (
    <svg viewBox={`0 0 ${width + 75} ${height}`} preserveAspectRatio="xMidYMid meet">
      {/* Chart Title */}
      <text
        x={width / 2}
        y={marginTop / 2 + 5}
        textAnchor="middle"
        fontSize="18px"
        fill="white"
        // fontWeight="bold"
      >
        {data.title}
      </text>

      {/*  X-Axis Label */}
      <text
        x={width / 2}
        y={height - 5}
        textAnchor="middle"
        fontSize="14px"
        fill="lightgrey"
      >
        {data.xlabel}
      </text>

      {/*  Y-Axis Label */}
      <text
        transform="rotate(-90)"
        x={-(height / 2)}
        y={15}
        textAnchor="middle"
        fontSize="14px"
        fill="lightgrey"
      >
        {data.ylabel}
      </text>

      {/* Colour Legend */}
      <g
        transform={`translate(${width - marginRight + 170}, ${marginTop - 10})`}
      >
        {data.groups[0].bars.map((bar, i) => (
          <g key={bar.bar_name} transform={`translate(${0}, ${i * 20})`}>
            <rect width={14} height={14} fill={bar.color} rx={2} />
            <text x={-8} y={12} textAnchor="end" fontSize="12px" fill="white">
              {bar.bar_name}
            </text>
          </g>
        ))}
      </g>

      <g transform={`translate(${marginLeft}, ${marginTop})`}>
        {/* Create the lines going across the background */}
        {yTickValues.map((tickValue) => (
          <line
            x1={0}
            y1={yScale(tickValue)}
            x2={innerWidth}
            y2={yScale(tickValue)}
            stroke="white"
            key={tickValue}
          />
        ))}

        {/* For every group, scale across the x based on the xscale */}
        {data.groups.map((group, index) => (
          <g transform={`translate(${xScale(group.name)}, 0)`} key={group.name}>
            {/* For every bar in subgroup, scale across starting from  */}
            {group.bars.map((bar, key) => (
              <g key={bar.bar_name}>
                <rect
                  x={xSubgroupScale(bar.bar_name)}
                  y={yScale(bar.value)}
                  width={xSubgroupScale.bandwidth()}
                  height={innerHeight - yScale(bar.value)}
                  key={key}
                  id=""
                  fill={bar.color}
                  className="hover:saturate-300 focus:outline-2 transition-transform duration-300"
                >
                  <title>{bar.bar_name}</title>
                </rect>
                {bar.value != 0 && (
                  <text
                    x={
                      xSubgroupScale(bar.bar_name) +
                      xSubgroupScale.bandwidth() / 2
                    }
                    y={yScale(bar.value)}
                    textAnchor="middle"
                    fontSize="10px"
                    fill="white"
                    // fontWeight="bold"
                  >
                    {bar.value.toLocaleString()}
                  </text>
                )}
              </g>
            ))}
          </g>
        ))}
      </g>
      <g
        ref={gx}
        transform={`translate(${marginLeft},${height - marginBottom})`}
        fill="white"
        stroke="white"
      />
      <g 
        ref={gy} 
        transform={`translate(${marginLeft},${marginTop})`} 
        fill="white" 
        stroke="white" 
      />
    </svg>
  );
}
