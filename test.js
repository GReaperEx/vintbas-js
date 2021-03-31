import Program from "./source/Program.js"

const tests = [
    { code: [ `10 PRINT 42` ], input: "", output: "  42\n" },
    { code: [ `10 PRINT 42;` ], input: "", output: "  42" },
    { code: [ `10 PRINT 42,24;` ], input: "", output: "  42            24" },
    { code: [ `10 PRINT 1;2;3;4` ], input: "", output: "  1  2  3  4\n" },
    { code: [ `10 PRINT 4*5+2` ], input: "", output: "  22\n" },
    { code: [ `10 PRINT 4+5*2` ], input: "", output: "  14\n" },
    { code: [ `10 PRINT (4+5)*2` ], input: "", output: "  18\n" },
    { code: [ `10 PRINT 2^2^3` ], input: "", output: "  256\n" },
    { code: [ `10 PRINT 1+2+3+4+5` ], input: "", output: "  15\n" },
    { code: [ `10 PRINT 1*2*3*4*5` ], input: "", output: "  120\n" },
    { code: [ `10 PRINT 5/2/2.5` ], input: "", output: "  1\n" },
    { code: [ `10 PRINT 5-4-3-2-1` ], input: "", output: " -5\n" },
    { code: [ `10 PRINT 9/0` ], input: "", output: "!DIVISION BY ZERO IN LINE 10\n" },
    { code: [ `10 PRINT "HELLO"; " WORLD"` ], input: "", output: "HELLO WORLD\n" },
    { code: [ `10 PRINT "HELLO", "WORLD"` ], input: "", output: "HELLO         WORLD\n" },

    { code: [ `10 PRINT 14 = 5` ], input: "", output: "  0\n" },
    { code: [ `10 PRINT "HELLO" = "HELLO"` ], input: "", output: " -1\n" },
    { code: [ `10 PRINT 14 <> 5` ], input: "", output: " -1\n" },
    { code: [ `10 PRINT 14 > 5` ], input: "", output: " -1\n" },
    { code: [ `10 PRINT 14 < 5` ], input: "", output: "  0\n" },

    { code: [ `10 PRINT 0 > 1 OR 1 > 0` ], input: "", output: " -1\n" },
    { code: [ `10 PRINT 0 > 1 AND 1 > 0` ], input: "", output: "  0\n" },
    { code: [ `10 PRINT NOT 1 > 0` ], input: "", output: "  0\n" },
    { code: [ `10 PRINT NOT 0 AND -1 OR 0` ], input: "", output: " -1\n" },
    { code: [ `10 PRINT NOT -1 OR -1 AND 0` ], input: "", output: "  0\n" },
    { code: [ `10 PRINT 2+3*5 = 17` ], input: "", output: " -1\n" },
    { code: [ `10 PRINT 0 OR 5` ], input: "", output: "  5\n" },
    { code: [ `10 PRINT 4 AND 5` ], input: "", output: "  4\n" },
];
let testCounter = 0;

tests.forEach((test) => {
    const output = performTest(test.code, test.input);
    if (output !== test.output) {
        console.log("\nCode:");
        test.code.forEach(line => console.log(`  ${line}`));
        console.log(`Input: ${JSON.stringify(test.input)}`);
        console.log(`Expected output: ${JSON.stringify(test.output)}`);
        console.log(`Actual output  : ${JSON.stringify(output)}`);
    } else {
        ++testCounter;
    }
});

console.log(`\n${testCounter} out of ${tests.length} tests passed.\n`);

function performTest(code, input) {
    let output = "";
    let program = new Program(() => "", (str) => output += str);

    try {
        code.forEach((line) => {
            program.addLine(line);
        });
        program.run();
    } catch (error) {
        output += `${error}\n`;
    }

    return output;
}