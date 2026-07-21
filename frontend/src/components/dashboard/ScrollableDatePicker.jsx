import React, { useRef, useEffect, useState } from "react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function ScrollableDatePicker({ onChange }) {
  const years = Array.from({ length: 11 }, (_, i) => 2026 - i).reverse();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthRef = useRef(null);
  const yearRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const ITEM_HEIGHT = 40; // Matches your item h-10 (40px)

    if (monthRef.current) {
      monthRef.current.scrollTop = selectedMonth * ITEM_HEIGHT;
    }
    if (yearRef.current) {
      const yearIndex = years.indexOf(selectedYear);
      if (yearIndex !== -1) {
        yearRef.current.scrollTop = yearIndex * ITEM_HEIGHT;
      }
    }
  }, []);

  const handleScroll = (e, list, setter) => {
    const container = e.currentTarget;
    const type = container.getAttribute("data-type"); // Reads 'month' or 'year' directly from the element

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const itemHeight = container.firstChild?.offsetHeight || 40;
      const scrollPosition = container.scrollTop;
      const index = Math.round(scrollPosition / itemHeight);

      if (index >= 0 && index < list.length) {
        setter(type === "month" ? index : list[index]);
      }
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (onChange) onChange({ month: selectedMonth, year: selectedYear });
  }, [selectedMonth, selectedYear, onChange]);

  const renderColumn = (ref, items, selectedValue, type) => {
    const isMonth = type === "month";
    const setter = isMonth ? setSelectedMonth : setSelectedYear;

    return (
      <div
        ref={ref}
        data-type={type} // Adds the identifier here
        onScroll={(e) => handleScroll(e, items, setter)}
        className="h-48 overflow-y-scroll snap-y snap-mandatory py-20 w-25 text-center"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item, index) => {
          const isSelected = isMonth
            ? index === selectedValue
            : item === selectedValue;
          return (
            <div
              key={item}
              className={`h-10 flex items-center justify-center snap-center transition-all duration-200 ${
                isSelected
                  ? "text-black font-bold text-lg"
                  : "text-gray-400 text-sm"
              }`}
            >
              {isMonth ? item.substring(0, 3) : item}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="relative flex items-center justify-center rounded-xl p-4 w-50 h-50 overflow-hidden">
        <div className="absolute inset-x-4 h-10 border-y-2 border-black pointer-events-none top-[calc(50%-20px)]" />
        <div className="flex space-x-8 z-10">
          {renderColumn(monthRef, MONTHS, selectedMonth, "month")}
          {renderColumn(yearRef, years, selectedYear, "year")}
        </div>
      </div>
    </>
  );
}
