import {BrowserRouter, Routes, Route} from 'react-router-dom'
import App1 from './app1/app1'
import App2 from './app2/app2'

export default function Admin() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={ <App1/> } />,
            <Route path='/app2' element={ <App2/> } />
        </Routes>
    </BrowserRouter>
  )
}
