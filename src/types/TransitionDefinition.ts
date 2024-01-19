import {TransitionCheckFunction} from "@/types/TransitionCheckFunction";

export interface TransitionDefinition {
	[fromState: string]: {
		[toState: string]: TransitionCheckFunction;
	};
}