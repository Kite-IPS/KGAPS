import { BrowserRouter, Routes , Route} from "react-router-dom"
import Login from "./pages/loginComponent/Login"
import Faculty from "./pages/FacultyComponent/Faculty"
import Admin from "./pages/AdminComponent/Admin"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ <Login/> } />
        <Route path="/faculty-incharge" element={ <Faculty/> } />
        <Route path='/admin' element={ <Admin/> } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
