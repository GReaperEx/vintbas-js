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
        const nextLexeme = (lineStr) => {
            let type, token = "";
            let index = 0;

            while (lineStr[index].trim() === "") {
                ++index;
            }
            if (index >= lineStr.length) {
                return [ undefined, lineStr.substr(index) ];
            }

            if (lineStr[index] === '"') {
                for (index = index + 1; index < lineStr.length && lineStr[index] !== '"'; ++index) {
                    token += lineStr[index];
                }
                if (index === lineStr.length) {
                    token += "\b";
                }
                type = this.TOKTYPES.STRING;
                return [ { type: type, value: token }, lineStr.substr(index + 1) ];
            }

            const restOfLine = lineStr.substr(index);
            const foundKeyword = this.KEYWORDS.find((val) => restOfLine.startsWith(val));
            if (foundKeyword) {
                token = foundKeyword;
                index += foundKeyword.length;
                type = this.TOKTYPES.KEYWORD;
                return [ { type: type, value: token }, lineStr.substr(index) ];
            }

            const foundBuiltin = this.BUILTINS.find((val) => restOfLine.startsWith(val));
            if (foundBuiltin) {
                token = foundBuiltin;
                index += foundBuiltin.length;
                type = this.TOKTYPES.BUILTIN;
                return [ { type: type, value: token }, lineStr.substr(index) ];
            }

            const re = /[+-]?\d*(\.\d*)?(E[+-]?\d+)?/i;
            const found = restOfLine.match(re);
            if (found && found[0] !== "" && found.index === 0) {
                token = found[0];
                index += found[0].length;
                type = this.TOKTYPES.NUMBER;
                return [ { type: type, value: Number(token) }, lineStr.substr(index) ];
            }

            const foundOperator = this.OPERATORS.find((val) => restOfLine.startsWith(val));
            if (foundOperator) {
                token = foundOperator;
                index += foundOperator.length;
                type = this.TOKTYPES.OPERATOR;
                return [ { type: type, value: token }, lineStr.substr(index) ];
            }

            const keywordIndex = Math.min(... this.KEYWORDS.map((val) => {
                const valIndex = restOfLine.indexOf(val);
                return valIndex > -1 ? valIndex : restOfLine.length;
            }));

            const builtinIndex = Math.min(... this.BUILTINS.map((val) => {
                const valIndex = restOfLine.indexOf(val);
                return valIndex > -1 ? valIndex : restOfLine.length;
            }));

            const operatorIndex = Math.min(... this.OPERATORS.map((val) => {
                const valIndex = restOfLine.indexOf(val);
                return valIndex > -1 ? valIndex : restOfLine.length;
            }));

            const quoteIndex = restOfLine.indexOf('"');

            let minIndex = Math.min(keywordIndex, builtinIndex, operatorIndex, quoteIndex);

            token = restOfLine.substr(0, minIndex).trim();
            index += minIndex;
            type = this.TOKTYPES.VARNAME;
            return [ { type: type, value: token }, lineStr.substr(index) ];
        };

        let lexemes = [];
        let lex, restOfLine = lineStr.toUpperCase();

        while (restOfLine !== "") {
            [ lex, restOfLine ] = nextLexeme(restOfLine);
            if (!lex) {
                break;
            }
            lexemes.push(lex);
        }

        return lexemes;
    }
}