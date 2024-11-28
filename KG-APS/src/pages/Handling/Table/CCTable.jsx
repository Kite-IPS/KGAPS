import React, { useState } from 'react';
import "../../Table.css";
import HandlingSidebar from '../HandlingSidebar/HandlingSidebar';

const HandlingCCTable = () => {
  const data = JSON.parse(sessionStorage.getItem('userData'));

  const mockData = [
    { id: 1, topic: 'Data Structures', outcome: 'Understand basics', status_code: 3, link: 'http://example.com', hoursTaken: null },
    { id: 2, topic: 'Algorithms', outcome: 'Learn sorting', status_code: 2, link: '', hoursTaken: null },
    { id: 3, topic: 'Databases', outcome: 'SQL basics', status_code: 1, link: '', hoursTaken: null },
  ];

  const uidData = [{ uid: 1 }];

  const [viewMode, setViewMode] = useState('all'); 

  const getBoxColor = (status_code) => {
    switch (status_code) {
      case 0: return 'white';
      case 1: return 'orange';
      case 2: return 'red';
      case 3: return 'green';
      default: return 'white';
    }
  };

  // Function to handle link input for "To upload"
  const handleLinkInput = (e, item) => {
    item.link = e.target.value;
  };

  // Function to handle hours input for "Handle"
  const handleHoursInput = (e, item) => {
    item.hoursTaken = e.target.value;
  };

  const filteredData = mockData.filter((item) => {
    if (viewMode === 'upload') {
      return !item.link; 
    } else if (viewMode === 'handle') {
      return item.link; 
    }
    return true; 
  });

  const isUid1 = uidData.some(user => user.uid === 1);

  return (
    <div className="HFTtable-container">
      {isUid1 ? (
        <>
        <HandlingSidebar />
          <div className="HFTbutton-group">
            <button className="HFTbutton-1" onClick={() => setViewMode('all')}>All contents</button>
            <button className="HFTbutton-2" onClick={() => setViewMode('upload')}>To upload</button>
            <button className="HFTbutton-3" onClick={() => setViewMode('handle')}>Handle</button>
          </div>

          <table>
            <thead>
              <tr>
                <th>Topic</th>
                <th>Outcome</th>
                <th>Status Code</th>
                <th>Link</th>
                {viewMode === 'handle' && <th>Hours Taken</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id}>
                  <td>{item.topic}</td>
                  <td>{item.outcome}</td>
                  <td style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <span
                      className="HFTbox"
                      style={{
                        display: 'inline-block',
                        width: '20px',
                        height: '20px',
                        backgroundColor: getBoxColor(item.status_code),
                      }}
                    ></span>
                  </td>
                  <td>
                    {viewMode === 'upload' && !item.link ? (
                      <input
                        type="text"
                        placeholder="Upload link"
                        onChange={(e) => handleLinkInput(e, item)}
                      />
                    ) : item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer">View</a>
                    ) : (
                      <span>No Link Available</span>
                    )}
                  </td>
                  {viewMode === 'handle' && item.link && (
                    <td>
                      <input
                        type="text"
                        placeholder="Hours taken"
                        onChange={(e) => handleHoursInput(e, item)}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>No data available for this UID.</p>
      )}
    </div>
  );
};

export default HandlingCCTable;
