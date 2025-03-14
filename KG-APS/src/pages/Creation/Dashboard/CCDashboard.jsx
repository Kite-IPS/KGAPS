import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from "axios";
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import HandlingSidebar from "../../Handling/HandlingSidebar/HandlingSidebar.jsx";
import HandlingSidebar2 from '../../Handling/HandlingSidebar2/HandlingSidebar2.jsx';
Chart.register(ArcElement, Tooltip, Legend);

const CreationCCDashboard = () => {
  const data = JSON.parse(sessionStorage.getItem('userData'));
  const [course, setCourse] = useState({});
  const [showStuff, setShowStuff] = useState(false);
  const [MainChartData, setMainChartData] = useState({
    labels: [],
    datasets: [
      {
        label: '',
        data: [],
        backgroundColor: [],
      },
    ],
  });

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };
  window.addEventListener("resize", handleResize);
  return () => {
    window.removeEventListener("resize", handleResize);
  };
  }, []);
  
  console.log(data);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseResponse = await axios.post("http://localhost:8000/api/coordinator_courses", {
          uid: data.uid,
        });
        if (courseResponse.data) {
          setCourse(courseResponse.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const course = await axios({
          url: "http://localhost:8000/api/coordinator_courses",
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          data: data,
        });
        console.log(course.data[0]);
        if (course) {
          const res = await axios({
            url: "http://localhost:8000/api/course_progress",
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            data: course.data[0],
          });
          if (res.data.main.status_code.length > 0) {
            setShowStuff(true);
          }
          const response = res.data;
          const { status_code, count, color } = response.main;

          // Set main chart data
          setMainChartData({
            labels: status_code,
            datasets: [
              {
                label: "Overall Progress",
                data: count,
                backgroundColor: color,
              },
            ],
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // Run only once when the component mounts

  return (
    <div className="chf-grid-container" style={{ display: 'flex', gap: '5vw' }}>
      {windowWidth > 1500 ? <HandlingSidebar /> : <HandlingSidebar2 />}
      <div className="chf-dashboard-contents">
      
        {showStuff ? (
          <>
          <h3>Progress</h3>
          <div style={{ width: '400px', height: '400px', marginBottom: '20px' }}>
            <Pie data={MainChartData} />
          </div>
          </>
        ) : (
          <div
            style={{
              fontSize: '26px', 
              fontWeight: 'bold',
              color: '#FF6347', 
              textAlign: 'left', 
              marginTop: '50px',
              
            }}
          >
            No topics assigned...
          </div>
        )}
      </div>
    </div>
  );
};

export default CreationCCDashboard;
