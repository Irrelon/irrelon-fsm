# Irrelon Finite State Machine
A finite state machine implementation.

```bash
npm i @irrelon/fsm
```

### Defining and Using States

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
	someCustomEventHandler: (arg1, arg2) => {
		
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

// Raise an event inside the current state, if someCustomEventHandler() exists, it
// will be called with the arguments "foo" and "bar".
fsm.raiseEvent("someCustomEventHandler", "foo", "bar");
```

### Exiting States

```ts
await fsm.initialState("state1");
await fsm.enterState("state2");
await fsm.enterState("state3");
await fsm.exitState(); // Return to the previous state

// State will now be "state2"
```