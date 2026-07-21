import React, { useEffect } from "react";
const App = () => {
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the browser's default mini-infobar from popping up early
      e.preventDefault();
      // Store the event globally on the window object so any component can access it
      window.deferredPrompt = e;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);
  return (
    <div className="flex w-full justify-center items-center border">Hello</div>
  );
};

export default App;
