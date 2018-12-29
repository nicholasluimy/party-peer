import Utils from "./Utils";

interface ILobbyConfig {
    maxPlayers?: number;
}

interface ILobbyPlayer {
    [key: string]: any;
}

export default class Lobby {
    public readonly maxPlayers: number = 4;
    private players: ILobbyPlayer = {};
    private numPlayers = 0;

    constructor(config: ILobbyConfig) {
        if (config !== null) {
            if (config.maxPlayers !== undefined) {
                this.maxPlayers = config.maxPlayers;
            }
        }
    }

    public addPlayer(key: string, player: any) {
        if (this.numPlayers < this.maxPlayers) {
            this.players[key] = player;
            this.numPlayers++;
        }
    }

    public dropPlayer(key: string) {
        if (key in this.players) {
            delete this.players[key];
            this.numPlayers--;
        }
    }

    public getPlayers() {
        return Utils.getDictionaryValues(this.players);
    }

    public getKeys() {
        return Object.keys(this.players);
    }
}
