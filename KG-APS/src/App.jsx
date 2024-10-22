import { BrowserRouter, Routes , Route} from "react-router-dom"
import Login from "./pages/loginComponent/Login"
import Faculty from "./pages/FacultyComponent/Faculty"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />,
        <Route path="/faculty-incharge" element={<Faculty/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
