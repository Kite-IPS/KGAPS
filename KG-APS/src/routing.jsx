import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginComponent/Login";
import HandlingSidebar from "./pages/Handling/HandlingSidebar/HandlingSidebar";
import HandlingFacultyDashboard from "./pages/Handling/HandlingFacultyDashboard/HandlingFacultyDashboard";
import CreationFacultyDashboard from "./pages/Creation/Dashboard/FacultyDashboard";
import CreationCCDashboard from "./pages/Creation/Dashboard/CCDashboard";
import HandlingFacultyTable from "./pages/Handling/HandlingFacultyTable/HandlingFacultyTable";
import CreationSupervisorDashboard from "./pages/Creation/Dashboard/SupervisorDashboard";
import CreationHodDashboard from "./pages/Creation/Dashboard/HodDashboard";
import CreationDMDashboard from "./pages/Creation/Dashboard/DMDashboard";

function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/handlingsidebar" element={ < HandlingSidebar />} />
        <Route path="/handling/faculty/dashboard" element={ < HandlingFacultyDashboard />} />
        <Route path="/handling/faculty/table" element={ < HandlingFacultyTable />} />
        <Route path="/handling/course-coordinator/dashboard" element={ < HandlingFacultyDashboard />} />
        <Route path="/handling/domain-mentor/dashboard" element={ < HandlingFacultyDashboard />} />
        <Route path="/handling/hod/dashboard" element={ < HandlingFacultyDashboard />} />
        <Route path="/handling/supervisor/dashboard" element={ < HandlingFacultyDashboard />} />

        <Route path="/creation/faculty/dashboard" element={ < CreationFacultyDashboard />} />
        <Route path="/creation/course-coordinator/dashboard" element={ < CreationCCDashboard />} />
        <Route path="/creation/domain-mentor/dashboard" element={ < CreationDMDashboard />} />
        <Route path="/creation/hod/dashboard" element={ < CreationHodDashboard />} />
        <Route path="/creation/supervisor/dashboard" element={ < CreationSupervisorDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default Routing;