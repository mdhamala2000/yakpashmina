import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { MyContext } from "../App";

const PrivateRoute = ({ children }) => {
  const context = useContext(MyContext);
  const location = useLocation();

  if (!context?.isLogin || !context?.userData?._id) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
};

export default PrivateRoute;