
import { findStrInArray } from "./lib.ts";

export type Player = {
  hands: number;
  vpip: number;
  pfr: number;
};

const getAction = (item: string): string => {
    if (item.includes("bets")) return "bets"; else
    if (item.includes("raises")) return "raises"; else
    if (item.includes("calls")) return "calls"; else
    if (item.includes("checks")) return "checks"; else
    if (item.includes("folds")) return "folds"; else
    if (item.includes("show hand")) return "show"; else
    return "none";
}

const getSection = (item: string): string | null => {
    if (item.includes("Table")) return "header"; else
    if (item.includes("*** HOLE CARDS ***")) return "preflop"; else
    if (item.includes("*** FLOP ***")) return "flop"; else
    if (item.includes("*** TURN ***")) return "turn"; else
    if (item.includes("*** RIVER ***")) return "river"; else
    if (item.includes("*** SHOW DOWN ***")) return "show"; else
    if (item.includes("*** SUMMARY ***")) return "summary"; else
    return null;    
}

const getPlayerPosition = (name: string, data: string[], index:number): string => {
    let position = "?";
    let ini = data.indexOf("*** SUMMARY ***", index);
    let end = findStrInArray("PokerStars", data, ini);
    if (end == -1) end = data.length - 1;

    for (let i = ini; i < end; i ++) {
        if (data[i].includes("Seat")) {
             if (name == data[i].substring(8, data[i].indexOf("(") -1)) {
                if (data[i]. includes("(button)")) position = "BT";
                else if (data[i]. includes("(small blind)")) position = "SB";
                else if (data[i]. includes("(big blind)")) position = "BB";
             }
        }
    }    
    
    return position;
}

const isTableItem = (item: string): boolean => item.includes("Table");
const isPlayerItem = (item: string): boolean => item.includes("Seat") && item.includes("in chips");

export const newPlayerStats = () => ({
    hands: 0,
    vpip: 0,
    pfr: 0    
});

export const addStats = (data1: Map<string, Player>, data2: Map<string, Player>) => {

    data2.forEach((item, key) => {
        let data = data1.get(key) ?? newPlayerStats();
        data["hands"] += item["hands"];
        data["vpip"] += item["vpip"];
        data["pfr"] += item["pfr"];
        data1.set(key, data);
    });  
}

export const getStats = (data: string[]) => {

    const stats = new Map();

    let section: string;
    let tableName: string;
    //let playerName: string;
    let playerList = new Map();
        
    data.forEach((item, index, data) => {
    
        section = getSection(item) ?? section;
        
        if (isTableItem(item)) tableName = item.substring(7, item.lastIndexOf("'"));

        // lista de jugadores.
        if (section == "header" && isPlayerItem(item)) {
            // Primer jugador de la lista y vacio la lista.
            if (!isPlayerItem(data[index - 1])) playerList.clear();

            let playerName = item.substring(8, item.indexOf("(") - 1);
            playerList.set(playerName, {position: getPlayerPosition(playerName, data, index), action: "none"});
            
            // Ultimo jugadir de la lista.
            //if (!isPlayerItem(data[index + 1])) console.log(playerList);
        }

        if (["preflop", "flop", "turn", "river"].includes(section) && item.includes(":")) {
            let playerName = item.substring(0, item.indexOf(":"));
            let playerStats = stats.get(playerName) ?? newPlayerStats();
            let playerData = playerList.get(playerName) ?? {position: getPlayerPosition(playerName, data, index), action: "none"};
            let action = getAction(item);

            switch (section) {
                case "preflop": {
                    if (playerData["action"] === "none") {
                        // hands
                        playerStats["hands"] ++;
                        // vpip
                        if (["calls", "bets", "raises"].includes(action)) playerStats["vpip"] ++;
                        // pfr
                        if (["bets", "raises"].includes(action)) playerStats["pfr"] ++;
                    }

                    break;
                };

                default: break;
            }
            
            playerData["action"] = action;
            playerList.set(playerName, playerData);
            stats.set(playerName, playerStats);
        }
        
    });
    
    return stats;
}

export const getTables = (data: string[]) => {

    let section: string;
    let tableName: string;
    let playerList: string[];
    let tableList = new Map();
        
    data.forEach((item, index, data) => {
    
        section = getSection(item) ?? section;
        
        if (isTableItem(item)) tableName = item.substring(7, item.lastIndexOf("'"));

        // lista de jugadores.
        if (section == "header" && isPlayerItem(item)) {
            // Primer jugador de la lista y vacio la lista.
            if (!isPlayerItem(data[index - 1])) {
                playerList = [];
            }

            let playerName = item.substring(8, item.indexOf("(") - 1);
            playerList.push(playerName);
            
            // Ultimo jugadir de la lista.
            if (!isPlayerItem(data[index + 1])) tableList.set(tableName, playerList);
        }
        
    });
    
    return tableList;
    
}

const main = () => {
    let data: Array<string> = Deno.readTextFileSync("test_history.txt").split("\r\n");

    let a = getStats(data);
    console.log(a);
    let b = getStats(data);
    console.log(b);
    addStats(a, b);
    console.log(a);
    
    //console.log(getStats(data));
    
}

if (import.meta.main) main();
