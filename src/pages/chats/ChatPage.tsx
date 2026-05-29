// chat/ChatPage.tsx
import { useState } from "react";
import { useParams } from "react-router";

import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import ContactInfoDrawer from "./components/ContactInfoDrawer";
import ChatHeader from "./components/ChatHeader";
import { useChat } from "./hooks/useChat";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function ChatPage() {
  const { numberSeller } = useParams();
  const chat = useChat(numberSeller);
  const [openInfo, setOpenInfo] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-100 dark:bg-slate-950 pb-6 md:pb-8">
      <PageMeta title="Chat" description={`Chats de ${chat.seller.name}`} />
      <PageBreadcrumb pageTitle={`Chats de ${chat.seller.name}`} />

      <div className="mx-auto mt-4 h-[calc(100vh-160px)] max-w-[1600px] px-3 md:px-6 lg:px-8">
        <div className="h-full rounded-[32px] overflow-hidden bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-[0_28px_80px_-32px_rgba(15,23,42,0.2)] backdrop-blur-sm">
          <div className="h-full flex flex-col md:flex-row min-h-0">
            {/* Mobile Sidebar */}
            {openSidebar && (
              <div className="fixed inset-0 z-50 md:hidden">
                <div
                  className="absolute inset-0 bg-black/30"
                  onClick={() => setOpenSidebar(false)}
                />
                <div className="absolute left-0 top-0 h-full w-80">
                  <ChatSidebar
                    contacts={chat.conversations}
                    selectedContact={chat.selectedConversation}
                    onSelect={(c) => {
                      chat.setSelectedConversation(c);
                      setOpenSidebar(false);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:w-80 md:flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <ChatSidebar
                contacts={chat.conversations}
                selectedContact={chat.selectedConversation}
                onSelect={chat.setSelectedConversation}
              />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              <ChatHeader
                contact={chat.selectedContact}
                typing={chat.typing}
                onOpenInfo={() => setOpenInfo(true)}
                onOpenSidebar={() => setOpenSidebar(true)}
              />

              <ChatWindow
                messages={chat.messages}
                onSend={chat.sendMessage}
                onSendFile={chat.sendFile}
                typing={chat.typing}
              />
            </div>

            <ContactInfoDrawer
              contact={chat.selectedContact}
              open={openInfo}
              onClose={() => setOpenInfo(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
