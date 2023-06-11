import { useEffect, useRef, useState } from "react";

type UseInputFocusRefArgsProps = {
  onFocus?: (event: FocusEvent) => void
  onBlur?: (event: FocusEvent) => void
}

export default function useInputFocusRef(props: UseInputFocusRefArgsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  useEffect(() => {
    const focusHandler = (e: FocusEvent) => {
      props.onFocus?.(e)
      setIsInputFocused(true);
    };
    const blurHandler = (e: FocusEvent) => {
      props.onBlur?.(e)
      setIsInputFocused(false);
    };

    inputRef.current?.addEventListener("focus", focusHandler);
    inputRef.current?.addEventListener("blur", blurHandler);
    return () => {
      inputRef.current?.removeEventListener("focus", focusHandler);
      inputRef.current?.removeEventListener("blur", blurHandler);
    };
  }, []);
  return { inputRef, isInputFocused };
}
