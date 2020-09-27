export type PuzzleItem = PuzzleSymbol | PuzzleNumber;

export type Puzzle = {
    height: number;
    width: number;
    cell: PuzzleItem[][];
    loop?: {horizontal: PuzzleItem[][], vertical: PuzzleItem[][]};
};

export enum PuzzleSymbol {
    Undecided,
    BlackCell,
    Dot,
    LineEdge,
    BlankEdge,
}

export class PuzzleNumber {
    value: number;

    constructor(value: number) {
        this.value = value;
    }
}
