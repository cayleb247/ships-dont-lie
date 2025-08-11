"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Video.module.css";
// import RoomsList from "@/components/RoomsList";
// import CreateRoomDialog from "@/components/CreateRoomDialog";
import { socket } from "@/socket.js";
import Image from "next/image";

const colors = {
  red: "bg-[red]",
  blue: "bg-[blue]",
  green: "bg-[green]",
  purple: "bg-[purple]",
  white: "bg-[white]",
  orange: "bg-[orange]",
  yellow: "bg-[yellow]",
  teal: "bg-[teal]",
};

export default function Video() {
  const [isPaused, togglePaused] = useState(true);
  const [currentColor, setCurrentColor] = useState("red");

  useEffect(() => {
    socket.on("receive color", (color) => {
      setCurrentColor(colors[color]);
    });
    socket.emit("request color");
  }, []);

//   useEffect(() => {
//     if (isPaused) {
//       videoRef.current.play();
//     } else if (isPaused == false) {
//       videoRef.current.pause();
//     }
//   }, [isPaused]);

  const videoRef = useRef(null);

  //   useEffect(() => {
  //     console.log("Connected to socket:", socket.id); // might be undefined immediately
  //     console.log(search);
  //     socket.emit("leave all rooms");
  //     console.log("leaving all rooms!");
  //   }, [search]);

  return (
    <div className={styles.container}>
      <video ref={videoRef} src="/shipwrecked_video.mp4" autoPlay muted playsInline className="h-full w-full"></video>
      <div
        className={`opacity-50 ${colors["red"]} absolute z-2 h-full w-full top-0`}
      ></div>
    </div>
  );
}
