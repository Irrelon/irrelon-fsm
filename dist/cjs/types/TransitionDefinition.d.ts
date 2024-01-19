import { TransitionCheckFunction } from "./TransitionCheckFunction.js"
export interface TransitionDefinition {
    [fromState: string]: {
        [toState: string]: TransitionCheckFunction;
    };
}
