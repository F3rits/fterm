let msg = "";
let history = [];
let historyIndex = -1;
const input = document.getElementById("input");
const textarea = document.getElementById("textarea");
let locked = true;
let prev = 0;
let files = {};
let currentFile = "";
let file = [];
let fileIndex = -1;
let filemode = false;
let inputMode = false;
let inputVal = "";
let inputEnd = null;
let vars = {};

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
    vars[inputVal] = msg;
    inputMode = false;

    if (inputEnd){
        inputEnd();
    }

    msg = "";
    return;
}

if (filemode){

    if (msg === "save"){
        files[currentFile] = file;
        localStorage.setItem("files", JSON.stringify(files));
        filemode = false;
        fileIndex = -1;
        textarea.innerText = "";
        say(currentFile + " saved.");
        currentFile = "";
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

    if (command === "help"){
        if (split[1] === "fscript"){
            locked = true;
            type("FScript is a simple programming language for FTerm.");
            type("Commands:");
            type(" - var [name] [value]");
            type(" - print [text/var]");
            type(" - add [var1] [var2] [resultVar]");
            type(" - if [var1] [operator] [var2] (>, <, ==)");
            type(" - endif");
            type(" - loop [count]");
            type(" - endloop");
            type(" - input [varName]");
            prev = 0;
        }else{
            locked = true;
            type("Available commands:");
            type(" - clear");
            type(" - history");
            type(" - add [numbers]");
            type(" - subtract [num1] [num2]");
            type(" - multiply [numbers]");
            type(" - divide [num1] [num2]");
            type(" - avg [numbers]");
            type(" - median [numbers]");
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
    }
    else if (command === "clear"){
        textarea.innerText = "";
    }
    else if (command === "add"){
        let numbers = [];
        for (let i = 1; i < split.length; i++) {
            numbers.push(parseFloat(split[i]));
        }

        let sum = 0;
        for (let i = 0; i < numbers.length; i++){
            sum += numbers[i];
        }
        if (!isNaN(sum)){
            say("Result: " + sum);
        } else {
            say("Invalid numbers provided");
        }
    }
    else if (command === "subtract"){
        let num1 = parseFloat(split[1]);
        let num2 = parseFloat(split[2]);

        if (!isNaN(num1) && !isNaN(num2)){
            say("Result: " + (num1 - num2));
        } else {
            say("Invalid numbers provided");
        }
    }
    else if (command === "multiply"){
        let numbers = [];
        for (let i = 1; i < split.length; i++) {
            numbers.push(parseFloat(split[i]));
        }

        let product = 1;

        for (let i = 0; i < numbers.length; i++){
            product *= numbers[i];
        }

        if (isNaN(product)){
            say("Invalid numbers provided");
        } else {
             say("Result: " + product);
    }
    }
    else if (command === "divide"){
        let num1 = parseFloat(split[1]);
        let num2 = parseFloat(split[2]);

        if (!isNaN(num1) && !isNaN(num2) && num2 !== 0){
            say("Result: " + (num1 / num2));
        } else {
            say("Invalid numbers provided");
        }
    }
    else if (command === "avg"){
        let numbers = [];
        for (let i = 1; i < split.length; i++) {
            numbers.push(parseFloat(split[i]));
        }

        let sum = 0;

        for (let i = 0; i < numbers.length; i++){
            sum += numbers[i];
        }

        let average = sum / numbers.length;

        if (isNaN(average)){
            say("Invalid numbers provided");
        } else {
            say("Result: " + average);
        }
    }else if (command === "median"){
        let numbers = [];
        for (let i = 1; i < split.length; i++) {
            numbers.push(parseFloat(split[i]));
        }

        for (let j = 0; j < numbers.length; j++){
            for (let i = 0; i < numbers.length - 1; i++){
                if (numbers[i] > numbers[i + 1]){
                    let temp = numbers[i];
                    numbers[i] = numbers[i + 1];
                    numbers[i + 1] = temp;
                }
            }
        }
        let median;

        if (numbers.length % 2 === 0){
            median = (numbers[numbers.length/2 - 1] + numbers[numbers.length/2]) / 2;
        } else {
            median = numbers[Math.floor(numbers.length/2)];
        }
        if (isNaN(median)){
            say("Invalid numbers provided");
        } else {
            say("Result: "+median);
        }
        } else if (command === "history"){
            say(history.join(", "));
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

        currentFile = name;
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

    msg = "";
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
        } else if (command === "print"){
            let text = "";
            for (let i = 1; i < split.length; i++) {
                text += process(split[i], vars) + " ";
            }
            text = text.trim();
            textarea.innerText += "\n" + text;
        } else if (command === "add"){
            vars[split[3]] =
                process(split[1], vars) +
                process(split[2], vars);
        } else if (command === "if"){

            let left = process(split[1], vars);
            let op = split[2];
            let right = process(split[3], vars);

            let condition = false;

            if (op === ">") condition = left > right;
            if (op === "<") condition = left < right;
            if (op === "==") condition = left == right;

            if (!condition){
                while (lines[i] !== "endif"){
                    i++;
                }
            }
        } else if (command === "loop"){
            let count = process(split[1], vars);
            let start = i + 1;

            while (lines[i] !== "endloop"){
                i++;
            }

            let end = i;

            for (let j = 0; j < count; j++){
                FScript(lines.slice(start, end));
            }
        }else if (command === "input"){
            let name = split[1];
            inputMode = true;
            inputVal = name;
            inputEnd = () => {
            FScript(lines.slice(i + 1));
    };

    return;
}
     i++;
    }
}

function process(v, vars){
    if (typeof v === "string" && v.startsWith("$")){
        let name = v.slice(1);
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
