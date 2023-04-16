var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import assert from "assert";
import { FiniteStateMachine } from "../src/FiniteStateMachine.js";
describe("Finite State Machine", () => {
    it("Correctly handles promises when entering and exiting states", () => __awaiter(void 0, void 0, void 0, function* () {
        const fsm = new FiniteStateMachine();
        fsm.defineState("state1");
        fsm.defineState("state2", {
            enter: () => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 200);
                });
            },
            exit: () => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 200);
                });
            }
        });
        fsm.defineState("state3", {
            enter: () => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 200);
                });
            },
            exit: () => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 200);
                });
            }
        });
        yield fsm.initialState("state1");
        const startTime = new Date().getTime();
        yield fsm.enterState("state2");
        yield fsm.enterState("state3");
        const deltaTime = new Date().getTime() - startTime;
        assert.ok(deltaTime > 590, "The delayed time is too short");
    }));
});
