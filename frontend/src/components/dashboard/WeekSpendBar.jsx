import React, { useEffect, useState } from "react";
import {
  CircleArrowDownIcon,
  TrendingUp,
  TrendingDown,
  Star,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
} from "lucide-react";
import WeeklyGraph from "./Graphs/WeeklyGraph";
import { formatMoney, weekList } from "../../assets/assets";

const WeekSpendBar = ({
  spendingData = [],
  prevWeekBetter,
  isCurrentMonth,
  selectedDate,
}) => {
  const [weekDialogOpen, setWeekDialogOpen] = useState(false);
  const date = new Date();
  const [weekIndex, setWeekIndex] = useState(0);
  const weekData = spendingData[weekIndex];
  const daysPassed = date.getDay() === 0 ? 7 : date.getDay();
  let average = 0;
  if (weekIndex == 0) {
    average = weekData.reduce((sum, num) => sum + num, 0) / daysPassed;
  } else {
    average = weekData.reduce((sum, num) => sum + num, 0) / 7;
  }
  const total = weekData.reduce((sum, num) => sum + num, 0);

  const openWeekDialog = () => {
    setWeekDialogOpen(!weekDialogOpen);
  };

  useEffect(() => {
    const weekIndexTimeout = setTimeout(() => {
      setWeekDialogOpen(false);
    }, 1500);

    return () => {
      clearTimeout(weekIndexTimeout);
    };
  }, [weekIndex]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="relative">
          <div
            className={`flex items-center gap-${weekIndex == 0 ? "2" : "1"}`}
          >
            <span
              className={`flex size-8 items-center justify-center rounded-xl duration-300 ${!prevWeekBetter[weekIndex] ? "bg-peach text-peach-foreground" : "bg-mint text-mint-foreground"}`}
            >
              {!prevWeekBetter[weekIndex] && (
                <TrendingUp className="size-4" aria-hidden="true" />
              )}
              {prevWeekBetter[weekIndex] && (
                <TrendingDown className="size-4" aria-hidden="true" />
              )}
            </span>
            <h2
              className={`font-bold text-foreground text-${weekIndex == 0 ? "base" : "xs"}`}
            >
              {isCurrentMonth
                ? weekIndex == 0
                  ? "This Week"
                  : `
              ${weekList[weekIndex][1]} - ${weekList[weekIndex][0]}
              `
                : new Date(
                    selectedDate.year,
                    selectedDate.month,
                  ).toLocaleString("en-us", {
                    month: "short",
                    year: "numeric",
                  })}
            </h2>
            <span className="flex size-4 items-center justify-center">
              {isCurrentMonth && (
                <ChevronDown
                  onClick={openWeekDialog}
                  className={`rotate-${weekDialogOpen ? "180" : "0"} duration-300`}
                />
              )}
            </span>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {formatMoney(total)} spent so far
          </p>
          <div
            className={`absolute overflow-hidden flex justify-between items-center duration-300 px-1 w-60 h-${weekDialogOpen ? 15 : 0} top-1/2 ${weekDialogOpen ? "border border-border shadow-md" : ""} rounded-md bg-white`}
          >
            <ChevronLeft
              color={weekIndex == 8 ? "#00000066" : "#000000"}
              onClick={
                weekIndex == 8 ? null : () => setWeekIndex(weekIndex + 1)
              }
            />
            <span className="font-bold">
              {weekList[weekIndex][1]} - {weekList[weekIndex][0]}
            </span>
            <ChevronRight
              color={weekIndex == 0 ? "#00000066" : "#000000"}
              onClick={
                weekIndex == 0 ? null : () => setWeekIndex(weekIndex - 1)
              }
            />
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-muted-foreground">
            Daily average
          </p>
          <p className="text-lg font-bold text-foreground">
            {formatMoney(average)}
          </p>
        </div>
      </div>
      <WeeklyGraph
        weekSpend={weekData}
        average={average}
        onGoingWeek={true}
        currentWeek={weekIndex == 0}
      />
    </section>
  );
};

export default WeekSpendBar;
