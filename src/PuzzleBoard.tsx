import React from 'react';
import {Puzzle, PuzzleItem, PuzzleSymbol, PuzzleNumber} from './PuzzleItem';

type Props = {
    margin: number;
    cellSize: number;
    puzzle: Puzzle;
}

function getGrid(margin: number, cellSize: number, height: number, width: number) {
    if (height === 0 || width === 0) return null;
    return <g fill="none" stroke="black" strokeWidth={2}>
        <rect y={margin} x={margin} height={cellSize * height} width={cellSize * width} />
        {
            Array(height - 1).fill(0).map((_, i) =>
                <line y1={margin + cellSize * (i + 1)} x1={margin}
                      y2={margin + cellSize * (i + 1)} x2={margin + cellSize * width} />
            )
        }
        {
            Array(width - 1).fill(0).map((_, i) =>
                <line y1={margin} x1={margin + cellSize * (i + 1)}
                      y2={margin + cellSize * height} x2={margin + cellSize * (i + 1)} />
            )
        }
    </g>;
}

function getCellElement(margin: number, cellSize: number, y: number, x: number, item: PuzzleItem) {
    if (item instanceof PuzzleNumber) {
        return <text y={margin + cellSize * (y + 0.5)} x={margin + cellSize * (x + 0.5)}
                     dominantBaseline='central' textAnchor='middle' style={{ fontSize: cellSize * 0.8 }}>
                    {item.value}
               </text>
    } else {
        if (item === PuzzleSymbol.Undecided) {
            return null;
        } else if (item === PuzzleSymbol.BlackCell) {
            return <rect y={margin + cellSize * y + 4} x={margin + cellSize * x + 4}
                         height={cellSize - 8} width={cellSize - 8}
                         fill="black" stroke="none" />;
        } else if (item === PuzzleSymbol.Dot) {
            return <rect y={margin + cellSize * (y + 0.5) - 3} x={margin + cellSize * (x + 0.5) - 3} height={6} width={6}
                         fill="black" stroke="none" />;
        }
    }
}

export class PuzzleBoard extends React.Component<Props, {}> {
    render() {
        const {margin, cellSize, puzzle} = this.props;
        const {height, width} = puzzle;

        let elements = [];

        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                elements.push(getCellElement(margin, cellSize, y, x, puzzle.cell[y][x]));
            }
        }
        return <svg height={2 * margin + cellSize * height} width={2 * margin + cellSize * width}>
            {getGrid(margin, cellSize, height, width)}
            {elements}
        </svg>;
    }
}
