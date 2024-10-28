import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/loginComponent/Login";
import PieChart from "./ProgressDisplay/chart";
import HandlingSidebar from "./pages/Handling/HandlingSidebar/HandlingSidebar";
import HandlingFacultyDashboard from "./pages/Handling/HandlingFacultyDashboard/HandlingFacultyDashboard";
import TestAxiosRequest from "./ProgressDisplay/testaxios";
import HandlingTables from "./pages/Handling/HandlingTables/HandlingTables"

function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/handlingsidebar" element={ < HandlingSidebar />} />
        <Route path="/handlingtables" element={ < HandlingTables />} />
        <Route path="/handlingfacultydashboard" element={ < HandlingFacultyDashboard />} />
        <Route path="/chart" element={<PieChart />} />
        <Route path="/test" element={<TestAxiosRequest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routing;