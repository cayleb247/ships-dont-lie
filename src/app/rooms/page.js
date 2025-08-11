"use client";

import { useState, useEffect } from "react";
import styles from "./rooms.module.css";
import RoomsList from "@/components/RoomsList";
import CreateRoomDialog from "@/components/CreateRoomDialog";
import { socket } from "@/socket.js";
import Image from "next/image";

export default function Rooms() {
  const [search, setSearch] = useState("");
  const [dialogOpen, toggleDialog] = useState(false);

  useEffect(() => {
    console.log("Connected to socket:", socket.id); // might be undefined immediately
    console.log(search);
    socket.emit("leave all rooms");
    console.log("leaving all rooms!");
  }, [search]);

  return (
    <div className={styles.container}>
      <Image alt="zach latta" src="/zach_latta.png" fill />
      <div className={styles.roomPage}>
        <h1 className={styles.title}>Find a Room</h1>
        <div className={styles.roomsContainer}>
          <input
            type="text"
            placeholder="search rooms"
            name="search"
            autoComplete="off"
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
          <RoomsList search={search}></RoomsList>
          <button
            onClick={() => toggleDialog(true)}
            className={styles.createRoomButton}
          >
            Create Room
          </button>
        </div>
        <CreateRoomDialog
          isOpen={dialogOpen}
          onClose={() => toggleDialog(false)}
        />
      </div>
    </div>
  );
}
