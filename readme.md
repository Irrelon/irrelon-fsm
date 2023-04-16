# Irrelon Finite State Machine
A finite state machine implementation.

```bash
npm i @irrelon/fsm
```

```ts
import {FiniteStateMachine} from "../services/FiniteStateMachine";
const fsm = new FiniteStateMachine();

fsm.defineState("state1");

fsm.defineState("state2", {
	enter: () => {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
			}, 200);
		})
	},
	exit: () => {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
			}, 200);
		})
	}
});

fsm.defineState("state3", {
	enter: () => {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
			}, 200);
		})
	},
	exit: () => {
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
			}, 200);
		})
	}
});

await fsm.initialState("state1");
await fsm.enterState("state2");
await fsm.enterState("state3");
```
