import React from "react";

const StatusLegend = () => {
  const statusCodes = [
    { code: 0, label: "Assigned", color: "white" },
    { code: 1, label: "Uploaded", color: "orange" },
    { code: 2, label: "Disapproved", color: "red" },
    { code: 3, label: "Approved", color: "green" },
  ];

  const containerStyle = {
    margin: "16px",
    padding: "16px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  const titleStyle = {
    fontSize: "18px",
    marginBottom: "12px",
    color: "#333",
  };

  const listStyle = {
    listStyle: "none",
    padding: 0,
    margin: 0,
  };

  const itemStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
  };

  const colorBoxStyle = (color) => ({
    width: "16px",
    height: "16px",
    borderRadius: "3px",
    marginRight: "8px",
    border: "1px solid #ccc",
    backgroundColor: color,
  });

  const labelStyle = {
    fontSize: "14px",
    color: "#555",
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>Status Legend</h3>
      <ul style={listStyle}>
        {statusCodes.map((status) => (
          <li key={status.code} style={itemStyle}>
            <span style={colorBoxStyle(status.color)}></span>
            <span style={labelStyle}>{`${status.code}: ${status.label}`}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusLegend;
