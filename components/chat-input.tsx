"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (text: string) => void
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage("")
    }
  }

  return (
    <motion.form
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      onSubmit={handleSubmit}
      className="flex items-center space-x-2"
    >
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1"
      />
      <Button type="submit" size="icon" disabled={!message.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </motion.form>
  )
}
