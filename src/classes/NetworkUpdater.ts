import * as ex from "excalibur";

export class NetworkUpdater {
    private engine: ex.Engine;
    public eventType: string;
    public previousString: string;

    constructor(engine: ex.Engine, eventType: string) {
        this.engine = engine;
        this.eventType = eventType;
        this.previousString = "";
    }

    sendStateUpdate(newString: string) {
        if (this.previousString === newString) return;
        this.engine.emit(this.eventType, newString);
        this.previousString = newString;
    }
}