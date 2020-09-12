import React from 'react';
import {Puzzle} from './PuzzleItem'
import {PuzzleBoard} from './PuzzleBoard'
import {solveUrl} from './InternalSolver'

type PuzzleSolverState = {
    problemUrl?: string;
    error?: string,
    puzzle?: Puzzle;
}

const defaultPuzzle = {
    height: 0,
    width: 0,
    cell: []
};

export class PuzzleSolver extends React.Component<{}, PuzzleSolverState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            problemUrl: ""
        };
    }

    render() {
        const changeUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
            this.setState({
                problemUrl: e.target.value
            });
        };
        const runSolver = () => {
            if (!this.state.problemUrl) return;
            const result = solveUrl(this.state.problemUrl);
            this.setState({
                error: result.error,
                puzzle: result.answer
            });
        };
        const puzzle = this.state.puzzle || defaultPuzzle;
        return (
            <div>
                <div>
                    <span>Problem URL (pzv / puzz.link): </span>
                    <input type="text" value={this.state.problemUrl} onChange={changeUrl} size={50} />
                    <input type="button" value="Solve" onClick={runSolver} />
                </div>
                {
                    this.state.error &&
                    <div style={{color: "red"}}>Error: {this.state.error}</div>
                }
                <PuzzleBoard cellSize={30} margin={5} puzzle={puzzle} />
            </div>
        )
    }
}

export default PuzzleSolver;
