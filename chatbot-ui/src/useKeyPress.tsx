import { useState, useEffect } from "react";

type KeyPressListener = (event: KeyboardEvent) => void;

export function useKeyPress(targetKey: string, onPress?: KeyPressListener) {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      if (e.key === targetKey) {
        e.preventDefault();
        onPress?.(e);
        setKeyPressed(true);
      }
    };

    const upHandler = ({ key }: KeyboardEvent) => {
      if (key === targetKey) {
        setKeyPressed(false);
      }
    };
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [targetKey, onPress]);

  return keyPressed;
}
