import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../context/authContext";

export default function QuickLog() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(""); // 1. Added category state
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const returnData = {
        amount: amount,
        category: category, // This will now accurately capture the state
        notes: note,
      };
      const expenseData = await api.post("/log/ANDROID", returnData);

      if (expenseData.status === 201) {
        alert("💰 Expense logged successfully!");

        // 2. Clear state values manually to reset the form
        setAmount("");
        setCategory("");
        setNote("");
        setTimeout(() => {
          navigate("/");
        }, 2500);
      } else {
        alert("Failed to log expense.");
      }
    } catch (error) {
      console.error("Error logging expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  useEffect(() => {
    if (urlParams.size != 0) {
      setAmount(urlParams.get("amt"));
      setCategory(urlParams.get("category"));
    }
  }, []);

  if (amount && category && urlParams.size != 0) {
    fetchData();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return alert("Please enter an amount");
    if (!category) return alert("Please select a category"); // Added validation

    setLoading(true);

    try {
      const returnData = {
        amount: amount,
        category: category, // This will now accurately capture the state
        notes: note,
      };
      const expenseData = await api.post("/log/ANDROID", returnData);

      if (expenseData.status === 201) {
        alert("💰 Expense logged successfully!");

        // 2. Clear state values manually to reset the form
        setAmount("");
        setCategory("");
        setNote("");
      } else {
        alert("Failed to log expense.");
      }
    } catch (error) {
      console.error("Error logging expense:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col border-4 h-screen w-screen justify-center items-center p-5">
      <h2 className="font-bold text-2xl">⚡ Quick Log</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-max-65 mt-10"
      >
        <input
          type="number"
          id="amount"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-3 text-lg rounded-sm border-2"
          autoFocus
          required
        />
        {/* 3. Made the select element controlled */}
        <select
          name="category"
          id="category-form-quick-look"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="p-3 text-lg rounded-sm border-2 appearance-none"
        >
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Grocery">Grocery</option>
          <option value="Stationery">Stationery</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          id="note"
          placeholder="Notes"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{
            padding: "12px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="p-3 bg-[#007aff] text-white border-none rounded-sm text-lg cursor-pointer active:scale-90 duration-100"
        >
          {loading ? "Logging..." : "Save Expense"}
        </button>
      </form>
    </div>
  );
}
