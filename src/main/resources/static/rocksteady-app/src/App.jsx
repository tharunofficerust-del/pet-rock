import { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [gameState, setGameState] = useState({
        rockName: "Rocky",
        healthPoints: 100,
        moodState: "HAPPY",
        streakCount: 0,
        lastCheckInDate: new Date().toISOString().split('T')[0],
        habits: []
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newHabitTitle, setNewHabitTitle] = useState("");
    const [dialogue, setDialogue] = useState("Tap me, slacker. Let's see your progress.");
    const [isDialogueVisible, setIsDialogueVisible] = useState(true);

    // --- On Launch: Process Time & Local Storage Updates ---
    useEffect(() => {
        const saved = localStorage.getItem("ROCKSTEADY_DATA");
        const todayStr = new Date().toISOString().split('T')[0];
        let currentData = saved ? JSON.parse(saved) : {
            rockName: "Rocky",
            healthPoints: 100,
            moodState: "HAPPY",
            streakCount: 0,
            lastCheckInDate: todayStr,
            habits: []
        };

        if (currentData.lastCheckInDate !== todayStr) {
            const total = currentData.habits.length;
            const completed = currentData.habits.filter(h => h.isCompletedToday).length;
            const missed = total - completed;

            if (missed > 0) {
                currentData.healthPoints = Math.max(0, currentData.healthPoints - (missed * 20));
                currentData.streakCount = 0;
            } else if (total > 0 && missed === 0) {
                currentData.streakCount += 1;
                currentData.healthPoints = Math.min(100, currentData.healthPoints + 15);
            }

            if (currentData.healthPoints > 80) currentData.moodState = "HAPPY";
            else if (currentData.healthPoints > 50) currentData.moodState = "BORED";
            else if (currentData.healthPoints > 20) currentData.moodState = "DEPRESSED";
            else currentData.moodState = "CRACKED";

            currentData.habits = currentData.habits.map(h => ({ ...h, isCompletedToday: false }));
            currentData.lastCheckInDate = todayStr;
        }

        localStorage.setItem("ROCKSTEADY_DATA", JSON.stringify(currentData));
        setGameState(currentData);
    }, []);

    // --- Automatically fade out speech messages after 4 seconds ---
    useEffect(() => {
        setIsDialogueVisible(true);
        const timer = setTimeout(() => {
            setIsDialogueVisible(false);
        }, 4000);
        return () => clearTimeout(timer);
    }, [dialogue]);

    const saveState = (updatedState) => {
        localStorage.setItem("ROCKSTEADY_DATA", JSON.stringify(updatedState));
        setGameState(updatedState);
    };

    const toggleHabit = (id) => {
        const updatedHabits = gameState.habits.map(h => 
            h.id === id ? { ...h, isCompletedToday: !h.isCompletedToday } : h
        );
        saveState({ ...gameState, habits: updatedHabits });
    };

    const deleteHabit = (id) => {
        const updatedHabits = gameState.habits.filter(h => h.id !== id);
        saveState({ ...gameState, habits: updatedHabits });
    };

    const handleAddHabit = (e) => {
        e.preventDefault();
        if (!newHabitTitle.trim()) return;
        if (gameState.habits.length >= 5) {
            alert("Maximum limit of 5 habits reached!");
            return;
        }

        const newHabit = {
            id: Date.now(),
            title: newHabitTitle,
            isCompletedToday: false
        };

        saveState({
            ...gameState,
            habits: [...gameState.habits, newHabit]
        });
        setNewHabitTitle("");
        setIsModalOpen(false);
    };

    const handleRockClick = () => {
        const quotes = [
            "I'm a literal pebble and my discipline is better than yours.",
            "Did you finish your tasks, or am I growing weeds tomorrow?",
            "Streak count is looking okay... keep going!",
            "Every checked box makes my stone skin radiant.",
            "Stay focused! Don't let me down."
        ];
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setDialogue(quotes[randomIndex]);
    };

    return (
        <div className="app-container">
            {/* Top Header Bar */}
            <div className="header-bar">
                <strong>{gameState.rockName}</strong>
                <div className="streak-badge">🔥 {gameState.streakCount}</div>
            </div>

            {/* Premium Health Metrics Display Track */}
            <div className="health-container">
                <label>HEALTHBAR ({gameState.healthPoints}%)</label>
                <div className="health-bar-bg">
                    <div className="health-bar-fill" style={{ width: `${gameState.healthPoints}%` }}></div>
                </div>
            </div>

            {/* Embedded Visual Gaming Panel */}
            <div className="rock-area">
                {/* Clean, Non-Distracting Fading Dialogue Bubble */}
                <div className={`speech-bubble ${isDialogueVisible ? 'fade-in' : 'fade-out'}`}>
                    {dialogue}
                </div>
                
                {/* Animated Character Object */}
                <div className={`pet-rock rock-breathing ${gameState.moodState}`} onClick={handleRockClick}>
                    <div className="eyes-container">
                        <div className="cartoon-eye"></div>
                        <div className="cartoon-eye"></div>
                    </div>
                    <div className="cartoon-mouth"></div>
                </div>
            </div>

            {/* Habit Controls Area */}
            <div className="habit-header">
                <span>TASKS ({gameState.habits.length}/5)</span>
                <button className="add-btn" onClick={() => setIsModalOpen(true)} disabled={gameState.habits.length >= 5}>
                    + add
                </button>
            </div>

            {/* Scrollable Tasks Output Area */}
            <div className="habit-list">
                {gameState.habits.map(h => (
                    <div className="habit-item" key={h.id}>
                        <label style={{ display: 'flex', gap: '12px', cursor: 'pointer', alignItems: 'center' }}>
                            <input type="checkbox" checked={h.isCompletedToday} onChange={() => toggleHabit(h.id)} />
                            <span className={h.isCompletedToday ? "completed-text" : ""}>{h.title}</span>
                        </label>
                        <button className="delete-icon-btn" onClick={() => deleteHabit(h.id)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Task Pop-up Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <form className="modal-content" onSubmit={handleAddHabit}>
                        <h3>ADD NEW TASK</h3>
                        <input className="modal-input" type="text" placeholder="Enter task name..." value={newHabitTitle} onChange={(e) => setNewHabitTitle(e.target.value)} required />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button type="button" className="cancel-modal-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" className="save-modal-btn">Save</button>
                        </div>
                    </form>
                </div>
            )}

            {/* High-Fidelity Vector-Based Navigation Bar Footer */}
            <div className="footer-buttons">
                <button className="footer-btn active-nav">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    <span className="nav-label">Home</span>
                </button>
                <button className="footer-btn">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    <span className="nav-label">Settings</span>
                </button>
                <button className="footer-btn">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    <span className="nav-label">About</span>
                </button>
            </div>
        </div>
    );
}

export default App;
