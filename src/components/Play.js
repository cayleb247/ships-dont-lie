import styles from "./Play.module.css";
import { useEffect, useState, useRef } from "react";
// import { SOLVABLE_SETS } from "@/constants/data";
// import { evaluate } from "mathjs";
import { useRouter } from "next/navigation";
import { socket } from "@/socket";
import Video from "@/components/Video";
import Image from "next/image";

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
        setCorrectAnswerCount((count) => count + 1);
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
    <div className={`${styles.playContainer} relative`}>
      <Video correctAnswerCount={correctAnswerCount} />

      {/* Overlay container */}
      <div className="absolute inset-0 flex flex-col justify-between p-5">
        <h1 className={`${styles.titleText} text-center text-3xl font-bold`}>
          Pass Jared!
        </h1>

        {/* Game images row */}
        <div className={styles.gameContainer}>
          <div className="flex items-center gap-1 w-full">
            <Image alt="heidi" src="/heidi.png" width={250} height={250} />
            {hasPotato && (
              <Image
                className="rounded-full"
                alt="jared"
                src="/jared.png"
                width={100}
                height={100}
              />
            )}
          </div>

          <div className="flex items-center gap-1 w-full justify-end">
            {!hasPotato && (
              <Image
                className="rounded-full"
                alt="jared"
                src="/jared.png"
                width={100}
                height={100}
              />
            )}
            <Image alt="orpheus" src="/orpheus.png" width={250} height={250} />
          </div>
        </div>

        {/* Key press prompt */}
        <div className={`${styles.inputContainer} flex justify-center`}>
          {currentKey && (
            <div className="flex flex-col items-center">
              <h1 className="mb-2 font-medium text-2xl">Press</h1>
              <div className="rounded bg-amber-50 border-4 border-amber-400 text-amber-800 px-6 py-3 text-3xl font-bold">
                {currentKey}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
