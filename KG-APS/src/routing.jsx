import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginComponent/Login";
import HandlingSidebar from "./pages/Handling/HandlingSidebar/HandlingSidebar";
import HandlingFacultyDashboard from "./pages/Handling/Dashboard/FacultyDashboard/FacultyDashboard";
import CreationFacultyDashboard from "./pages/Creation/Dashboard/FacultyDashboard";
import CreationCCDashboard from "./pages/Creation/Dashboard/CCDashboard";
import HandlingFacultyTable from "./pages/Handling/Table/FacultyTable";
import CreationSupervisorDashboard from "./pages/Creation/Dashboard/SupervisorDashboard";
import CreationHodDashboard from "./pages/Creation/Dashboard/HodDashboard";
import CreationDMDashboard from "./pages/Creation/Dashboard/DMDashboard";
import HandlingCCDashboard from "./pages/Handling/Dashboard/CCDashboard/CCDashboard";
import HandlingCCTable from "./pages/Handling/Table/CCTable";
import HandlingDMDashboard from "./pages/Handling/Dashboard/DMDashboard/DMDashboard";
import HandlingDMTable from "./pages/Handling/Table/DMTable";
import HandlingHODDashboard from "./pages/Handling/Dashboard/HodDashboard/HODDashboard";
import HandlingHODTable from "./pages/Handling/Table/HODTable";
import HandlingSupervisorDashboard from "./pages/Handling/Dashboard/SupervisorDashboard/SupervisorDashboard";
import HandlingSupervisorTable from "./pages/Handling/Table/SupervisorTable";
import CreationSupervisorTable from "./pages/Creation/Table/SupervisorTable";
import CreationCCTable from "./pages/Creation/Table/CCTable";
import CreationDMTable from "./pages/Creation/Table/DMTable";
import CreationHODTable from "./pages/Creation/Table/HODTable";
import CreationFacultyTable from "./pages/Creation/Table/FacultyTable";
import AdminComponent from "./pages/Admin/IQAC/IQAC";

function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/handlingsidebar" element={ < HandlingSidebar />} />
        <Route path="/handling/faculty/dashboard" element={ < HandlingFacultyDashboard />} />
        <Route path="/handling/faculty/table" element={ < HandlingFacultyTable />} />
        <Route path="/handling/course-coordinator/dashboard" element={ < HandlingCCDashboard />} />
        <Route path="/handling/course-coordinator/table" element={ < HandlingCCTable />} />
        <Route path="/handling/domain-mentor/dashboard" element={ < HandlingDMDashboard />} />
        <Route path="/handling/domain-mentor/table" element={ < HandlingDMTable />} />
        <Route path="/handling/hod/dashboard" element={ < HandlingHODDashboard />} />
        <Route path="/handling/hod/table" element={ < HandlingHODTable />} />
        <Route path="/handling/supervisor/dashboard" element={ < HandlingSupervisorDashboard/>} />
        <Route path="/handling/supervisor/table" element={ < HandlingSupervisorTable />} />

        <Route path="/creation/faculty/dashboard" element={ < CreationFacultyDashboard />} />
        <Route path="/creation/faculty/table" element={ < CreationFacultyTable />} />
        <Route path="/creation/course-coordinator/dashboard" element={ < CreationCCDashboard />} />
        <Route path="/creation/course-coordinator/table" element={ < CreationCCTable />} />
        <Route path="/creation/domain-mentor/dashboard" element={ < CreationDMDashboard />} />
        <Route path="/creation/domain-mentor/table" element={ < CreationDMTable />} />
        <Route path="/creation/hod/dashboard" element={ < CreationHodDashboard />} />
        <Route path="/creation/hod/table" element={ < CreationHODTable />} />
        <Route path="/creation/supervisor/dashboard" element={ < CreationSupervisorDashboard />} />
        <Route path="/creation/supervisor/table" element={ < CreationSupervisorTable />} />
        <Route path="/admin-entry" element={ < AdminComponent />} />
        <Route path="/admin" element={ < HandlingFacultyTable />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routing;