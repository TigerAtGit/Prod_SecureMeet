import { Navigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

const Protected = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return <Navigate to='/login' replace={true} />
  }

  const decodedJwt = jwt_decode(user.token);
  const currentTime = Date.now() / 1000;

  if (decodedJwt.exp < currentTime) {
    localStorage.clear();
    // alert('Session expired! Please login again.')
    return <Navigate to='/login' replace={true} />
  }
  return children;
}

export default Protected;