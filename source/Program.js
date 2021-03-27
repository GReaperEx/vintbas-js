import Lexer from "./Lexer.js"

export default class Program {
    constructor(inputCallback, outputCallback) {
        this.lines = [];
        this.variables = {};
        this.arrays = {};
        this.functions = {};
        this.callStack = [];
        this.data = [];

        this.inputCall = inputCallback;
        this.outputCall = outputCallback;
        this.curColumn = 0;

        this.curLine = 0;
        this.running = false;
    }

    addLine(lineStr) {
        if (lineStr.trim() !== "") {
            const lexemes = Lexer.parseLine(lineStr);
            if (lexemes[0].type !== Lexer.TOKTYPES.NUMBER || isNaN(lexemes[0].value) || lexemes[0].value < 0) {
                throw `!LINE NUMBERING ERROR IN RAW LINE ${this.lines.length+1}`;
            }

            for (const lex of lexemes) {
                if (lex.type === Lexer.TOKTYPES.STRING && lex.value.endsWith("\b")) {
                    throw `!EXPECTED CLOSING QUOTE IN LINE ${lexemes[0].value}`;
                }
                if (lex.type === Lexer.TOKTYPES.VARNAME) {
                    const regex = /^([A-Za-z]+)(\d*)$/;
                    const found = lex.value.match(regex);
                    if (!found) {
                        throw `!INVALID VARNAME IN LINE ${lexemes[0].value}`;
                    }

                    const realName = found[1].substr(0, 2) + found[2].substr(0, 1);
                    lex.value = realName;
                }
            }

            this.lines.push(lexemes);
        }
        return 0;
    }

    run() {
        this.lines.sort((a, b) => {
            return a[0].value - b[0].value;
        });
        this.curLine = 0;
        this.curColumn = 0;
        this.running = true;

        // TODO: Parse DATA values

        while (this.running) {
            this.runNextLine();
        }
    }

    runNextLine() {
        let found = true;
        let curIndex = 1;

        while (this.running && found) {
            [this.curLine, curIndex] = runStatement(this, this.lines[this.curLine], curIndex);
            [found, curIndex] = consume(this.lines[this.curLine], curIndex, Lexer.OPERATORS, ':');
        }
    }

    getVariable(varName) {
        if (varName.endsWith('$')) {
            const varValue = this.variables[varName] || "";
            return varValue;
        }

        const varValue = this.variables[varName] || 0;
        return varValue;
    }

    setVariable(varName, varValue) {
        if (varName.endsWith('$')) {
            if (typeof(varValue) !== "string") {
                return false;
            }
        } else if (varName.endsWith('%')) {
            if (typeof(varValue) !== "number" || Math.floor(varValue) !== varValue) {
                return false;
            }
        } else {
            if (typeof(varValue) !== "number") {
                return false;
            }
        }

        this.variables[varName] = varValue;
        return true;
    }

    getArrayElem(arrName, pos) {
        const arr = this.arrays[arrName] || { dims: [ 10 ] };
        if (arr.dims.length !== pos.length) {
            return [undefined, 1];
        }

        const index = pos.reduce((prev, cur, i) => {
            if (cur > arr.dims[i]) {
                return [undefined, 2];
            }
            return prev*(i !== 0 ? arr.dims[i - 1] : 0) + cur;
        }, 0);

        if (arrName.endsWith('$')) {
            const varValue = arr[index] || "";
            return varValue;
        }

        const varValue = arr[index] || 0;
        return [varValue, 0];
    }

    setArrayElem(arrName, pos, newValue) {
        const arr = this.arrays[arrName] || { dims: [ 10 ] };
        if (arr.dims.length !== pos.length) {
            return 1;
        }

        const index = pos.reduce((prev, cur, i) => {
            if (cur > arr.dims[i]) {
                return 2;
            }
            return prev*(i !== 0 ? arr.dims[i - 1] : 0) + cur;
        }, 0);

        if (arrName.endsWith('$')) {
            if (typeof(newValue) !== "string") {
                return 3;
            }
        } else if (arrName.endsWith('%')) {
            if (typeof(newValue) !== "number" || Math.floor(newValue) !== newValue) {
                return 3;
            }
        } else {
            if (typeof(newValue) !== "number") {
                return 3;
            }
        }

        arr[index] = newValue;
        this.arrays[arrName] = arr;
        return 0;
    }
}

function consume(lexemes, curIndex, type, value) {
    if (curIndex >= lexemes.length) {
        return [false, lexemes.length];
    }
    if (!type && !value) {
        return [true, curIndex + 1];
    }
    if (lexemes[curIndex].type !== type) {
        return [false, curIndex];
    }
    if (value && lexemes[curIndex].value !== value) {
        return [false, curIndex];
    }
    return [true, curIndex + 1];
}

function expect(lexemes, curIndex, type, value) {
    const [found, nextIndex] = consume(lexemes, curIndex, type, value);
    if (!found) {
        if (value) {
            throw `!EXPECTED ${type.toUpperCase()} OF VALUE '${value}' IN LINE ${lexemes[0].value}`;
        } else {
            throw `!EXPECTED ${type.toUpperCase()} IN LINE ${lexemes[0].value}`;
        }
    }
    return nextIndex;
}

function runStatement(program, lexemes, curIndex) {
    let found;

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "DATA");
    if (found) {
        return [program.curLine + 1, lexemes.length];
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "DEF");
    if (found) {
        throw `!NOT IMPLEMENTED YET IN LINE ${lexemes[0].value}`;
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "DIM");
    if (found) {
        throw `!NOT IMPLEMENTED YET IN LINE ${lexemes[0].value}`;
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "END");
    if (found) {
        program.running = false;
        return [program.curLine, curIndex];
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "FOR");
    if (found) {
        throw `!NOT IMPLEMENTED YET IN LINE ${lexemes[0].value}`;
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "GOSUB");
    if (found) {
        throw `!NOT IMPLEMENTED YET IN LINE ${lexemes[0].value}`;
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "GOTO");
    if (found) {
        throw `!NOT IMPLEMENTED YET IN LINE ${lexemes[0].value}`;
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "IF");
    if (found) {
        throw `!NOT IMPLEMENTED YET IN LINE ${lexemes[0].value}`;
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "INPUT");
    if (found) {
        throw `!NOT IMPLEMENTED YET IN LINE ${lexemes[0].value}`;
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "NEXT");
    if (found) {
        throw `!NOT IMPLEMENTED YET IN LINE ${lexemes[0].value}`;
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "ON");
    if (found) {
        throw `!NOT IMPLEMENTED YET IN LINE ${lexemes[0].value}`;
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "PRINT");
    if (found) {
        throw `!NOT IMPLEMENTED YET IN LINE ${lexemes[0].value}`;
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "RANDOMIZE");
    if (found) {
        throw `!NOT IMPLEMENTED YET IN LINE ${lexemes[0].value}`;
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "READ");
    if (found) {
        throw `!NOT IMPLEMENTED YET IN LINE ${lexemes[0].value}`;
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "REM");
    if (found) {
        return [program.curLine + 1, lexemes.length];
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "RESTORE");
    if (found) {
        throw `!NOT IMPLEMENTED YET IN LINE ${lexemes[0].value}`;
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "RETURN");
    if (found) {
        throw `!NOT IMPLEMENTED YET IN LINE ${lexemes[0].value}`;
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "STOP");
    if (found) {
        program.outputCall(`!BREAK IN LINE ${lexemes[0].value}`);
        program.running = false;
        return [program.curLine, curIndex];
    }

    // LET is the default
    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "LET");
    return impl_LET(program, lexemes, curIndex);
}

function impl_LET(program, lexemes, curIndex) {
    curIndex = expect(lexemes, curIndex, Lexer.TOKTYPES.VARNAME);
    const varName = lexemes[curIndex - 1].value;

    let found = false;
    let isArray = false;
    let arrIndices = [];

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, "(");
    if (found) {
        while (found) {
            let newVal;
            [newVal, curIndex] = evalExpression(program, lexemes, curIndex);
            arrIndices.push(newVal);
            [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, ',');
        }
        curIndex = expect(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, ")");
        isArray = true;
    }

    curIndex = expect(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, '=');
    let newValue;
    [newValue, curIndex] = evalExpression(program, lexemes, curIndex);

    if (!isArray) {
        if (!program.setVariable(varName, newValue)) {
            throw `!TYPE MISMATCH IN LINE ${lexemes[0].value}`;
        }
    } else {
        const outcome = program.setArrayElem(varName, arrIndices, newValue);
        switch (outcome) {
            case 1:
                throw `!MISMATCHED ARRAY DIMENSIONS IN LINE ${lexemes[0].value}`;
            break;
            case 2:
                throw `!OUT OF ARRAY BOUNDS IN LINE ${lexemes[0].value}`;
            break;
            case 3:
                throw `!TYPE MISMATCH IN LINE ${lexemes[0].value}`;
            break;
        }
    }
    return [program.curLine + (curIndex >= lexemes.length), curIndex];
}

// eval_stage1(program, lexemes, curIndex) {
function evalExpression(program, lexemes, curIndex) {
    let newValue, found;

    [newValue, curIndex] = eval_stage2(program, lexemes, curIndex);
    while (found) {
        let temp;
        [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "OR");
        if (found) {
            [temp, curIndex] = eval_stage2(program, lexemes, curIndex);
            newValue = (newValue !== 0) ? newValue : temp;
        }
    }

    return [newValue, curIndex];
}

function eval_stage2(program, lexemes, curIndex) {
    let newValue, found = true;

    [newValue, curIndex] = eval_stage3(program, lexemes, curIndex);
    while (found) {
        let temp;
        [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "AND");
        if (found) {
            [temp, curIndex] = eval_stage3(program, lexemes, curIndex);
            newValue = (newValue !== 0 && temp !== 0) ? newValue : 0;
        }
    }

    return [newValue, curIndex];
}

function eval_stage3(program, lexemes, curIndex) {
    let newValue, found = true;

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "NOT");
    [newValue, curIndex] = eval_stage4(program, lexemes, curIndex);
    if (found) {
        newValue = (newValue !== 0) ? 0 : -1;
    }

    return [newValue, curIndex];
}

function eval_stage4(program, lexemes, curIndex) {
    let newValue, foundOper = true;

    [newValue, curIndex] = eval_stage5(program, lexemes, curIndex);
    while (foundOper) {
        let temp;

        [foundOper, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, "=");
        if (foundOper) {
            [temp, curIndex] = eval_stage5(program, lexemes, curIndex);
            newValue = (newValue === temp) ? -1 : 0;
            continue;
        }

        [foundOper, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, "<>");
        if (foundOper) {
            [temp, curIndex] = eval_stage5(program, lexemes, curIndex);
            newValue = (newValue !== temp) ? -1 : 0;
            continue;
        }

        [foundOper, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, "<");
        if (foundOper) {
            [temp, curIndex] = eval_stage5(program, lexemes, curIndex);
            newValue = (newValue < temp) ? -1 : 0;
            continue;
        }

        [foundOper, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, "<=");
        if (foundOper) {
            [temp, curIndex] = eval_stage5(program, lexemes, curIndex);
            newValue = (newValue <= temp) ? -1 : 0;
            continue;
        }

        [foundOper, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, ">");
        if (foundOper) {
            [temp, curIndex] = eval_stage5(program, lexemes, curIndex);
            newValue = (newValue > temp) ? -1 : 0;
            continue;
        }

        [foundOper, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, ">=");
        if (foundOper) {
            [temp, curIndex] = eval_stage5(program, lexemes, curIndex);
            newValue = (newValue >= temp) ? -1 : 0;
            continue;
        }
    }

    return [newValue, curIndex];
}

function eval_stage5(program, lexemes, curIndex) {
    let newValue, foundOper = true;

    [newValue, curIndex] = eval_stage6(program, lexemes, curIndex);
    while (foundOper) {
        let temp;

        [foundOper, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, "+");
        if (foundOper) {
            [temp, curIndex] = eval_stage6(program, lexemes, curIndex);
            newValue = (newValue + temp);
            continue;
        }

        [foundOper, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, "-");
        if (foundOper) {
            [temp, curIndex] = eval_stage6(program, lexemes, curIndex);
            newValue = (newValue - temp);
            continue;
        }
    }

    return [newValue, curIndex];
}

function eval_stage6(program, lexemes, curIndex) {
    let newValue, foundOper = true;

    [newValue, curIndex] = eval_stage7(program, lexemes, curIndex);
    while (foundOper) {
        let temp;

        [foundOper, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, "*");
        if (foundOper) {
            [temp, curIndex] = eval_stage7(program, lexemes, curIndex);
            newValue = (newValue * temp);
            continue;
        }

        [foundOper, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, "/");
        if (foundOper) {
            [temp, curIndex] = eval_stage7(program, lexemes, curIndex);
            newValue = (newValue / temp);
            continue;
        }
    }

    return [newValue, curIndex];
}

function eval_stage7(program, lexemes, curIndex) {
    let newValue, foundOper = true;
    let powArray = [];

    [newValue, curIndex] = eval_stage8(program, lexemes, curIndex);
    powArray.push(newValue);
    while (foundOper) {
        let temp;

        [foundOper, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, "^");
        if (foundOper) {
            [temp, curIndex] = eval_stage8(program, lexemes, curIndex);
            powArray.push(temp);
            continue;
        }
    }
    if (powArray.length !== 1) {
        newValue = 1;
        for (let i = powArray - 1; i >= 0; --i) {
            newValue = Math.pow(powArray[i], newValue);
        }
    }

    return [newValue, curIndex];
}

function eval_stage8(program, lexemes, curIndex) {
    let sign, foundOper = true;

    sign = 1;
    while (foundOper) {
        [foundOper, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, "+");
        if (foundOper) {
            continue;
        }

        [foundOper, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, "-");
        if (foundOper) {
            sign *= -1;
            continue;
        }
    }

    let newValue;
    [newValue, curIndex] = eval_stage9(program, lexemes, curIndex);

    return [sign*newValue, curIndex];
}

function eval_stage9(program, lexemes, curIndex) {
    let newValue, found;

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, "(");
    if (found) {
        [newValue, curIndex] = evalExpression(program, lexemes, curIndex);
        curIndex = expect(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, ")");
        return [newValue, curIndex];
    }

    [newValue, curIndex] = eval_var_builtin(program, lexemes, curIndex);
    if (newValue !== undefined) {
        return [newValue, curIndex];
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR);
    if (found) {
        throw `!SYNTAX ERROR IN LINE ${lexemes[0].value}`;
    }

    [found, curIndex] = consume(lexemes, curIndex);
    if (!found) {
        throw `!SYNTAX ERROR IN LINE ${lexemes[0].value}`;
    }

    newValue = lexemes[curIndex - 1].value;
    return [newValue, curIndex];
}

function eval_var_builtin(program, lexemes, curIndex) {
    let newValue, found, varName;

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.BUILTIN);
    if (found) {
        let foundParam = true, params = [];
        curIndex = expect(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, '(');

        while (foundParam) {
            [newValue, curIndex] = evalExpression(program, lexemes, curIndex);
            params.push(newValue);
            [foundParam, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, ',');
        }
        newValue = runBuiltin(program, lexemes[0].value, lexemes[curIndex - 1].value, params);

        curIndex = expect(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, ')');
        return [newValue, curIndex];
    }

    [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.VARNAME);
    if (found) {
        let isArray = false;
        let arrIndices = [];

        varName = lexemes[curIndex - 1].value;

        [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, "(");
        if (found) {
            while (found) {
                let newVal;
                [newVal, curIndex] = evalExpression(program, lexemes, curIndex);
                arrIndices.push(newVal);
                [found, curIndex] = consume(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, ',');
            }
            curIndex = expect(lexemes, curIndex, Lexer.TOKTYPES.OPERATOR, ")");
            isArray = true;
        }

        if (!isArray) {
            newValue = program.getVariable(varName);
        } else {
            let outcome;
            [newValue, outcome] = program.getArrayElem(varName, arrIndices);
            switch (outcome) {
                case 1:
                    throw `!MISMATCHED ARRAY DIMENSIONS IN LINE ${lexemes[0].value}`;
                break;
                case 2:
                    throw `!OUT OF ARRAY BOUNDS IN LINE ${lexemes[0].value}`;
                break;
            }
        }

        return [newValue, curIndex];
    }

    return [newValue, curIndex];
}

var randSeed = Math.floor(Math.random()*4294967296);

function runBuiltin(program, line, funcName, params) {
    let result;
    switch (funcName) {
        case "ABS":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "number") {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = Math.abs(params[0]);
        break;
        case "ASC":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "string") {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = params[0].charCodeAt(0);
        break;
        case "ATN":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "number") {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = Math.atan(params[0]);
        break;
        case "CHR$":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "number") {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = String.fromCharCode(params[0]);
        break;
        case "COS":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "number") {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = Math.cos(params[0]);
        break;
        case "EXP":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "number") {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = Math.exp(params[0]);
        break;
        case "INT":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "number") {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = Math.floor(params[0]);
        break;
        case "LEFT$":
            if (params.length !== 2) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "string" || typeof(params[1]) !== "number" || params[1] < 0) {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = params[0].substr(0, params[1]);
        break;
        case "LEN":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "string") {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = params[0].length;
        break;
        case "LOG":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "number") {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = Math.log(params[0]);
        break;
        case "MID$":
            if (params.length < 2 || params.length > 3) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "string" || typeof(params[1]) !== "number" || params[1] < 1 || (params[2] && params[2] < 0)) {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = params[0].substr(params[1] - 1, params[2]);
        break;
        case "RIGHT$":
            if (params.length !== 2) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "string" || typeof(params[1]) !== "number" || params[1] < 1) {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = params[0].substr(-params[1]);
        break;
        case "RND":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "number") {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }

            if (params[0] > 0) {
                randSeed = ((randSeed*214013 + 2531011) >> 16) & 0x7FFF;
                result = randSeed/0x8000;
            } else if (params[0] < 0) {
                randSeed = Math.floor(params[0]);
            } else {
                result = randSeed/0x8000;
            }
        break;
        case "SGN":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "number") {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = Math.sign(params[0]);
        break;
        case "SIN":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "number") {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = Math.sin(params[0]);
        break;
        case "SPC":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "number") {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = " ".repeat(params[0]);
        break;
        case "SQR":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "number" || params[0] < 0) {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = Math.sqrt(params[0]);
        break;
        case "STR":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "number") {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = params[0].toString();
        break;
        case "TAB":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "number" || params[0] < 0) {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }

            const dist = params[0] - program.curColumn;
            result = " ".repeat(dist >= 0 ? dist : 0);
        break;
        case "TAN":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "number" || params[0] < 0) {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }
            result = Math.tan(params[0]);
        break;
        case "VAL":
            if (params.length !== 1) {
                throw `!WRONG NUMBER OF ARGUMENTS IN LINE ${line}`;
            }
            if (typeof(params[0]) !== "string") {
                throw `!INVALID ARGUMENT IN LINE ${line}`;
            }

            try {
                result = Number(params[0]);
            } catch (error) {
                result = 0;
            }
        break;
    }
    return result;
}

