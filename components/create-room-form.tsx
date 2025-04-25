"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function CreateRoomForm() {
  const [username, setUsername] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !roomName.trim()) return;

    setIsCreating(true);

    try {
      // Generate a unique room ID
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Store user info in localStorage
      localStorage.setItem("username", username);
      localStorage.setItem("roomId", roomId);
      localStorage.setItem("roomName", roomName);
      localStorage.setItem("isRoomCreator", "true");

      // Navigate to the room
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      setIsCreating(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="username">Your Name</Label>
        <Input
          id="username"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="roomName">Room Name</Label>
        <Input
          id="roomName"
          placeholder="Enter room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isCreating}>
        {isCreating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Room"
        )}
      </Button>
    </motion.form>
  );
}
