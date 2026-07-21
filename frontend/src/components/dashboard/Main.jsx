import React from "react";
import CategorySection from "./CategorySection";
import MonthlyBudgetSection from "./MonthlyBudgetSection";

const Main = ({ categories = [], catData = [0, 0, 0, 0, 0], budget = 0 }) => {
  const monthDataFormatted = categories.map((category, index) => {
    return { label: category, amount: catData[index] };
  });
  return (
    <section className="flex flex-col gap-5 items-center justify-center py-5">
      <div
        id="categorization"
        className="h-1/2 w-full items-center justify-center rounded-xl flex shadow-md border-border border"
      >
        <CategorySection spendingData={catData} />
      </div>
      <div
        id="monthly-budget"
        className="h-1/2 w-full items-center justify-center rounded-xl flex shadow-md border-border border"
      >
        <MonthlyBudgetSection
          budgetData={budget}
          spendingData={monthDataFormatted}
        />
      </div>
    </section>
  );
};

export default Main;
