import React from "react";

export default function Modal({ children, onClose }) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeButton} onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

/* ================= ESTILOS ================= */

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999, // 🔥 FICA ACIMA DA TABELA
};

const modalStyle = {
  background: "white",
  padding: "30px",
  borderRadius: "14px",
  width: "500px",
  maxWidth: "90%",
  boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
  position: "relative",
  animation: "fadeIn 0.2s ease-in-out",
  zIndex: 10000
};

const closeButton = {
  position: "absolute",
  top: "12px",
  right: "15px",
  background: "transparent",
  border: "none",
  fontSize: "18px",
  cursor: "pointer",
  fontWeight: "bold"
};
