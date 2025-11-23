import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { io } from "socket.io-client";

export default function KioskHome() {
  // --- Load kioskId from URL or localStorage ---
  const params = new URLSearchParams(window.location.search);
  let initialKioskId = params.get("kioskId") || localStorage.getItem("kioskId");

  if (params.get("kioskId")) {
    localStorage.setItem("kioskId", params.get("kioskId"));
  }

  const kioskId = initialKioskId;
  const frontendURL = process.env.REACT_APP_FRONTEND_URL;
  const socketURL = process.env.REACT_APP_SOCKET_URL;

  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Waiting for user to scan QR...");
  const [fileInfo, setFileInfo] = useState(null);
  const [printSettings, setPrintSettings] = useState(null);

  // ---------------- SOCKET CONNECTION ----------------
  useEffect(() => {
    if (!kioskId) {
      setStatus("❌ No kioskId found");
      return;
    }

    const socket = io(socketURL, { transports: ["websocket"] });

    // ✅ Correct event name (backend expects join_kiosk)
    socket.emit("join_kiosk", kioskId);

    // When user connects
    socket.on("userConnectedMessage", (msg) => {
      setConnected(true);
      setStatus("📲 " + msg);
    });

    // When file uploaded
    socket.on("fileReceived", (data) => {
      setFileInfo(data);
      setStatus(`📤 File received: ${data.filename}`);
    });

    // When print request comes
    socket.on("printFile", (settings) => {
      setPrintSettings(settings);
      setStatus(
        `🖨️ Printing ${fileInfo?.filename || "file"} (${settings.copies} copies, ${settings.color})`
      );
    });

    // After printing completes
    socket.on("printStatus", (msg) => {
      setStatus(`✅ ${msg.status}`);
      setFileInfo(null);
      setPrintSettings(null);
    });

    return () => socket.disconnect();
  }, [kioskId, socketURL]);

  // ---------------- UI ----------------
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🖨️ Kiosk Dashboard</h1>
        <p style={styles.subtitle}>{status}</p>

        {/* QR code only when idle */}
        {!connected && kioskId && (
          <>
            <QRCodeCanvas
              value={`${frontendURL}/connect?kioskId=${kioskId}`}
              size={220}
            />
            <p style={styles.footer}>Kiosk ID: {kioskId}</p>
          </>
        )}

        {/* File info */}
        {fileInfo && (
          <div style={styles.fileBox}>
            <h3>📄 File Received</h3>
            <p><strong>{fileInfo.filename}</strong></p>
            <p>Size: {fileInfo.size ? (fileInfo.size / 1024).toFixed(2) + " KB" : "Unknown"}</p>
          </div>
        )}

        {/* Print settings */}
        {printSettings && (
          <div style={styles.printBox}>
            <h3>🖨️ Print Settings</h3>
            <p>Color: <strong>{printSettings.color}</strong></p>
            <p>Copies: <strong>{printSettings.copies}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #74ABE2, #5563DE)",
    fontFamily: "Segoe UI",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
    textAlign: "center",
    width: "450px",
  },
  title: { fontSize: "2rem", marginBottom: "15px" },
  subtitle: { fontSize: "1.2rem", color: "#444", minHeight: "40px" },
  footer: { marginTop: "20px", fontSize: "1rem", color: "#666" },
  fileBox: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "15px",
    backgroundColor: "#f0f9f0",
    border: "1px solid #c8e6c9",
  },
  printBox: {
    marginTop: "15px",
    padding: "15px",
    borderRadius: "15px",
    backgroundColor: "#fff3e0",
    border: "1px solid #ffcc80",
  },
};
