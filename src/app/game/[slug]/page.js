"use client";

import styles from "./game.module.css";
import { socket } from "@/socket.js";
import Play from "@/components/Play.js";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading.js";

export default function Game({ params }) {
  const [gameLoading, setGameLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const router = useRouter();

  const [roomFull, setRoomFull] = useState("");
  const { slug } = use(params); // room name

  useEffect(() => {
    const handleRoomFull = (roomFull) => {
      //   console.log("received room status");
      setRoomFull(roomFull);
    };
    socket.on("receive room full", handleRoomFull);
    socket.emit("request room full", slug);

    socket.on("start game", () => {
      setGameStarted(true);
      setGameLoading(false);
    });

    // console.log('current status of room', roomFull)
    return () => {
      socket.off("receive room full", handleRoomFull);
    };
  }, []);

  useEffect(() => {
    if (roomFull === true) {
      console.log("room full");
      router.push("/");
      socket.emit("send error", "room is full");
    } else if (roomFull === null) {
      console.log("room doesn't exist");
      router.push("/");
      socket.emit("send error", "room does not exist");
    }
  }, [roomFull]);

  useEffect(() => {
    if (roomFull === false) {
      console.log("room isnt full!");
      function handleRoomMembers(roomMembers) {
        console.log("room members:", roomMembers);
        console.log("length = ", roomMembers.length);
        if (roomMembers.length == 1) {
          setGameLoading(true);
          setGameStarted(false);
        } else if (roomMembers.length == 2) {
          setGameStarted(true);
          setGameLoading(false);
        }
      }
      socket.on("return room members", handleRoomMembers);
      socket.emit("request room members", slug);
    }
  }, [roomFull]);

  return (
    <div className={styles.gameContainer}>
      {gameLoading && <Loading roomName={slug} />}
      {gameStarted && <Play roomName={slug} />}
    </div>
  );
}
