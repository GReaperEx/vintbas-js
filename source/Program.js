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
                    const found = regex.match(lex.value);
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
}

function consume(lexemes, curIndex, type, value) {
    if (curIndex >= lexemes.length) {
        return [false, lexemes.length];
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

    // LET is implicit
    consume(lexemes, curIndex, Lexer.TOKTYPES.KEYWORD, "LET");
    throw `!NOT IMPLEMENTED YET IN LINE ${lexemes[0].value}`;
}