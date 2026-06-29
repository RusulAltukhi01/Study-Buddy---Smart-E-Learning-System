import { useEffect } from "react";
import { io } from "socket.io-client";
import { useNotificationStore } from "../store/notificationStore";

let socket;

export const useNotification = (classroomIds = []) => {
  const addNotification = useNotificationStore((s) => s.add);
  useEffect(() => {
    console.log("Connecting to socket...");
    socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });

    socket.on("connect", () => {
              console.log("Socket connected");

      if (classroomIds.length) socket.emit("join:classrooms", classroomIds);
    });

    
    socket.on("notification", (notif) => {
            console.log("Received notification:", notif);

        addNotification(notif);
    });

    return () => socket.disconnect();
  }, []);
};
