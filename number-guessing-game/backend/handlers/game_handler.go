package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"number-guessing-game/backend/models"
)


func StartNewGame(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	models.Mu.Lock()
	defer models.Mu.Unlock()

	models.SessionCtr++
	sessionID := fmt.Sprintf("%d", models.SessionCtr)
	secret := rand.Intn(10) + 1
	game := models.Game{
		SessionID:  sessionID,
		Secret:     secret,
		Guesses:    0,
		MaxGuesses: 10,
		Won:        false,
	}

	models.Games[sessionID] = game

	resp := models.StartResponse{
		Game: game,
		Message: "Game started! Guess the number between 1 and 10",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}


func MakeGuess(w http.ResponseWriter, r *http.Request) {
 if r.Method != http.MethodPost {
	w.WriteHeader(http.StatusMethodNotAllowed)
	return
 }

 body, err := io.ReadAll(r.Body)
 if err != nil {
	w.WriteHeader(http.StatusBadRequest)
	return
 }
 var req struct {
	SessionID string `json:"session_id"`
	Guess     int    `json:"guess"`
 }
 if err := json.Unmarshal(body, &req); err != nil {
	http.Error(w, "Invalid JSON", http.StatusBadRequest)
	return
 }

 models.Mu.Lock()
 game, exist := models.Games[req.SessionID]
 models.Mu.Unlock()

 if !exist {
	http.Error(w, "session not found", http.StatusNotFound)
	return
 }
 if game.Won {
	http.Error(w, "game already won", http.StatusNotFound)
	return
 }
 game.Guesses++
 tooHigh := req.Guess > game.Secret
 tooLow := req.Guess < game.Secret
 correct := req.Guess == game.Secret
 if correct	{
	game.Won = true
 }
 remaining := game.MaxGuesses - game.Guesses

 models.Mu.Lock()
 models.Games[req.SessionID] = game
 models.Mu.Unlock()

 resp := models.GuessResponse{
	Message: GetFeedback(game, tooHigh, tooLow, correct, remaining),
	Correct: correct,
	Remaining: remaining,
	TooHigh: tooHigh,
	TooLow: tooLow,
 }

 w.Header().Set("Content-Type", "application/json")
 json.NewEncoder(w).Encode(resp)

}

func GetStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	SessionID := r.URL.Path[len("/api/status/"):]
	models.Mu.Lock()
	game, exist := models.Games[SessionID]
	models.Mu.Unlock()
	if !exist {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	resp := map[string]interface{}{
		"session_id": game.SessionID,
		"guesses":    game.Guesses,
		"maxGuesses": game.MaxGuesses,
		"won":        game.Won,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)

}

func GetFeedback(game models.Game, tooHigh, tooLow, correct bool, remaining int) string {
if correct {
		return fmt.Sprintf("Correct! You guessed it in %d tries.", game.Guesses)
	}
	if remaining <= 0 {
		return fmt.Sprintf("Out of guesses! The number was %d.", game.Secret)
	}
	if tooHigh {
		return fmt.Sprintf("Too high! (%d remaining)", remaining)
	}
	return fmt.Sprintf("Too low! (%d remaining)", remaining)
}
