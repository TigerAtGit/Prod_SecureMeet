import { Navigate } from "react-router-dom";

const Protected = ({ children }) => {
  const token = JSON.parse(localStorage.getItem('user')); 
  if(!token){
    return <Navigate to='/login' replace={true}/>
  }
  return children;
}

export default Protected;