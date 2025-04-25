import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isCurrentUser?: boolean;
  isSystem?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const formattedTime = formatDistanceToNow(new Date(message.timestamp), {
    addSuffix: true,
  });

  // For system messages (join/leave notifications)
  if (message.isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-sm text-slate-500 dark:text-slate-400">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex mb-4",
        message.isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          message.isCurrentUser
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-slate-200 dark:bg-slate-700 rounded-bl-none"
        )}
      >
        {!message.isCurrentUser && (
          <div className="font-medium text-sm text-slate-600 dark:text-slate-300 mb-1">
            {message.sender}
          </div>
        )}
        <div className="break-words">{message.text}</div>
        <div
          className={cn(
            "text-xs mt-1",
            message.isCurrentUser
              ? "text-blue-100"
              : "text-slate-500 dark:text-slate-400"
          )}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
}
