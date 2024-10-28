import React, { useEffect } from 'react';
import axios from 'axios';

const TestAxiosRequest = () => {

  useEffect(() => {
    axios({
      // Endpoint to send the request
      url: "http://localhost:8000/creation/departments",
      method: "GET",
    })
    .then((res) => {
      console.log('Response:', res);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  }, []);

  return (
    <div>
      <h1>Testing Axios Request</h1>
    </div>
  );
}

export default TestAxiosRequest;
