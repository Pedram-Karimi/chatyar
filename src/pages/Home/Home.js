import ContactSide from "./components/ContactSide/ContactSide";
import ChatSide from "./components/ChatSide/ChatSide";
import { SelectedUserProvider } from "../../contexts/SelectedUserCtx";
import { AddTextProvider } from "../../contexts/AddTextCtx";

import "./home.css"; // styles
import "../../responsiveStyles.css";
function Home() {
  return (
    <div className="home">
      <SelectedUserProvider>
        <ContactSide />
        <AddTextProvider>
          <ChatSide />
        </AddTextProvider>
      </SelectedUserProvider>
    </div>
  );
}

export default Home;
