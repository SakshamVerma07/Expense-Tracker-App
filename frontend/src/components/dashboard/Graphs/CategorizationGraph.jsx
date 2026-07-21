import React, { useEffect, useRef, useState } from "react";
import {
  Clapperboard,
  Coins,
  Pencil,
  Pizza,
  ShoppingBasket,
  Star,
  TrendingUp,
} from "lucide-react";
import { Chart as Chartjs, defaults } from "chart.js/auto";
import { Doughnut, Line } from "react-chartjs-2";
import annotationPlugin from "chartjs-plugin-annotation";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { formatMoney } from "../../../assets/assets";

const centerTextPlugin = {
  id: "centerText",
  beforeDraw: (chart) => {
    const { ctx } = chart;

    // Get the first active dataset element metadata
    const meta = chart.getDatasetMeta(0);
    if (!meta.data || !meta.data[0]) return;

    // This gets the EXACT center point of the actual doughnut circle
    const { x: centerX, y: centerY } = meta.data[0];
    const dataValues = chart.data.datasets[0].data;
    const totalSum = dataValues.reduce((sum, value) => sum + value, 0);

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 1. Draw "Total"
    ctx.font = "500 18px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Total", centerX, centerY - 18); // Offset relative to doughnut center

    // 2. Draw "$824.80"
    ctx.font = "bold 34px sans-serif";
    ctx.fillStyle = "#1e293b";
    ctx.fillText(formatMoney(totalSum), centerX, centerY + 14); // Offset relative to doughnut center

    ctx.restore();
  },
};

const CategorizationGraph = ({ dataList }) => {
  const [chartColor, setChartColor] = useState([]);
  const tooltipRef = useRef(null);

  const categories = [
    "Food",
    "Grocery",
    "Entertainment",
    "Stationery",
    "Other",
  ];

  useEffect(() => {
    const root = document.documentElement;
    let l = [];
    for (let index = 0; index < 7; index++) {
      const computedColor = getComputedStyle(root)
        .getPropertyValue(`--chart-${index + 1}`)
        .trim();
      l.push(computedColor);
    }

    if (l) {
      setChartColor(l);
    }
  }, []);

  const iconMap = {
    Food: <Pizza />,
    Grocery: <ShoppingBasket />,
    Entertainment: <Clapperboard />,
    Stationery: <Pencil />,
    Other: <Coins />,
  };

  return (
    <>
      <Doughnut
        plugins={[centerTextPlugin]}
        className="w-full relative"
        data={{
          labels: categories,
          datasets: [
            {
              label: "Categories",
              data: dataList,
              backgroundColor: chartColor.map((color) => {
                return color;
              }),
              cutout: "70%",
              borderWidth: 1,
              borderRadius: 3,
              hoverOffset: 20,
            },
          ],
        }}
        options={{
          responsive: true,
          layout: {
            padding: 10,
          },
          // maintainAspectRatio: false,
          animation: {
            animateRotate: true,
            animateScale: true,
          },
          plugins: {
            datalabels: { display: false },
            legend: {
              position: "bottom",
              align: "center",
              labels: {
                usePointStyle: true,
                pointStyle: "circle",
                generateLabels: (chart) => {
                  const data = chart.data;
                },
              },
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
                  tooltipEl.innerHTML = `${this.dataPoints[0].label}
                  ${formatMoney(value)}
                  `;
                }

                // Absolute position the HTML pill using Chart.js canvas coordinates
                const position = chart.canvas.getBoundingClientRect();
                tooltipEl.style.opacity = 1;
                tooltipEl.style.left =
                  window.pageXOffset + tooltip.caretX + 40 + "px";
                tooltipEl.style.top = tooltip.caretY + "px"; // -40 offsets it above the cursor
              },
            },
          },
        }}
      />

      <div className="custom-legend">
        {categories.map((label, index) => {
          return (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <span style={{ color: `hsl(from ${chartColor[index]} h s 50)` }}>
                {iconMap[label]}
              </span>
              <span style={{ fontWeight: "500" }}>{label}</span>
              <span style={{ marginLeft: "auto", fontWeight: "bold" }}>
                {formatMoney(dataList[index])}
              </span>
            </div>
          );
        })}
      </div>

      <div
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
    </>
  );
};

export default CategorizationGraph;
