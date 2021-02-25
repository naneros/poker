import { Player } from "./stats.ts";

export const showTableStats = (stats: Map<string, Player>, playerList: string[], tableName: string) => {

    const BgBlack = "\x1b[40m";
    const BgRed = "\x1b[41m";
    const BgGreen = "\x1b[42m";
    const BgYellow = "\x1b[43m";
    const BgBlue = "\x1b[44m";
    const BgMagenta = "\x1b[45m";
    const BgCyan = "\x1b[46m";
    const BgWhite = "\x1b[47m";

    const FgBlack = "\x1b[30m";
    const FgRed = "\x1b[31m";
    const FgGreen = "\x1b[32m";
    const FgYellow = "\x1b[33m";
    const FgBlue = "\x1b[34m";
    const FgMagenta = "\x1b[35m";
    const FgCyan = "\x1b[36m";
    const FgWhite = "\x1b[37m";
    
    const DefaultColor = "\x1b[0m";
    
    console.clear();
    console.log(DefaultColor , "Table: " + tableName);
    console.log("");
    console.log(DefaultColor, "player                Hands   VPIP    PFR");
    console.log(DefaultColor, "----------------------------------------------------");

    let nameColor = DefaultColor;
    let vpipColor = DefaultColor;
    let pfrColor = DefaultColor;

    playerList.forEach((item) => {
        const playerStats = stats.get(item);
        if (playerStats) {
            const hands = playerStats["hands"];
            const vpip = Math.round(playerStats["vpip"] / hands * 100);
            const pfr = Math.round(playerStats["pfr"] / hands * 100);

            if (vpip <= 10) vpipColor = FgRed;
            else if (vpip <= 20) vpipColor = FgMagenta;
            else if (vpip <= 30) vpipColor = FgYellow;
            else if (vpip <= 40) vpipColor = FgCyan;
            else if (vpip > 40) vpipColor = FgGreen;
            nameColor = vpipColor;

            console.log(nameColor, item.padEnd(20), DefaultColor, hands.toString().padStart(5), vpipColor, vpip.toString().padStart(5), DefaultColor, pfr.toString().padStart(5));
        }
    });
}

