import React from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function App() {
    const [status, setStatus] = React.useState<string>("…");

    React.useEffect(() => {
        fetch(`${API}/health`)
            .then(r => r.json())
            .then(j => setStatus(`API: ${j.status}, DB: ${j.db}`))
            .catch(() => setStatus("API unreachable"));
    }, []);

    return (
        <main style={{ fontFamily: "system-ui", padding: 24 }}>
            <h1>Fuel Tracker — MVP</h1>
            <p>Fast Start ✅</p>
            <p><code>{status}</code></p>
        </main>
    );
}