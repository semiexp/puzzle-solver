import {Puzzle, PuzzleItem, PuzzleSymbol, PuzzleString} from './PuzzleItem'
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
    } else if (puzzleType === "yajilin" || puzzleType === "yajirin") {
        return solveYajilin(tokens);
    } else if (puzzleType === "heyawake") {
        return solveHeyawake(tokens);
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
            } else if (marker === ".") {
                num = 0;
                strIndex += 1;
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
            if (problem[y][x] !== -1) {
                if (problem[y][x] === 0) {
                    row.push(new PuzzleString("?"));
                } else {
                    row.push(new PuzzleString(String(problem[y][x])));
                }
            } else if (answer[y][x] === puzzle.WhiteCell) row.push(PuzzleSymbol.Dot);
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
                row.push(new PuzzleString(String(problem[y][x])));
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
    if (tokens.length !== 4 && tokens.length !== 5) return { error: "invalid url" };
    const width = parseInt(tokens[tokens.length - 3]);
    const height = parseInt(tokens[tokens.length - 2]);
    const body = tokens[tokens.length - 1];
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
    let answerCells: (PuzzleItem | PuzzleItem[])[][] = [];
    for (let y = 0; y < height; ++y) {
        let row: (PuzzleItem | PuzzleItem[])[] = [];
        for (let x = 0; x < width; ++x) {
            let p = problem[y][x];
            if (p !== null) {
                let items: PuzzleItem[] = [new PuzzleString(String(p.value))];
                if (p.direction === puzzle.Direction.Up) {
                    items.push(PuzzleSymbol.SideArrowUp);
                } else if (p.direction === puzzle.Direction.Down) {
                    items.push(PuzzleSymbol.SideArrowDown);
                } else if (p.direction === puzzle.Direction.Left) {
                    items.push(PuzzleSymbol.SideArrowLeft);
                } else if (p.direction === puzzle.Direction.Right) {
                    items.push(PuzzleSymbol.SideArrowRight);
                }
                row.push(items);
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
            if (answerCells[y][x] === PuzzleSymbol.BlackCell || problem[y][x] !== null) {
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

async function solveHeyawake(tokens: string[]): Promise<AnswerType> {
    if (tokens.length !== 4) return { error: "invalid url" };
    const width = parseInt(tokens[1]);
    const height = parseInt(tokens[2]);
    let body = tokens[3];

    function analyzeBinary(height: number, width: number, sequence: string): boolean[][] {
        let ret = [];
        for (let y = 0; y < height; ++y) {
            let row = [];
            for (let x = 0; x < width; ++x) {
                row.push(false);
            }
            ret.push(row);
        }
        for (let i = 0; i < sequence.length; ++i) {
            let v = parseInt(sequence.charAt(i), 32);
            for (let j = 0; j < 5; ++j) {
                let p = i * 5 + j;
                if (p < height * width) {
                    let y = Math.floor(p / width);
                    let x = p % width;
                    ret[y][x] = ((v >> (4 - j)) & 1) != 0;
                }
            }
        }
        return ret;
    }

    const verticalWallsCodeLength = Math.floor((height * (width - 1) + 4) / 5);
    const verticalWalls = analyzeBinary(height, width - 1, body.substring(0, verticalWallsCodeLength));
    body = body.substring(verticalWallsCodeLength);
    const horizontalWallsCodeLength = Math.floor(((height - 1) * width + 4) / 5);
    const horizontalWalls = analyzeBinary(height - 1, width, body.substring(0, horizontalWallsCodeLength));
    body = body.substring(horizontalWallsCodeLength);

    let regions: {y: number, x: number}[][] = [];
    let visited: boolean[][] = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) {
            row.push(false);
        }
        visited.push(row);
    }
    let clueNumbers: number[][] = [];
    for (let y = 0; y < height; ++y) {
        clueNumbers.push(new Array(width).fill(-1));
    }

    function visit(y: number, x: number, region: {y: number, x: number}[]) {
        if (visited[y][x]) return;
        visited[y][x] = true;
        region.push({y, x});

        if (y > 0 && !horizontalWalls[y - 1][x]) visit(y - 1, x, region);
        if (y < height - 1 && !horizontalWalls[y][x]) visit(y + 1, x, region);
        if (x > 0 && !verticalWalls[y][x - 1]) visit(y, x - 1, region);
        if (x < width - 1 && !verticalWalls[y][x]) visit(y, x + 1, region);
    }

    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            if (visited[y][x]) continue;
            let region: {y: number, x: number}[] = [];
            visit(y, x, region);
            regions.push(region);
        }
    }

    let clue = new Array(regions.length);
    clue.fill(-1);

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
            } else if (marker === ".") {
                num = 0;
                strIndex += 1;
            } else {
                num = parseInt(marker, 16);
                strIndex += 1;
            }
            if (pos >= height * width) return { error: "invalid url" };
            clue[pos] = num;
            clueNumbers[regions[pos][0].y][regions[pos][0].x] = num;
            pos += 1;
        }
    }
    let answer;
    try {
        answer = await puzzle.solveHeyawakeAsync(height, width, regions, clue);
    } catch (err) {
        return { error: err.message };
    }
    if (answer === null) return { error: "no answer" };

    let answerCells = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) {
            let items = [];
            if (answer[y][x] === puzzle.WhiteCell) items.push(PuzzleSymbol.Dot);
            else if (answer[y][x] === puzzle.BlackCell) items.push(PuzzleSymbol.BlackCell);
            else items.push(PuzzleSymbol.Undecided);

            if (clueNumbers[y][x] != -1) {
                items.push(new PuzzleString(clueNumbers[y][x].toString()));
            }

            row.push(items);
        }
        answerCells.push(row);
    }

    function convertWalls(walls: boolean[][]): PuzzleItem[][] {
        let ret = [];
        for (let y = 0; y < walls.length; ++y) {
            let row = [];
            for (let x = 0; x < walls[y].length; ++x) {
                if (walls[y][x]) row.push(PuzzleSymbol.BoldEdge);
                else row.push(PuzzleSymbol.LineEdge);
            }
            ret.push(row);
        }
        return ret;
    }

    return {
        answer: {
            height,
            width,
            cell: answerCells,
            wall: {
                horizontal: convertWalls(horizontalWalls),
                vertical: convertWalls(verticalWalls)
            }
        }
    };
}
