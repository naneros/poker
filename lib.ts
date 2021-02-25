
export let findStrInArray = (str: string, strA: Array<string>, ini: number): number => {
    for (let i = ini; i < strA.length; i++) {
        if (strA[i].includes(str)) return i;
    }
    return -1;
}

export const runFun = async (command: string): Promise<string> => {

    let result: string = "error";
    
    let p = Deno.run({
        cmd: ["bash", "-c", command],
        stdout: "piped",
//        stderr: "piped",
    });

    const { code } = await p.status();
    if (code === 0) {
        const rawOutput = await p.output();
        result = new TextDecoder().decode(rawOutput);
    };

    p.close();

    return result;     
}

