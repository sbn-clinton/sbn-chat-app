"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

interface User {
  id: string
  name: string
}

interface RoomInfoProps {
  roomId: string
  roomName: string
  users: User[]
}

export function RoomInfo({ roomId, roomName, users }: RoomInfoProps) {
  return (
    <div className="p-4 h-full">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Room Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Room Name</h3>
            <p className="font-medium">{roomName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Room Code</h3>
            <Badge variant="outline" className="font-mono">
              {roomId}
            </Badge>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              Participants ({users.length})
            </h3>
            <ul className="space-y-1">
              {users.map((user, index) => (
                <motion.li
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  <span>{user.name}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
