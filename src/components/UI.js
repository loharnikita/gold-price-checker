import React from "react";

export function Input({ label, value, onChange, ...props }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <label>
        {label}:{" "}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        />
      </label>
    </div>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <label>
        {label}:{" "}
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function Card({ children }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "15px",
        margin: "10px 0",
        background: "#fafafa",
      }}
    >
      {children}
    </div>
  );
}
