import React, { useState } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import Button from '../ui/button/Button'; // también puedes usar otro popup
import { Bold, Italic, Strikethrough, Code, Smile } from 'lucide-react';

interface WhatsAppMessageEditorProps{
  value: string;
  onChange: (value: string) => void;
}

export const WhatsAppMessageEditor: React.FC<WhatsAppMessageEditorProps> = ({
  value,
  onChange,
  ...props
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const insertAtCursor = (open: string, close: string = open) => {
    const textarea = document.getElementById('whatsapp-message-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.slice(start, end);
    const newText = value.slice(0, start) + open + selectedText + close + value.slice(end);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + open.length, end + open.length);
    }, 0);
  };

  const addEmoji = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const textarea = document.getElementById('whatsapp-message-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = value.slice(0, start) + emoji + value.slice(end);
    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <Button onClick={() => insertAtCursor('*')}>
          <Bold size={16} />
        </Button>
        <Button onClick={() => insertAtCursor('_')}>
          <Italic size={16} />
        </Button>
        <Button onClick={() => insertAtCursor('~')}>
          <Strikethrough size={16} />
        </Button>
        <Button onClick={() => insertAtCursor('```', '```')}>
          <Code size={16} />
        </Button>
        <div className="relative inline-block">
        <Button  onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <Smile size={16} />
        </Button>

        {showEmojiPicker && (
            <div className="absolute z-50 mt-2 bg-white border rounded shadow-md">
            <EmojiPicker onEmojiClick={addEmoji} height={350} />
            </div>
        )}
        </div>

      </div>

      <textarea
        id="whatsapp-message-textarea"
        className="w-full p-2 border rounded-md resize-none h-40 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribe tu mensaje de WhatsApp con formato..."
        {...props}
      />
    </div>
  );
};
