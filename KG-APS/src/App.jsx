import { BrowserRouter, Routes , Route} from "react-router-dom"
import Login from "./pages/loginComponent/Login"
import Facultysidebar from "./pages/FacultysidebarComponent/Facultysidebar"
import Admin from "./pages/AdminComponent/Admin"
import PieChart from "./ProgressDisplay/chart"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ <Login/> } />
        <Route path="/facultysidebar" element={ <Facultysidebar/> } />
        <Route path='/admin' element={ <Admin/> } />
        <Route path='/chart' element={ <PieChart/> } />
      </Routes>
    </BrowserRouter>
  )
}

export default App