import { useUserAuth } from "./contexts/UserAuthCtx";
import { Navigate } from "react-router-dom";

function ProtectedRouts({ children }) {
  const { userDataState } = useUserAuth();
  if (userDataState === null) {
    return <Navigate to="/login" />;
  }
  return children;
}

export default ProtectedRouts;
