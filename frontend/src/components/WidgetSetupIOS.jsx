import React, { useEffect, useState } from "react";
import { api, supabase } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const WidgetSetupIOS = () => {
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
    if (!apiKey) {
      return;
    }
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
    <main className="flex w-screen h-dvh flex-col justify-around items-center p-5 gap-20">
      <header className="text-2xl font-bold flex justify-between items-center w-full">
        <ChevronLeft
          className=""
          onClick={() => {
            navigate("/");
          }}
        />
        <span className="">Setup Widget (IOS)</span>
        <span className=""></span>
      </header>
      <div className="border-2 rounded-xl w-full md:w-1/2 flex-col flex p-5 gap-10 mb-auto">
        <div className="flex flex-col">
          <span className="font-semibold text-lg">Click to Copy APIKEY</span>
          <span
            id="apiKey"
            className={`h-10 text-center mt-3 font-bold ${!apiKey && "text-red-500"} cursor-pointer ${!apiKey ? "bg-red-200/50" : "bg-emerald-100/50"} w-full py-2 hover:bg-emerald-100 duration-150`}
            onClick={handleCopyKey}
          >
            {apiKey ? apiKey : "Kindly Login First"}
          </span>
        </div>

        <div className="flex-col flex">
          <span className="font-semibold text-lg">Steps:</span>
          <div className="flex flex-col ps-5 font-medium">
            <ul className="list-disc text-sm">
              <li>
                <span>Copy the API Key</span>
              </li>
              <li>
                <span>Click on get Shortcut</span>
              </li>
              <li>
                <span>Paste the API Key when prompted</span>
              </li>
              <li>
                <span className="self-center font-bold">All Set!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default WidgetSetupIOS;
