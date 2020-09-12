export type PuzzleItem = PuzzleSymbol | PuzzleNumber;

export type Puzzle = {
    height: number;
    width: number;
    cell: PuzzleItem[][];
};

export enum PuzzleSymbol {
    Undecided,
    BlackCell,
    Dot,
}

export class PuzzleNumber {
    value: number;

    constructor(value: number) {
        this.value = value;
    }
}
