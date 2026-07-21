import {
  ChevronDownIcon,
  Circle,
  Coffee,
  GraduationCap,
  LucideCalculator,
  LucideChartBarBig,
  LucideChartLine,
  LucideCoins,
  LucideDices,
  LucideNotebookTabs,
  LucidePencil,
  LucideShoppingBasket,
  Mail,
  Pencil,
  Pizza,
  ShieldCheck,
  User2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { assets, colorList } from "../assets/assets";
import { api, supabase } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import profileIcons from "../components/profilePics";
import { FcAndroidOs } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { BsGithub, BsInstagram, BsLinkedin, BsTwitter } from "react-icons/bs";

const Homepage = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendMessage, setBackendMessage] = useState("");
  const [homepageData, setHomepageData] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiData = await api.get("/homepage");
      setHomepageData(apiData.data);
      setError(null);
    } catch (err) {
      console.error("API Fetch Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const handleLogout = () => {
    supabase.auth.signOut();
    setBackendMessage("");
  };

  if (!loading) {
    return (
      <>
        <nav className="flex w-full border-2 h-16 items-center justify-between px-3 lg:px-5">
          <div
            className="flex items-center gap-2 pointer-events-none select-none "
            style={{ color: "hsl(from var(--mint-foreground)h s 40)" }}
          >
            <GraduationCap size={30} />
            <span className="font-bold hidden sm:inline">Campus Cash</span>
          </div>
          {/* <div className="w-1/3"></div> */}
          <div className="flex gap-2 items-center">
            {session && (
              <>
                {/* <span className="font-semibold cursor-pointer focus:text-cyan-500 focus-within:text-cyan-500 active:text-cyan-700 hover:text-cyan-500 duration-150">
                  Dashboard
                </span> */}
                <div
                  onClick={() => {
                    navigate("/dashboard");
                  }}
                  className="flex gap-2 items-center cursor-pointer focus:text-cyan-500 focus-within:text-cyan-500 active:text-cyan-700 hover:text-cyan-500 duration-150"
                >
                  <span className="font-semibold">Dashboard</span>
                  {homepageData ? (
                    <div
                      id={profileIcons[homepageData?.profileIconIndex].id}
                      className="rounded-full p-1.5 shadow-md size-7 aspect-square flex justify-center items-center cursor-pointer"
                      style={{
                        backgroundColor:
                          profileIcons[homepageData?.profileIconIndex].bgColor,
                        color:
                          profileIcons[homepageData?.profileIconIndex].color,
                      }}
                    >
                      {profileIcons[homepageData?.profileIconIndex].icon}
                    </div>
                  ) : (
                    <User2 />
                  )}
                </div>
              </>
            )}
          </div>
          {!session && (
            <div className="flex gap-3 items-center ">
              <>
                <span
                  onClick={() => {
                    navigate("/register");
                  }}
                  className="font-semibold rounded-full px-3 py-1 shadow-md focus:bg-mint focus:text-mint-foreground 
                  focus-within::bg-mint focus-within::text-mint-foreground
                 active:text-mint-foreground active:bg-mint active:scale-90 hover:bg-mint hover:text-mint-foreground duration-300 cursor-pointer"
                >
                  Sign Up
                </span>
                <div
                  onClick={() => {
                    navigate("/dashboard");
                  }}
                  className="flex items-center gap-2 focus:ttext-[hsl(from_var(--mint-foreground)_h_s_40)]focus-within:text-cyan-500 active:text-[hsl(from_var(--mint-foreground)_h_s_40)]
                  hover:text-[hsl(from_var(--mint-foreground)_h_s_40)] duration-100 cursor-pointer "
                >
                  <span className="font-semibold">Login</span>
                  <User2 />
                </div>
              </>
            </div>
          )}
        </nav>

        <main className="relative flex justify-around items-center w-full h-screen p-5 overflow-hidden flex-col">
          <div
            aria-hidden="true"
            id="bg-items"
            className="absolute -z-1 opacity-10 w-[200vw] flex flex-col justify-center items-center gap-10"
          >
            {Array.from({ length: 10 }, (_, i) => {
              // 1. Put the 6 icon elements into an array
              const icons = [
                <GraduationCap key="cap" size={60} />,
                <Pencil key="pencil" size={60} />,
                <Pizza key="pizza" size={60} />,
                <Coffee key="coffee" size={60} />,
                <LucideCalculator key="calc" size={60} />,
                <LucideNotebookTabs key="notes" size={60} />,
              ];

              // 2. Shuffle that array using Map-Sort
              const shuffledIcons = icons
                .map((element) => ({ element, sortKey: Math.random() }))
                .sort((a, b) => a.sortKey - b.sortKey)
                .map(({ element }) => element);
              return (
                <div
                  key={i}
                  className={`row flex gap-10`}
                  style={{
                    animationDelay:
                      Math.floor(Math.random() * 100) * 100 + "ms",
                  }}
                >
                  {Array.from({ length: 5 }, (_, j) => {
                    // 3. Render the row with the shuffled icons
                    return (
                      <div key={j} className="flex gap-10">
                        {shuffledIcons}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="text-3xl font-bold text-center">
            Expense Tracker <br /> Made Especially for <br />
            <span className="text-[hsl(from_var(--mint-foreground)_h_s_40)] text-4xl ">
              Students
            </span>
          </div>

          <div className="text-xl font-semibold">
            Manage Your Budget with Us
          </div>
        </main>

        <section className="w-full flex justify-center items-center flex-col px-5 pb-10 overflow-hidden">
          <span className="text-3xl lg:text-4xl font-bold my-10">
            What we Offer
          </span>

          <div className="flex flex-col gap-10">
            <div
              id="feature-1"
              className=" flex flex-col rounded-xl border border-border shadow-md p-5 justify-center items-center bg-white"
            >
              <h3 className="font-semibold text-2xl">Weekly Insights</h3>
              <img
                src={assets.Feature1}
                alt="feature 1 image"
                className="w-100 shadow-[0_0px_10px_0px] shadow-chart-1 rounded-3xl my-5"
              />
              <div className="w-full text-center flex flex-col gap-5">
                <span className="font-semibold">
                  Useful Weekly Insights To Manage Your Money Better
                </span>
                <span className="font-semibold text-chart-1">
                  AI Recommendations Personalised For Your Spending Habits
                </span>
              </div>
            </div>

            <div
              id="feature-2"
              className="relative flex flex-col rounded-xl border border-border shadow-md p-5 justify-center items-center bg-white/70 "
            >
              <div
                aria-hidden="true"
                className="absolute -z-1 opacity-10 w-[200vw] flex flex-col justify-center items-center gap-10"
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className={`row flex gap-10`}
                    style={{
                      "--transx": `${Math.pow(-1, i) * 600}px`,
                      animation: "moveleft 5000ms linear infinite",
                    }}
                  >
                    {Array.from({ length: 5 }, (_, j) => (
                      <div key={j} className="flex gap-10">
                        <LucideChartBarBig size={60} />
                        <LucideShoppingBasket size={60} />
                        <LucideChartLine size={60} />
                        <LucideCoins size={60} />
                        <LucideDices size={60} />
                        <LucidePencil size={60} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <h3 className="font-semibold text-xl">Monthly Insights</h3>
              <img
                src={assets.Feature2}
                alt="feature 2 image"
                className="w-100 shadow-[0_0px_10px_0px] shadow-chart-6 rounded-xl my-5"
              />
              <div className="w-full text-center flex flex-col gap-5">
                <span className="font-semibold text-sm">
                  Monthly Insights Categorised Over Various Useful Categories To
                  Learn Your Spending Habits
                </span>
              </div>
            </div>

            <div
              id="feature-3"
              className=" flex flex-col rounded-xl border border-border shadow-md p-5 justify-center items-center"
            >
              <h3 className="font-semibold text-xl">Safe to Spend</h3>
              <img
                src={assets.Feature3}
                alt="feature 3 image"
                className="w-100 shadow-[0_0px_10px_0px] shadow-chart-1 rounded-xl my-5"
              />
              <div className="w-full text-center flex flex-col gap-5">
                <span className="font-semibold text-sm">
                  Safe To Spend Feature To Keep You & Your Budget In Check Every
                  Time You Spend
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="setup"
          className="w-full flex justify-center flex-col md:px-10 overflow-hidden "
        >
          <div className="relative w-full max-w-275 mx-auto my-10 p-6 md:p-12 bg-slate-50/50 border border-slate-100 rounded-3xl overflow-visible">
            {/* 1. SECTION HEADER */}
            <div className="mb-12 text-center lg:text-left">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Easy to Setup
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Get up and running in under 2 minutes
              </p>
            </div>

            {/* 2. THE SVG CONNECTOR PATH (Only visible on Desktop/Large Screens) */}
            <svg
              className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 1100 750"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path
                    d="M 0 1.5 L 8 5 L 0 8.5 z"
                    className="fill-slate-800"
                  />
                </marker>
              </defs>

              {/* 
          Master 4-Step S-Curve Path:
          - Starts at Step 1 (top-left) -> loops right to Step 2 (top-right)
          - Swoops back left -> lands at Step 3 (bottom-left)
          - Swoops right -> lands at Step 4 (bottom-right)
        */}
              <path
                d="M 430, 240 
             C 850, 240 1050, 320 850, 380
             C 650, 440 100, 320 180, 500
             C 210, 560 350, 590 620, 580"
                className="stroke-slate-800/90"
                strokeWidth="3.5"
                strokeDasharray="8 8"
                strokeLinecap="round"
                markerEnd="url(#arrow)"
              />
            </svg>

            {/* 3. STEPS CONTAINER */}
            {/* Grid on desktop, stack on mobile. relative z-20 keeps interactive elements clickable */}
            <div className="relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-y-9 lg:gap-y-36 lg:gap-x-12">
              {/* ==================== STEP 1 ==================== */}
              <div
                className={`relative flex flex-col items-start ${session ? "bg-emerald-50/50" : "bg-white"} border border-slate-100 rounded-2xl p-6 shadow-sm max-w-100 w-full mx-auto lg:mx-0`}
              >
                {session ? (
                  <div className="absolute bg-emerald-50/40 w-full h-full rounded-2xl top-0 left-0"></div>
                ) : (
                  ""
                )}
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                  Step 1
                </span>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  Sign Up
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Create your account on Campus Cash with just an{" "}
                  <strong className="font-semibold text-slate-800">
                    Email ID
                  </strong>
                  .
                </p>
                {session ? (
                  <span className="border-2 border-slate-900 rounded-full px-6 py-1.5 text-sm font-semibold hover:bg-slate-900 hover:text-white transition-all duration-200 cursor-pointer">
                    Signed Up
                  </span>
                ) : (
                  <button
                    className="border-2 border-slate-900 rounded-full px-6 py-1.5 text-sm font-semibold hover:bg-slate-900 hover:text-white transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      navigate("/register");
                    }}
                  >
                    Sign Up
                  </button>
                )}
              </div>

              {/* Mobile Connector Line (Only visible on mobile/tablet between cards) */}
              <div className="lg:hidden flex justify-center -my-8">
                <div className="h-16 w-0.5 border-l-2 border-dashed border-slate-400"></div>
              </div>

              {/* ==================== STEP 2 ==================== */}
              <div className="flex flex-col items-start bg-white border border-slate-100 rounded-2xl p-6 shadow-sm max-w-100 w-full mx-auto lg:ml-auto lg:mr-0">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                  Step 2
                </span>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  Choose your OS
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Select your preferred operating system to proceed with
                  configuration.
                </p>
                <div className="flex gap-2 w-full">
                  <button
                    className="flex-1 flex justify-center items-center px-4 border border-slate-200 rounded-xl text-sm font-medium hover:border-slate-800 transition-colors cursor-pointer"
                    onClick={() => {
                      navigate("/setup-widget/ios");
                    }}
                  >
                    <FaApple size={20} /> <span>iOS</span>
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center py-2 px-4 border border-slate-200 rounded-xl text-sm font-medium hover:border-slate-800 transition-colors cursor-pointer"
                    onClick={() => {
                      navigate("/setup-widget/android");
                    }}
                  >
                    <FcAndroidOs size={20} />{" "}
                    <span className="text-center">Android</span>
                  </button>
                </div>
              </div>

              {/* Mobile Connector Line */}
              <div className="lg:hidden flex justify-center -my-8">
                <div className="h-16 w-0.5 border-l-2 border-dashed border-slate-400"></div>
              </div>

              {/* ==================== STEP 3 ==================== */}
              <div className="flex flex-col items-start bg-white border border-slate-100 rounded-2xl p-6 shadow-sm max-w-100 w-full mx-auto lg:mx-0">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
                  Step 3
                </span>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  Add widget / shortcut
                </h3>
                <p className="text-sm text-slate-600">
                  Pin the quick shortcut to your phone's home screen or active
                  widget pane for instant access.
                </p>
              </div>

              {/* Mobile Connector Line */}
              <div className="lg:hidden flex justify-center -my-8">
                <div className="h-16 w-0.5 border-l-2 border-dashed border-slate-400"></div>
              </div>

              {/* ==================== STEP 4 ==================== */}
              <div className="flex flex-col items-start bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 shadow-sm max-w-100 w-full mx-auto lg:ml-auto lg:mr-0">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
                  Step 4
                </span>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  🎉 And, All Done!
                </h3>
                <p className="text-sm text-slate-600">
                  Everything is set up. You are ready to start utilizing and
                  managing your daily expenses!
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-slate-900 w-full flex flex-col lg:flex-row p-5 lg:py-5 lg:px-3 lg:min-h-64">
          {/* Mobile: Top, Desktop:Left */}
          <div className="flex-1 flex text-white">
            {/* Main Part */}
            <div className="flex lg:flex-col lg:items-center lg:justify-between p-5 lg:ps-0">
              <div className="flex flex-col lg:items-center gap-1">
                <div className="flex items-center gap-1">
                  <GraduationCap
                    size={40}
                    className="text-green-300 lg:hidden"
                  />
                  <GraduationCap
                    size={50}
                    className="text-green-300 hidden lg:block"
                  />
                  <span className="font-bold text-lg lg:text-2xl">
                    Expense&nbsp;
                    <span className="text-green-300">Tracker</span>
                  </span>
                </div>
                <div className="text-xs ps-1 text-white/60 lg:text-sm">
                  Helping students manage their money smarter with AI insights
                  and simple expense tracking.
                </div>
              </div>

              {/* Vertical Line for Mobile Devices */}
              <div className="lg:hidden border-white/50 border rounded-full mx-3"></div>

              {/* Horizontal Line for Desktops */}
              <div className="hidden lg:block border-white/40 border rounded-full w-full"></div>

              {/* Trusted Label */}
              <div className="flex flex-col lg:flex-row justify-center items-center gap-1 ">
                <ShieldCheck size={35} className="lg:hidden" />
                <ShieldCheck size={45} className="lg:block hidden" />

                <span className="lg:hidden text-xs font-bold text-center">
                  Trusted by Hundreds of Students
                </span>
                <span className="hidden text-xs font-bold  h-full justify-around lg:flex flex-col">
                  Trusted by Hundreds of Students <br />
                  <span className="font-normal text-white/40">
                    Built for a better financial future.
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex-3 flex flex-col text-white px-3 gap-3 lg:px-0 lg:py-5 lg:justify-center">
            {/* Quick Links & Resources */}
            <div className="flex lg:flex-1">
              <div className="flex p-1 flex-col flex-1 gap-2 lg:gap-4">
                <span className="font-bold lg:text-lg">Quick Links</span>
                <span
                  className="flex items-center gap-2 text-xs lg:text-[16px] font-semibold hover:text-green-300 cursor-pointer duration-150"
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  <Circle
                    fill="oklch(87.1% 0.15 154.449)"
                    className="text-green-300"
                    size={7}
                  />
                  Home
                </span>
                <span
                  className="flex items-center gap-2 text-xs lg:text-[16px] font-semibold hover:text-green-300 cursor-pointer duration-150"
                  onClick={() => {
                    navigate("/dashboard");
                  }}
                >
                  <Circle
                    fill="oklch(87.1% 0.15 154.449)"
                    className="text-green-300"
                    size={7}
                  />
                  Dashboard
                </span>
                <span
                  className="flex items-center gap-2 text-xs lg:text-[16px] font-semibold hover:text-green-300 cursor-pointer duration-150"
                  onClick={() => {
                    navigate("/register");
                  }}
                >
                  <Circle
                    fill="oklch(87.1% 0.15 154.449)"
                    className="text-green-300"
                    size={7}
                  />
                  Register
                </span>
                <span className="flex items-center gap-2 text-xs  lg:text-[16px] font-semibold hover:text-green-300 cursor-pointer duration-150">
                  <a
                    href="#setup"
                    className="flex items-center justify-center gap-2"
                  >
                    <Circle
                      fill="oklch(87.1% 0.15 154.449)"
                      className="text-green-300"
                      size={7}
                    />
                    How to Setup
                  </a>
                </span>
              </div>

              <div className="flex p-1 flex-col flex-1 gap-2">
                <span className="font-bold lg:text-lg">Resources</span>
                <span
                  className="flex items-center gap-2 text-xs lg:text-[16px] font-semibold hover:text-green-300 cursor-pointer duration-150"
                  onClick={() => {
                    navigate("/privacy-policy");
                  }}
                >
                  <Circle
                    fill="oklch(87.1% 0.15 154.449)"
                    className="text-green-300"
                    size={7}
                  />
                  Privacy Policy
                </span>
                <span
                  className="flex items-center gap-2 text-xs lg:text-[16px] font-semibold hover:text-green-300 cursor-pointer duration-150"
                  onClick={() => {
                    navigate("/terms-and-condition");
                  }}
                >
                  <Circle
                    fill="oklch(87.1% 0.15 154.449)"
                    className="text-green-300"
                    size={7}
                  />
                  Terms & Conditions
                </span>
              </div>

              <div className="hidden lg:flex p-1 flex-col flex-1 gap-2">
                <span className="font-bold lg:text-lg">Social</span>
                <span
                  className="flex items-center gap-2 text-xs lg:text-[16px] font-semibold hover:text-green-300 duration-150 cursor-pointer"
                  onClick={() => {
                    navigate("/privacy-policy");
                  }}
                >
                  <Mail className="text-green-300" size={15} />
                  vermasaksham676@gmail.com
                </span>
                <div className="border-white/50 border rounded-full lg:my-3"></div>
                <div className="flex gap-2 lg:justify-center lg:gap-7">
                  <div className="lg:scale-125 size-8 rounded-full bg-gray-500 flex items-center justify-center hover:bg-green-300 duration-150 cursor-pointer">
                    <BsTwitter />
                  </div>
                  <div className="lg:scale-125 size-8 rounded-full bg-gray-500 flex items-center justify-center hover:bg-green-300 duration-150 cursor-pointer">
                    <BsInstagram />
                  </div>
                  <div className="lg:scale-125 size-8 rounded-full bg-gray-500 flex items-center justify-center hover:bg-green-300 duration-150 cursor-pointer">
                    <BsGithub />
                  </div>
                  <div className="lg:scale-125 size-8 rounded-full bg-gray-500 flex items-center justify-center hover:bg-green-300 duration-150 cursor-pointer">
                    <BsLinkedin />
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex justify-between mt-4">
              <span>
                &copy; 2026&nbsp;
                <span className="text-green-300">Expense Tracker</span>. All
                right reserved.
              </span>
              <span className="font-bold">Made with ❤️ for students</span>
            </div>

            {/* Mobile:Social */}
            <div className="lg:hidden flex p-1 flex-col flex-1 gap-3">
              <span className="font-bold">Social</span>
              <span
                className="flex items-center gap-2 text-xs font-semibold hover:text-green-300 duration-150 cursor-pointer"
                onClick={() => {
                  navigate("/privacy-policy");
                }}
              >
                <Mail className="text-green-300" size={15} />
                vermasaksham676@gmail.com
              </span>
              <div className="border-white/50 border rounded-full"></div>
              <div className="flex gap-2">
                <div className="size-8 rounded-full bg-gray-500 flex items-center justify-center hover:bg-green-300 duration-150 cursor-pointer">
                  <BsTwitter />
                </div>
                <div className="size-8 rounded-full bg-gray-500 flex items-center justify-center hover:bg-green-300 duration-150 cursor-pointer">
                  <BsInstagram />
                </div>
                <div className="size-8 rounded-full bg-gray-500 flex items-center justify-center hover:bg-green-300 duration-150 cursor-pointer">
                  <BsGithub />
                </div>
                <div className="size-8 rounded-full bg-gray-500 flex items-center justify-center hover:bg-green-300 duration-150 cursor-pointer">
                  <BsLinkedin />
                </div>

                <span className="text-xs font-semibold flex items-center">
                  Made with ❤️ for students
                </span>
              </div>
            </div>
          </div>
        </footer>

        {/* Mobile/Tab Footer */}
        {/* <footer className="flex bg-slate-950 w-full h-64 flex-col">
          <div className="flex-2"></div>
          <div className="flex-3"></div>
        </footer> */}
      </>
    );
  }
};

export default Homepage;
