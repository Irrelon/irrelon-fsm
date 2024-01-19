import { TransitionResult } from "./TransitionResult.js"
export type TransitionCheckFunction = (...rest: any[]) => TransitionResult;
