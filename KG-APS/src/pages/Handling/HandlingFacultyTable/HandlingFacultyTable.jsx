import React from 'react';
import "./HandlingFacultyTable.css";

const TableComponent = () => {
  // Mock data for the table
  const mockData = [
    { id: 1, topic: 'Data Structures', outcome: 'Understand basics', status_code: 3, link: 'http://example.com' },
    { id: 2, topic: 'Algorithms', outcome: 'Learn sorting', status_code: 2, link: '' },
    { id: 3, topic: 'Databases', outcome: 'SQL basics', status_code: 1, link: '' },
  ];

  // Example UID data
  const uidData = [
    { uid: 1 }
  ];

  // Function to get the box color based on the status code
  const getBoxColor = (status_code) => {
    switch (status_code) {
      case 0: return 'white';
      case 1: return 'orange';
      case 2: return 'red';
      case 3: return 'green';
      default: return 'white';
    }
  };

  // Check if the UID is 1
  const isUid1 = uidData.some(user => user.uid === 1);

  return (
    <div className="table-container">
      {isUid1 ? ( 
        <table>
          <thead>
            <tr>
              <th>Topic</th>
              <th>Outcome</th>
              <th>Status Code</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((item) => (
              <tr key={item.id}>
                <td>{item.topic}</td>
                <td>{item.outcome}</td>
                <td style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <span
                    className="box"
                    style={{
                      display: 'inline-block',
                      width: '20px',
                      height: '20px',
                      backgroundColor: getBoxColor(item.status_code),
                    }}
                  ></span>
                </td>
                <td>
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noopener noreferrer">View</a>
                  ) : (
                    <span>No Link Available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available for this UID.</p> // Message when UID is not 1
      )}
    </div>
  );
};

export default TableComponent;
