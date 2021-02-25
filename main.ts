
import { Player, getStats, addStats, getTables } from "./stats.ts";
import { runFun } from "./lib.ts"
import { showTableStats } from "./hud.ts"

const cfg = {
    PSHistoryPath: '/home/mros/.PlayOnLinux/wineprefix/PokerStarsEU/drive_c/users/mros/Local Settings/Application Data/PokerStars.ES/HandHistory/mros21/',
    PSNotesPath: '/home/mros/.PlayOnLinux/wineprefix/PokerStarsEU/drive_c/users/mros/Local Settings/Application Data/PokerStars.ES/',
    notesFileName: "notes.mros21.xml",
    dataJSONName: "data.json",
};


const add = () => {

    let jsonIni = JSON.parse(Deno.readTextFileSync(cfg.dataJSONName));
    let stats = new Map<string, Player>(JSON.parse(jsonIni));
    
    for (const dirEntry of Deno.readDirSync(cfg.PSHistoryPath)) {
        
        if (dirEntry.isFile) {
            let data: Array<string> = Deno.readTextFileSync(cfg.PSHistoryPath + dirEntry.name).split("\r\n");

            addStats(stats, getStats(data));
            
            //Deno.copyFileSync(cfg.PSHistoryPath + dirEntry.name, "hands/" + dirEntry.name);
            Deno.copyFileSync(cfg.PSHistoryPath + dirEntry.name, "hands/" + Date.now().toString());
            Deno.remove(cfg.PSHistoryPath + dirEntry.name);
        }
    }

    let jsonEnd = JSON.stringify([...stats]);
    
    Deno.writeTextFileSync(cfg.dataJSONName, JSON.stringify(jsonEnd));
} 

const restore = () => {

    let stats = new Map<string, Player>();
    
    for (const dirEntry of Deno.readDirSync("hands/")) {
        
        if (dirEntry.isFile) {
            let data: Array<string> = Deno.readTextFileSync("hands/" + dirEntry.name).split("\r\n");
            addStats(stats, getStats(data));
        }
    }

    let jsonEnd = JSON.stringify([...stats]);
    
    Deno.writeTextFileSync(cfg.dataJSONName, JSON.stringify(jsonEnd));
} 

const hud = async () => {

    let jsonIni = JSON.parse(Deno.readTextFileSync(cfg.dataJSONName));
    let stats = new Map<string, Player>(JSON.parse(jsonIni));
    let tables: Map<string, string[]> = new Map();

    let windowName: string;
    
    while (true) {
       
        windowName = await runFun("xdotool getactivewindow getwindowname");
        windowName = windowName.substring(0, windowName.indexOf(" -"));
        
        for (const dirEntry of Deno.readDirSync(cfg.PSHistoryPath)) {
        
            if (dirEntry.isFile) {
                const data: Array<string> = Deno.readTextFileSync(cfg.PSHistoryPath + dirEntry.name).split("\r\n");

                addStats(stats, getStats(data));
                const _tables = getTables(data);
                _tables.forEach((item, key) => {
                    tables.set(key, item); 
                });

                Deno.copyFileSync(cfg.PSHistoryPath + dirEntry.name, "hands/" + Date.now().toString());
                Deno.removeSync(cfg.PSHistoryPath + dirEntry.name);
            }
        }

        let playerList: string[] | undefined = []; 
        if (tables)
            playerList = tables.get(windowName);
        if (playerList) {
            showTableStats(stats, playerList, windowName);    
        }   
                 
        Deno.sleepSync(2000);
    }
}

const xml = () => {

    let jsonIni = JSON.parse(Deno.readTextFileSync(cfg.dataJSONName));
    let stats = new Map<string, Player>(JSON.parse(jsonIni));

    const xmlData = map2xml(stats);

    Deno.writeTextFileSync(cfg.notesFileName, xmlData);  
    Deno.copyFileSync(cfg.notesFileName, cfg.PSNotesPath + cfg.notesFileName);
}

const map2xml = (data: Map<string, Player>): string => {

    let dataXML: Array<string> = [];

    dataXML.push('<?xml version="1.0" encoding="UTF-8"?>');
    dataXML.push('<notes version="1">');
    dataXML.push('    <labels>');

    dataXML.push('        <label id="0" color="303EFF">nit</label>');
    dataXML.push('        <label id="1" color="1985FF">tight</label>');
    dataXML.push('        <label id="2" color="30DBFF">loos</label>');
    dataXML.push('        <label id="3" color="E1FF80">fish</label>');
    dataXML.push('        <label id="4" color="30FF97">big fish</label');
    
    dataXML.push('        <label id="5" color="FF9B30">Custom Label 5</label>');
    dataXML.push('        <label id="6" color="FF304E">Custom Label 6</label>');
    dataXML.push('        <label id="7" color="FF30D7">Custom Label 7</label>');
    
    dataXML.push('    </labels>');

    data.forEach((item, key) => {
        let vpip = Math.round(item["vpip"] / item["hands"] * 100);
        let pfr = Math.round(item["pfr"] / item["hands"] * 100);
        
        let label = 0;

        if (vpip <= 10) label = 0
        else if (vpip <= 20) label = 1
        else if (vpip <= 30) label = 2
        else if (vpip <= 40) label = 3
        else if (vpip > 40) label = 4;

        let str = '        <note player=' + '"' + key + '"' + ' label="' + label + '" update="1612366764">' + 'HANDS:' + item["hands"] + '  VPIP:' + vpip + '  PFR:' + pfr + '</note>';
        if (item["hands"] > 30) dataXML.push(str);
    });

    dataXML.push('</notes>');
    
    return dataXML.join("\n");
}

const main = () => {

    const { args } = Deno;

    switch(args[0]) {
        case "add": add(); break;
        case "restore": restore(); break;
        case "hud": hud(); break;
        case "xml": xml(); break;

        default: {
            console.log("add                 Añade historial de manos a los stats y crea notes.xml.");
            console.log("restore             Restaura stats con historiales guardados y crea notes.xml.");
            console.log("hud                 Añade historial de manos en vivo y muestra stats mesa activa.");
            console.log("xml                 Crea el archivo notes.user.xml con los stats guardados.");
        }
    }
}

main();

