export type PuzzleItem = PuzzleSymbol | PuzzleString;

export type Puzzle = {
    height: number;
    width: number;
    cell: (PuzzleItem | PuzzleItem[])[][];
    loop?: {horizontal: PuzzleItem[][], vertical: PuzzleItem[][]};
    wall?: {horizontal: PuzzleItem[][], vertical: PuzzleItem[][]};
};

export enum PuzzleSymbol {
    Undecided,
    BlackCell,
    Dot,
    LineEdge,
    BlankEdge,
    BoldEdge,
    SideArrowUp,
    SideArrowDown,
    SideArrowLeft,
    SideArrowRight,
}

export class PuzzleString {
    value: string;

    constructor(value: string) {
        this.value = value;
    }
}
