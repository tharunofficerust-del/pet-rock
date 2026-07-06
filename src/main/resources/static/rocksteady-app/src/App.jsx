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

    // --- On Launch: Process Time Changes & Recovery/Decay Logic ---
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

        // If a calendar day has passed, apply the midnight reckoning calculation rules
        if (currentData.lastCheckInDate !== todayStr) {
            const total = currentData.habits.length;
            const completed = currentData.habits.filter(h => h.isCompletedToday).length;
            const missed = total - completed;

            if (missed > 0) {
                // Penalty: Lose 20 HP per missed task and reset the daily streak
                currentData.healthPoints = Math.max(0, currentData.healthPoints - (missed * 20));
                currentData.streakCount = 0;
            } else if (total > 0 && missed === 0) {
                // Reward: Complete all tasks to grow your daily streak and heal health points
                currentData.streakCount += 1;
                currentData.healthPoints = Math.min(100, currentData.healthPoints + 15);
            }

            // Transition Mood states based on structural health thresholds
            if (currentData.healthPoints > 80) currentData.moodState = "HAPPY";
            else if (currentData.healthPoints > 50) currentData.moodState = "BORED";
            else if (currentData.healthPoints > 20) currentData.moodState = "DEPRESSED";
            else currentData.moodState = "CRACKED";

            // Clean the task checkboxes completely for a new day cycle
            currentData.habits = currentData.habits.map(h => ({ ...h, isCompletedToday: false }));
            currentData.lastCheckInDate = todayStr;
        }

        localStorage.setItem("ROCKSTEADY_DATA", JSON.stringify(currentData));
        setGameState(currentData);
    }, []);

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

    return (
        <div className="app-container">
            {/* Top Bar Status Display Rows */}
            <div className="header-bar">
                <strong>Rock steady</strong>
                <div>Streak: {gameState.streakCount}</div>
            </div>

            {/* Main Visual Health Metrics */}
            <div className="health-container">
                <label>Healthbar ({gameState.healthPoints}%)</label>
                <div className="health-bar-bg">
                    <div className="health-bar-fill" style={{ width: `${gameState.healthPoints}%` }}></div>
                </div>
            </div>

            {/* Central Target Pet Rock Layout Wrapper */}
            <div className="rock-area">
                <div className={`pet-rock ${gameState.moodState}`}>
                    {gameState.moodState === "HAPPY" && "🪨 Pet Rock"}
                    {gameState.moodState === "BORED" && "😑 Bored Rock"}
                    {gameState.moodState === "DEPRESSED" && "🏚️ Sad Rock"}
                    {gameState.moodState === "CRACKED" && "💥 Cracked!!"}
                </div>
            </div>

            {/* Interactive Habit Section Controls */}
            <div className="habit-header">
                <span>Tasks ({gameState.habits.length}/5)</span>
                <button className="add-btn" onClick={() => setIsModalOpen(true)} disabled={gameState.habits.length >= 5}>
                    + add
                </button>
            </div>

            {/* Render Active Habit Elements Row Cards */}
            <div className="habit-list">
                {gameState.habits.map(h => (
                    <div className="habit-item" key={h.id}>
                        <label style={{ display: 'flex', gap: '8px', cursor: 'pointer', alignItems: 'center' }}>
                            <input type="checkbox" checked={h.isCompletedToday} onChange={() => toggleHabit(h.id)} />
                            <span className={h.isCompletedToday ? "completed-text" : ""}>{h.title}</span>
                        </label>
                        <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => deleteHabit(h.id)}>🗑️</button>
                    </div>
                ))}
            </div>

            {/* Dimmed Background Overlay Pop-up Modal Form */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <form className="modal-content" onSubmit={handleAddHabit}>
                        <h3>Add New Task</h3>
                        <input className="modal-input" type="text" placeholder="Enter task name..." value={newHabitTitle} onChange={(e) => setNewHabitTitle(e.target.value)} required />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" className="add-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" className="add-btn">Save</button>
                        </div>
                    </form>
                </div>
            )}

            {/* App Screen Mobile Footers Navigation Layout */}
            <div className="footer-buttons">
                <button className="footer-btn">Home</button>
                <button className="footer-btn">Stats</button>
                <button className="footer-btn">Settings</button>
            </div>
        </div>
    );
}

export default App;
