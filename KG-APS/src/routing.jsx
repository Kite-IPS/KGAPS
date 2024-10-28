import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginComponent/Login";
import HandlingSidebar from "./pages/Handling/HandlingSidebar/HandlingSidebar";
import HandlingFacultyDashboard from "./pages/Handling/HandlingFacultyDashboard/HandlingFacultyDashboard";
import CreationDashboard from "./pages/Creation/Dashboard/FacultyDashboard";
import HandlingTables from "./pages/Handling/HandlingTables/HandlingTables"

function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/handlingsidebar" element={ < HandlingSidebar />} />
        <Route path="/handlingtables" element={ < HandlingTables />} />
        <Route path="/handling/dashboard" element={ < HandlingFacultyDashboard />} />
        <Route path="/creation/dashboard" element={ < CreationDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routing;