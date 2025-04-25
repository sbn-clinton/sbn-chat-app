"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function JoinRoomForm() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !roomId.trim()) return;

    setIsJoining(true);
    setError("");

    try {
      // Store user info in localStorage
      localStorage.setItem("username", username);
      localStorage.setItem("roomId", roomId.toUpperCase());
      localStorage.setItem("isRoomCreator", "false");

      // Navigate to the room
      router.push(`/room/${roomId.toUpperCase()}`);
    } catch (error) {
      console.error("Failed to join room:", error);
      setIsJoining(false);
      setError("Failed to join room. Please try again.");
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
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="join-username">Your Name</Label>
        <Input
          id="join-username"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="roomId">Room Code</Label>
        <Input
          id="roomId"
          placeholder="Enter room code (e.g., ABC123)"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isJoining}>
        {isJoining ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Joining...
          </>
        ) : (
          "Join Room"
        )}
      </Button>
    </motion.form>
  );
}
