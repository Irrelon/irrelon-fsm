import assert from "assert";
import {FiniteStateMachine} from "../src/FiniteStateMachine";

describe("Finite State Machine", () => {
	it("Correctly handles promises when entering and exiting states", async () => {
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

		const startTime = new Date().getTime();

		await fsm.enterState("state2");
		await fsm.enterState("state3");

		const deltaTime = new Date().getTime() - startTime;

		assert.ok(deltaTime > 590, "The delayed time is too short");
	});
})