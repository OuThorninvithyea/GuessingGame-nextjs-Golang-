document.addEventListener("DOMContentLoaded", () => {
  const guessInput = document.getElementById("guess-input");
  const guessBtn = document.getElementById("guess-btn");
  const feedbackMsg = document.getElementById("feedback-msg");
  const currentScoreDisplay = document.getElementById("current-score");
  const highScoreDisplay = document.getElementById("high-score");
  const newGameBtn = document.getElementById("new-game-btn");

  let currentScore = 0;
  let highScore = localStorage.getItem("highScore") || 0;
  highScoreDisplay.textContent = highScore;

  // This is where you will connect to your Go backend
  // For now, it's a mock implementation
  let targetNumber = Math.floor(Math.random() * 100);
  console.log("Target (Mock):", targetNumber);

  const handleGuess = () => {
    const guess = parseInt(guessInput.value);

    if (isNaN(guess)) {
      updateFeedback("INVALID INPUT", "var(--secondary-neon)");
      return;
    }

    currentScore++;
    currentScoreDisplay.textContent = currentScore;

    if (guess === targetNumber) {
      updateFeedback("CORRECT! YOU WIN!", "#00ff88");
      if (highScore === 0 || currentScore < highScore) {
        highScore = currentScore;
        localStorage.setItem("highScore", highScore);
        highScoreDisplay.textContent = highScore;
      }
      guessBtn.disabled = true;
    } else if (guess > targetNumber) {
      updateFeedback("↑ TOO HIGH", "var(--secondary-neon)");
    } else {
      updateFeedback("↓ TOO LOW", "var(--primary-neon)");
    }

    guessInput.value = "";
    guessInput.focus();
  };

  const updateFeedback = (msg, color) => {
    feedbackMsg.textContent = msg;
    feedbackMsg.style.color = color;
    feedbackMsg.classList.remove("pulse");
    void feedbackMsg.offsetWidth; // Trigger reflow
    feedbackMsg.classList.add("pulse");
  };

  const resetGame = () => {
    targetNumber = Math.floor(Math.random() * 100);
    currentScore = 0;
    currentScoreDisplay.textContent = "0";
    updateFeedback("READY TO PLAY?", "var(--primary-neon)");
    guessBtn.disabled = false;
    guessInput.value = "";
    console.log("New Target (Mock):", targetNumber);
  };

  guessBtn.addEventListener("click", handleGuess);
  newGameBtn.addEventListener("click", resetGame);
  guessInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleGuess();
  });
});
