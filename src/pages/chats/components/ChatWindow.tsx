// chat/components/ChatWindow.tsx
import { Message } from "../hooks/useChat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";

export default function ChatWindow({
  messages,
  onSend,
  onSendFile,
  typing,
}: {
  messages: Message[];
  onSend: (text: string) => void;
  onSendFile: (file: File) => void;
  typing: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900">
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="mx-auto h-full max-w-[960px] px-4 py-4 md:px-6 md:py-5">
          <div className="flex h-full flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 shadow-sm">
            <MessageList messages={messages} />
            {typing && <TypingIndicator />}
            <MessageInput onSend={onSend} onSendFile={onSendFile} />
          </div>
        </div>
      </div>
    </div>
  );
}
