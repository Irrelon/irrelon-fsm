import {EventDefinition} from "@/types/EventDefinition";

export interface StateDefinition {
	[stateName: string]: EventDefinition;
}