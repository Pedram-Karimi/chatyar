import { useState, useEffect } from "react"; // react-hooks

import "./contactSide.css"; // stlyes

// components

import SMToggleBtn from "./components/SMToggleBtn";
import SideMenu from "../../../../components/SideMenu/SideMenu";
import ContactItem from "./components/ContactItem/ContactItem";

import Typesense from "typesense"; // search service

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

  //typesense search ----

  useEffect(() => {
    //checks
    if (searchInput == "" && searchedPeaple.length > 0) {
      setSearchedPeaple([]);
    }
    // changeSelected(null);
    let client = new Typesense.Client({
      nodes: [
        {
          host: "ojn84fea210mrhdvp-1.a1.typesense.net",
          port: "443",
          protocol: "https",
        },
      ],
      apiKey: "YT6m6EQvAINv0EfHt75qymW2xtkAMdBg",
      connectionTimeoutSeconds: 2,
    });
    let search = {
      q: searchInput,
      query_by: "userName",
    };
    if (searchInput !== "") {
      client
        .collections("users")
        .documents()
        .search(search)
        .then(function (searchResults) {
          searchResults.hits.forEach((userDoc) => {
            if (
              userDataState.user &&
              userDoc.document.id !== userDataState.user.uid
            ) {
              setSearchedPeaple([]);
              setSearchedPeaple((pervItems) => [
                ...pervItems,
                userDoc.document,
              ]);
            }
          });
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
          where("messengersArr", "array-contains", userDataState.user.uid)
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
              console.log(searchedPeaple);
              return <ContactItem key={person.id} {...person} />;
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
