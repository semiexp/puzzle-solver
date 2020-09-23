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
    console.time('solve');
    let answer;
    try {
        answer = await puzzle.solveNurikabeAsync(height, width, problem);
    } catch (err) {
        return { error: err.message };
    }
    console.timeEnd('solve');
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
