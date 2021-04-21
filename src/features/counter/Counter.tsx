import { useState } from 'react';

import { useAppDispatch, useAppSelector } from '@app/app/hooks';
import styles from '@app/features/counter/Counter.module.css';
import {
  decrement,
  increment,
  incrementAsync,
  incrementByAmount,
  incrementIfOdd,
  selectCount,
} from '@app/features/counter/counterSlice';

function Counter() {
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectCount);
  const [incrementAmount, setIncrementAmount] = useState('2');

  const incrementValue = Number(incrementAmount) || 0;

  return (
    <div>
      <div className={styles.row}>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          -
        </button>
        <span className={styles.value}>{count}</span>
        <button
          className={styles.button}
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          +
        </button>
      </div>
      <div className={styles.row}>
        <input
          className={styles.textbox}
          aria-label="Set increment amount"
          value={incrementAmount}
          onChange={(event) => {
            setIncrementAmount(event.target.value);
          }}
        />
        <button
          className={styles.button}
          onClick={() => dispatch(incrementByAmount(incrementValue))}
        >
          Add Amount
        </button>
        <button
          className={styles.asyncButton}
          onClick={() => dispatch(incrementAsync(incrementValue))}
        >
          Add Async
        </button>
        <button
          className={styles.button}
          onClick={() => {
            dispatch(incrementIfOdd(incrementValue));
          }}
        >
          Add If Odd
        </button>
      </div>
    </div>
  );
}

export default Counter;
