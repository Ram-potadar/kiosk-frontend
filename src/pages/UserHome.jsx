import React, { useState } from "react";
import { QrReader } from "react-qr-reader";
import { useNavigate } from "react-router-dom";

export default function UserHome({ onLogout }) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const navigate = useNavigate();

  const handleScanResult = (result) => {
    if (!result) return;

    const scannedText = result.text;
    setScanResult(scannedText);
    setScanning(false);

    // If QR contains URL → go directly
    if (scannedText.startsWith("http")) {
      window.location.href = scannedText;
    }
    // If QR contains only kioskId → navigate
    else {
      navigate(`/connect?kioskId=${encodeURIComponent(scannedText)}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>📱 User Dashboard</h1>

        {!scanning ? (
          <>
            <p style={styles.subtitle}>
              Welcome! Scan the QR code displayed on your kiosk machine.
            </p>

            <div style={styles.actions}>
              <button style={styles.scanBtn} onClick={() => setScanning(true)}>
                🔍 Scan Kiosk QR
              </button>

              <button style={styles.logoutBtn} onClick={onLogout}>
                🚪 Logout
              </button>
            </div>

            <p style={styles.note}>
              Camera permission is required to scan QR codes.
            </p>

            {scanResult && (
              <p style={{ marginTop: 20, color: "green" }}>
                ✅ Scanned: {scanResult}
              </p>
            )}
          </>
        ) : (
          <div>
            <h3 style={{ marginBottom: "10px" }}>📸 Scanning...</h3>

            <QrReader
              constraints={{ facingMode: "environment" }}  // rear/back camera
              onResult={(result, error) => {
                if (result) handleScanResult(result);
                if (error) console.log(error);
              }}
              containerStyle={{
                width: "100%",
                borderRadius: "10px",
                overflow: "hidden",
              }}
              videoStyle={{
                width: "100%",
              }}
            />

            <button
              style={{
                ...styles.logoutBtn,
                marginTop: "20px",
                backgroundColor: "#555",
              }}
              onClick={() => setScanning(false)}
            >
              ✖ Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------- STYLES --------------------------

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #74ABE2, #5563DE)",
    fontFamily: "Segoe UI, Roboto, sans-serif",
  },
  card: {
    backgroundColor: "white",
    padding: "40px 50px",
    borderRadius: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
    textAlign: "center",
    width: "420px",
  },
  title: {
    fontSize: "2rem",
    color: "#333",
    marginBottom: "20px",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#555",
    marginBottom: "30px",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  scanBtn: {
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    padding: "15px 20px",
    fontSize: "1.2rem",
    borderRadius: "10px",
    cursor: "pointer",
  },
  logoutBtn: {
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    padding: "12px 20px",
    fontSize: "1.1rem",
    borderRadius: "10px",
    cursor: "pointer",
  },
  note: {
    marginTop: "25px",
    fontSize: "0.9rem",
    color: "#777",
  },
};
