import type { Metadata } from "next"
import ClientPage from "./ClientPage"

export const metadata: Metadata = {
  title: "Chat Rooms | Real-time Chat App",
  description: "Create or join a chat room to start messaging in real-time",
}

export default function Home() {
  return <ClientPage />
}
