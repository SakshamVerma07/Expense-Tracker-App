import React, { useState, useEffect } from "react";
import { supabase, api } from "./context/authContext";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState(null);
  const [backendMessage, setBackendMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync session instantly on page load/refresh
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Diagnostic test to make sure Vite is actually reading your keys
    console.log("Supabase URL Check:", import.meta.env.VITE_SUPABASE_URL);
    console.log(
      "Supabase Key Check exists:",
      !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // 2. Print the exact description directly from the Supabase error engine
      console.error("Supabase Error Object:", error);
      alert(`Status ${error.status}: ${error.message}`);
    }
    setLoading(false);
  };

  const testFlaskBackend = async () => {
    try {
      const response = await api.get("/dashboard");
      setBackendMessage(
        `${response.data.message} (Database Row ID: ${response.data.user.id})`,
      );
    } catch (err) {
      setBackendMessage(
        "Flask rejected call: " + (err.response?.data?.error || err.message),
      );
    }
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    setBackendMessage("");
  };

  return (
    <div
      style={{
        padding: "50px",
        fontFamily: "system-ui, sans-serif",
        maxWidth: "500px",
      }}
    >
      <h1>Session Retention Sandbox</h1>
      <p style={{ color: "#666" }}>
        Testing secure authentication persistence across tabs and sessions.
      </p>

      <hr style={{ margin: "30px 0", borderColor: "#eee" }} />

      {!session ? (
        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <h3>Sign In</h3>
          <input
            type="email"
            placeholder="Test Account Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "10px" }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "10px" }}
            required
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px",
              background: "#000",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              backgroundColor: "#e6f4ea",
              color: "#137333",
              padding: "15px",
              borderRadius: "6px",
            }}
          >
            <strong>Status:</strong> Authenticated securely as{" "}
            {session.user.email}
          </div>

          <button
            onClick={testFlaskBackend}
            style={{
              padding: "12px",
              backgroundColor: "#0066cc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Send Authenticated Request to Flask
          </button>

          {backendMessage && (
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "15px",
                borderLeft: "4px solid #0066cc",
                whiteSpace: "pre-wrap",
              }}
            >
              <strong>Flask Node Response:</strong>
              <br />
              {backendMessage}
            </div>
          )}

          <button
            onClick={handleLogout}
            style={{
              padding: "8px",
              background: "none",
              border: "1px solid #ccc",
              cursor: "pointer",
              color: "#666",
            }}
          >
            Sign Out / Clear Long Session
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
