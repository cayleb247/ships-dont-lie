import { redirect } from "next/navigation";
import styles from "./Room.module.css";
import { socket } from "@/socket";
import { useEffect } from "react";

export default function Room(props) {
  useEffect(() => {
    const handler = (status) => {
      if (status === "successful") {
        redirect(`/game/${props.roomName}`);
      } else if (status === "failure") {
        socket.emit("send error", "room full");
        redirect("/");
      }
    };

    socket.on("join room", handler);

    return () => {
      socket.off("join room", handler);
    };
  }, [props.roomName]);
  
  return (
    <div className={styles.roomContainer}>
      <h3>{props.roomName}</h3>
      <button
        onClick={() => {
          console.log("attempting to join room", props.roomName);
          socket.emit("request room join", props.roomName);
        }}
      >
        Join
      </button>
    </div>
  );
}
