import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginComponent/Login";
import HandlingSidebar from "./pages/Handling/HandlingSidebar/HandlingSidebar";
import HandlingFacultyDashboard from "./pages/Handling/HandlingFacultyDashboard/HandlingFacultyDashboard";
import CreationFacultyDashboard from "./pages/Creation/Dashboard/FacultyDashboard";
import HandlingTables from "./pages/Handling/HandlingFacultyTable/HandlingFacultyTable"

function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/handlingsidebar" element={ < HandlingSidebar />} />
        <Route path="/handlingfacultytable" element={ < HandlingTables />} />
        <Route path="/handling/faculty/dashboard/" element={ < HandlingFacultyDashboard />} />
        <Route path="/creation/dashboard" element={ < CreationFacultyDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routing;