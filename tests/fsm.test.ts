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

	it("Correctly handles returning to the state prior to the current one", async () => {
		const fsm = new FiniteStateMachine();
		fsm.defineState("state1");
		fsm.defineState("state2");
		fsm.defineState("state3");

		await fsm.initialState("state1");
		await fsm.enterState("state2");

		expect(fsm.previousStates()).toStrictEqual( [{name: "state1", args: []}]);

		await fsm.exitState();

		expect(fsm.previousStates()).toStrictEqual( []);
		expect(fsm.currentStateName()).toStrictEqual( "state1");

		await fsm.enterState("state2");
		await fsm.enterState("state3");

		expect(fsm.previousStates()).toStrictEqual( [{name: "state1", args: []}, {name: "state2", args: []}]);
		await fsm.exitState();
		expect(fsm.previousStates()).toStrictEqual( [{name: "state1", args: []}]);
		expect(fsm.currentStateName()).toStrictEqual( "state2");
		await fsm.exitState();
		expect(fsm.previousStates()).toStrictEqual( []);
		expect(fsm.currentStateName()).toStrictEqual( "state1");
	});

	it("Correctly resets the previous state history when returning to the initial state", async () => {
		const fsm = new FiniteStateMachine();
		fsm.defineState("state1");
		fsm.defineState("state2");
		fsm.defineState("state3");
		fsm.defineState("state4");

		await fsm.initialState("state1");
		await fsm.enterState("state2");
		await fsm.enterState("state3");
		await fsm.enterState("state4");

		expect(fsm.previousStates()).toStrictEqual( [
			{name: "state1", args: []},
			{name: "state2", args: []},
			{name: "state3", args: []},
		]);

		await fsm.exitState();

		expect(fsm.previousStates()).toStrictEqual( [
			{name: "state1", args: []},
			{name: "state2", args: []},
		]);

		expect(fsm.currentStateName()).toStrictEqual( "state3");

		await fsm.enterState("state1");

		expect(fsm.previousStates()).toStrictEqual( []);
	});

	it("Throws an error if there is no state to exit to", async () => {
		const fsm = new FiniteStateMachine();
		fsm.defineState("state1");
		fsm.defineState("state2");
		fsm.defineState("state3");
		fsm.defineState("state4");

		await fsm.initialState("state1");
		await fsm.enterState("state2");
		await fsm.exitState();
		void expect(async () => {
			await fsm.exitState();
		}).rejects.toThrow("No previous state to transition to");
	});
});