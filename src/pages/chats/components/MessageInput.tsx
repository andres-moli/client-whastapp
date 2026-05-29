// chat/components/MessageInput.tsx
import { useState } from "react";
import { Send, Paperclip, Mic, Smile } from "lucide-react";

export default function MessageInput({
  onSend,
  onSendFile,
}: {
  onSend: (text: string) => void;
  onSendFile: (file: File) => void;
}) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-end gap-3 bg-gray-100 dark:bg-gray-700 rounded-2xl p-3 shadow-sm">
        
        {/* Attach */}
        <label className="cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors duration-200">
          <Paperclip size={20} />
          <input
            type="file"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              onSendFile(file);
              e.target.value = "";
            }}
          />
        </label>

        {/* Input */}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
        />

        {/* Emoji */}
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors duration-200">
          <Smile size={20} />
        </button>

        {/* Mic */}
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors duration-200">
          <Mic size={20} />
        </button>

        {/* Send */}
        <button
          onClick={handleSend}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!text.trim()}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}