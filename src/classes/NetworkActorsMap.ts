import * as ex from "excalibur";
import { EVENT_NETWORK_PLAYER_LEAVE, EVENT_NETWORK_PLAYER_UPDATE } from "../constants";
import { NetworkPlayer } from "../actors/players/NetworkPlayer";

interface INetworkPlayerData {
    id: string;
    data: string;
}

export class NetworkActorsMap {
    engine: ex.Engine;
    playerMap: Map<any, any>;
    constructor(engine: ex.Engine) {
        this.engine = engine;
        this.playerMap = new Map();

        this.engine.on(EVENT_NETWORK_PLAYER_UPDATE, otherPlayer => {
            this.onUpdatedPlayer(otherPlayer as unknown as INetworkPlayerData);
        });

        this.engine.on(EVENT_NETWORK_PLAYER_LEAVE, (playerId) => {
            this.removePlayer(playerId as unknown as string);
        })
    }

    getStateUpdate(data: string) {
        const [ actionType, x, y, velX, velY, skinId, facing, isInPain, isPainFlashing ] = data.split("|");
        return {
            actionType,
            x: Number(x),
            y: Number(y),
            skinId,
            facing,
            isInPain: isInPain === "true",
            isPainFlashing: isPainFlashing === "true",
            velX: isInPain === "true" ? Number(velX) : 0,
            velY: isInPain === "true" ? Number(velY) : 0,
        };
    }

    onUpdatedPlayer(playerData: INetworkPlayerData) {
        const stateUpdate = this.getStateUpdate(playerData.data);
        let otherPlayerActor = this.playerMap.get(playerData.id);
        if (!otherPlayerActor) {
            otherPlayerActor = new NetworkPlayer(stateUpdate.x, stateUpdate.y);
            this.playerMap.set(playerData.id, otherPlayerActor);
            this.engine.add(otherPlayerActor);
        }

        otherPlayerActor.onStateUpdate(stateUpdate);
    }

    removePlayer(id: string) {
        const actorToRemove = this.playerMap.get(id);
        if (!!actorToRemove) {
            actorToRemove.kill();
        }
        this.playerMap.delete(id);
    }
}