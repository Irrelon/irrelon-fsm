import { EventDefinition } from "./EventDefinition.js"
export interface StateDefinition {
    [stateName: string]: EventDefinition;
}
