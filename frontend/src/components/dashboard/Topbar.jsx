import {
  ChevronLeft,
  Circle,
  FileText,
  House,
  LogOut,
  NotebookText,
  Pencil,
  PlusIcon,
  Star,
  Wallet,
  WalletCards,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { assets, date } from "../../assets/assets";
import ScrollableDatePicker from "./ScrollableDatePicker";
import { Link, useNavigate } from "react-router-dom";
import profileIcons from "../profilePics";
import { supabase } from "../../context/authContext";

const Topbar = ({
  name = "mate",
  backButton = false,
  selectedDate = { month: date.getMonth(), year: date.getFullYear() },
  onDateChange,
  onSubmitAction,
  isTransactionPage = false,
  iconIndex = 12,
}) => {
  const [monthDialogOpen, setMonthDialogOpen] = useState(false);
  const [profileIconMenuOpen, setProfileIconMenuOpen] = useState(false);
  const openMonthChangeDialog = () => {
    setMonthDialogOpen(!monthDialogOpen);
  };
  const navigate = useNavigate();

  const handleDateChange = useCallback(
    (date) => {
      // {month: 1, year: 2029}
      onDateChange(date);
    },
    [onDateChange],
  );

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  return (
    <>
      {profileIconMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black
            zIndex: 1000, // Make sure it sits above other elements
          }}
          onClick={() => setProfileIconMenuOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 h-full ${profileIconMenuOpen ? "left-0" : "-left-50"} w-50 bg-white z-1001 duration-200 flex flex-col items-center justify-between`}
      >
        <div className="flex items-center h-15 gap-2 border-b-2 border-border w-full justify-center">
          <div className="w-11 aspect-square shadow-sm rounded-full flex justify-center items-center">
            <div
              onClick={() => {
                setProfileIconMenuOpen(true);
              }}
              id={profileIcons[iconIndex].id}
              className="rounded-full p-2.5 shadow-md w-11 aspect-square flex justify-center items-center cursor-pointer"
              style={{
                backgroundColor: profileIcons[iconIndex].bgColor,
                color: profileIcons[iconIndex].color,
              }}
            >
              {profileIcons[iconIndex].icon}
            </div>
          </div>
          <div id="text-box" className="flex flex-col justify-center h-full">
            <span className="font-bold">Hey, {name}</span>
          </div>
        </div>
        <div className="w-full px-5 pb-5 flex flex-col gap-2">
          <div
            onClick={() => {
              navigate("/");
            }}
            className="flex w-full gap-2 cursor-pointer focus:text-peach-foreground focus-within:text-peach-foreground active:text-peach-foreground hover:text-peach-foreground duration-100"
          >
            <House />
            <span className="font-semibold">Homepage</span>
          </div>
          <div
            onClick={() => {
              navigate("/dashboard/transactions");
            }}
            className="flex w-full gap-2 cursor-pointer focus:text-peach-foreground focus-within:text-peach-foreground active:text-peach-foreground hover:text-peach-foreground duration-100"
          >
            <WalletCards />
            <span className="font-semibold">Transactions</span>
          </div>
          <div
            onClick={() => {
              handleLogout();
              navigate("/");
            }}
            className="flex w-full gap-2 cursor-pointer focus:text-peach-foreground focus-within:text-peach-foreground active:text-peach-foreground hover:text-peach-foreground duration-100"
          >
            <LogOut />
            <span className="font-semibold">Logout</span>
          </div>
        </div>
      </div>

      <nav
        id="dashboard-topbar"
        className={`relative flex items-center justify-between ${backButton ? "ps-2 pe-5" : "px-5"} h-20`}
      >
        <div className="flex items-center">
          {backButton && (
            <Link to={"../dashboard"}>
              <ChevronLeft />
            </Link>
          )}
          <div id="welcome" className="flex items-center h-15 gap-2">
            <div className="w-12 aspect-square shadow-sm rounded-full flex justify-center items-center">
              <div
                onClick={() => {
                  setProfileIconMenuOpen(true);
                }}
                id={profileIcons[iconIndex].id}
                className="rounded-full p-2.5 shadow-md w-12 aspect-square flex justify-center items-center cursor-pointer"
                style={{
                  backgroundColor: profileIcons[iconIndex].bgColor,
                  color: profileIcons[iconIndex].color,
                }}
              >
                {profileIcons[iconIndex].icon}
              </div>
            </div>
            <div id="text-box" className="flex flex-col justify-center h-full">
              <span className="text-xs font-medium text-gray-600">
                Welcome back
              </span>
              <span className="font-bold text-lg">Hey, {name}</span>
            </div>
          </div>
        </div>

        <div className="relative" onClick={openMonthChangeDialog}>
          <Star
            fill="var(--sunny)"
            className="pointer-events-none absolute -left-4 -top-3 size-4 text-sunny"
          />
          <span className="rounded-full bg-mint px-4 py-2 text-sm font-semibold text-mint-foreground">
            {new Date(selectedDate.year, selectedDate.month).toLocaleString(
              "en-us",
              {
                month: "short",
                year: "numeric",
              },
            )}
          </span>
          <Pencil className="pointer-events-none absolute -bottom-4 -right-2 size-4 rotate-12 text-peach-foreground/50" />

          {!isTransactionPage && (
            <div
              id="monthDialog"
              className={`${monthDialogOpen ? "border border-border shadow-md" : ""} overflow-hidden absolute z-100 ${!monthDialogOpen ? "h-0 w-50" : "h-70 w-50"} rounded-xl flex flex-col items-center justify-evenly top-[calc(125%)] duration-300`}
              style={{ background: `hsl(from var(--mint) h s 95)` }}
            >
              <>
                <ScrollableDatePicker onChange={handleDateChange} />
                <div
                  className="px-4 py-2 rounded-full bg-chart-2 font-semibold text-white active:scale-90 active:bg-black duration-150"
                  onClick={() => {
                    setMonthDialogOpen(false);
                    onSubmitAction(true);
                  }}
                >
                  Submit
                </div>
              </>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Topbar;
