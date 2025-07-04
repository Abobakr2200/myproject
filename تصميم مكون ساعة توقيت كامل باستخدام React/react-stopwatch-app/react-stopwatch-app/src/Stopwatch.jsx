import React from 'react';

/**
 * Stopwatch Component - A feature-rich stopwatch built with React class components
 * 
 * Features:
 * - Start/Stop/Reset functionality
 * - Lap recording without interrupting the main timer
 * - Time display in HH:MM:SS:ms format
 * - Responsive design for mobile and desktop
 */
class Stopwatch extends React.Component {
  constructor(props) {
    super(props);
    
    // Initialize component state
    this.state = {
      elapsedTime: 0,    // Time elapsed in milliseconds
      isRunning: false,  // Whether the stopwatch is currently running
      laps: [],          // Array to store lap times
    };
    
    // Timer reference for setInterval
    this.timer = null;
    // Start time reference for accurate time calculation
    this.startTime = null;

    // Bind methods to this context to ensure proper 'this' reference
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.recordLap = this.recordLap.bind(this);
  }

  /**
   * Component lifecycle method - called after component mounts
   * No timer initialization needed here as it's controlled by user actions
   */
  componentDidMount() {
    // Timer will be started by user clicking the start button
  }

  /**
   * Component lifecycle method - called before component unmounts
   * Clean up the timer to prevent memory leaks
   */
  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  /**
   * Start the stopwatch timer
   * Uses timestamp-based calculation to avoid drift issues with setInterval
   */
  startTimer() {
    if (!this.state.isRunning) {
      this.setState({ isRunning: true });
      
      // Calculate start time by subtracting already elapsed time from current time
      // This allows for proper pause/resume functionality
      this.startTime = Date.now() - this.state.elapsedTime;
      
      // Update timer every 10ms for smooth display
      this.timer = setInterval(() => {
        this.setState({
          elapsedTime: Date.now() - this.startTime,
        });
      }, 10);
    }
  }

  /**
   * Stop/pause the stopwatch timer
   * Preserves elapsed time for resume functionality
   */
  stopTimer() {
    if (this.state.isRunning) {
      clearInterval(this.timer);
      this.timer = null;
      this.setState({ isRunning: false });
    }
  }

  /**
   * Reset the stopwatch to initial state
   * Clears timer, elapsed time, and all recorded laps
   */
  resetTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.setState({
      elapsedTime: 0,
      isRunning: false,
      laps: [],
    });
  }

  /**
   * Record a lap time without stopping the main timer
   * Adds current elapsed time to the laps array
   */
  recordLap() {
    if (this.state.isRunning) {
      const newLapTime = this.state.elapsedTime;
      this.setState(prevState => ({
        laps: [...prevState.laps, newLapTime],
      }));
    }
  }

  /**
   * Format time from milliseconds to HH:MM:SS:ms display format
   * @param {number} milliseconds - Time in milliseconds to format
   * @returns {string} Formatted time string
   */
  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const ms = Math.floor((milliseconds % 1000) / 10); // Convert to centiseconds (0-99)
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);

    // Helper function to pad single digits with leading zero
    const pad = (num) => num < 10 ? '0' + num : num;

    return (
      `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(ms)}`
    );
  }

  /**
   * Render the stopwatch component
   * Displays timer, control buttons, and lap list
   */
  render() {
    const { elapsedTime, isRunning, laps } = this.state;

    return (
      <div className="stopwatch-container">
        <h1>ساعة الإيقاف</h1>
        
        {/* Main timer display */}
        <div className="timer-display">
          {this.formatTime(elapsedTime)}
        </div>
        
        {/* Control buttons */}
        <div className="controls">
          <button 
            onClick={this.startTimer} 
            disabled={isRunning}
            className="start-btn"
          >
            بدء
          </button>
          <button 
            onClick={this.stopTimer} 
            disabled={!isRunning}
            className="stop-btn"
          >
            إيقاف
          </button>
          <button 
            onClick={this.resetTimer}
            className="reset-btn"
          >
            إعادة ضبط
          </button>
          <button 
            onClick={this.recordLap} 
            disabled={!isRunning}
            className="lap-btn"
          >
            لفة
          </button>
        </div>
        
        {/* Laps display section */}
        <div className="laps-container">
          <h2>اللفات</h2>
          {laps.length === 0 ? (
            <p className="no-laps">لا توجد لفات مسجلة</p>
          ) : (
            <ol className="laps-list">
              {laps.map((lapTime, index) => (
                <li key={index}>
                  <span className="lap-number">اللفة {index + 1}</span>
                  <span className="lap-time">{this.formatTime(lapTime)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    );
  }
}

export default Stopwatch;


