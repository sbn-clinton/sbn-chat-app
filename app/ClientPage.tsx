"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateRoomForm } from "@/components/create-room-form"
import { JoinRoomForm } from "@/components/join-room-form"
import { motion } from "framer-motion"

export default function ClientPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Chat Rooms</CardTitle>
            <CardDescription>Create a new room or join an existing one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="create">Create Room</TabsTrigger>
                <TabsTrigger value="join">Join Room</TabsTrigger>
              </TabsList>
              <TabsContent value="create">
                <CreateRoomForm />
              </TabsContent>
              <TabsContent value="join">
                <JoinRoomForm />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-slate-500 dark:text-slate-400">
            Connect and chat with friends in real-time
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
