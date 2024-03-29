import { useEffect, useState } from "react"; // react-hooks

import "./contactItem.css"; // styles

// contexts

import { useSelectedUser } from "../../../../../../contexts/SelectedUserCtx";

import { useUserAuth } from "../../../../../../contexts/UserAuthCtx";

// firebase
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../../../../FirebaseConfig";

//
function ContactItem(props) {
  // variables ---
  const [currUser, setCurrUser] = useState({});
  const [lastChat, setLastChat] = useState();

  // contexts ---

  const { changeSelected, selected } = useSelectedUser();
  const { userDataState } = useUserAuth();

  // check if component is unmounted ---

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      setIsMounted(false);
      changeSelected(null);
    };
  }, []);

  useEffect(() => {
    if (userDataState.user.uid) {
      const roomsRef = collection(db, "rooms");
      const q = query(
        roomsRef,
        where("messengers", "in", [
          `${props.id}%${userDataState.user.uid}`,
          `${userDataState.user.uid}%${props.id}`,
        ])
      );
      function tConvert(time) {
        time = time
          .toString()
          .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

        if (time.length > 1) {
          time = time.slice(1);
          time[5] = +time[0] < 12 ? " AM" : " PM";
          time[0] = +time[0] % 12 || 12;
        }
        return time.join("");
      }
      const lastChatSnapshot = onSnapshot(q, (docs) => {
        // console.log(docs.docs[0].data());
        if (docs.docs[0] && docs.docs[0].data().latestMess?.createdAt) {
          const fixedTime = tConvert(
            new Date(docs.docs[0].data().latestMess.createdAt.seconds * 1000)
              .toString()
              .split(" ")[4]
          );
          let arr = fixedTime.split(" ")[0].split(":");
          arr.pop();
          const createdTime = arr.join(":") + " " + fixedTime.split(" ")[1];
          setLastChat({
            ...docs.docs[0].data().latestMess,
            createdAt: createdTime,
          });
        }
      });
    }
  }, [userDataState.user.uid]);

  // useEffect(() => {
  //   if (!lastChat && user && selected) {
  //     const deleteChats = async () => {
  //       const meChatRef = doc(db, "userContacts", user.uid);
  //       const selectedChatRef = doc(db, "userContacts", selected?.id);
  //       const deleteMeChat = await setDoc(
  //         meChatRef,
  //         { chatedPeaple: arrayRemove(selected?.id) },
  //         { merge: true }
  //       );
  //       const deleteselectedChat = await setDoc(
  //         selectedChatRef,
  //         { chatedPeaple: arrayRemove(user.uid) },
  //         { merge: true }
  //       );
  //     };
  //     deleteChats();
  //   }
  // }, [lastChat, user, selected]);

  useEffect(() => {
    const getData = async () => {
      const userRef = doc(db, "users", props.id);
      const userDoc = await getDoc(userRef);
      setCurrUser({ ...userDoc.data(), id: userDoc.id });
    };
    getData();
  }, []);
  //
  // console.log(props.id);
  return (
    <>
      <div
        className={selected?.id === props.id ? "selectedLable" : "contactItem"}
        onClick={() => {
          changeSelected(currUser);
        }}
      >
        <img
          src={
            currUser?.userProfile ||
            "https://www.gravatar.com/avatar/b3568450826559f6ce26b424b8283279.jpg?size=240&d=https%3A%2F%2Fwww.artstation.com%2Fassets%2Fdefault_avatar.jpg"
          }
          alt="avatar"
        />

        <div className="user-small-info">
          <p className="user-userName">{currUser.userName}</p>
          <p className="user-lastMess">{lastChat?.mess}</p>
          <p className="last-mess-time">{lastChat?.createdAt}</p>
        </div>
      </div>
    </>
  );
}

export default ContactItem;
