
// < 15 nit, 15-25 reg, 25-35 los, 35 + fish
// < 30% pasivo, 30%-70% normal, 70% + agresivo

let config = {
    PSHistoryPath: '/home/mros/.PlayOnLinux/wineprefix/PokerStarsEU/drive_c/users/mros/Local Settings/Application Data/PokerStars.ES/HandHistory/mros21/',
    PSNotesPath: '/home/mros/.PlayOnLinux/wineprefix/PokerStarsEU/drive_c/users/mros/Local Settings/Application Data/PokerStars.ES/',
    notesFileName: "notes.mros21.xml",
    dataJSONName: "data.json",
};

type villano = {
  hands: number;
  vpip: number;
  pfr: number;
};

let findStrInA = (str: string, strA: Array<string>, ini: number): number => {
    for (let i = ini; i < strA.length; i++) {
        if (strA[i].includes(str)) return i;
    }
    return -1;
}

let getPreflop = (data: Array<string>): Array<string> => {
    let result: Array<string> = [];
    let ini = data.indexOf("*** CARTAS PROPIAS ***");
    while(ini > -1) {
        let fin = findStrInA('***', data, ini + 1);
        result = result.concat(data.slice(ini + 2, fin));
        ini = data.indexOf("*** CARTAS PROPIAS ***", ini + 1);
    }
    result = result.filter(item => {
       return item.includes(":") && (item.includes("se retira") || item.includes("iguala") || item.includes("sube")); 
    });

    return result;
}

let data2JSON = (data: Array<string>, dataJSON: {[name: string]: villano}): {[name: string]: villano} => {

    data.forEach( item => {
        let name = item.substring(0,item.indexOf(":"));
        let vpip = 0;
        let pfr = 0;

        if (item.includes("iguala")) vpip++;
        if (item.includes("sube")) { vpip++; pfr++ };

        let reg: villano = dataJSON[name];

        if (!reg) {
            reg = {hands: 0, vpip: 0, pfr: 0};
        }

        reg.hands = reg.hands + 1;
        reg.vpip = reg.vpip + vpip;
        reg.pfr = reg.pfr + pfr;
        
        dataJSON[name] = reg;
        });
    
    return dataJSON;
}    

let JSON2XML = (data: {[name: string]: villano}): Array<string> => {
    let dataXML: Array<string> = []; 

    for (const item in data) {
        let vill = data[item];
        
        let vpip100 = Math.round(vill.vpip / vill.hands * 100);
        let pfr100 = Math.round(vill.pfr / vill.hands * 100);
        let agg100 = Math.round(pfr100 / vpip100 * 100);

        let agg = 0;

        if (vpip100 < 15) {
            if (agg100 < 30) agg = 0;
            if (agg100 >= 30 && agg100 < 70) agg = 1;
            if (agg100 >= 70) agg = 2;
        } else if (vpip100 >= 15 && vpip100 < 25) {
            if (agg100 < 30) agg = 3;
            if (agg100 >= 30 && agg100 < 70) agg = 4;
            if (agg100 >= 70) agg = 5;
        } else if (vpip100 >= 25 && vpip100 < 35) {
            if (agg100 < 30) agg = 6;
            if (agg100 >= 30 && agg100 < 70) agg = 7;
            if (agg100 >= 70) agg = 8;
        } else if (vpip100 >= 35) {
            if (agg100 < 30) agg = 9;
            if (agg100 >= 30 && agg100 < 70) agg = 10;
            if (agg100 >= 70) agg = 11;
        }
        
        let str = '        <note player=' + '"' + item + '"' + ' label="' + agg + '" update="1612366764">' + 'HANDS:' + vill.hands + '  VPIP:' + vpip100 + '  PFR:' + pfr100 + '</note>';
        if (vill.hands > 30) dataXML.push(str);
    }
    
    return dataXML;
}

let main = () => {

    let dataJSON: {[name:string]: villano} = {};
    try {
        dataJSON = JSON.parse(Deno.readTextFileSync(config.dataJSONName));
    } catch(e) {
        console.log(e.message);
    }

    for (const dirEntry of Deno.readDirSync(config.PSHistoryPath)) {
        if (dirEntry.isFile) {
            let data: Array<string> = getPreflop(Deno.readTextFileSync(config.PSHistoryPath + dirEntry.name).split("\r\n"));
            dataJSON = data2JSON(data, dataJSON);

            Deno.copyFileSync(config.PSHistoryPath + dirEntry.name, "hands/" + dirEntry.name);
            Deno.remove(config.PSHistoryPath + dirEntry.name);
        }
    }
    Deno.writeTextFileSync(config.dataJSONName, JSON.stringify(dataJSON));

    let dataXML: Array<string> = [];

    dataXML.push('<?xml version="1.0" encoding="UTF-8"?>');
    dataXML.push('<notes version="1">');
    dataXML.push('    <labels>');

    //rojos nit
    dataXML.push('        <label id="0" color="8080FF">nit pasivo</label>');
    dataXML.push('        <label id="1" color="FF">nit</label>');
    dataXML.push('        <label id="2" color="80">nit agresivo</label>');

    //amarillos tigh
    dataXML.push('        <label id="3" color="DDFFFF">tight pasivo</label>');
    dataXML.push('        <label id="4" color="28FEF8">tight</label>');
    dataXML.push('        <label id="5" color="2C9CF">tight agresivo</label>');

    //azules loss
    dataXML.push('        <label id="6" color="FFFF80">loose pasivo</label>');
    dataXML.push('        <label id="7" color="FF8000">loose</label>');
    dataXML.push('        <label id="8" color="A00000">loose agresivo</label>');
    
    //verdes fish
    dataXML.push('        <label id="9" color="98FF98">fish pasivo</label>');
    dataXML.push('        <label id="10" color="FF00">fish</label>');
    dataXML.push('        <label id="11" color="254117">maniaco</label>');
    
    dataXML.push('    </labels>');

    dataXML = dataXML.concat(JSON2XML(dataJSON));
    dataXML.push('</notes>');
    
    Deno.writeTextFileSync(config.notesFileName, dataXML.join("\n"));  
    Deno.copyFileSync(config.notesFileName, config.PSNotesPath + config.notesFileName);
    
}

main();

//    for (const dirEntry of Deno.readDirSync('/home/mros/.PlayOnLinux/wineprefix/PokerStarsEU/drive_c/users/mros/Local Settings/Application Data/PokerStars.ES/HandHistory/mros21/')) {
        //if (dirEntry.isFile) {
//            console.log(dirEntry.name);
       // }
//    }


//let data = ["naneros1", "naneros2", "naneros3"];

//Deno.writeTextFileSync("arra.txt", data.join("\n"));

//console.log(data);


/*
type villano = {
  hands: number;
  vpip: number;
  pfr: number;
};

let data: {[name:string]: villano} = {};

let a = "hola"

data[a] = {hands: 7, vpip: 4, pfr: 1};
data["ho"] = {hands: 7, vpip: 2, pfr: 1};
Deno.writeTextFileSync("prb.json", JSON.stringify(data));
console.log(data);
*/
