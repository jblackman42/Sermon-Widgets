import { html, useState } from '../util/preactCentral.js';

export default function Counter() {
  const [count, setCount] = useState(0);
  const add = (value) => setCount(count + value);

  return html`
    <button onClick=${() => add(-1)}>Decrement</button>
    <input readonly size="4" value=${count} />
    <button onClick=${() => add(1)}>Increment</button>
  `;
}