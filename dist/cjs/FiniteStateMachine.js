"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiniteStateMachine = void 0;
class FiniteStateMachine {
    /**
     * A simple finite state machine implementation.
     */
    constructor(initialData) {
        /**
         * Gets / sets the debug flag. If set to true will enable console logging
         * of state changes / events.
         * @param {boolean=} val Set to true to enable.
         * @returns {boolean|FiniteStateMachine} The debug flag value.
         */
        this.debug = (val) => {
            if (val !== undefined) {
                this._debug = val;
                return this;
            }
            return this._debug;
        };
        /**
         * Defines a state with a name and a state definition.
         * @param {string} name The name of the state to define.
         * @param {EventDefinition} definition The state definition object.
         * @example #Define a state
         *     var fsm = new FSM();
         *
         *     // Define an "idle" state
         *     fsm.defineState('idle', {
         *         enter = async (data) => {
         *             console.log("entered idle state");
         *             return;
         *         },
         *         exit = async (data) => {
         *             console.log("exited idle state");
         *             return;
         *         }
         *     });
         * @returns {FiniteStateMachine} The FSM instance.
         */
        this.defineState = (name, definition = {}) => {
            this._states[name] = definition;
            if (!this._initialStateName) {
                this._initialStateName = name;
            }
            return this;
        };
        /**
         * Defines a transition between two states.
         * @param {String} fromState The state name the transition is from.
         * @param {String} toState The state name the transition is to.
         * @param {Function} transitionCheck A method to call just before this transition
         * between the two specified states is executed. The function should be async and
         * return either an Error instance (new Error()) to indicate the transition should
         * be cancelled, or any other value to indicate success.
         * @example #Define a state transition
         *     var fsm = new FSM();
         *
         *     // Define an "idle" state
         *     fsm.defineState('idle', {
         *         enter = async function (data) {
         *             console.log("entered idle state");
         *             return;
         *         },
         *         exit = async function (data) {
         *             console.log("exited idle state");
         *             return;
         *         }
         *     });
         *
         *     // Define a "moving" state
         *     fsm.defineState('moving', {
         *         enter = async function (data) {
         *             console.log("entered moving state");
         *             return;
         *         },
         *         exit = async function (data) {
         *             console.log("exited moving state");
         *             return;
         *         }
         *     });
         *
         *     // Define a transition between the two methods
         *     fsm.defineTransition('idle', 'moving', async (data) => {
         *         // Check some data we were passed
         *         if (data === 'ok') {
         *             return "whatever value you like, objects, arrays, strings, undefined etc";
         *         } else {
         *             return new Error("Some error");
         *         }
         *     });
         *
         *     // Now change states and cause it to fail
         *     fsm.enterState('moving', {"someData": true}).then((result) => {
         *         if (result instanceof Error) {
         *             // There was an error, the state did not change
         *             console.log('State did NOT change!', fsm.currentStateName());
         *         } else {
         *             // There was no error, the state changed successfully
         *             console.log('State changed!', fsm.currentStateName());
         *         }
         *     });
         *
         *     // Now change states and pass "ok" in the data to make it proceed
         *     fsm.enterState('moving', 'ok').then((result) {
         *         if (result instanceof Error) {
         *             // There was an error, the state did not change
         *             console.log('State did NOT change!', fsm.currentStateName());
         *         } else {
         *             // There was no error, the state changed successfully
         *             console.log('State changed!', fsm.currentStateName());
         *         }
         *     });
         * @returns {FiniteStateMachine|Boolean} The FSM instance.
         */
        this.defineTransition = (fromState, toState, transitionCheck) => {
            if (fromState && toState && transitionCheck) {
                if (!this._states[fromState]) {
                    this.log('fromState "' + fromState + '" specified is not defined as a state!', "error");
                }
                if (!this._states[toState]) {
                    this.log('toState "' + toState + '" specified is not defined as a state!', "error");
                }
                this._transitions[fromState] = this._transitions[fromState] || {};
                this._transitions[fromState][toState] = transitionCheck;
                return this;
            }
            return false;
        };
        /**
         * After defining your states, call this to set the initial state of the FSM.
         * Setting the state this way skips any transition logic since there is assumed
         * to be no current state and therefore no state to transition from.
         * @param {String} stateName The state to set as the initial state.
         * @param {any[]} rest Any data you wish to pass the state's "enter" method.
         * @returns {Promise} The result of trying to enter the state.
         */
        this.initialState = (stateName, ...rest) => __awaiter(this, void 0, void 0, function* () {
            const newStateObj = this.getState(stateName);
            if (!newStateObj)
                throw new Error(`Cannot set initial state "${stateName}" because it does not exist!`);
            // Record the initial state
            this._initialStateName = stateName;
            // Update the current state
            this._currentStateName = stateName;
            // Clear the previous states
            this._previousStates = [];
            if (this._debug) {
                this.log("Entering initial state: " + stateName);
            }
            if (newStateObj.enter) {
                this.log(`Calling initial state "${stateName}" enter() function`);
                return yield newStateObj.enter(...rest);
            }
            return;
        });
        /**
         * Gets the state definition object for the specified state name.
         * @param {string} stateName The name of the state to return the definition
         * object for.
         * @returns {EventDefinition} The state definition object or undefined if no state
         * exists with that name.
         */
        this.getState = (stateName) => {
            return this._states[stateName];
        };
        /**
         * Tell the FSM to enter the state specified.
         * @param {string} newStateName The new state to enter.
         * @param {any[]} rest Any data to pass to the exit and enter methods.
         * @returns {Promise<TransitionResult>} The result of entering the state.
         */
        this.enterState = (newStateName, ...rest) => __awaiter(this, void 0, void 0, function* () {
            this.log(`Asked to enter state: ${newStateName}`);
            this._transitionQueue.push(() => __awaiter(this, void 0, void 0, function* () {
                // Check if we need to do transitions
                if (newStateName === this._currentStateName) {
                    this.log(`Already in "${newStateName}" state.`);
                    return undefined;
                }
                if (!this._transitions[this._currentStateName] || !this._transitions[this._currentStateName][newStateName]) {
                    // No transition check method exists, continue to change states
                    this.log(`No check required, transitioning from ${this._currentStateName} to ${newStateName}...`);
                    return yield this._transitionStates(newStateName, "forward", ...rest);
                }
                this.log(`Checking transition from ${this._currentStateName} to ${newStateName}...`);
                // There is a transition check method, call it to see if we can change states
                const result = yield this._transitions[this._currentStateName][newStateName](...rest);
                if (result instanceof Error) {
                    // State change not allowed or error
                    this.log(`Cannot transition from "${this._currentStateName}" to "${newStateName}"`);
                    return result;
                }
                // State change allowed
                this.log(`Transition allowed from "${this._currentStateName}" to "${newStateName}"`);
                return yield this._transitionStates(newStateName, "forward", ...rest);
            }));
            this.log(`Processing transition queue from enterState(${newStateName})`);
            return yield this._processTransition();
        });
        /**
         * Tell the FSM to exit the current state and enter the previous state.
         * @returns {Promise} The exit promise.
         */
        this.exitState = (...rest) => __awaiter(this, void 0, void 0, function* () {
            if (!this._previousStates.length) {
                throw new Error("No previous state to transition to");
            }
            const previousState = this._previousStates.pop();
            if (!previousState) {
                throw new Error("No previous state to transition to");
            }
            const newStateName = previousState.name;
            // If provided with override args, use them, otherwise return to the previous
            // state with the previous states args
            const dataArgs = (rest && rest.length) ? rest : previousState.args;
            //return this.enterState(previousState.name, ...dataArgs);
            this._transitionQueue.push(() => __awaiter(this, void 0, void 0, function* () {
                // Check if we need to do transitions
                if (newStateName === this._currentStateName) {
                    this.log(`Already in "${newStateName}" state.`);
                    return undefined;
                }
                if (!this._transitions[this._currentStateName] || !this._transitions[this._currentStateName][newStateName]) {
                    // No transition check method exists, continue to change states
                    this.log(`No check required, transitioning from ${this._currentStateName} to ${newStateName}...`);
                    return yield this._transitionStates(newStateName, "backward", ...dataArgs);
                }
                this.log(`Checking transition from ${this._currentStateName} to ${newStateName}...`);
                // There is a transition check method, call it to see if we can change states
                const result = yield this._transitions[this._currentStateName][newStateName](...dataArgs);
                if (result instanceof Error) {
                    // State change not allowed or error
                    this.log(`Cannot transition from "${this._currentStateName}" to "${newStateName}"`);
                    return result;
                }
                // State change allowed
                this.log(`Transition allowed from "${this._currentStateName}" to "${newStateName}"`);
                return yield this._transitionStates(newStateName, "backward", ...dataArgs);
            }));
            this.log(`Processing transition queue from enterState(${newStateName})`);
            return yield this._processTransition();
        });
        /**
         * Processes the transition queue, taking the first on the queue
         * and calling the transition function, then when that function
         * completes, calls _processTransition again. This continues until
         * the queue is empty.
         * @private
         */
        this._processTransition = () => __awaiter(this, void 0, void 0, function* () {
            // Check if there are any further transitions to take
            if (!this._transitionQueue.length) {
                this.log(`No further transitions, returning`);
                this._transitioning = false;
                return;
            }
            // Mark the system as transitioning
            this._transitioning = true;
            // Pull the latest async function off the queue
            const func = this._transitionQueue.shift();
            if (!func) {
                this.log(`Transition function finished`);
                // Mark the system as no longer transitioning
                this._transitioning = false;
                return;
            }
            // Call the function and wait for resolve
            this.log(`Calling transition function...`);
            yield func();
            // Call processTransition() again
            this.log(`Checking for further transitions...`);
            this._transitioning = false;
            return yield this._processTransition();
        });
        /**
         * Raise an event in the current state. If a corresponding event
         * function exists in the current state's definition, it is executed
         * with the passed data as the argument. This is useful when you
         * want to respond to the same event in different ways depending on
         * the current state.
         * @param {string} eventName The name of the event to raise.
         * @param {any[]} rest The optional arguments to pass to the event handler.
         */
        this.raiseEvent = (eventName, ...rest) => __awaiter(this, void 0, void 0, function* () {
            const beforeAllStateObj = this.getState("beforeAll");
            if (beforeAllStateObj && beforeAllStateObj[eventName]) {
                const eventHandler = beforeAllStateObj[eventName];
                yield eventHandler(...rest);
            }
            const currentStateObj = this.getState(this._currentStateName);
            let result;
            if (currentStateObj[eventName]) {
                result = yield currentStateObj[eventName](...rest);
            }
            const afterAllStateObj = this.getState("afterAll");
            if (afterAllStateObj && afterAllStateObj[eventName]) {
                const eventHandler = afterAllStateObj[eventName];
                yield eventHandler(...rest);
            }
            return result;
        });
        /**
         * Handles changing states from one to another by checking for transitions and
         * handling return values.
         * @param {string} newStateName The name of the state we are transitioning to.
         * @param {"forward" | "backward"} direction If we are entering or exiting.
         * @param {any[]} rest Optional data to pass to the exit and enter methods of each state.
         * @returns {Promise} The promise of the transition result.
         * @private
         */
        this._transitionStates = (newStateName, direction, ...rest) => __awaiter(this, void 0, void 0, function* () {
            const currentStateObj = this.getState(this._currentStateName);
            const newStateObj = this.getState(newStateName);
            if (!currentStateObj) {
                this.log(`No state defined called ${this._currentStateName}, cannot change states!`);
            }
            if (!newStateObj) {
                this.log(`No state defined called ${newStateName}, cannot change states!`);
            }
            if (!currentStateObj || !newStateObj) {
                return new Error('Cannot change states from "' +
                    this._currentStateName +
                    '" to "' +
                    newStateName +
                    '" states because at least one is not defined.');
            }
            if (this._debug) {
                this.log("Exiting state: " + this._currentStateName);
            }
            const goToNextState = () => __awaiter(this, void 0, void 0, function* () {
                if (direction === "forward") {
                    this._previousStates.push({ name: this._currentStateName, args: rest });
                }
                this._currentStateName = newStateName;
                // If we are transitioning to the initial state, clear all history
                if (newStateName === this._initialStateName) {
                    // Clear previous state history
                    this._previousStates = [];
                }
                if (this._debug) {
                    this.log("Entering state: " + newStateName);
                }
                if (newStateObj.enter) {
                    const enter = newStateObj.enter;
                    return yield enter(...rest).then((enterResult) => {
                        return enterResult;
                    });
                }
                return Promise.resolve();
            });
            if (currentStateObj.exit) {
                this.log("Current state has an exit() function, calling it...");
                const exitResult = yield currentStateObj.exit(...rest);
                if (exitResult instanceof Error) {
                    this.log("Error exiting state: " + this._currentStateName);
                    return exitResult;
                }
                this.log("Moving to next state...");
                return goToNextState();
            }
            // The current state doesn't have an exit function, just call
            // the new state enter function
            this.log("Current state does not have an exit() function");
            this.log("Moving to next state...");
            return goToNextState();
        });
        this._states = {};
        this._transitions = {};
        // Track states by name.
        this._initialStateName = "";
        this._currentStateName = "";
        this._previousStates = [];
        this._transitionQueue = [];
        this._transitioning = false;
        this._data = {};
        this._debug = false;
        if (initialData) {
            if (initialData.states) {
                Object.entries(initialData.states).forEach(([stateName, definition]) => {
                    this.defineState(stateName, definition);
                });
            }
            if (initialData.initialState) {
                void this.initialState(initialData.initialState);
            }
        }
    }
    log(...rest) {
        if (!this._debug)
            return;
        console.log(...rest);
    }
    /**
     * Returns the name of the initial state.
     * @returns {string} The name of the initial state.
     */
    initialStateName() {
        return this._initialStateName;
    }
    /**
     * Returns the names of all previous states currently
     * in the previous state array.
     * @returns {string[]}
     */
    previousStates() {
        return this._previousStates;
    }
    /**
     * Returns the previous state.
     * @returns {string[]}
     */
    previousState() {
        return this._previousStates[this._previousStates.length - 1];
    }
    /**
     * Returns the name of the previous state.
     * @returns {string} The name of the previous state.
     */
    previousStateName() {
        return this._previousStates[this._previousStates.length - 1].name;
    }
    /**
     * Returns the name of the current state.
     * @returns {string} The name of the current state.
     */
    currentStateName() {
        return this._currentStateName;
    }
    getData(key) {
        return this._data[key];
    }
    setData(key, val) {
        this._data[key] = val;
    }
}
exports.FiniteStateMachine = FiniteStateMachine;
