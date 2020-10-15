import React from 'react';
import {Puzzle, PuzzleItem, PuzzleSymbol, PuzzleString} from './PuzzleItem';

type Props = {
    margin: number;
    cellSize: number;
    puzzle: Puzzle;
}

function getGrid(margin: number, cellSize: number, height: number, width: number) {
    if (height === 0 || width === 0) return null;
    return <g fill="none" stroke="black" strokeWidth={1}>
        <rect y={margin} x={margin} height={cellSize * height} width={cellSize * width} strokeWidth={3} />
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

function getCustomGrid(margin: number, cellSize: number, height: number, width: number, wall: {horizontal: PuzzleItem[][], vertical: PuzzleItem[][]}) {
    if (height === 0 || width === 0) return null;
    let {horizontal, vertical} = wall;
    let wallElems = [];
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            if (y < height - 1) {
                if (horizontal[y][x] === PuzzleSymbol.BoldEdge || horizontal[y][x] === PuzzleSymbol.LineEdge) {
                    let lineWidth = 1;
                    if (horizontal[y][x] === PuzzleSymbol.BoldEdge) lineWidth = 3;
                    wallElems.push(
                        <line y1={margin + cellSize * (y + 1)} x1={margin + cellSize * x}
                              y2={margin + cellSize * (y + 1)} x2={margin + cellSize * (x + 1)} strokeWidth={lineWidth} />
                    );
                }
            }
            if (x < width - 1) {
                if (vertical[y][x] === PuzzleSymbol.BoldEdge || vertical[y][x] === PuzzleSymbol.LineEdge) {
                    let lineWidth = 1;
                    if (vertical[y][x] === PuzzleSymbol.BoldEdge) lineWidth = 3;
                    wallElems.push(
                        <line y1={margin + cellSize * y} x1={margin + cellSize * (x + 1)}
                              y2={margin + cellSize * (y + 1)} x2={margin + cellSize * (x + 1)} strokeWidth={lineWidth} />
                    );
                }
            }
        }
    }
    return <g fill="none" stroke="black">
        <rect y={margin} x={margin} height={cellSize * height} width={cellSize * width} strokeWidth={3} />
        {wallElems}
    </g>;
}

function getCellElement(margin: number, cellSize: number, y: number, x: number, item: PuzzleItem) {
    if (item instanceof PuzzleString) {
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
                         fill="green" stroke="none" />;
        } else if (item === PuzzleSymbol.Dot) {
            return <rect y={margin + cellSize * (y + 0.5) - 3} x={margin + cellSize * (x + 0.5) - 3} height={6} width={6}
                         fill="green" stroke="none" />;
        } else if (item === PuzzleSymbol.SideArrowUp || item === PuzzleSymbol.SideArrowDown || item === PuzzleSymbol.SideArrowLeft || item === PuzzleSymbol.SideArrowRight) {
            let shape = [
                [0.1, 0.1],
                [0.5, 0.1],
                [0.5, 0.05],
                [0.9, 0.125],
                [0.5, 0.2],
                [0.5, 0.15],
                [0.1, 0.15]
            ];
            let points = [];
            for (let i = 0; i < shape.length; ++i) {
                let dx = shape[i][0];
                let dy = shape[i][1];

                // affine transform
                if (item === PuzzleSymbol.SideArrowLeft || item === PuzzleSymbol.SideArrowUp) {
                    dx = 1 - dx;
                }
                if (item === PuzzleSymbol.SideArrowUp || item === PuzzleSymbol.SideArrowDown) {
                    let tmp = dx;
                    dx = dy;
                    dy = tmp;
                }

                // adjust to the cell
                dx = margin + cellSize * (x + dx);
                dy = margin + cellSize * (y + dy);
                points.push(String(dx) + "," + String(dy));
            }
            return <polygon points={points.join(" ")} stroke="none" fill="black" />
        } else {
            throw new Error("unsupported cell element");
        }
    }
}

function getLoop(cellSize: number, topY: number, topX: number, horizontal: PuzzleItem[][], vertical: PuzzleItem[][]) {
    let height = horizontal.length - 1;
    let width = horizontal[0].length;
    let crossSize = cellSize / 10.0;

    let loopLines = [];
    let loopBlankCrosses = [];
    for (let y = 0; y <= height; ++y) {
        for (let x = 0; x <= width; ++x) {
            if (x < width) {
                if (horizontal[y][x] === PuzzleSymbol.LineEdge) {
                    loopLines.push(
                        <line y1={topY + y * cellSize} x1={topX + x * cellSize}
                              y2={topY + y * cellSize} x2={topX + (x + 1) * cellSize} />
                    );
                } else if (horizontal[y][x] === PuzzleSymbol.BlankEdge) {
                    let centerY = topY + y * cellSize;
                    let centerX = topX + (x + 0.5) * cellSize;
                    loopBlankCrosses.push(
                        <line y1={centerY - crossSize} x1={centerX - crossSize}
                              y2={centerY + crossSize} x2={centerX + crossSize} />
                    );
                    loopBlankCrosses.push(
                        <line y1={centerY - crossSize} x1={centerX + crossSize}
                              y2={centerY + crossSize} x2={centerX - crossSize} />
                    );
                } else if (horizontal[y][x] !== PuzzleSymbol.Undecided) {
                    throw new Error("unsupported edge element");
                }
            }
            if (y < height) {
                if (vertical[y][x] === PuzzleSymbol.LineEdge) {
                    loopLines.push(
                        <line y1={topY + y * cellSize} x1={topX + x * cellSize}
                              y2={topY + (y + 1) * cellSize} x2={topX + x * cellSize} />
                    );
                } else if (vertical[y][x] === PuzzleSymbol.BlankEdge) {
                    let centerY = topY + (y + 0.5) * cellSize;
                    let centerX = topX + x * cellSize;
                    loopBlankCrosses.push(
                        <line y1={centerY - crossSize} x1={centerX - crossSize}
                              y2={centerY + crossSize} x2={centerX + crossSize} />
                    );
                    loopBlankCrosses.push(
                        <line y1={centerY - crossSize} x1={centerX + crossSize}
                              y2={centerY + crossSize} x2={centerX - crossSize} />
                    );
                } else if (vertical[y][x] !== PuzzleSymbol.Undecided) {
                    throw new Error("unsupported edge element");
                }
            }   
        }
    }
    return <g>
        <g stroke="green" strokeWidth={4}>{loopLines}</g>
        <g stroke="black" strokeWidth={1}>{loopBlankCrosses}</g>
    </g>;
}

export class PuzzleBoard extends React.Component<Props, {}> {
    render() {
        const {margin, cellSize, puzzle} = this.props;
        const {height, width} = puzzle;

        let elements = [];
        let useGrid = true;

        if (puzzle.loop) {
            let {horizontal, vertical} = puzzle.loop;
            let loopHeight = horizontal.length - 1;
            let loopWidth = horizontal[0].length;
            if (vertical.length !== loopHeight || vertical[0].length - 1 !== loopWidth) {
                throw new Error("loop shape mismatch");
            }

            if (height === loopHeight && width === loopWidth) {
                elements.push(getLoop(cellSize, margin, margin, horizontal, vertical));
                for (let y = 0; y <= height; ++y) {
                    for (let x = 0; x <= width; ++x) {
                        elements.push(<rect y={margin + y * cellSize - 3} x={margin + x * cellSize - 3} height={6} width={6}
                                            fill="black" stroke="none" />);
                    }
                }
                useGrid = false;
            } else if (height - 1 === loopHeight && width - 1 === loopWidth) {
                elements.push(getLoop(cellSize, margin + cellSize / 2, margin + cellSize / 2, horizontal, vertical));
            } else {
                throw new Error("unsupported loop shape");
            }
        }
        if (useGrid) {
            if (puzzle.wall) {
                elements.push(getCustomGrid(margin, cellSize, height, width, puzzle.wall));
            } else {
                elements.push(getGrid(margin, cellSize, height, width));
            }
        }

        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                const cellValue = puzzle.cell[y][x];

                if (cellValue instanceof Array) {
                    for (const value of cellValue) {
                        elements.push(getCellElement(margin, cellSize, y, x, value));
                    }
                } else {
                    elements.push(getCellElement(margin, cellSize, y, x, cellValue));
                }
            }
        }
        return <svg height={2 * margin + cellSize * height} width={2 * margin + cellSize * width} style={{backgroundColor: 'white'}}>
            {elements}
        </svg>;
    }
}
