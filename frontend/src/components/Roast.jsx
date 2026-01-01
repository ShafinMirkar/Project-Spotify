import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import{ apiFetch} from './fetchWrapper.js';
export default function Roast() {
  const [roasts, setRoasts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRoasts() {
      const userId = localStorage.getItem("userId");

      if(userId===null) navigate("/login");

      const res = await apiFetch(
        `http://localhost:5000/api/roast?userId=${userId}`
      );

      const data = await res.json();

      const roastArray = data.text
        .trim()
        .split(/\n\s*\n/);

      setRoasts(roastArray);
      setLoading(false);
    }

    fetchRoasts();
  }, []);

  function handleNext() {
    if (currentIndex === roasts.length - 1) {
      navigate("/");
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }
  function handlePrev() {
  if (currentIndex > 0) {
    setCurrentIndex(prev => prev - 1);
  }
  }


  if (loading) {
    return (
      <div className="container">
        <h1>Cooking your roast… 🔥</h1>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Your
        {currentIndex + 1 === 1 ? " Playlist " : (currentIndex + 1===2 ? " Top tracks " : " Tops Artists ")}
        huh..😏
      </h1>

      <div className={`roast-card ${
    currentIndex + 1 === 1
      ? "roast-green"
      : currentIndex + 1 === 2
      ? "roast-orange"
      : "roast-blue"}`} >
        {roasts[currentIndex]}
      </div>

      <div
  style={{
    marginTop: "1.5rem",
    display: "flex",
    justifyContent: "space-between",
  }}
>
  <button
    className="btn"
    onClick={handlePrev}
    disabled={currentIndex === 0}
    style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
  >
    ← 
  </button>

  <button className="btn" onClick={handleNext}>
    {currentIndex === roasts.length - 1
      ? "Back to Home 🏠"
      : "→"}
  </button>
</div>

    </div>
  );
}
