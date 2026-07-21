import React from "react";
import { formatMoney, colorList, colorMap } from "../../assets/assets";
import {
  Clapperboard,
  Coins,
  Pencil,
  Pizza,
  Receipt,
  ShoppingBasket,
} from "lucide-react";
import { Link } from "react-router-dom";

function formatRelativeTimestamp(customDateStr) {
  // Parse custom "DD:MM:YYYY:HH:MM:SS" string
  const [day, month, year, hours, minutes, seconds] = customDateStr
    .split(":")
    .map(Number);
  const targetDate = new Date(year, month - 1, day, hours, minutes, seconds);

  // Setup boundary dates at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const targetDayOnly = new Date(targetDate);
  targetDayOnly.setHours(0, 0, 0, 0);

  // Format the time component (e.g., "11:35 AM")
  const timeString = targetDate
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(" ", ""); // Removes the space to match "11:35AM"

  // Calculate day difference for week checking
  const oneDayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((today - targetDayOnly) / oneDayMs);

  // Check if it's the same calendar week (Sunday to Saturday)
  const todayDayOfWeek = today.getDay();
  const isSameWeek = diffDays > 1 && diffDays <= todayDayOfWeek;

  // Determine the date prefix
  let datePrefix = "";
  if (diffDays === 0) {
    datePrefix = "Today";
  } else if (diffDays === 1) {
    datePrefix = "Yesterday";
  } else if (isSameWeek) {
    // "Mon", "Tue", etc.
    datePrefix = targetDate.toLocaleDateString("en-US", { weekday: "short" });
  } else {
    // THIS IS THE UPDATED ELSE BLOCK:
    // Check if the target year matches the current calendar year
    const isCurrentYear = targetDate.getFullYear() === today.getFullYear();

    datePrefix = targetDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: isCurrentYear ? undefined : "numeric", // Hides year for 2026, shows it for 2024
    });
  }

  return `${datePrefix} - ${timeString}`;
}

const Recent = ({ transactionsData = [] }) => {
  const transactions = transactionsData;
  // [
  //   {
  //     id: 123456,
  //     payer: "company",
  //     amount: 100,
  //     date: "7:7:2026:13:04:25",
  //     category: "Food",
  //   },
  //   {
  //     id: 123456,
  //     payer: "company",
  //     amount: 100,
  //     date: "7:7:2026:13:04:25",
  //     category: "Entertainment",
  //   },
  //   {
  //     id: 123456,
  //     payer: "company",
  //     amount: 100,
  //     date: "6:7:2026:13:04:25",
  //     category: "Other",
  //   },
  //   {
  //     id: 123456,
  //     payer: "company",
  //     amount: 100,
  //     date: "6:7:2026:13:04:25",
  //     category: "Grocery",
  //   },
  //   {
  //     id: 123456,
  //     payer: "company",
  //     amount: 100,
  //     date: "5:7:2026:13:04:25",
  //     category: "Stationery",
  //   },
  //   {
  //     id: 123456,
  //     payer: "company",
  //     amount: 100,
  //     date: "5:6:2023:13:04:25",
  //     category: "Food",
  //   },
  // ];
  const iconMap = {
    Food: <Pizza />,
    Grocery: <ShoppingBasket />,
    Entertainment: <Clapperboard />,
    Stationery: <Pencil />,
    Other: <Coins />,
  };
  const date = new Date();

  return (
    <div
      id="recent-transactions"
      className="w-full p-3 items-center rounded-xl flex flex-col shadow-md border-border border relative"
    >
      <div
        id="top-part"
        className="relative justify-between w-full flex h-1/5 py-2 px-1 mb-3"
      >
        <div className="flex flex-col">
          <span className="font-semibold">Recent Transactions</span>
          <span className="opacity-60 text-sm">Every Coffee Counts</span>
        </div>
        <Receipt className="size-10 right-3 text-chart-3" />
      </div>
      <div
        id="table-part"
        className="w-9/10 flex flex-col gap-2 h-100 overflow-scroll scrollbar-none"
      >
        {transactions.map((transaction, index) => {
          return (
            <div
              key={index}
              className="flex justify-between items-center border-b py-4 w-full"
            >
              <div className="flex gap-2">
                <div
                  className="icon rounded-full flex justify-center items-center size-10 p-2.5"
                  style={{
                    background: `hsl(from ${colorMap[transaction.category]} h s 80)`,
                    color: `hsl(from ${colorMap[transaction.category]} h s 40)`,
                  }}
                >
                  {iconMap[transaction.category]}
                </div>

                <div
                  id="contents"
                  className="flex justify-center flex-col gap-0"
                >
                  <span className="font-medium text-sm">
                    {transaction.category}
                  </span>
                  <span className="font-medium text-xs opacity-60">
                    {formatRelativeTimestamp(transaction.date)}
                  </span>
                </div>
              </div>
              <div className="flex">
                <span className="font-bold ">
                  -{formatMoney(transaction.amount)}
                </span>
              </div>
            </div>
          );
        })}
        <div className="flex justify-between py-4 w-full">
          <div className="gap-2 text-center w-full hover:font-bold active:font-semibold duration-50">
            <Link to="./transactions">View All Transactions</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recent;
