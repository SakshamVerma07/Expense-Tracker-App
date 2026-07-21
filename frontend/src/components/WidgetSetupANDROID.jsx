import React, { useEffect, useState } from "react";
import { api, supabase } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, EllipsisVertical } from "lucide-react";
import { assets } from "../assets/assets";

const WidgetSetupANDROID = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiData = await api.get("/setup");
      setApiKey(apiData.data);
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

  //   const handleCopyKey = () => {
  //     // navigator.clipboard.writeText(apiKey);
  //     console.log(navigator.clipboard.writeText(apiKey));
  //     setCopied(true);
  //     setTimeout(() => setCopied(false), 2000);
  //   };
  const handleiOSSetup = () => {
    // Step A: Open the iCloud link to download the structure
    window.open(ICLOUD_SHORTCUT_LINK, "_blank");
    setTimeout(() => {
      navigate("/");
    }, 3000);
  };

  const ICLOUD_SHORTCUT_LINK =
    "https://www.icloud.com/shortcuts/2a8e08deda264b08a8e0ebc5ee2d1286";

  const handleCopyKey = () => {
    // Check if the modern clipboard API is available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(apiKey)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Modern copy failed, trying fallback:", err);
          fallbackCopyText(apiKey);
        });
    } else {
      // If navigator.clipboard is undefined, use the classic fallback
      fallbackCopyText(apiKey);
    }
    handleiOSSetup();
  };

  // Old-school fallback method that works on HTTP and older mobile browsers
  const fallbackCopyText = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom on mobile
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        console.error("Fallback copy command was unsuccessful");
      }
    } catch (err) {
      console.error("Fallback copy failed completely:", err);
    }

    document.body.removeChild(textArea);
  };

  return (
    <main className="flex w-screen h-screen flex-col justify-between items-center p-5 gap-10">
      <header className="text-2xl font-bold flex justify-between items-center w-full">
        <ChevronLeft
          className=""
          onClick={() => {
            navigate("/");
          }}
        />
        <span className="text-xl">Setup Widget (Android)</span>
        <span className=""></span>
      </header>
      <div className="border-2 rounded-xl w-full md:w-1/2 flex-col flex p-5 mb-5">
        <div>
          <span className="font-semibold text-lg">How to enable:</span>
          <ul className="p-5 list-disc flex gap-2 flex-col">
            <li>
              Click on<span className="font-bold text-xl mx-3">&#8942;</span>
              and select "Add to Homescreen" or "Install and create Shortcut"
            </li>
            <li>
              Rename if Needed, and Click <strong>Add</strong>
            </li>
            <li className="font-bold">The shortcut is ready</li>
          </ul>
          <div className="flex items-center gap-2 overflow-x-scroll scrollbar-none">
            <img
              src={assets.android_htu_1}
              alt=""
              width={"100px"}
              className="border-black border rounded-sm"
            />
            <img
              src={assets.android_htu_2}
              alt=""
              width={"100px"}
              className="border-black border rounded-sm"
            />
            <img
              src={assets.android_htu_3}
              alt=""
              width={"100px"}
              className="border-black border rounded-sm"
            />
          </div>
        </div>
        <div>
          <hr className="my-5" />
          <span className="font-semibold text-lg">How to Use:</span>
          <ul className="p-5 list-disc flex gap-2 flex-col">
            <li>You can log your expense by clicking on the app itself.</li>
            <li>Enter the amount.</li>
            <li>Select the category.</li>
            <li>Put a note if needed.</li>
            <li>Click "Save Expense".</li>
            <li>
              Tip : You Can Long Press the App to Access Some Quick Expense
              shortcuts.
            </li>
          </ul>
          <div className="flex items-center gap-2 overflow-x-scroll scrollbar-none">
            <img
              width={"100px"}
              className="border border-black rounded-sm"
              src={assets.android_htu_3}
              alt=""
            />
            <img
              width={"100px"}
              className="border border-black rounded-sm"
              src={assets.android_how_to_use_1}
              alt=""
            />
            <img
              width={"100px"}
              className="border border-black rounded-sm"
              src={assets.android_how_to_use_2}
              alt=""
            />
            <img
              width={"100px"}
              className="border border-black rounded-sm"
              src={assets.android_how_to_use_3}
              alt=""
            />
            <img
              width={"100px"}
              className="border border-black rounded-sm"
              src={assets.android_how_to_use_4}
              alt=""
            />
            <img
              width={"100px"}
              className="border border-black rounded-sm"
              src={assets.android_how_to_use_5}
              alt=""
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default WidgetSetupANDROID;
