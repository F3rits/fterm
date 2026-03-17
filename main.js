let msg = "";
let history = [];
let historyIndex = -1;
const input = document.getElementById("input");
const textarea = document.getElementById("textarea");
let locked = true;
let prev = 0;
let files = {};
let current = "";
let file = [];
let fileIndex = -1;
let filemode = false;
let inputMode = false;
let inputValue = "";
let inputEnd = null;
let vars = {};
let functions = {};
let arrays = {};

const saved = localStorage.getItem("files");

if (saved){
    files = JSON.parse(saved);
}

input.innerText = "> ";

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
        if (!filemode){
        if (history.length === 0) {
            return;
        }
        if (historyIndex < history.length - 1) {
        historyIndex++;
        }
        msg = history[history.length - 1 - historyIndex];
    } else {
        if (file.length === 0) {
            return;
        }

        if (fileIndex > 0){
            fileIndex--;
        }

        msg = file[fileIndex];
        writeFile();
    }
        input.innerText = "> " + msg;
        return;
}
    if (e.key === "ArrowDown") {
      if (!filemode){
        if (history.length === 0) {
            return
        };
        if (historyIndex > 0) {
            historyIndex--;
            msg = history[history.length - 1 - historyIndex];
        }else {
            if (file.length === 0){ 
                return;
            }
            if (fileIndex < file.length - 1){
            fileIndex++;
    }
    msg = file[fileIndex] || "";
    writeFile();
}
    } else {
        if (file.length === 0) {
            return;
        }

        if (fileIndex < file.length - 1){
            fileIndex++;
            msg = file[fileIndex];
        }
    }
        input.innerText = "> " + msg;
        return;
    }
    if (e.key === "Enter" && !locked) {
        send();
    }

    if (e.key === "Backspace") {
        msg = msg.slice(0, -1);
    }

    if (e.key.length === 1){
    msg += e.key;
    }
    input.innerText = "> " + msg;
});

function send(){

if (inputMode){
    vars[inputValue] = msg;
    inputMode = false;

    if (inputEnd){
        textarea.innerText += "\n" + "> " + msg;
        inputEnd();
    }

    msg = "";
    return;
}

if (filemode){

    if (msg === "save"){
        files[current] = file;
        localStorage.setItem("files", JSON.stringify(files));
        filemode = false;
        fileIndex = -1;
        textarea.innerText = "";
        say(current + " saved.");
        current = "";
        msg = "";
        return;
    }

    if (fileIndex === -1){
        fileIndex = 0;
    }

    file[fileIndex] = msg;

    fileIndex++;

    if (fileIndex >= file.length){
        file.push("");
    }

    writeFile();

    msg = file[fileIndex] || "";
    return;
}
    historyIndex = -1;

    textarea.innerText += "\n" + "> " + msg;
    input.innerText = "> ";

    history.push(msg);

    const split = msg.split(" ");
    const command = split[0];

    runCommand(command, split);

    msg = "";
}

function runCommand(command, split){
    if (command === "help"){
        if (split[1] === "fscript"){
            locked = true;
            type("FScript is a simple programming language for FTerm.");
            type("Commands:");
            type(" - var [name] [value] (variables must be called using the $ prefix)");
            type(" - array [name]");
            type(" - endarray");
            type(" - get [array] [index] [var]");
            type(" - setitem [array] [index] [val]");
            type(" - length [array] [var]")
            type(" - set [var]");
            type(" - print [text/var]");
            type(" - if [var1] [operator] [var2] (>, <, ==)");
            type(" - endif");
            type(" - loop [count]");
            type(" - endloop");
            type(" - input [var]");
            type(" - function [name]")
            type(" - endfunction");
            type(" - add [var1] [var2] [outputVar]");
            type(" - subtract [var1] [var2] [outputVar]");
            type(" - multiply [var1] [var2] [outputVar]");
            type(" - divide [var1] [var2] [outputVar]");
            prev = 0;
        }else{
            locked = true;
            type("Available commands:");
            type(" - clear");
            type(" - history");
            type(" - touch [filename]");
            type(" - nano [filename]");
            type(" - rm [filename]");
            type(" - ls");
            type(" - cat [filename]");
            type(" - say [message]");
            type(" - type [message]");
            type(" - run [filename]");
            type("For help on FScript run 'help fscript'.");
            prev = 0;
        }
        } else if (command === "clear"){
            textarea.innerText = "";
        } else if (command === "history"){
            say(history.join(", "));
        } else if (command === "calc"){

            const expression = split.slice(1).join(" ");

            if (!expression){
                say("Usage: calc [expression]");
                return;
            }

            try{
                const result = Function("return (" + expression + ")")();
                say(String(result));
            }catch{
                say("Invalid expression.");
            }

        } else if (command === "touch"){
        const name = split[1];
        if (!name){
            say("Usage: touch [filename]");
            return;
        }
        if (files[name]){
            say("File already exists: " + name);
            return;
        }
        files[name] = [];
        localStorage.setItem("files", JSON.stringify(files));
        say("Created " + name + "! Use 'nano " + name + "' to edit the file.");
        }
        else if (command === "nano"){
                const name = split[1];
        if (!files[name]){
            say("File not found: " + name);
            return;
        }

        current = name;
        file = files[name];
        filemode = true;
        fileIndex = file.length - 1;
        textarea.innerText = "Editing " + name + ". Type 'save' to save and exit.";

        for (let i = 0; i < file.length; i++){
            textarea.innerText += "\n" + file[i];
        }

        locked = false;
    }
    else if (command === "rm"){
        const name = split[1];
        if (files[name]){
            delete files[name];
            localStorage.setItem("files", JSON.stringify(files));
            say("File deleted: " + name);
        } else {
            say("File not found: " + name);
        }
    }
    else if (command === "ls"){
        let names = [];

        for (let name in files){
            names.push(name);
        }
        if (names.length === 0){
            say("No files.");
        } else {
            say(names.join(", "));
        }
    }
    else if (command === "cat"){
        const name = split[1];
        if (!files[name]){
            say("File not found: " + name);
            return;
        }
        const content = files[name];
        if (content.length === 0){
            say("(empty file)");
            return;
        }
        say(content.join("\n"));
    }
    else if (command === "print"){
        textarea.innerText += "\n" + split.slice(1).join(" ");
    }
    else if (command === "type"){
        type(split.slice(1).join(" "));
    }
    else if (command === "run"){
        const name = split[1];

        if (!files[name]){
            say("File not found: " + name);
            return;
        }

        FScript(files[name]);
    }
    else {
        say("Unknown command: " + command);
    } 
}

function say(msg){
    locked = true;
    if (textarea.innerText.length > 0){
        textarea.innerText += "\n";
    }
    for (let i = 0; i < msg.length; i++){
        setTimeout(() => {
            textarea.innerText += msg[i];
            if (i === msg.length - 1){
                locked = false;
            }
        }, i * 30);
    }
}

function type (msg) {
    console.log(prev);
        setTimeout(() => say(msg), prev);
        prev = prev + (30 * msg.length + 150);
}



function writeFile(){
    textarea.innerText = "";
    for (let i = 0; i < file.length; i++){
        if (i === fileIndex){
            textarea.innerText += (i === 0 ? "" : "\n") + "> " + file[i];
        } else {
            textarea.innerText += (i === 0 ? "" : "\n") + "  " + file[i];
        }
    }

}


function FScript(lines){
    let i = 0;

    while (i < lines.length){
        let line = lines[i].trim();
        if (line === ""){
            i++;
            continue;
        }

        let split = line.split(" ");
        let command = split[0];

        if (command === "var"){
            vars[split[1]] = process(split[2], vars);
        }else if (command === "array"){
            let name = split[1];
            arrays[name] = [];
            i++;
            while (lines[i].trim() !== "endarray") {
                let val = process(lines[i].trim(), vars);
                arrays[name].push(val);
                i++;
            }
        } else if (command === "push"){
            let name = split[1];
            let val = process(split[2], vars);

            if (arrays[name]){
                arrays[name].push(val);
            }
        } else if (command === "get"){
            let name = split[1];
            let index = process(split[2], vars);
            let result = split[3];

            if (arrays[name]){
                vars[result] = arrays[name][index];
            }
        } else if (command === "setitem"){
            let name = split[1];
            let index = process(split[2], vars);
            let val = process(split[3], vars);

            if (arrays[name]){
                arrays[name][index] = val;
            }
        } else if (command === "length"){
            let name = split[1];
            let result = split[2];

            if (arrays[name]){
                vars[result] = arrays[name].length;
            }
        } else if (command === "print"){
            let text = "";
            for (let i = 1; i < split.length; i++) {
                text += process(split[i], vars) + " ";
            }
            text = text.trim();
            textarea.innerText += "\n" + text;
        } else if (command === "add"){
            vars[split[3]] = process(split[1], vars) +  process(split[2], vars);
        } else if (command === "if"){

            let left = process(split[1], vars);
            let op = split[2];
            let right = process(split[3], vars);

            let condition = false;

            if (op === ">") condition = left > right;
            if (op === "<") condition = left < right;
            if (op === "==") condition = left == right;
            if (op === ">=") condition = left >= right;
            if (op === "<=") condition = left <= right;
            if (op === "!=") condition = left != right;

            if (!condition){
                while (lines[i].trim() !== "endif"){
                    i++;
                }
            }
        }else if (command === "loop"){
            let count = process(split[1], vars);
            if (!vars.loops) vars.loops = [];
            vars.loops.push({
                start: i + 1,
                remaining: count
            });
        }
        else if (command === "endloop"){
            let loop = vars.loops[vars.loops.length - 1];

            loop.remaining--;

            if (loop.remaining > 0){
                i = loop.start - 1;
            } else {
                vars.loops.pop();
            }
        } else if (command === "while"){

            let left = process(split[1], vars);
            let op = split[2];
            let right = process(split[3], vars);

            let condition = false;

            if (op === ">") condition = left > right;
            if (op === "<") condition = left < right;
            if (op === "==") condition = left == right;
            if (op === ">=") condition = left >= right;
            if (op === "<=") condition = left <= right;
            if (op === "!=") condition = left != right;

            if (!vars.whiles) vars.whiles = [];

            if (condition){
                vars.whiles.push({
                    start: i
                });
            } else {
                while (lines[i].trim() !== "endwhile"){
                    i++;
                }
            }

        } else if (command === "endwhile"){

            let loop = vars.whiles[vars.whiles.length - 1];

            if (loop){
                i = loop.start - 1;
                vars.whiles.pop();
            }

        } else if (command === "wait"){

            let time = process(split[1], vars);

            setTimeout(() => {
                FScript(lines.slice(i + 1));
            }, time);

            return;

        } else if (command === "random"){

            let min = process(split[1], vars);
            let max = process(split[2], vars);
            let out = split[3];

            vars[out] = Math.floor(Math.random() * (max - min + 1)) + min;

        } else if (command === "input"){
            let name = split[1];
            inputMode = true;
            inputValue = name;
            inputEnd = () => {
                FScript(lines.slice(i + 1));
            };

            return;
        } else if (command === "function") {
            let functionName = split[1];
            let params = split.slice(2);

            functions[functionName] = {
                params: params,
                body: []
            };

            i++;
            while (lines[i].trim() !== "endfunction") {
                functions[functionName].body.push(lines[i]);
                i++;
            }
        }else if (functions[command]){

            let func = functions[command];
            let localVars = {...vars};

            for (let j = 0; j < func.params.length; j++){
                localVars[func.params[j]] = process(split[j + 1], vars);
            }

            FScript(func.body);

        }else if (command === "set"){
            vars[split[1]] = process(split[2], vars);
        }else if (command === "subtract"){
            vars[split[3]] = process(split[1], vars) - process(split[2], vars);
        }else if (command === "multiply"){
            vars[split[3]] = process(split[1], vars) * process(split[2], vars);
        }else if (command === "divide"){
            vars[split[3]] = process(split[1], vars) / process(split[2], vars);
        }else if (command === "endif"){

        }else {
            runCommand(command, split);
        }
     i++;
    }
}

function process(v, vars){
    if (typeof v === "string" && v.startsWith("$")){
        let name = v.slice(1);
        if (name.includes("[")){
            let arrName = name.split("[")[0];
            let index = parseInt(name.split("[")[1].replace("]",""));
            if (arrays[arrName]){
                return arrays[arrName][index];
            }
        }
        if (vars[name] !== undefined){
            return vars[name];
        }
        return "";
    }
    if (!isNaN(parseFloat(v))){
        return parseFloat(v);
    }
    return v;
}

type ("Hello,");
type ("Welcome to Ferret Terminal (FTerm)!");
type ("Type 'help' for a list of commands.");

prev = 0;
