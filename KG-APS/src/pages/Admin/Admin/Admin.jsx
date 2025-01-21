import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define a utility function for counting occurrences
const countOccurrences = (array, value) => {
  return array.filter(x => x === value).length;
};

function Admin() {
  const [data, setData] = useState([]);
  const [columnData, setColumnData] = useState([]);

  useEffect(() => {
    const fetchGoogleSheet = async () => {
      const link = "https://docs.google.com/spreadsheets/d/1jRfEmrs5Vy7YZaFzE4DWEfuFcxMkwwmfwiFHUq5pPZk";
      const csvLink = link.split('/edit')[0] + '/export?format=csv';

      try {
        // Fetch CSV data as plain text
        const response = await axios.get(csvLink, { responseType: 'text' });

        // Split CSV into rows and columns
        const rows = response.data.split('\n').map(row => row.split(','));

        setData(rows); // Set the full data for reference

        // Extract a specific column (e.g., column 3, index 2)
        const columnIndex = rows[0]?.length - 1; // Adjust to your needs (0-based index)
        const extractedColumn = rows.map(row => row[columnIndex]?.trim());
        setColumnData(extractedColumn.slice(1)); // Remove header row
      } catch (error) {
        console.error('Error fetching or parsing Google Sheet:', error);
      }
    };

    fetchGoogleSheet();
  }, []);

  return (
    <div>
      <h1>Google Sheets Data</h1>
      <div>
        <h2>Extracted Column Data:</h2>
        <pre>{JSON.stringify(columnData, null, 2)}</pre>
        <p>
          {"YES: " + countOccurrences(columnData, "Yes") + " | NO: " + countOccurrences(columnData, "No")}
        </p>
      </div>
    </div>
  );
}

export default Admin;
