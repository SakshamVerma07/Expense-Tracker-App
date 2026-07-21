import React, { useEffect, useState, useCallback } from "react";
import Topbar from "../components/dashboard/Topbar";
import { colorMap, formatMoney } from "../assets/assets";
import { supabase, api } from "../context/authContext"; // Imported your secure client wrappers
import {
  Clapperboard,
  Coins,
  Pencil,
  Pizza,
  ShoppingBasket,
} from "lucide-react";

const iconMap = {
  Food: <Pizza />,
  Grocery: <ShoppingBasket />,
  Entertainment: <Clapperboard />,
  Stationery: <Pencil />,
  Other: <Coins />,
};

// Relative date formatter logic block remains intact
function formatRelativeTimestamp(customDateStr) {
  if (!customDateStr) return "";
  const [day, month, year, hours, minutes, seconds] = customDateStr
    .split(":")
    .map(Number);
  const targetDate = new Date(year, month - 1, day, hours, minutes, seconds);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const targetDayOnly = new Date(targetDate);
  targetDayOnly.setHours(0, 0, 0, 0);

  const timeString = targetDate
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(" ", "");

  const oneDayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((today - targetDayOnly) / oneDayMs);

  const todayDayOfWeek = today.getDay();
  const isSameWeek = diffDays > 1 && diffDays <= todayDayOfWeek;

  let datePrefix = "";
  if (diffDays === 0) {
    datePrefix = "Today";
  } else if (diffDays === 1) {
    datePrefix = "Yesterday";
  } else if (isSameWeek) {
    datePrefix = targetDate.toLocaleDateString("en-US", { weekday: "short" });
  } else {
    const isCurrentYear = targetDate.getFullYear() === today.getFullYear();
    datePrefix = targetDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: isCurrentYear ? undefined : "numeric",
    });
  }

  return `${datePrefix} - ${timeString}`;
}

const Transactions = () => {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [isNotLastPage, setIsNotLastPage] = useState(false);
  const [transactionsList, setTransactionsList] = useState([]);
  const [page, setPage] = useState(1);
  const [session, setSession] = useState(null);
  const [apiData, setApiData] = useState(null);

  // EFFECT 1: Resolve the active session on component mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      setSession(activeSession);
      if (!activeSession) setLoading(false);
    });
  }, []);

  // FETCH DATA MAPPED TO SECURE AXIOS CLIENT
  const fetchData = useCallback(async (currentPage, activeSession) => {
    if (!activeSession) return;

    if (currentPage === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      // Automatically reads the route relative to your backend baseURL setup
      // Note: Your backend should read user identity from the JWT token via authorization headers!
      const response = await api.get(`/expense?page=${currentPage}`, {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`,
        },
      });

      const jsonData = response.data;
      setApiData(jsonData);
      if (jsonData.firstName) setFirstName(jsonData.firstName);
      setIsNotLastPage(!!jsonData.isNotLastPage);

      if (jsonData && Array.isArray(jsonData.expenses)) {
        setTransactionsList((prevList) =>
          currentPage === 1
            ? jsonData.expenses
            : [...prevList, ...jsonData.expenses],
        );
      }
    } catch (error) {
      console.error("Network or parsing error:", error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // EFFECT 2: Fired precisely when page or session state locks into memory
  useEffect(() => {
    if (session) {
      fetchData(page, session);
    }
  }, [page, session, fetchData]);

  // RENDER GUARDS
  if (loading) {
    return (
      <div className="flex w-full h-dvh justify-center items-center text-xl font-bold">
        Loading transactions...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex w-full h-dvh justify-center items-center text-xl font-medium text-red-500">
        Access Denied. Please Sign In.
      </div>
    );
  }

  return (
    <>
      <Topbar
        backButton={true}
        onDateChange={() => {}}
        onSubmitAction={() => {}}
        isTransactionPage={true}
        name={firstName}
        iconIndex={apiData.profileIconIndex}
      />
      <section className="relative h-[calc(100%-80px)] w-full flex flex-col overflow-scroll px-5 pb-10 scrollbar-none">
        <div className="w-full flex flex-col gap-2 overflow-scroll scrollbar-none items-center">
          {transactionsList.length == 0 && (
            <span className="text-3xl font-bold mt-10">No transactions</span>
          )}

          {transactionsList.map((transaction, index) => {
            return (
              <div
                key={`${transaction.id || index}-${index}`}
                className="flex justify-between items-center border-b py-4 w-full"
              >
                <div className="flex gap-2">
                  <div
                    className="icon rounded-full flex justify-center items-center size-10 p-2.5"
                    style={{
                      background: `hsl(from ${colorMap[transaction.category] || "#ccc"} h s 80)`,
                      color: `hsl(from ${colorMap[transaction.category] || "#333"} h s 40)`,
                    }}
                  >
                    {iconMap[transaction.category] || iconMap.Other}
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

                {transaction.note && (
                  <div className="flex text-sm text-gray-600 max-w-[40%] truncate">
                    <span className="font-semibold me-1 text-black">Note:</span>
                    {transaction.note}
                  </div>
                )}

                <div className="flex">
                  <span className="font-bold text-red-600">
                    -{formatMoney(transaction.amount)}
                  </span>
                </div>
              </div>
            );
          })}

          {isNotLastPage && (
            <div className="flex justify-between py-4 w-full">
              <button
                disabled={loadingMore}
                className="gap-2 text-center w-full py-2 bg-gray-50 text-sm font-medium hover:bg-gray-100 rounded border duration-150 disabled:opacity-50"
                onClick={() => setPage((prevPage) => prevPage + 1)}
              >
                {loadingMore ? "Loading more records..." : "Load More..."}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Transactions;
