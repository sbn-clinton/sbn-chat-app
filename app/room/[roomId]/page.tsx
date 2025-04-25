"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { RoomInfo } from "@/components/room-info";
import { ArrowLeft, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isCurrentUser?: boolean;
  isSystem?: boolean;
}

interface User {
  id: string;
  name: string;
}

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [roomName, setRoomName] = useState("");
  const [showUsers, setShowUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Get user info from localStorage
    const storedUsername = localStorage.getItem("username");
    const storedRoomId = localStorage.getItem("roomId");
    const storedRoomName = localStorage.getItem("roomName");
    const isRoomCreator = localStorage.getItem("isRoomCreator") === "true";

    if (!storedUsername || !storedRoomId || storedRoomId !== params.roomId) {
      router.push("/");
      return;
    }

    setUsername(storedUsername);
    setRoomName(storedRoomName || `Room ${params.roomId}`);
    setIsLoading(true);
    setError("");

    // Initialize socket connection
    const newSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
      {
        path: "/api/socketio",
      }
    );

    setSocket(newSocket);

    // Join room
    newSocket.emit("joinRoom", {
      roomId: params.roomId,
      username: storedUsername,
      isCreator: isRoomCreator,
      roomName: storedRoomName,
    });

    // Handle errors
    newSocket.on("error", (errorData: { message: string }) => {
      console.error("Socket error:", errorData);
      setError(errorData.message);
      setIsLoading(false);

      // If room not found, redirect after 3 seconds
      if (errorData.message === "Room not found") {
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    });

    // Load previous messages
    newSocket.on("previousMessages", (previousMessages: Message[]) => {
      const formattedMessages = previousMessages.map((msg) => ({
        ...msg,
        isCurrentUser: msg.sender === storedUsername,
      }));
      setMessages(formattedMessages);
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    });

    // Listen for new messages
    newSocket.on("message", (message: Message) => {
      setMessages((prev) => [
        ...prev,
        {
          ...message,
          isCurrentUser: message.sender === storedUsername,
        },
      ]);
      setTimeout(scrollToBottom, 100);
    });

    // Listen for user list updates
    newSocket.on("roomUsers", ({ users: roomUsers }: { users: User[] }) => {
      setUsers(roomUsers);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [params.roomId, router]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (text: string) => {
    if (socket && text.trim()) {
      socket.emit("chatMessage", {
        roomId: params.roomId,
        text,
      });
    }
  };

  const leaveRoom = () => {
    if (socket) {
      socket.disconnect();
    }
    localStorage.removeItem("roomId");
    localStorage.removeItem("roomName");
    localStorage.removeItem("isRoomCreator");
    router.push("/");
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900">
      <header className="flex items-center justify-between p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={leaveRoom}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold truncate">{roomName}</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowUsers(!showUsers)}
          className="relative"
        >
          <Users className="h-5 w-5" />
          <span className="absolute top-0 right-0 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {users.length}
          </span>
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col p-4 overflow-hidden">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pb-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChatMessage message={message} />
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}

          {!error && <ChatInput onSendMessage={sendMessage} />}
        </main>

        <AnimatePresence>
          {showUsers && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 250, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-l dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
            >
              <RoomInfo
                roomId={params.roomId}
                roomName={roomName}
                users={users}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
