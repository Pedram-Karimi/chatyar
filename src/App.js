import { BrowserRouter, Routes, Route } from "react-router-dom";
import { firebaseInitError, isFirebaseReady } from "./FirebaseConfig";

// contexts ---

import { UserAuthProvider, useUserAuth } from "./contexts/UserAuthCtx";

// components
import Home from "./pages/Home/Home";
import ProtectedRouts from "./ProtectedRouts";
import Login from "./pages/Login&Signup/Login";
import SignUp from "./pages/Login&Signup/SignUp";
import Account from "./pages/Account/Account";
import PeopleProfile from "./pages/PeopleProfile/PeopleProfile";
function App() {
  if (!isFirebaseReady) {
    return (
      <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1>Configuration Required</h1>
        <p>Firebase environment variables are missing for this build.</p>
        {firebaseInitError && (
          <p style={{ color: "#b91c1c" }}>{firebaseInitError.message}</p>
        )}
      </div>
    );
  }
  return (
    <div className="App">
      <UserAuthProvider>
        <BrowserRouter basename={"/chatyar"}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRouts>
                  <Home />
                </ProtectedRouts>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRouts>
                  <Account />
                </ProtectedRouts>
              }
            />
            <Route path="/profile/:id" element={<PeopleProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
          </Routes>
        </BrowserRouter>
      </UserAuthProvider>
    </div>
  );
}

export default App;
