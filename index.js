class FSM {
	/**
	 * A simple finite state machine implementation.
	 */
	constructor () {
		this._states = {};
		this._transitions = {};

		// Track states by name.
		this._initialStateName = "";
		this._currentStateName = "";
		this._previousStateName = "";

		this._debug = false;
	}

	/**
	 * Returns the name of the initial state.
	 * @returns {string} The name of the initial state.
	 */
	initialStateName = () => {
		return this._initialStateName;
	}

	/**
	 * Returns the name of the previous state.
	 * @returns {string} The name of the previous state.
	 */
	previousStateName = () => {
		return this._previousStateName;
	}

	/**
	 * Returns the name of the current state.
	 * @returns {string} The name of the current state.
	 */
	currentStateName = () => {
		return this._currentStateName;
	}

	/**
	 * Gets / sets the debug flag. If set to true will enable console logging
	 * of state changes / events.
	 * @param {Boolean=} val Set to true to enable.
	 * @returns {*} The debug flag value.
	 */
	debug = (val) => {
		if (val !== undefined) {
			this._debug = val;
			return this;
		}

		return this._debug;
	}

	/**
	 * Defines a state with a name and a state definition.
	 * @param {String} name The name of the state to define.
	 * @param {Object} definition The state definition object.
	 * @example #Define a state
	 *     var fsm = new FSM();
	 *
	 *     // Define an "idle" state
	 *     fsm.defineState('idle', {
	 *         enter = async (data) => {
	 *             console.log('entered idle state');
	 *             return;
	 *         },
	 *         exit = async (data) => {
	 *             console.log('exited idle state');
	 *             return;
	 *         }
	 *     });
	 * @returns {FSM} The FSM instance.
	 */
	defineState = (name, definition = {}) => {
		this._states[name] = definition;

		if (!this._initialStateName) {
			this._initialStateName = name;
		}

		return this;
	}

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
	 *             console.log('entered idle state');
	 *             return;
	 *         },
	 *         exit = async function (data) {
	 *             console.log('exited idle state');
	 *             return;
	 *         }
	 *     });
	 *
	 *     // Define a "moving" state
	 *     fsm.defineState('moving', {
	 *         enter = async function (data) {
	 *             console.log('entered moving state');
	 *             return;
	 *         },
	 *         exit = async function (data) {
	 *             console.log('exited moving state');
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
	 *             return new Error('Some error');
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
	 * @returns {FSM|Boolean} The FSM instance.
	 */
	defineTransition = (fromState, toState, transitionCheck) => {
		if (fromState && toState && transitionCheck) {
			if (!this._states[fromState]) {
				this.log("fromState \"" + fromState + "\" specified is not defined as a state!", "error");
			}

			if (!this._states[toState]) {
				this.log("toState \"" + toState + "\" specified is not defined as a state!", "error");
			}

			this._transitions[fromState] = this._transitions[fromState] || {};
			this._transitions[fromState][toState] = transitionCheck;

			return this;
		}

		return false;
	}

	/**
	 * After defining your states, call this with the state name and the initial
	 * state of the FSM will be set.
	 * @param {String} stateName The state to set as the initial state.
	 * @param {*=} data Any data you wish to pass the state's "enter" method.
	 * @returns {Promise} The result of trying to enter the state.
	 */
	initialState = (stateName, data) => {
		return new Promise((resolve) => {
			const newStateObj = this.getState(stateName);

			// Update the current state
			this._currentStateName = stateName;

			if (this._debug) { this.log("Entering initial state: " + stateName); }

			if (newStateObj.enter) {
				resolve(newStateObj.enter(data));
				return;
			}

			resolve();
		});
	}

	/**
	 * Gets the state definition object for the specified state name.
	 * @param {String} stateName The name of the state who's definition object should
	 * be looked up and returned.
	 * @returns {Object} The state definition object or undefined if no state exists
	 * with that name.
	 */
	getState = (stateName) => {
		return this._states[stateName];
	}

	/**
	 * Tell the FSM to enter the state specified.
	 * @param {String} newStateName The new state to enter.
	 * @param {*} data Any data to pass to the exit and enter methods.
	 * @returns {Promise} The result of entering the state.
	 */
	enterState = (newStateName, data) => {
		return new Promise((resolve) => {
			// Check if we need to transitions
			if (newStateName === this._currentStateName) {
				this.log(`Already in "${newStateName}" state.`, "warning");
				return;
			}

			if (!this._transitions[this._currentStateName] || !this._transitions[this._currentStateName][newStateName]) {
				// No transition check method exists, continue to change states
				return resolve(this._transitionStates(this._currentStateName, newStateName, data));
			}

			// There is a transition check method, call it to see if we can change states
			this._transitions[this._currentStateName][newStateName](data).then((result) => {
				if (result instanceof Error) {
					// State change not allowed or error
					this.log("Cannot transition from \"" + this._currentStateName + "\" to \"" + newStateName + "\" states.", "warning");
					return resolve(result);
				}

				// State change allowed
				return resolve(this._transitionStates(this._currentStateName, newStateName, data));
			});
		});
	};

	/**
	 * Tell the FSM to exit the current state and enter the previous state.
	 * @returns {Promise} The exit promise.
	 */
	exitState = () => {
		return this.enterState(this._previousStateName, null);
	}

	process = (functionName, data) => {
		const currentStateObj = this.getState(this._currentStateName);

		if (!currentStateObj[functionName]) return;
		return currentStateObj[functionName](data);
	};

	/**
	 * Handles changing states from one to another by checking for transitions and
	 * handling return values.
	 * @param {String} oldStateName The name of the state we are transitioning from.
	 * @param {String} newStateName The name of the state we are transitioning to.
	 * @param {*=} data Optional data to pass to the exit and enter methods of each state.
	 * @returns {Promise} The promise of the transition result.
	 * @private
	 */
	_transitionStates = (oldStateName, newStateName, data) => {
		return new Promise((resolve) => {
			const currentStateObj = this.getState(this._currentStateName);
			const newStateObj = this.getState(newStateName);

			if (!currentStateObj || !newStateObj) {
				this.log("Cannot change states from \"" + this._currentStateName + "\" to \"" + newStateName + "\" states.", "warning");
				return resolve(new Error("Cannot change states from \"" + this._currentStateName + "\" to \"" + newStateName + "\" states."));
			}

			if (this._debug) {
				this.log("Exiting state: " + this._currentStateName);
			}

			if (currentStateObj.exit) {
				currentStateObj.exit(data).then((exitResult) => {
					if (exitResult instanceof Error) {
						this.log("Error exiting state: " + this._currentStateName);
						return resolve(exitResult);
					}

					this._previousStateName = this._currentStateName;
					this._currentStateName = newStateName;

					if (this._debug) {
						this.log("Entering state: " + newStateName);
					}

					if (newStateObj.enter) {
						newStateObj.enter(data).then((enterResult) => {
							return resolve(enterResult);
						});
					}
				});
			}
		});
	}
}

module.exports = FSM;