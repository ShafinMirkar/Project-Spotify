import generateCode from './generateCode.js'
import "../App.css"

export default function Login (){
    return(
        <>
            <div className='container'>
            <h1>Welcome to Roastifyy</h1>
            <button type="button" onClick={()=>generateCode()}>Sign in with Spotify</button>
            </div>
        </>
    )
}