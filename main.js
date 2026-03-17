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
let objects = {};
let callStack = [];
let modules = {};

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
    if (command === "help") {
        locked = true;

        if (split[1] === "fscript") {
            type("FScript commands:");
            type("var [name] [value]");
            type("set [var]");
            type("array [name] ... endarray");
            type("get [array] [index] [var]");
            type("setitem [array] [index] [val]");
            type("length [array] [var]");
            type("object [name]");
            type("setprop [obj] [key] [val]");
            type("add [v1] [v2] [out]");
            type("subtract [v1] [v2] [out]");
            type("multiply [v1] [v2] [out]");
            type("divide [v1] [v2] [out]");
            type("random [min] [max] [out]");
            type("if [v1] [op] [v2] ... endif");
            type("loop [count] ... endloop");
            type("for [var] [start] [end] ... endfor");
            type("break / continue");
            type("input [var]");
            type("print [text/var]");
            type("type [text]");
            type("function [name] [params] ... endfunction");
            type("return [value]");
            type("writefile [file] [text]");
            type("readfile [file] [var]");
            prev = 0;
        } else {
            type("FTerm commands:");
            type("clear / history / ls");
            type("touch [filename] / nano [filename] / rm [filename]");
            type("cat [filename]");
            type("say [message] / type [message]");
            type("run [filename]");
            type("For FScript help: help fscript");
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


function FScript(lines, scope = {...vars}){

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
            scope[split[1]] = process(split.slice(2).join(" "), scope);
        }

        else if (command === "set"){
            scope[split[1]] = process(split.slice(2).join(" "), scope);
        }

        else if (command === "array"){
            let name = split[1];
            arrays[name] = [];
            i++;

            while (lines[i].trim() !== "endarray"){
                arrays[name].push(process(lines[i].trim(), scope));
                i++;
            }
        }

        else if (command === "push"){
            let name = split[1];
            let val = process(split[2], scope);

            if (arrays[name]) arrays[name].push(val);
        }

        else if (command === "get"){
            let name = split[1];
            let index = process(split[2], scope);
            let result = split[3];

            if (arrays[name]) scope[result] = arrays[name][index];
        }

        else if (command === "setitem"){
            let name = split[1];
            let index = process(split[2], scope);
            let val = process(split[3], scope);

            if (arrays[name]) arrays[name][index] = val;
        }

        else if (command === "length"){
            let name = split[1];
            let result = split[2];

            if (arrays[name]) scope[result] = arrays[name].length;
        }

        else if (command === "object"){
            objects[split[1]] = {};
        }

        else if (command === "setprop"){
            let obj = split[1];
            let key = split[2];
            let val = process(split[3], scope);

            if (objects[obj]) objects[obj][key] = val;
        }

        else if (command === "print"){
            let text = "";

            for (let j=1;j<split.length;j++){
                text += process(split[j], scope) + " ";
            }

            textarea.innerText += "\n" + text.trim();
        }

        else if (command === "add"){
            scope[split[3]] =
                process(split[1], scope) +
                process(split[2], scope);
        }

        else if (command === "subtract"){
            scope[split[3]] =
                process(split[1], scope) -
                process(split[2], scope);
        }

        else if (command === "multiply"){
            scope[split[3]] =
                process(split[1], scope) *
                process(split[2], scope);
        }

        else if (command === "divide"){
            scope[split[3]] =
                process(split[1], scope) /
                process(split[2], scope);
        }

        else if (command === "if"){

            let left = process(split[1], scope);
            let op = split[2];
            let right = process(split[3], scope);

            let condition = false;

            if (op===">") condition=left>right;
            if (op==="<") condition=left<right;
            if (op==="==") condition=left==right;
            if (op==="!=") condition=left!=right;
            if (op===">=") condition=left>=right;
            if (op==="<=") condition=left<=right;

            if (!condition){
                while(lines[i].trim()!=="endif") i++;
            }
        }

        else if (command === "loop"){

            let count = process(split[1], scope);

            if (!scope.loops) scope.loops=[];

            scope.loops.push({
                start:i+1,
                remaining:count
            });
        }

        else if (command === "endloop"){

            let loop=scope.loops[scope.loops.length-1];

            loop.remaining--;

            if (loop.remaining>0){
                i=loop.start-1;
            }else{
                scope.loops.pop();
            }
        }

        else if (command === "for"){

            let name = split[1];
            let start = process(split[2], scope);
            let end = process(split[3], scope);

            if (!scope.fors) scope.fors=[];

            scope[name]=start;

            scope.fors.push({
                var:name,
                end:end,
                startLine:i
            });
        }

        else if (command === "endfor"){

            let loop=scope.fors[scope.fors.length-1];

            scope[loop.var]++;

            if (scope[loop.var] <= loop.end){
                i = loop.startLine;
            }else{
                scope.fors.pop();
            }
        }

        else if (command === "break"){

            while(lines[i] &&
                 lines[i].trim()!=="endloop" &&
                 lines[i].trim()!=="endfor"){
                i++;
            }
        }

        else if (command === "continue"){

            while(lines[i] &&
                 lines[i].trim()!=="endloop" &&
                 lines[i].trim()!=="endfor"){
                i++;
            }
            i--;
        }

        else if (command === "random"){

            let min=process(split[1], scope);
            let max=process(split[2], scope);
            let out=split[3];

            scope[out]=Math.floor(Math.random()*(max-min+1))+min;
        }

        else if (command === "wait"){

            let time = process(split[1], scope);

            setTimeout(()=>{
                FScript(lines.slice(i+1), scope);
            },time);

            return;
        }

        else if (command === "input"){

            let name = split[1];

            inputMode=true;
            inputValue=name;

            inputEnd=()=>{
                FScript(lines.slice(i+1), scope);
            };

            return;
        }

        else if (command === "function"){

            let name=split[1];
            let params=split.slice(2);

            functions[name]={params:params,body:[]};

            i++;

            while(lines[i].trim()!=="endfunction"){
                functions[name].body.push(lines[i]);
                i++;
            }
        }

        else if (command === "return"){

            let value = process(split[1], scope);
            return {return:value};
        }

        else if (functions[command]){

            let func = functions[command];
            let local = {...scope};

            for (let j=0;j<func.params.length;j++){
                local[func.params[j]] =
                    process(split[j+1], scope);
            }

            let result = FScript(func.body, local);

            let outVar = split[func.params.length+1];

            if (outVar){
                scope[outVar] = result?.return;
            }
        }
        
        else if (command === "writefile"){

            let name=split[1];
            let text=split.slice(2)
                .map(v=>process(v,scope))
                .join(" ");

            files[name]=[text];
        }

        else if (command === "readfile"){

            let name=split[1];
            let out=split[2];

            if (files[name]){
                scope[out]=files[name].join("\n");
            }
        }

        else{
            runCommand(command, split);
        }

        i++;
    }

    return scope;
}

function process(v, scope){

    if (typeof v !== "string") return v;

    if (v.startsWith("$")){
        let name = v.slice(1);

        if (name.includes(".")){
            let [obj,key] = name.split(".");
            if (objects[obj]) return objects[obj][key];
        }

        if (name.includes("[")){
            let arrName = name.split("[")[0];
            let index = process(name.split("[")[1].replace("]",""), scope);
            if (arrays[arrName]) return arrays[arrName][index];
        }

        if (scope[name] !== undefined) return scope[name];
        return "";
    }

    if (!isNaN(parseFloat(v))) return parseFloat(v);

    return v;
}

function evaluateExpression(expr, scope){
    try{
        return Function("vars","arrays","objects",
        "with(vars){with(arrays){with(objects){return " + expr + "}}}")(
            scope, arrays, objects
        );
    }catch{
        return expr;
    }
}

type ("Hello,");
type ("Welcome to Ferret Terminal (FTerm)!");
type ("Type 'help' for a list of commands.");

prev = 0;
