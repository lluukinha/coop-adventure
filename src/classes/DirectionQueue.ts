import * as ex from "excalibur";
import { DOWN, LEFT, RIGHT, UP } from "../constants";

interface IDirectionGroup {
    key: ex.Input.Keys;
    dir: string;
}

export class DirectionQueue {
    private heldDirections: string[];
    private directions: IDirectionGroup[] = [
        { key: ex.Input.Keys.Left, dir: LEFT },
        { key: ex.Input.Keys.Right, dir: RIGHT },
        { key: ex.Input.Keys.Up, dir: UP },
        { key: ex.Input.Keys.Down, dir: DOWN }
    ];

    constructor() {
        this.heldDirections = [];
    }

    get direction() {
        return this.heldDirections[0] ?? null;
    }

    add(direction: string) {
        const exists = this.heldDirections.includes(direction);
        if (exists) return;
        this.heldDirections.unshift(direction);
    }

    remove(direction: string) {
        this.heldDirections = this.heldDirections.filter(d => d !== direction);
    }

    update(engine: ex.Engine) {
        this.directions.forEach((direction: IDirectionGroup) => {
            if (engine.input.keyboard.wasPressed(direction.key)) {
                this.add(direction.dir);
            }
            if (engine.input.keyboard.wasReleased(direction.key)) {
                this.remove(direction.dir);
            }
        })
    }
}