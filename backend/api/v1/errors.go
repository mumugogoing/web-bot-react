package v1

import "errors"

var (
	// ErrAlreadyRunning is returned when trying to start an already running monitor
	ErrAlreadyRunning = errors.New("monitor is already running")

	// ErrNotRunning is returned when trying to stop a monitor that isn't running
	ErrNotRunning = errors.New("monitor is not running")
)
