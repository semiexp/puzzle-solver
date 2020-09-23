import React from 'react';
import {Puzzle} from './PuzzleItem'
import {PuzzleBoard} from './PuzzleBoard'
import {solveUrl, stopSolver} from './InternalSolver'

type PuzzleSolverState = {
    problemUrl?: string;
    error?: string,
    message?: string,
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
            this.setState({
                error: undefined,
                message: "Now solving..."
            });
            const startTime = new Date();
            solveUrl(this.state.problemUrl).then(result => {
                const elapsedTime = (new Date().getTime() - startTime.getTime()) / 1000;
                this.setState({
                    error: result.error,
                    message: result.error ? undefined : "Done! (Cost: " + elapsedTime + "s)",
                    puzzle: result.answer
                });
            });
        };
        const puzzle = this.state.puzzle || defaultPuzzle;
        return (
            <div>
                <div>
                    <span>Problem URL (pzv / puzz.link): </span>
                    <input type="text" value={this.state.problemUrl} onChange={changeUrl} size={50} />
                    <input type="button" value="Solve" onClick={runSolver} />
                    <input type="button" value="Stop" onClick={stopSolver} />
                </div>
                {
                    this.state.error &&
                    <div style={{color: "red"}}>Error: {this.state.error}</div>
                }
                {
                    this.state.message &&
                    <div style={{color: "blue"}}>{this.state.message}</div>
                }
                <PuzzleBoard cellSize={30} margin={5} puzzle={puzzle} />
            </div>
        )
    }
}

export default PuzzleSolver;
