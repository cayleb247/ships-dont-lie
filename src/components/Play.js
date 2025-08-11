import styles from "./Play.module.css";
import { useEffect, useState, useRef } from "react";
// import { SOLVABLE_SETS } from "@/constants/data";
// import { evaluate } from "mathjs";
import { useRouter } from "next/navigation";
import { socket } from "@/socket";
import Video from "@/components/Video";
import Image from "next/image";

const items = ["you", "enemy"]

export default function Play(props) {
  const router = useRouter();

  const [hasPotato, setHasPotato] = useState(true);
//   const playersReady = true;



  useEffect(() => {
    socket.on("receive potato status", (userID) => {
      console.log("opponent score received", score);
      if (userID == socket.id) {
        setHasPotato(true);
      } else {
        setHasPotato(false);
      }
    });
    return () => {
      socket.off("receive potato status");
    };
  }, []);

  useEffect(() => {
    socket.on("receive game role", (role) => {
      setGameRole(role);
    });
    socket.emit("get game role", props.roomName);
  }, []);

  useEffect(() => {
    console.log("receiving current cards!");
    socket.on("receive current cards", (cardList) => {
      console.log("cards received!");
      setCurrentCards(cardList);
    });

    socket.on("both players ready", () => {
      setPlayersReady(true);
    });

    socket.emit("player ready", props.roomName); // verify both players are ready

    return () => {
      socket.off("receive current cards");
    };
  }, []);

//   useEffect(() => {
//     if (gameRole === "host") {
//       sendCards();
//     }
//   }, [playersReady]);

  const radius = 120;
  const angleStep = (2 * Math.PI) / items.length;

  return (
    <div className={styles.playContainer}>
      <Video></Video>
      <div className={styles.gameContainer}>
          {items.map((item, i) => {
            const angle = i * angleStep;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: `translate(${x}px, ${y}px)`,
                  padding: "1rem",
                  aspectRatio: "1",
                  background: "blue",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                {item}
                {hasPotato && <Image alt="jared" src={'/jared.png'} height='40' width='40'></Image>}
              </div>
            );
          })}
      </div>
    </div>
  );
}
