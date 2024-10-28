import React from 'react';
import "./HandlingTables.css"

const TableComponent = () => {
  const mockData = [
    { id: 1, topic: 'Data Structures', outcome: 'Understand basics', status_code: 3, link: 'http://example.com' },
    { id: 2, topic: 'Algorithms', outcome: 'Learn sorting', status_code: 2, link: '' },
    { id: 3, topic: 'Databases', outcome: 'SQL basics', status_code: 1, link: '' },
  ];

  const getBoxColor = (status_code) => {
    switch (status_code) {
      case 0: return 'white';
      case 1: return 'orange';
      case 2: return 'red';
      case 3: return 'green';
      default: return 'white';
    }
  };

  return (
    <div className="table-container">
      <h1>Topics Table</h1>
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
              <td>
                <div
                  className="box"
                  style={{
                    width: '20px', // Width of the box
                    height: '20px', // Height of the box
                    backgroundColor: getBoxColor(item.status_code),
                  }}
                >
                ‎ 
                </div>
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
    </div>
  );
};

export default TableComponent;
