import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Initial_Page from './pages/Initial_Page'
import Create_Account from './pages/Create_Account'
import Login from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Initial_Page />} />
        <Route path="/Create_Account" element={<Create_Account />} />
        <Route path="/Login" element={<Login />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App