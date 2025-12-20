import { useState } from "react"
import './App.css'
export default function App() {
  const [userId, setUserId] = useState();
  const [roast, setRoast] = useState(null)
  async function handleSubmit(e){
    e.preventDefault();
    try {
      userId;
      console.log(userId);
      const response = await fetch(`/api/token?user_id=${encodeURIComponent(userId)}`);
      const data= await response.json();
      console.log(data.text)
      setRoast(data.text); 
    } catch (error) {
      console.log("error while fetching roast", error);
    }
    
  }
  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Enter your user ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>

      {roast && <div className="roast-content">{roast}</div>}
    </div>
  );

}