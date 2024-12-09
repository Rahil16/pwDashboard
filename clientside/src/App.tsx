import { BrowserRouter, Route, Routes } from "react-router-dom"
import LoginCard from "./Components/Login/LoginCard"
import Dashboard from "./Components/Dasboard/Dashboard"
const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginCard/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App