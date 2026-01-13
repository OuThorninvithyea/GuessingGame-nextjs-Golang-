package models

import "sync"

type Game struct {
	SessionID  string `json:"session_id"`
	Secret     int    `json:"-"` // hidden from client
	Guesses    int    `json:"guesses"`
	MaxGuesses int    `json:"maxGuesses"`
	Won        bool   `json:"won"`
}

type StartResponse struct {
	Game    Game   `json:"game"`
	Message string `json:"message"`
}

type GuessResponse struct {
	Message   string `json:"message"`
	Correct   bool   `json:"correct"`
	TooHigh   bool   `json:"too_high"`
	TooLow    bool   `json:"too_low"`
	Remaining int    `json:"remaining_guesses"`
}

// In-memory storage for games
var (
	Games      = make(map[string]Game)
	Mu         sync.Mutex
	SessionCtr = 0
)