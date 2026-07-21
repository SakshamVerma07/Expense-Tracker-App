import React, { useEffect, useRef, useState } from "react";
import { Star, TrendingUp } from "lucide-react";
import { Chart as Chartjs, defaults } from "chart.js/auto";
import { Bar, Line } from "react-chartjs-2";
import annotationPlugin from "chartjs-plugin-annotation";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { color } from "chart.js/helpers";
import { formatMoney } from "../../../assets/assets";

Chartjs.register(annotationPlugin, ChartDataLabels);

defaults.maintainAspectRatio = true;
defaults.responsive = true;

const WeeklyGraph = ({
  weekSpend,
  average,
  onGoingWeek,
  currentWeek = true,
}) => {
  const [chartColor, setChartColor] = useState([]);
  const tooltipRef = useRef(null);
  const dataPoints = weekSpend;
  const total = 500;
  const avg = average;

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const date = new Date();

  useEffect(() => {
    const root = document.documentElement;
    let l = [];
    for (let index = 0; index < 4; index++) {
      const computedColor = getComputedStyle(root)
        .getPropertyValue(`--chart-${index + 1}`)
        .trim();
      l.push(computedColor);
    }

    if (l) {
      setChartColor(l);
    }
  }, []);

  return (
    <>
      <div
        id="weeklyGraphTooltip"
        ref={tooltipRef}
        style={{
          position: "absolute",
          background: "#FFFFFF",
          color: "#1E293B",
          padding: "6px 12px",
          borderRadius: "20px",
          fontWeight: "600",
          fontSize: "12px",
          boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
          pointerEvents: "none", // Prevents mouse flickering stutter
          opacity: 0,
          transition: "all 0.15s ease",
          transform: "translate(-50%, -50%)", // Center it nicely over the pointer
          whiteSpace: "nowrap",
        }}
      />
      <Bar
        data={{
          labels: labels,
          datasets: [
            {
              label: "Expense",
              data: weekSpend,
              backgroundColor: (context) => {
                const index = context.dataIndex; // Gets the index of the bar currently being evaluated
                if (
                  onGoingWeek &&
                  currentWeek &&
                  index === (date.getDay() + 6) % 7
                ) {
                  return chartColor[2]; // Highlight color for today
                }
                return chartColor[0];
              },
              borderRadius: 5,
              borderSkipped: false,
              minBarLength: 0,
            },
          ],
        }}
        options={{
          layout: {
            padding: 5,
          },

          plugins: {
            legend: {
              display: false,
            },

            datalabels: {
              display: true,
              align: "top", // Positions text above the top of the bar
              anchor: "end", // Anchors the text to the end of the bar geometry
              offset: 0, // Pixel space above the bar
              color: "#1E293B", // Dark gray text color
              font: { weight: "bold", size: 10 },
              formatter: (value) => `₹${Math.ceil(value)}`, // Prepends the currency sign
            },

            tooltip: {
              enabled: false, // 🛠️ Crucial: Turn off native canvas popup
              external: function (context) {
                const { chart, tooltip } = context;
                const tooltipEl = tooltipRef.current;

                // Hide if no hover interaction active
                if (tooltip.opacity === 0) {
                  tooltipEl.style.opacity = 0;
                  return;
                }

                // Set text content from the hovered item
                if (tooltip.body) {
                  const value = tooltip.dataPoints[0].raw;
                  tooltipEl.innerHTML = `${formatMoney(value)}`;
                }

                // Absolute position the HTML pill using Chart.js canvas coordinates
                const position = chart.canvas.getBoundingClientRect();
                tooltipEl.style.opacity = 1;
                tooltipEl.style.left =
                  position.left + window.pageXOffset + tooltip.caretX + "px";
                tooltipEl.style.top =
                  position.top +
                  window.pageYOffset +
                  tooltip.caretY -
                  40 +
                  "px"; // -40 offsets it above the cursor
              },
            },

            annotation: {
              annotations: {
                averageLine: {
                  type: "line",
                  yMin: avg,
                  yMax: avg,
                  borderColor: "rgb(255, 99, 132, 0.7)",
                  borderWidth: 2,
                  borderDash: [6, 6], // Dotted line style
                  drawTime: "afterDatasetsDraw",
                  label: {
                    display: true,
                    content: `Avg: ${formatMoney(avg)}`,
                    position: "end",
                    backgroundColor: "rgb(255, 99, 132, 0)",
                    font: { size: 8, weight: "bolder" },
                    color: "rgba(255, 99, 132, 0.7)",
                    yAdjust: 10,
                    xAdjust: 10,
                  },
                },
              },
            },
          },

          scales: {
            x: {
              grid: { display: false },
              border: {
                display: false,
              },
              ticks: {
                backdropColor: "black",
                font: {
                  size: 12,
                },
              },
            },

            y: {
              grace: "40%",
              grid: {
                display: true, // Set false to hide all grid lines for this axis
                color: "rgba(0, 0, 0, 0.08)", // Solid color, hex, or rgba string
                lineWidth: 1, // Width of the grid lines in pixels
                drawOnChartArea: true, // If false, lines only show next to axis labels, not behind data
                tickBorderDash: [5, 5],
              },
              border: {
                display: false,
                dash: [5, 5],
              },
              ticks: {
                display: false,
              },
              afterFit: (axis) => {
                axis.width = 0;
              },
            },
          },
        }}
      />
    </>
  );
};

export default WeeklyGraph;
