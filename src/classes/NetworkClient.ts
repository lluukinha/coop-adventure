import * as ex from 'excalibur';
import { guidGenerator } from '../helpers';
import Peer, { DataConnection } from 'peerjs';
import {
  EVENT_INITIAL_DATA_REQUESTED,
  EVENT_NETWORK_MONSTER_UPDATE,
  EVENT_NETWORK_PLAYER_LEAVE,
  EVENT_NETWORK_PLAYER_UPDATE,
} from '../constants';

// const PORT = 9002;

// const LOCALHOST_CONFIG = {
//     host: "localhost",
//     key: "demodemo",
//     port: PORT,
//     path: "/myapp"
// };

// const LOCALHOST_URL = `http://localhost:${PORT}`;

const PRODUCTION_CONFIG = {
  host: 'peerjs-server-2jakyffcz-lluukinha.vercel.app',
  key: 'demodemo',
  path: '/myapp',
  secure: true,
};

const PRODUCTION_URL = `https://peerjs-server-2jakyffcz-lluukinha.vercel.app`;

export class NetworkClient {
  public engine: ex.Engine;
  public peerId: string;
  public connectionMap: Map<any, any>;
  public peer: Peer;
  constructor(engine: ex.Engine) {
    this.engine = engine;
    this.peerId = `Player_${guidGenerator()}`;
    this.connectionMap = new Map();
    this.peer = new Peer(this.peerId, PRODUCTION_CONFIG);
    void this.init();
  }

  async init() {
    this.peer.on('error', (err) => {
      console.log(err.message);
    });

    // Be ready to hear from incoming connections
    this.peer.on('connection', async (conn) => {
      // A new playeer has connected to me
      conn.on('open', () => {
        this.connectionMap.set(conn.peer, conn);
        this.engine.emit(EVENT_INITIAL_DATA_REQUESTED, this.peerId);
      });

      // Know when its closed
      conn.on('close', () => {
        this.engine.emit(EVENT_NETWORK_PLAYER_LEAVE, conn.peer);
      });
      // conn.on("disconnected", () => {
      //     this.engine.emit(EVENT_NETWORK_PLAYER_LEAVE, conn.peer);
      // });

      conn.on('data', (data) => {
        this.handleIncomingData(conn, data);
      });

      // Close the connecetion if I leave
      window.addEventListener('unload', () => {
        conn.close();
      });
    });

    // Make all outgoing connections
    const otherPeerIds = await this.getAllPeerIds();
    await this.timeout(1000);

    for (let i = 0; i < otherPeerIds.length; i++) {
      const id = otherPeerIds[i];
      this.connectPeer(id);
    }
  }

  async connectPeer(id: string) {
    // I joined and reached out to all the other players.
    const conn = this.peer.connect(id);

    // Register to each player I know about
    conn.on('open', () => {
      this.connectionMap.set(id, conn);
      this.engine.emit(EVENT_INITIAL_DATA_REQUESTED, conn.peer);
    });

    // Know when it's closed
    conn.on('close', () => {
      this.engine.emit(EVENT_NETWORK_PLAYER_LEAVE, conn.peer);
    });
    // conn.on("disconnected", () => {
    //   this.engine.emit(EVENT_NETWORK_PLAYER_LEAVE, conn.peer);
    // });

    // Subscribe to their updates
    conn.on('data', (data) => {
      this.handleIncomingData(conn, data);
    });

    // Close the connection if I leave
    window.addEventListener('unload', () => {
      conn.close();
    });

    await this.timeout(200);
  }

  handleIncomingData(conn: DataConnection, data: unknown) {
    // Handle MONSTER updates (detect by prefix)
    if ((data as string).startsWith('MONSTER')) {
      this.engine.emit(EVENT_NETWORK_MONSTER_UPDATE, data as string);
      return;
    }

    // Handle PLAYER prefix
    this.engine.emit(EVENT_NETWORK_PLAYER_UPDATE, {
      id: conn.peer,
      data,
    });
  }

  async getAllPeerIds() {
    const response = await fetch(`${PRODUCTION_URL}/myapp/demodemo/peers`);
    const peersArray = await response.json();
    const list = peersArray || [];
    return list.filter((id: string) => id !== this.peerId);
  }

  sendUpdate(update: string) {
    this.connectionMap.forEach((conn: DataConnection, _key: string) => {
      conn.send(update);
    });
  }

  async timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
