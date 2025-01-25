import React, { useState, useEffect } from "react";
import axios from "axios";

// Utility function to count occurrences of specific values
const countOccurrences = (array, value) => {
  return array.filter(x => x === value).length;
};

function Admin() {
  const [data, setData] = useState([]);
  const [completionColumn, setCompletionColumn] = useState([]);
  const [sheetTitle, setSheetTitle] = useState("");

  useEffect(() => {
    const fetchGoogleSheet = async () => {
      // Input link containing gid
      const inputLink =
        "https://docs.google.com/spreadsheets/d/1jRfEmrs5Vy7YZaFzE4DWEfuFcxMkwwmfwiFHUq5pPZk/edit?gid=48115445#gid=48115445";

      // Extract sheetId and gid from the link
      const sheetId = inputLink.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      const gid = inputLink.match(/gid=(\d+)/)?.[1];

      if (!sheetId || !gid) {
        console.error("Invalid Google Sheet link!");
        return;
      }

      // Construct the CSV export link for the specific sheet
      const csvLink = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

      try {
        // Fetch CSV data as plain text
        const response = await axios.get(csvLink, { responseType: "text" });

        // Parse CSV into rows and columns
        const rows = response.data.split("\n").map(row => row.split(","));

        setData(rows); // Store the full data

        // Extract title (e.g., first row/first cell)
        setSheetTitle(rows[0][0]?.trim() || "Assignment Marks Allocation Sheet");

        // Extract the last column for "Completion"
        const columnIndex = rows[0]?.length - 1; // Get the last column index
        const extractedColumn = rows.map(row => row[columnIndex]?.trim());
        setCompletionColumn(extractedColumn.slice(1)); // Skip header row
      } catch (error) {
        console.error("Error fetching or parsing Google Sheet:", error);
      }
    };

    fetchGoogleSheet();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ marginTop: "20px" }}>
        <h3>Summary</h3>
        <p>
          {"YES: " + countOccurrences(completionColumn, "Y") + " | NO: " + countOccurrences(completionColumn, "N")}
        </p>
      </div>
    </div>
  );
}

export default Admin;
