import {TransitionResult} from "@/types/TransitionResult";

export type TransitionCheckFunction = (...rest: any[]) => TransitionResult;