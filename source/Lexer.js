export default class Lexer {
    static TOKTYPES = {
        BUILTIN: "builtin",
        KEYWORD: "keyword",
        OPERATOR: "operator",
        NUMBER: "number",
        STRING: "string",
        VARNAME: "varname"
    };

    static KEYWORDS = [
        "AND", "DATA", "DEF", "DIM", "END", "FN", "FOR",
        "GO", "IF", "INPUT", "LET", "NEXT", "NOT", "ON", "OR",
        "PRINT", "RANDOMIZE", "READ", "REM", "RESTORE",
        "RETURN", "STEP", "STOP", "SUB", "THEN", "TO"
    ];
    static BUILTINS = [
        "ABS", "ASC", "ATN",
        "CHR$", "COS", "EXP",
        "INT", "LEFT$", "LEN",
        "LOG", "MID$", "RIGHT$",
        "RND", "SGN", "SIN",
        "SPC", "SQR", "STR",
        "TAB", "TAN", "VAL"
    ];
    static OPERATORS = [
        "+", "-", "^",
        "*", "/",
        "<=", ">=", "<>",
        "<", ">", "=",
        "(", ")", ":", ";",
        ","
    ];

    static parseLine(lineStr) {
        let lexemes = [];
        let token = "";
        let insideQuote = false;

        for (let i = 0; i < lineStr.length; ++i) {
            if (!insideQuote && lineStr[i] === "\"") {
                if (token !== "") {
                    if (!isNaN(Number(token))) {
                        lexemes.push({ type: this.TOKTYPES.NUMBER, value: Number(token) });
                    } else {
                        lexemes.push({ type: this.TOKTYPES.VARNAME, value: token });
                    }
                    token = "";
                }
                insideQuote = true;
                continue;
            }

            if (insideQuote) {
                if (lineStr[i] === "\"") {
                    lexemes.push({ type: this.TOKTYPES.STRING, value: token });
                    token = "";
                    insideQuote = false;
                } else {
                    token += lineStr[i];
                }
                continue;
            }

            const c = lineStr[i].toUpperCase().trim();
            if (c === "") {
                if (token !== "") {
                    if (!isNaN(Number(token))) {
                        lexemes.push({ type: this.TOKTYPES.NUMBER, value: Number(token) });
                    } else {
                        lexemes.push({ type: this.TOKTYPES.VARNAME, value: token });
                    }
                    token = "";
                }
                continue;
            }

            const restOfLine = lineStr.substr(i);
            const foundKeyword = this.KEYWORDS.find((val) => restOfLine.startsWith(val));
            const foundBuiltin = this.BUILTINS.find((val) => restOfLine.startsWith(val));
            const foundOperator = this.OPERATORS.find((val) => restOfLine.startsWith(val));

            if (foundKeyword || foundBuiltin || foundOperator) {
                if (token !== "") {
                    if (!isNaN(Number(token))) {
                        lexemes.push({ type: this.TOKTYPES.NUMBER, value: Number(token) });
                    } else {
                        lexemes.push({ type: this.TOKTYPES.VARNAME, value: token });
                    }
                    token = "";
                }

                if (foundKeyword) {
                    lexemes.push({ type: this.TOKTYPES.KEYWORD, value: foundKeyword });
                    i += foundKeyword.length - 1;
                } else if (foundBuiltin) {
                    lexemes.push({ type: this.TOKTYPES.BUILTIN, value: foundBuiltin });
                    i += foundBuiltin.length - 1;
                } else if (foundOperator) {
                    lexemes.push({ type: this.TOKTYPES.OPERATOR, value: foundOperator });
                    i += foundOperator.length - 1;
                }
            } else {
                token += c;
            }
        }
        if (token !== "") {
            if (insideQuote) {
                // TODO: Should I throw an error here?
                lexemes.push({ type: this.TOKTYPES.STRING, value: token });
            } else if (!isNaN(Number(token))) {
                lexemes.push({ type: this.TOKTYPES.NUMBER, value: Number(token) });
            } else {
                lexemes.push({ type: this.TOKTYPES.VARNAME, value: token });
            }
        }

        return lexemes;
    }
}