
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

let main = () => {

    let dataJSON: {[name:string]: villano} = {};
    let dataJSONHud: {[name:string]: villano} = {};
    try {
        dataJSON = JSON.parse(Deno.readTextFileSync(config.dataJSONName));
    } catch(e) {
        console.log(e.message);
    }

    console.log("Hello");
    while (true) {

        for (const dirEntry of Deno.readDirSync(config.PSHistoryPath)) {
            if (dirEntry.isFile) {
                let data: Array<string> = getPreflop(Deno.readTextFileSync(config.PSHistoryPath + dirEntry.name).split("\r\n"));
                dataJSON = data2JSON(data, dataJSON);

                Deno.copyFileSync(config.PSHistoryPath + dirEntry.name, "hands/" + dirEntry.name);
                Deno.remove(config.PSHistoryPath + dirEntry.name);
            }
        }
        


        Deno.sleepSync(2000);
    }

/*
    for (const dirEntry of Deno.readDirSync(config.PSHistoryPath)) {
        if (dirEntry.isFile) {
            let data: Array<string> = getPreflop(Deno.readTextFileSync(config.PSHistoryPath + dirEntry.name).split("\r\n"));
            dataJSON = data2JSON(data, dataJSON);

            Deno.copyFileSync(config.PSHistoryPath + dirEntry.name, "hands/" + dirEntry.name);
            Deno.remove(config.PSHistoryPath + dirEntry.name);
        }
    }
    Deno.writeTextFileSync(config.dataJSONName, JSON.stringify(dataJSON));
*/
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
