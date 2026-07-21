import React, { useEffect, useState, useRef } from "react";
import Topbar from "../components/dashboard/Topbar";
import WeekSpendBar from "../components/dashboard/WeekSpendBar";
import Main from "../components/dashboard/Main";
import Recent from "../components/dashboard/Recent";
import Footer from "../components/dashboard/Footer";
import { date } from "../assets/assets";
import { supabase, api } from "../context/authContext";

const DashboardLayout = () => {
  // STATES
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [selectedMonthAndYear, setSelectedMonthAndYear] = useState({
    month: date.getMonth(),
    year: date.getFullYear(),
  });
  const [dashboardUrl, setDashboardUrl] = useState(`/dashboard`);
  const [submittedDate, setSubmittedDate] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  // REF: Prevents background useEffect collisions during fresh login handshakes
  const isLoggingIn = useRef(false);

  // FETCH DATA
  const fetchData = async (currentSession = session) => {
    if (!currentSession) return;

    // setLoading(true);
    try {
      const response = await api.get(dashboardUrl, {
        headers: {
          // Bypasses the interceptor lag by explicitly setting the header
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error("API Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // EFFECT 1: Initialize Auth Listeners (Runs EXACTLY once on mount)
  useEffect(() => {
    document.body.classList.add("bg-[#fcfeff]");

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (!initialSession) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (!currentSession) {
        setLoading(false);
      }
    });

    return () => {
      document.body.classList.remove("bg-[#fcfeff]");
      subscription.unsubscribe();
    };
  }, []);

  // EFFECT 2: Generate Request URL based on Month/Year submissions
  useEffect(() => {
    if (
      selectedMonthAndYear.month === date.getMonth() &&
      selectedMonthAndYear.year === date.getFullYear()
    ) {
      setDashboardUrl(`/dashboard`);
    } else {
      setDashboardUrl(
        `/dashboard/${selectedMonthAndYear.month + 1}/${selectedMonthAndYear.year}`,
      );
    }
  }, [submittedDate]);

  // EFFECT 3: Handles automated data refetching
  useEffect(() => {
    if (session && !isLoggingIn.current) {
      fetchData(session);
      console.log("hi");
    }
    console.log(dashboardUrl);
    setSubmittedDate(false);
  }, [dashboardUrl, session]);

  // AUTH ACTIONS
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    isLoggingIn.current = true;

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      console.error("Supabase Error Object:", loginError);
      alert(`Status ${loginError.status}: ${loginError.message}`);
      setLoading(false);
      isLoggingIn.current = false;
    } else if (data?.session) {
      setSession(data.session);

      // Fixes clock skew & storage sync: Pauses briefly so the token becomes valid
      // relative to your local Flask backend's system clock.
      setTimeout(async () => {
        await fetchData(data.session);
        isLoggingIn.current = false;
      }, 500);
    }
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    setBackendMessage("");
  };

  // CONDITIONAL RENDER GUARDS
  if (error) {
    return (
      <div className="h-dvh w-dvw flex flex-col justify-center items-center gap-4">
        <div className="text-xl text-red-500 font-semibold">
          Something went wrong
        </div>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchData();
          }}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
        >
          Try Again
        </button>
        <button
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
          onClick={() => {
            setSession(null);
            setError(null);
          }}
        >
          Login Page
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-dvh w-dvw flex justify-center items-center text-4xl font-bold">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <form
        onSubmit={handleLogin}
        className="border w-full h-full justify-center items-center"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "20px",
        }}
      >
        <div className="flex flex-col justify-center gap-2">
          <h3 className="font-bold text-xl">Sign In</h3>
          <input
            type="email"
            placeholder="Account Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            required
          />
          <div className="w-full">
            <button
              type="submit"
              className="w-full"
              style={{
                padding: "10px",
                background: "#000",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <>
      <Topbar
        selectedDate={selectedMonthAndYear}
        name={dashboardData.firstName}
        onDateChange={setSelectedMonthAndYear}
        onSubmitAction={setSubmittedDate}
        iconIndex={dashboardData.profileIconIndex}
      />
      <div id="dashboard-main-div" className="px-5 mb-5">
        <WeekSpendBar
          prevWeekBetter={dashboardData.prevWeekBetterAvg}
          spendingData={dashboardData.currentWeekSpendings}
          isCurrentMonth={
            selectedMonthAndYear.month === date.getMonth() &&
            selectedMonthAndYear.year === date.getFullYear()
          }
          selectedDate={selectedMonthAndYear}
        />
        <Main
          categories={dashboardData.categories}
          catData={dashboardData.categorisedPastMonth}
          budget={dashboardData.budget}
        />
        <Recent transactionsData={dashboardData.recentTransactions} />
      </div>
      <Footer />
    </>
  );
};

export default DashboardLayout;
