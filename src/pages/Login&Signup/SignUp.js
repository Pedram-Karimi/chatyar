import { useState } from "react"; // react

import { Link, useNavigate } from "react-router-dom"; // react-router

import algoliasearch from "algoliasearch"; // search service

// firebase

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../FirebaseConfig";
import { db } from "../../FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";

import "./login&Signup.css"; // styles

function SignUp() {
  //
  // variables ---

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerFirstName, setRegisterFirstName] = useState("");
  let navigate = useNavigate();

  // signing up a new account ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // creating a new account in firebase auth ---

      const user = await createUserWithEmailAndPassword(
        auth,
        registerEmail,
        registerPassword,
      );

      // saving users name in the db ---

      const userRef = doc(db, "users", user.user.uid);
      setDoc(
        userRef,
        {
          userName: registerFirstName,
          bio: "",
        },
        { merge: true },
      );

      // saving user id to the search service servers ---

      const client = algoliasearch(
        "V72F27H9FY",
        "97b5d713b756d046460945cdafd52150",
      );
      const index = client.initIndex("users");

      const objects = [
        {
          objectID: user.user.uid,
          userName: registerFirstName,
        },
      ];

      index
        .saveObjects(objects)
        .then(({ objectIDs }) => {
          console.log(objectIDs);
        })
        .catch((err) => {
          console.log(err);
        });

      // clearing inputs ---

      // setRegisterEmail("");
      // setRegisterPassword("");
      // setRegisterFirstName("");

      // going to the home page ---

      navigate("/");
      //
    } catch (err) {
      console.log(err.message);
    }
  };
  //---
  return (
    <div className="signUp">
      <div className="container">
        <p>Sign up here</p>
        <div className="input_box">
          <form onSubmit={handleSubmit}>
            <input
              value={registerFirstName}
              placeholder="First name"
              required
              onChange={(e) => {
                setRegisterFirstName(e.target.value);
              }}
            />
            <input
              value={registerEmail}
              placeholder="Email"
              required
              onChange={(e) => {
                setRegisterEmail(e.target.value);
              }}
            />
            <input
              placeholder="Password (contains numbers and letters)"
              value={registerPassword}
              required
              onChange={(e) => {
                setRegisterPassword(e.target.value);
              }}
            />
            <button className="signup_btn">Sign up</button>
          </form>
        </div>
        <div className="signUp-box">
          do you have account?
          <Link to="/login" className="signup-link">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
