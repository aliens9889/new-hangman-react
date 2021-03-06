import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import Loading from "./Loading";
import * as actions from "../store/actions";
import "./Style.css";

import step0 from "../media/images/step0.svg";
import step1 from "../media/images/step1.svg";
import step2 from "../media/images/step2.svg";
import step3 from "../media/images/step3.svg";
import step4 from "../media/images/step4.svg";
import step5 from "../media/images/step5.svg";

import fail from "../media/audios/fail.mp3";
import victory from "../media/audios/victory.mp3";

export class Hangman extends Component {
  static defaultProps = {
    maxWrong: 5,
    images: [step0, step1, step2, step3, step4, step5],
  };

  state = {
    mistake: 0,
    guessed: new Set([]),
    youGuessed: false,
    failAudio: new Audio(fail),
    victoryAudio: new Audio(victory),
    isPlayed: false,
  };

  componentDidMount() {
    this.props.onShowGame();
    this.state.failAudio.pause();
    this.state.victoryAudio.pause();
  }

  handleGuess = (e) => {
    const { answer } = this.props;
    let letter = e.target.value;
    this.setState((prevState) => ({
      guessed: prevState.guessed.add(letter),
      mistake: prevState.mistake + (answer.includes(letter) ? 0 : 1),
    }));
  };

  guessedWords = () => {
    const { answer } = this.props;
    return answer.split(" ").map(
      (word) =>
        word
          .split("")
          .map((letter) => (this.state.guessed.has(letter) ? letter : " _ "))
          .join("") + " "
    );
  };

  generateButtons = () => {
    return "qwertyuiopasdfghjklñzxcvbnm".split("").map((letter) => (
      <button
        className="btn btn-lg btn-primary m-2"
        key={letter}
        value={letter}
        onClick={this.handleGuess}
        disabled={this.state.guessed.has(letter)}
      >
        {letter}
      </button>
    ));
  };

  resetButton = () => {
    this.setState({
      mistake: 0,
      guessWords: new Set([]),
      youGuessed: false,
    });
    // Reset state on Store
    this.props.onResetGame();
    this.props.history.push("/");
  };

  showResult = () => {
    this.setState({
      youGuessed: true,
    });
  };

  failPlay = () => {
    this.state.failAudio.play();
  };

  victoryPlay = () => {
    this.state.victoryAudio.play();
  };

  render() {
    const { mistake, youGuessed } = this.state;
    const { answer, answerCopy, maxWrong, isLoading, images } = this.props;
    const gameOver = mistake >= maxWrong;

    const isWinner = youGuessed
      ? answer.trim("")
      : this.guessedWords().join("").trim("") === answer.trim("");

    const winOrLose = isWinner ? (
      <div>
        <h1>Lo lograste!</h1>
        <button className="btn_start_game" onClick={() => this.resetButton()}>
          Jugar otra vez
        </button>
        {this.victoryPlay()}
      </div>
    ) : gameOver ? (
      <div>
        <h1>Perdiste!</h1>
        <button className="btn_start_game" onClick={() => this.resetButton()}>
          Jugar otra vez
        </button>
        {gameOver ? this.failPlay() : null}
      </div>
    ) : (
      <div>
        {this.generateButtons()}
        <div>
          <button className="btn_start_game" onClick={() => this.showResult()}>
            Resolver
          </button>
        </div>
      </div>
    );

    const checkGame = isLoading ? (
      <Loading />
    ) : (
      <div className="container">
        <h1 className="text-center">
          Cuanto turnos llevas: {mistake} de {maxWrong}
        </h1>
        <div className="text-center">
          <img src={images[mistake]} alt="" className="guy" />
        </div>
        <div className="text-center">
          <h4>
            {!gameOver
              ? "Adivina la palabra o frase:"
              : "La palabra o frase era:"}
          </h4>
          <pre>
            <h1 className="game_word">
              {gameOver || isWinner || youGuessed
                ? answerCopy
                : this.guessedWords()}
            </h1>
          </pre>
          {winOrLose}
        </div>
      </div>
    );

    if (answer.length === 0) return <Redirect to="/" />;

    return <div className="game_bg">{checkGame}</div>;
  }
}

const mapStateToProps = (state) => ({
  answer: state.game.answer,
  answerCopy: state.game.answerCopy,
  isLoading: state.game.isLoading,
});

const mapDispatchToProps = (dispatch) => ({
  onShowGame: () => dispatch(actions.showGame()),
  onResetGame: () => dispatch(actions.resetGame()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Hangman);