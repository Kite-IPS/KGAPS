import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginComponent/Login";
import HandlingSidebar from "./pages/Handling/HandlingSidebar/HandlingSidebar";
import HandlingFacultyDashboard from "./pages/Handling/HandlingFacultyDashboard/HandlingFacultyDashboard";
import CreationFacultyDashboard from "./pages/Creation/Dashboard/FacultyDashboard";
import CreationCCDashboard from "./pages/Creation/Dashboard/CCDashboard";
import HandlingFacultyTable from "./pages/Handling/HandlingFacultyTable/HandlingFacultyTable";

function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/handlingsidebar" element={ < HandlingSidebar />} />
        <Route path="/handling/faculty/dashboard" element={ < HandlingFacultyDashboard />} />
        <Route path="/handling/faculty/table" element={ < HandlingFacultyTable />} />
        <Route path="/handling/course-coordinator/dashboard" element={ < HandlingFacultyDashboard />} />
        <Route path="/creation/faculty/dashboard" element={ < CreationFacultyDashboard />} />
        <Route path="/creation/course-coordinator/dashboard" element={ < CreationCCDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routing;