import React, { createElement, useState } from "react";
import { Chart as Chartjs } from "chart.js";
import { Bar } from "react-chartjs-2";
import { formatMoney, colorList } from "../../assets/assets";
import {
  Barcode,
  Clapperboard,
  Coins,
  HandCoins,
  Pencil,
  Pizza,
  ShoppingBasket,
} from "lucide-react";

// Chartjs.register(Bar);

const MonthlyBudgetSection = ({ spendingData, budgetData }) => {
  const [barClicked, setBarClicked] = useState(false);
  const date = new Date();
  const spendData = spendingData;
  const iconMap = {
    Food: <Pizza />,
    Grocery: <ShoppingBasket />,
    Entertainment: <Clapperboard />,
    Stationery: <Pencil />,
    Other: <Coins />,
  };
  const total = spendData.reduce((sum, num) => sum + num.amount, 0);
  const budget = budgetData;
  const leftOver = 100 - (total / budget) * 100;
  const barColor =
    leftOver <= 0
      ? "oklch(0.57 0.23 27)"
      : leftOver < 20
        ? colorList[2]
        : colorList[0];

  const clicked = (e) => {
    setBarClicked(!barClicked);
  };

  return (
    <div className="flex flex-col justify-around w-full px-5 py-5">
      <span className="relative mb-1 w-full">
        <HandCoins className="absolute right-0 size-9" color={barColor} />
        <h2
          className={`font-bold ${leftOver >= 20 ? "opacity-60" : "opacity-100"}`}
          style={{ color: `${leftOver >= 20 ? "black" : barColor}` }}
        >
          {leftOver <= 0
            ? "Exhausted"
            : leftOver < 20
              ? "Closing on Limit"
              : "Safe to Spend"}
        </h2>
        <span id="month" className="font-semibold opacity-60 text-sm">
          {date.toLocaleDateString("en-US", { month: "long" })}
        </span>
      </span>
      <span className="mb-1 w-1/2 text-3xl font-extrabold">
        {formatMoney(budget - total > 0 ? budget - total : 0)}
      </span>
      <span className="sm:hidden mb-4 w-1/2 text-xs opacity-60 font-semibold">
        {Math.round(100 - leftOver)}% Budget Utilised
      </span>
      <div className="relative flex flex-col items-center w-full">
        <div
          className={`border-2 border-border w-full ${barClicked ? "h-16" : "h-4"} rounded-xl flex overflow-hidden duration-300`}
          onClick={clicked}
        >
          {!barClicked && (
            <div
              style={{
                background: barColor,
                width: `${(total / budget) * 100}%`,
              }}
              className="h-full"
            />
          )}

          {barClicked &&
            spendData.map((item, index) => {
              return (
                <div
                  key={index}
                  className="h-full flex items-center justify-center p-2"
                  style={{
                    background: colorList[index],
                    width: `${(item.amount / budget) * 100}%`,
                    color: `hsl(from ${colorList[index]} h s 40 )`,
                  }}
                >
                  {iconMap[item.label]}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default MonthlyBudgetSection;
