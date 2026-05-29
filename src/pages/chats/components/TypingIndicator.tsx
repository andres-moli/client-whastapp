// chat/components/TypingIndicator.tsx
export default function TypingIndicator() {
  return (
    <div className="px-6 pb-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span>escribiendo...</span>
    </div>
  );
}