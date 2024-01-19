export interface EventDefinition {
    [eventName: string]: (...rest: any[]) => Promise<any>;
}
