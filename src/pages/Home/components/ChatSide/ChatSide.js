import { useState, useEffect, useRef } from "react"; // react
import "./chatSide.css"; // styles

import { FaClock } from "react-icons/fa";

// components

import WriteText from "./components/WriteText";
import ChatHeader from "./components/ChatHeader";
// import UnBlockNav from "./components/UnBlockNav";

// contexts

// import { useUserAuth } from "../../contexts/UserAuthContext";
import { useSelectedUser } from "../../../../contexts/SelectedUserCtx";

// firebase

import {
  collection,
  limit,
  onSnapshot,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../../FirebaseConfig";
import { useUserAuth } from "../../../../contexts/UserAuthCtx";
import { useAddText } from "../../../../contexts/AddTextCtx";

//
function ChatSide() {
  // variables ---

  const [userChats, setUserChats] = useState([]);
  const [currChatRoomId, setCurrChatRoomId] = useState();
  const [messDates, setMessDates] = useState([]);
  const [tempVar, setTempVar] = useState([]);
  const messageBody = useRef();

  // contexts ---

  const { userDataState } = useUserAuth();
  const { message } = useAddText();
  const { selected } = useSelectedUser();

  // time formating function ---

  function tConvert(time) {
    time = time
      ?.toString()
      ?.match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    if (time.length > 1) {
      time = time?.slice(1);
      time[5] = +time[0] < 12 ? " AM" : " PM";
      time[0] = +time[0] % 12 || 12;
    }
    return time?.join("");
  }

  // clear up the message box

  useEffect(() => {
    setUserChats([]);
    setMessDates([]);
  }, [selected]);

  // get all messages ----

  useEffect(() => {
    if (selected && userDataState.user) {
      const roomsRef = collection(db, "rooms");
      const q = query(
        roomsRef,
        where("messengers", "in", [
          `${selected?.id}%${userDataState.user.uid}`,
          `${userDataState.user.uid}%${selected?.id}`,
        ]),
      );
      const getChats = async () => {
        const getRooms = await getDocs(q).then(async (coll) => {
          if (coll.docs[0] === undefined && message !== "") {
            const fixedTime = tConvert(
              new Date(Math.floor(Date.now() / 1000) * 1000)
                ?.toString()
                ?.split(" ")[4],
            );
            let arr = fixedTime.split(" ")[0].split(":");
            arr.pop();
            const createdTime = arr.join(":") + " " + fixedTime.split(" ")[1];

            setUserChats((pervMess) => [
              ...pervMess,
              {
                mess: message,
                messInfo: [userDataState.user.uid, selected?.id],
                createdAt: createdTime,
              },
            ]);
            return;
          }
          const orderedQ = query(
            collection(db, "rooms", coll.docs[0]?.id, "chats"),
            orderBy("createdAt"),
            limit(100),
          );
          // console.log("it gets run outside");
          const messDoc = await onSnapshot(orderedQ, (messages) => {
            setUserChats([]);
            setMessDates([]);
            messages.docs.forEach((message) => {
              //storing dates of the messages in order to seperate them into catagories ---

              const date = new Date(message.data().createdAt.seconds * 1000);
              const month = date.getMonth() + 1;
              const day = date.getDate();
              const year = date.getFullYear();

              const formattedDate = `${month}/${day}/${year}`;
              setMessDates((pervDates) => [...pervDates, formattedDate]);

              // getting hour and minute ---

              const fixedTime = tConvert(
                new Date(message.data().createdAt?.seconds * 1000)
                  ?.toString()
                  ?.split(" ")[4],
              );

              let arr = fixedTime.split(" ")[0].split(":");
              arr.pop();
              const createdTime = arr.join(":") + " " + fixedTime.split(" ")[1];
              setUserChats((pervMess) => [
                ...pervMess,
                { ...message.data(), createdAt: createdTime },
              ]);
              setTempVar((pervMess) => [...pervMess, { ...message.data() }]);
            });
            setCurrChatRoomId(coll.docs[0]?.id);
          });
        });
      };
      getChats();
    }
  }, [selected, message]);

  // keeps the scroll at the bottom
  useEffect(() => {
    messageBody.current.scrollTop =
      messageBody.current.scrollHeight - messageBody.current.clientHeight;
  });

  return (
    <div className={`chatSide  ${selected && "phone-chat-side"}`}>
      <div className="chat-desk">
        {selected && <ChatHeader {...selected} chatRoomId={currChatRoomId} />}
        <div className="message-disk" ref={messageBody}>
          {/* <span></span> */}
          <div>
            {userChats.map((mess, index) => {
              return (
                <div
                  className={`mess-box-container ${
                    mess.messInfo[0] == userDataState.user.uid &&
                    "curr-user-mess-container"
                  }`}
                  key={index}
                >
                  {/* seperating messages by date */}
                  {messDates[index] != messDates[index - 1] && (
                    <p className="year-month-date">{messDates[index]}</p>
                  )}
                  <p
                    className={`mess-box ${
                      mess.messInfo[0] == userDataState.user.uid &&
                      "curr-user-mess"
                    }`}
                  >
                    {mess.mess}
                    <span className="write-time">
                      <span>
                        {mess.createdAt == " undefined" ? (
                          <FaClock />
                        ) : (
                          mess.createdAt
                        )}
                      </span>
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {selected && <WriteText />}
      <img src="https://i.postimg.cc/k4SgX0p5/1.jpg" className="bg-image" />
    </div>
  );
}

export default ChatSide;
