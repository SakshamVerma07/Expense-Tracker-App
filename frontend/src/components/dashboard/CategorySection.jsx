import React from "react";
import CategorizationGraph from "./Graphs/CategorizationGraph";
import { formatMoney } from "../../assets/assets";

const CategorySection = ({ spendingData }) => {
  const spendData = spendingData ? spendingData : [0, 0, 0, 0, 0];
  const total = spendData.reduce((sum, num) => sum + num, 0);

  return (
    <div className="flex flex-col justify-around w-full px-5 py-5">
      <span className="mb-4 w-full text-center">
        <h2 className="font-bold text-lg">Where is my money going?</h2>
      </span>
      <div className="relative flex flex-col items-center">
        <CategorizationGraph dataList={spendData} total={total} />
      </div>
    </div>
  );
};

export default CategorySection;
