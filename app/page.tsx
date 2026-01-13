"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("READY TO PLAY?");
  const [feedbackColor, setFeedbackColor] = useState("var(--primary-neon)");
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [remainingGuesses, setRemainingGuesses] = useState(10); // Default or initial value
  const [isGameOver, setIsGameOver] = useState(false);

  const [sessionId, setSessionId] = useState("");
  const [guesses, setGuesses] = useState(0);
  const [maxGuesses, setMaxGuesses] = useState(10);
  const [won, setWon] = useState(false);

  useEffect(() => {
    startNewGame();
  }, []);

  // Implement your Go API calls here
  const startNewGame = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8080/api/new-game", {
        method: "POST",
      });
      const data = await response.json();

      setSessionId(data.game.session_id);
      setGuesses(data.game.guesses);
      setMaxGuesses(data.game.maxGuesses);
      setRemainingGuesses(data.game.maxGuesses - data.game.guesses);
      setIsGameOver(false);
      setFeedback(data.message);
      setFeedbackColor("var(--primary-neon)");
      setGuess("");
    } catch (error) {
      console.error("Error starting new game:", error);
    }
  };

  const handleGuess = async () => {
    if (!guess || !sessionId || isGameOver) return;
    try {
      const response = await fetch("http://127.0.0.1:8080/api/guess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          guess: parseInt(guess),
        }),
      });
      const data = await response.json();

      setFeedback(data.message);
      setRemainingGuesses(data.remaining_guesses);

      if (data.correct) {
        setFeedbackColor("#4ade80"); // Bright green
        setIsGameOver(true);
        setCurrentScore((prev) => prev + 1);
        if (currentScore + 1 > highScore) setHighScore(currentScore + 1);
      } else if (data.remaining_guesses <= 0) {
        setFeedbackColor("#f87171"); // Bright red
        setIsGameOver(true);
        setCurrentScore(0);
      } else {
        setFeedbackColor(
          data.too_high || data.too_low
            ? "var(--secondary-neon)"
            : "var(--primary-neon)"
        );
      }
      setGuess("");
    } catch (error) {
      console.error("Error making guess:", error);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#05070a] text-white overflow-hidden selection:bg-cyan-500/30">
      {/* Background Blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-neon rounded-full blur-[120px] opacity-20 animate-blob" />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary-neon rounded-full blur-[120px] opacity-20 animate-blob"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <main className="relative z-10 w-full max-w-4xl px-6 grid grid-cols-1 md:grid-cols-[1fr_200px] gap-8">
        <header className="md:col-span-2 text-center mb-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-widest uppercase">
            NEON{" "}
            <span className="text-primary-neon drop-shadow-[0_0_15px_rgba(0,242,255,0.5)]">
              NUMBERS
            </span>
          </h1>
        </header>

        {/* Game Main Card */}
        <section className="glass rounded-3xl p-8 md:p-12 flex flex-col gap-8 shadow-2xl">
          <div className="space-y-4">
            <label className="block text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">
              Enter a Number
            </label>
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGuess()}
              placeholder="1-10"
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 text-4xl text-center focus:outline-none focus:border-primary-neon focus:ring-1 focus:ring-primary-neon/50 transition-all placeholder:text-white/10"
              disabled={isGameOver}
            />
          </div>

          <button
            onClick={handleGuess}
            disabled={isGameOver}
            className="w-full py-6 rounded-full bg-gradient-to-r from-secondary-neon to-primary-neon text-xl font-bold tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            GUESS
          </button>

          <div className="glass-inner relative overflow-hidden flex flex-col items-center justify-center py-10 min-h-[140px]">
            <p
              className="text-2xl font-bold tracking-tight transition-all duration-300"
              style={{ color: feedbackColor }}
            >
              {feedback}
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden opacity-30">
              <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-primary-neon to-transparent animate-wave" />
            </div>
          </div>
        </section>

        {/* Stats Sidebar */}
        <aside className="flex flex-col gap-6">
          <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2">
              Score
            </span>
            <span className="text-4xl font-black">{currentScore}</span>
          </div>
          <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2">
              High Score
            </span>
            <span className="text-4xl font-black text-primary-neon">
              {highScore}
            </span>
          </div>
          <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center border-secondary-neon/30">
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2">
              Remaining
            </span>
            <span className="text-4xl font-black text-secondary-neon">
              {remainingGuesses}
            </span>
          </div>
          <button
            onClick={startNewGame}
            className="glass w-full py-4 rounded-xl text-sm font-bold tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase"
          >
            New Game
          </button>
        </aside>

        <footer className="md:col-span-2 text-center mt-4">
          <p className="text-[10px] text-white/20 tracking-widest uppercase">
            Built with Next.js & Go Logic
          </p>
        </footer>
      </main>
    </div>
  );
}
