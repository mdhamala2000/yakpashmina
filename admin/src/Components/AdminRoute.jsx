import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { MyContext } from "../App";

const AdminRoute = ({ children }) => {
  const context = useContext(MyContext);
  const token = localStorage.getItem("accessToken");

  if (!token || !context?.isLogin) {
    return <Navigate to="/login" replace />;
  }

  if (context?.userData?.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;