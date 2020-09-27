import {Puzzle, PuzzleSymbol, PuzzleNumber} from './PuzzleItem'
import {puzzle, stopRunningSolver} from 'cspuz'

type AnswerType = { answer?: Puzzle, error?: string };

export async function solveUrl(url: string): Promise<AnswerType> {
    const splitUrl = url.split("?");
    if (splitUrl.length !== 2) {
        return { error: "invalid url" };
    }
    const tokens = splitUrl[1].split("/");
    const puzzleType = tokens[0];
    if (puzzleType === "nurikabe") {
        return solveNurikabe(tokens);
    } else if (puzzleType === "slither") {
        return solveSlitherlink(tokens);
    } else if (puzzleType === "yajilin") {
        return solveYajilin(tokens);
    }
    return { error: "unsupported puzzle type: " + puzzleType };
}

export function stopSolver() {
    stopRunningSolver();
}

async function solveNurikabe(tokens: string[]): Promise<AnswerType> {
    if (tokens.length !== 4) return { error: "invalid url" };
    const width = parseInt(tokens[1]);
    const height = parseInt(tokens[2]);
    const body = tokens[3];
    let problem = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) row.push(-1);
        problem.push(row);
    }

    let pos = 0;
    let strIndex = 0;
    while (strIndex < body.length) {
        if (body.charCodeAt(strIndex) >= 103) { // 'g'
            pos += body.charCodeAt(strIndex) - 102;
            strIndex++;
        } else {
            const marker = body.charAt(strIndex);
            let num = -1;
            if (marker === "-") {
                if (strIndex + 3 > body.length) return { error: "invalid url" };
                num = parseInt(body.substring(strIndex + 1, strIndex + 3), 16);
                strIndex += 3;
            } else {
                num = parseInt(marker, 16);
                strIndex += 1;
            }
            if (pos >= height * width) return { error: "invalid url" };
            problem[Math.floor(pos / width)][pos % width] = num;
            pos += 1;
        }
    }
    let answer;
    try {
        answer = await puzzle.solveNurikabeAsync(height, width, problem);
    } catch (err) {
        return { error: err.message };
    }
    if (answer === null) return { error: "no answer" };

    let answerCells = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) {
            if (problem[y][x] !== -1) row.push(new PuzzleNumber(problem[y][x]));
            else if (answer[y][x] === puzzle.WhiteCell) row.push(PuzzleSymbol.Dot);
            else if (answer[y][x] === puzzle.BlackCell) row.push(PuzzleSymbol.BlackCell);
            else row.push(PuzzleSymbol.Undecided);
        }
        answerCells.push(row);
    }
    return {
        answer: {
            height,
            width,
            cell: answerCells
        }
    };
}

async function solveSlitherlink(tokens: string[]): Promise<AnswerType> {
    if (tokens.length !== 4) return { error: "invalid url" };
    const width = parseInt(tokens[1]);
    const height = parseInt(tokens[2]);
    const body = tokens[3];
    let problem = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) row.push(-1);
        problem.push(row);
    }

    let pos = 0;
    let strIndex = 0;
    while (strIndex < body.length) {
        if (body.charCodeAt(strIndex) >= 103) { // 'g'
            pos += body.charCodeAt(strIndex) - 102;
            strIndex++;
        } else {
            const num = parseInt(body.charAt(strIndex), 16);
            problem[Math.floor(pos / width)][pos % width] = num % 5;
            pos += 1 + Math.floor(num / 5);
            strIndex++;
        }
    }
    let answer;
    try {
        answer = await puzzle.solveSlitherlinkAsync(height, width, problem);
    } catch (err) {
        return { error: err.message };
    }
    if (answer === null) return { error: "no answer" };

    const convert = function (answer: puzzle.Edge[][]) {
        let height = answer.length;
        let width = answer[0].length;

        let ret = [];
        for (let y = 0; y < height; ++y) {
            let row = [];
            for (let x = 0; x < width; ++x) {
                if (answer[y][x] === puzzle.Edge.Undecided) {
                    row.push(PuzzleSymbol.Undecided);
                } else if (answer[y][x] === puzzle.Edge.Line) {
                    row.push(PuzzleSymbol.LineEdge);
                } else if (answer[y][x] === puzzle.Edge.Blank) {
                    row.push(PuzzleSymbol.BlankEdge);
                }
            }
            ret.push(row);
        }
        return ret;
    };
    let answerCells = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) {
            if (problem[y][x] === -1) {
                row.push(PuzzleSymbol.Undecided);
            } else {
                row.push(new PuzzleNumber(problem[y][x]));
            }
        }
        answerCells.push(row);
    }
    return {
        answer: {
            height,
            width,
            cell: answerCells,
            loop: {
                horizontal: convert(answer.horizontal),
                vertical: convert(answer.vertical)
            }
        }
    };
}

async function solveYajilin(tokens: string[]): Promise<AnswerType> {
    if (tokens.length !== 4) return { error: "invalid url" };
    const width = parseInt(tokens[1]);
    const height = parseInt(tokens[2]);
    const body = tokens[3];
    let problem: (puzzle.NumberWithDirection | null)[][] = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) row.push(null);
        problem.push(row);
    }

    let pos = 0;
    let strIndex = 0;
    while (strIndex < body.length) {
        if (body.charCodeAt(strIndex) >= 97) { // 'a'
            pos += body.charCodeAt(strIndex) - 96;
            strIndex++;
        } else {
            const dir = parseInt(body.charAt(strIndex), 16);
            const num = parseInt(body.charAt(strIndex + 1), 16);

            let cspuzDir;
            if (dir === 1) {
                cspuzDir = puzzle.Direction.Up;
            } else if (dir === 2) {
                cspuzDir = puzzle.Direction.Down;
            } else if (dir === 3) {
                cspuzDir = puzzle.Direction.Left;
            } else if (dir === 4) {
                cspuzDir = puzzle.Direction.Right;
            } else {
                throw new Error("unexpected direction");
            }
            problem[Math.floor(pos / width)][pos % width] = {direction: cspuzDir, value: num};
            pos += 1;
            strIndex += 2;
        }
    }
    console.log(problem);
    let answer;
    try {
        answer = await puzzle.solveYajilinAsync(height, width, problem);
    } catch (err) {
        return { error: err.message };
    }
    if (answer === null) return { error: "no answer" };

    const convert = function (answer: puzzle.Edge[][]) {
        let height = answer.length;
        let width = answer[0].length;

        let ret = [];
        for (let y = 0; y < height; ++y) {
            let row = [];
            for (let x = 0; x < width; ++x) {
                if (answer[y][x] === puzzle.Edge.Undecided) {
                    row.push(PuzzleSymbol.Undecided);
                } else if (answer[y][x] === puzzle.Edge.Line) {
                    row.push(PuzzleSymbol.LineEdge);
                } else if (answer[y][x] === puzzle.Edge.Blank) {
                    row.push(PuzzleSymbol.BlankEdge);
                }
            }
            ret.push(row);
        }
        return ret;
    };
    let answerCells = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) {
            let p = problem[y][x];
            if (p !== null) {
                row.push(new PuzzleNumber(p.value));
            } else if (answer.cell[y][x] === puzzle.BlackCell) {
                row.push(PuzzleSymbol.BlackCell);
            } else if (answer.cell[y][x] === puzzle.WhiteCell) {
                row.push(PuzzleSymbol.Dot);
            } else {
                row.push(PuzzleSymbol.Undecided);
            }
        }
        answerCells.push(row);
    }
    let horizontal = convert(answer.horizontal);
    let vertical = convert(answer.vertical);

    // simplify answer
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            if (answerCells[y][x] === PuzzleSymbol.BlackCell || answerCells[y][x] instanceof PuzzleNumber) {
                if (y > 0) vertical[y - 1][x] = PuzzleSymbol.Undecided;
                if (x > 0) horizontal[y][x - 1] = PuzzleSymbol.Undecided;
                if (y < height - 1) vertical[y][x] = PuzzleSymbol.Undecided;
                if (x < width - 1) horizontal[y][x] = PuzzleSymbol.Undecided;
            } else {
                let degree = 0;
                if (y > 0 && vertical[y - 1][x] === PuzzleSymbol.LineEdge) ++degree;
                if (x > 0 && horizontal[y][x - 1] === PuzzleSymbol.LineEdge) ++degree;
                if (y < height - 1 && vertical[y][x] === PuzzleSymbol.LineEdge) ++degree;
                if (x < width - 1 && horizontal[y][x] === PuzzleSymbol.LineEdge) ++degree;

                if (degree >= 1) answerCells[y][x] = PuzzleSymbol.Undecided;
                if (degree === 2) {
                    if (y > 0 && vertical[y - 1][x] === PuzzleSymbol.BlankEdge) vertical[y - 1][x] = PuzzleSymbol.Undecided;
                    if (x > 0 && horizontal[y][x - 1] === PuzzleSymbol.BlankEdge) horizontal[y][x - 1] = PuzzleSymbol.Undecided;
                    if (y < height - 1 && vertical[y][x] === PuzzleSymbol.BlankEdge) vertical[y][x] = PuzzleSymbol.Undecided;
                    if (x < width - 1 && horizontal[y][x] === PuzzleSymbol.BlankEdge) horizontal[y][x] = PuzzleSymbol.Undecided;
                }
            }
        }
    }
    return {
        answer: {
            height,
            width,
            cell: answerCells,
            loop: {horizontal, vertical}
        }
    };
}
