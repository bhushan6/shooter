import { useEffect, useState } from "react";

type MovementEnums =
  | "moveForward"
  | "moveBackward"
  | "moveLeft"
  | "moveRight"
type KeyEnums = "KeyW" | "KeyS" | "KeyA" | "KeyD" ;

function moveFieldByKey(key: KeyEnums): MovementEnums {
  const keys: Record<KeyEnums, MovementEnums> = {
    KeyW: "moveForward",
    KeyS: "moveBackward",
    KeyA: "moveLeft",
    KeyD: "moveRight",
  };
  return keys[key];
}

export const useMovementControls = () => {
  const [movement, setMovement] = useState<Record<MovementEnums, boolean>>({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setMovement((m) => ({
        ...m,
        [moveFieldByKey(e.code as KeyEnums)]: true,
      }));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setMovement((m) => ({
        ...m,
        [moveFieldByKey(e.code as KeyEnums)]: false,
      }));
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return movement;
};
