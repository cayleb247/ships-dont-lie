import styles from "./Play.module.css";
import { useEffect, useState, useRef } from "react";
// import { SOLVABLE_SETS } from "@/constants/data";
// import { evaluate } from "mathjs";
import { useRouter } from "next/navigation";
import { socket } from "@/socket";
import Video from "@/components/Video";
import Image from "next/image";
import Keycap from "./Keycap";

const items = ["you", "enemy", "penis"];
const alphabet = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

export default function Play(props) {
  const router = useRouter();

  const [hasPotato, setHasPotato] = useState(null);
  const [currentKey, setCurrentKey] = useState(null);
  const [answerStatus, setAnswerStatus] = useState(null);
  const [gameRole, setGameRole] = useState(null);
  const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
  //   const playersReady = true;

  function randomLetter() {
    let index = Math.floor(Math.random() * alphabet.length);
    let letter = alphabet[index];
    setCurrentKey(letter);
    setAnswerStatus("incorrect");
    console.log("current letter", letter);
    console.log(currentKey);
  }

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
    socket.on("correct answer", () => {
      setHasPotato(true);
      randomLetter();
    });
  });

  useEffect(() => {
    socket.on("receive game role", (role) => {
      console.log("role", role);
      setGameRole(role);
      if (role == "host") {
        setHasPotato(true);
      }
    });
    socket.emit("get game role", props.roomName);
  }, []);

  useEffect(() => {
    if (answerStatus !== "incorrect") {
      console.log("generating new letter");
      randomLetter();
      setHasPotato(false);
      setCurrentKey(null);
      socket.emit("correct answer", props.roomName);
    }
  }, [answerStatus]);

  useEffect(() => {}, []);

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

  useEffect(() => {
    function handleKeyDown(event) {
      console.log("Key pressed:", event.key);
      console.log("current key", currentKey);
      console.log("answer status", answerStatus);
      if (event.key == currentKey) {
        console.log("correct answer!");
        setAnswerStatus("correct");
        setCorrectAnswerCount(count => count + 1);
      } else {
        setAnswerStatus("incorrect");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentKey]);

  //   useEffect(() => {
  //     if (gameRole === "host") {
  //       sendCards();
  //     }
  //   }, [playersReady]);

  const radius = 120;
  const angleStep = (2 * Math.PI) / items.length;

  return (
    <div className={styles.playContainer}>
      <Video correctAnswerCount={correctAnswerCount}></Video>
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
                gap: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <div
                style={{
                  padding: "1rem",
                  aspectRatio: "1",
                  background: "blue",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p>{item}</p>
              </div>
              {hasPotato && (
                <Image
                  className="rounded-full"
                  alt="jared"
                  src={"/jared.png"}
                  height="40"
                  width="40"
                ></Image>
              )}
            </div>
          );
        })}
      </div>
      <div className={styles.inputContainer}>
        {/* <Keycap key={currentKey}></Keycap> */}
        {currentKey && <div className="rounded-sm bg-amber-50 border-amber-400 text-amber-800 p-4 border-[0.25rem] box-border flex content-center justify-center">{currentKey}</div>}
      </div>
    </div>
  );
}
