// import { useNavigate } from "react-router-dom";
// import { useEffect } from "react";


// export default function Home() {
//   const navigate = useNavigate();
//   const urlParams = new URLSearchParams(window.location.search);
//   const code = urlParams.get("code");
//   const userId = localStorage.getItem("userId");

//   async function getToken(code){
//   console.log("Fetching Token");

//   const response = await fetch("http://localhost:5000/api/token", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       code,
//       code_verifier: localStorage.getItem("code_verifier"),
//     }),
//   });

//   const {userId}= await response.json();

//   localStorage.setItem("userId",userId);
  
//   navigate("/");
//   }

//   useEffect(() => {
//     async function handler(){
//       if(code===null && userId===null){
//       console.log("navigate( to login)")
//       navigate("/login");
//     }
//       if(code!==null && userId===null)  await getToken(code);
//     }
//     handler();
//   },[]);
//   return (
//     <div className="container">
//       <h1>Your Spotify wrapped lied to you!!</h1>
//       <button className="btn" onClick={()=>navigate("/roast")}>Let me prove it</button>
//     </div>
//   );
// // }
// import { useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";

// export default function Home() {
//   const navigate = useNavigate();
//   const [checkingAuth, setCheckingAuth] = useState(true);

//   async function getToken(code) {
//     const response = await fetch("http://localhost:5000/api/token", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         code,
//         code_verifier: localStorage.getItem("code_verifier"),
//       }),
//     });

//     const { userId } = await response.json();
//     localStorage.setItem("userId", userId);
//   }

//   useEffect(() => {
//   async function handler() {
//     const params = new URLSearchParams(window.location.search);
//     const code = params.get("code");
//     const userId = localStorage.getItem("userId");

//     console.log("AUTH DEBUG ↓↓↓");
//     console.log("code from URL:", code);
//     console.log("userId from storage:", userId);
//     console.log("current path:", window.location.pathname);

//     if (!code && !userId) {
//       console.log("CASE 1 → redirecting to /login");
//       navigate("/login");
//       return;
//     }

//     if (code && !userId) {
//       console.log("CASE 2 → exchanging token");
//       await getToken(code);
//       console.log("Token exchanged, navigating to /");
//       navigate("/");
//       return;
//     }

//     console.log("CASE 3 → already logged in");
//     setCheckingAuth(false);
//   }

//   handler();
// }, [navigate]);


//   // Prevent UI flicker during auth resolution
//   if (checkingAuth) {
//     return null; // or loading spinner
//   }

//   return (
//     <div className="container">
//       <h1>Your Spotify wrapped lied to you!!</h1>
//       <button className="btn" onClick={() => navigate("/roast")}>
//         Let me prove it
//       </button>
//     </div>
//   );
// }
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import{ apiFetch} from './fetchWrapper.js';

export default function Home() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 🔐 StrictMode guard
  const exchangeStartedRef = useRef(false);

  async function getToken(code) {
    const response = await apiFetch("http://localhost:5000/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        code_verifier: localStorage.getItem("code_verifier"),
      }),
    });

    const { userId } = await response.json();
    localStorage.setItem("userId", userId);
  }

  useEffect(() => {
    async function handler() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      const rawUserId = localStorage.getItem("userId");
      const userId =
        rawUserId && rawUserId !== "null" ? rawUserId : null;

      console.log("AUTH DEBUG ↓↓↓");
      console.log("code:", code);
      console.log("userId:", userId);

      // 🚪 First-time user
      if (!code && !userId) {
        navigate("/login", { replace: true });
        return;
      }

      // 🔁 OAuth return
      if (code && !userId) {
        if (exchangeStartedRef.current) return;

        exchangeStartedRef.current = true;
        await getToken(code);

        // 🧹 Remove ?code from URL
        window.history.replaceState({}, "", "/");

        navigate("/", { replace: true });
        return;
      }

      // ✅ Already logged in
      setCheckingAuth(false);
    }

    handler();
  }, [navigate]);

  if (checkingAuth) return null;

  return (
    <div className="container">
      <h1>Your Spotify wrapped lied to you!!</h1>
      <button className="btn" onClick={() => navigate("/roast")}>
        Let me prove it
      </button>
    </div>
  );
}
