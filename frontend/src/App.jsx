import { Routes, Route } from "react-router-dom";
import { useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import generateCode from './components/generateCode.js';
import Navbar from './components/Navbar.jsx'
import Home from './components/Home.jsx';
import Roast from "./components/Roast.jsx"
import Login from './components/Login.jsx';
import Users from './components/Users.jsx'
import './App.css'

export default function App() {
  
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/roast" element={<Roast/>} />
        <Route path="/users" element={<Users />} />
      </Routes>
    </>
  );

}