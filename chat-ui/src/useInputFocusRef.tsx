import { useEffect, useRef, useState } from "react";

type UseInputFocusRefArgsProps = {
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
};

export default function useInputFocusRef({
  onFocus,
  onBlur,
}: UseInputFocusRefArgsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  useEffect(() => {
    const inputElement = inputRef.current;
    if (!inputElement) {
      return;
    }
    const focusHandler = (e: FocusEvent) => {
      onFocus?.(e);
      setIsInputFocused(true);
    };
    const blurHandler = (e: FocusEvent) => {
      onBlur?.(e);
      setIsInputFocused(false);
    };

    inputElement.addEventListener("focus", focusHandler);
    inputElement.addEventListener("blur", blurHandler);
    return () => {
      inputElement.removeEventListener("focus", focusHandler);
      inputElement.removeEventListener("blur", blurHandler);
    };
  }, [onFocus, onBlur]);
  return { inputRef, isInputFocused };
}
