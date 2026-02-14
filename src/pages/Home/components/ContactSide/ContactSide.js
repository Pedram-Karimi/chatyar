import { useState, useEffect } from "react"; // react-hooks

import "./contactSide.css"; // stlyes

// components

import SMToggleBtn from "./components/SMToggleBtn";
import SideMenu from "../../../../components/SideMenu/SideMenu";
import ContactItem from "./components/ContactItem/ContactItem";

import algoliasearch from "algoliasearch";

// firebase

import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../FirebaseConfig";

// contexts
import { SideMenuProvider } from "../../../../contexts/SideMenuContext";

import { useUserAuth } from "../../../../contexts/UserAuthCtx";
import { useSelectedUser } from "../../../../contexts/SelectedUserCtx";

function ContactSide() {
  // variables ---
  const [searchInput, setSearchInput] = useState("");
  const [searchedPeaple, setSearchedPeaple] = useState([]);
  const [contacts, setContacts] = useState([]);

  // contexts ---

  const { selected } = useSelectedUser();
  const { userDataState } = useUserAuth();

  //algolia search ----

  useEffect(() => {
    //checks
    if (searchInput === "") {
      setSearchedPeaple([]);
    }

    const client = algoliasearch(
      "V72F27H9FY",
      "97b5d713b756d046460945cdafd52150",
    );
    const index = client.initIndex("users");

    if (searchInput) {
      index
        .search(searchInput)
        .then(({ hits }) => {
          hits.forEach((userDoc) => {
            if (
              userDataState.user &&
              userDoc.objectID !== userDataState.user.uid
            ) {
              console.log(searchedPeaple);
              setSearchedPeaple([]);
              setSearchedPeaple((pervItems) => [
                ...pervItems,
                userDoc.objectID,
              ]);
            }
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [searchInput]);

  //get chated peaple ----

  useEffect(() => {
    if (userDataState.user) {
      const getContacts = async () => {
        const roomsRef = collection(db, "rooms");
        const q = query(
          roomsRef,
          where("messengersArr", "array-contains", userDataState.user.uid),
        );
        const getRooms = await getDocs(q).then((coll) => {
          coll.docs.forEach((doc) => {
            setContacts((pervUsers) => [
              ...pervUsers,
              doc.data().messengersArr[0] === userDataState.user.uid
                ? doc.data().messengersArr[1]
                : doc.data().messengersArr[0],
            ]);
          });
        });
      };
      getContacts();
    }
  }, [userDataState.user]);
  //
  return (
    <>
      <div className={`contactSide ${selected && "contactSide-close"}`}>
        <header>
          <SideMenuProvider>
            <SideMenu />
            <SMToggleBtn />
          </SideMenuProvider>

          <input
            placeholder="search for your friends..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
            }}
          />
        </header>
        <div className="contact-list">
          {searchInput &&
            searchedPeaple.map((person) => {
              return <ContactItem key={person} id={person} />;
            })}
          {searchedPeaple.length === 0 && searchInput && (
            <p className="no-search-result">No users found</p>
          )}
          {!searchInput &&
            contacts.map((person) => {
              return <ContactItem key={person} id={person} />;
            })}
        </div>
      </div>
    </>
  );
}

export default ContactSide;
