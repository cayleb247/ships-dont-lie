"use client";

import { useEffect, useState } from "react";
import { socket } from "../socket";
import Image from "next/image";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const router = useRouter();

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <div className={styles.homeContainer}>
      <Image alt="zach latta" src="/zach_latta.png" fill />
      <div className={styles.homePage}>
        <h1 className='text-[3rem]'>Ships Don&apos;t Lie</h1>
        <p className=" mb-[1rem]">The Hot Potato Experience</p>
        <div
          className={styles.homeButtons}
          onClick={() => router.push("/rooms")}
        >
          <button>Play</button>
        </div>
      </div>
    </div>
  );
}
