import type { ChangeEvent } from 'react';
import { useEffect, useRef } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, AppState } from '@app/app/store';

export const useForm = <TContent>(defaultValues: TContent) => (
  handler: (content: TContent) => void | Promise<void>,
) => async (event: ChangeEvent<HTMLFormElement>) => {
  event.preventDefault();
  event.persist();

  const form = event.target as HTMLFormElement;
  const elements = Array.from(form.elements) as HTMLInputElement[];
  const data = elements
    .filter((element) => element.hasAttribute('name'))
    .reduce(
      (object, element) => ({
        ...object,
        [String(element.getAttribute('name'))]: element.value,
      }),
      defaultValues,
    );

  await handler(data);

  form.reset();
};

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export const useInterval = (
  callback: (...args: unknown[]) => void,
  delay: number,
) => {
  const savedCallback = useRef<typeof callback>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (...args: Parameters<typeof callback>) =>
      savedCallback.current?.(...args);

    if (delay !== null) {
      const id = setInterval(handler, delay);

      return () => {
        clearInterval(id);
      };
    }
  }, [delay]);
};

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
