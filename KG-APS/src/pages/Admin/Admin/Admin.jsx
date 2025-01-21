import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

function Admin() {
  const [data, setData] = useState([]);
  const [columnData, setColumnData] = useState([]);

  useEffect(() => {
    const fetchExcelFile = async () => {
      try {
        // Make a request to your API endpoint
        const response = await axios.get('https://docs.google.com/spreadsheets/d/1jRfEmrs5Vy7YZaFzE4DWEfuFcxMkwwmfwiFHUq5pPZk/edit?usp=sharing', {
          responseType: 'arraybuffer', // Important: Use arraybuffer to receive binary data
        });

        // Convert the response data (binary) to a workbook
        const workbook = XLSX.read(response.data, { type: 'array' });

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert sheet data to JSON (arrays of arrays)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // header: 1 gives an array of arrays

        setData(jsonData); // Store the whole data for reference

        // Extract the specific column (for example, column 2, which is index 1)
        const columnIndex = 1; // Adjust this to select the specific column index
        const extractedColumn = jsonData.map(row => row[columnIndex]);

        setColumnData(extractedColumn); // Store the column data
      } catch (error) {
        console.error('Error fetching or parsing Excel file:', error);
      }
    };

    // Fetch the Excel file when the component mounts
    fetchExcelFile();
  }, []); // Empty dependency array makes this run once when the component mounts

  return (
    <div>
      <h1>Excel File Data from API</h1>

      <div>
        <h2>Extracted Column Data:</h2>
        <pre>{JSON.stringify(columnData, null, 2)}</pre> {/* Display the extracted column data */}
      </div>

      <div>
        <h2>Full Data:</h2>
        <pre>{JSON.stringify(data, null, 2)}</pre> {/* Optionally display the full data */}
      </div>
    </div>
  );
}

export default Admin;
