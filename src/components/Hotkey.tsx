import { useEffect, useRef } from 'react';
import { fromEvent, merge } from 'rxjs';
import { filter, takeWhile, tap } from 'rxjs/operators';

type HotKeyProps = {
  keys: string[] | string;
  disabled?: boolean;
  preventDefault?: boolean;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
};

const HotKey = ({
  keys: keyOrKeys,
  disabled = false,
  preventDefault = false,
  onKeyDown = (_: KeyboardEvent) => {},
  onKeyUp = (_: KeyboardEvent) => {},
}: HotKeyProps) => {
  const disabledRef = useRef<boolean>(false);
  const preventDefaultRef = useRef<boolean>(false);
  const onKeyDownRef = useRef<(event: KeyboardEvent) => void>(() => {});
  const onKeyUpRef = useRef<(event: KeyboardEvent) => void>(() => {});

  disabledRef.current = disabled;
  preventDefaultRef.current = preventDefault;
  onKeyDownRef.current = onKeyDown;
  onKeyUpRef.current = onKeyUp;

  const keys = !Array.isArray(keyOrKeys) ? [keyOrKeys] : keyOrKeys;

  useEffect(() => {
    const keydown$ = fromEvent(window, 'keydown', (event) => {
      preventDefaultRef.current && event.preventDefault();
      return event;
    }).pipe(
      takeWhile(() => !disabledRef.current),
      filter((event: KeyboardEvent) => keys.includes(event.key)),
      tap((event) => onKeyDownRef.current(event))
    );

    const keyup$ = fromEvent(window, 'keyup', (event) => {
      preventDefaultRef.current && event.preventDefault();
      return event;
    }).pipe(
      takeWhile(() => !disabledRef.current),
      filter((event) => keys.includes(event.key)),
      tap((event) => onKeyUpRef.current(event))
    );

    const subscription = merge(keydown$, keyup$).subscribe();

    return () => subscription.unsubscribe();
  }, [...keys]);

  return null;
};

export default HotKey;
