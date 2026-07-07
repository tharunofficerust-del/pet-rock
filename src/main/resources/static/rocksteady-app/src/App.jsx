import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './App.css';

function App() {
    const [gameState, setGameState] = useState({
        rockName: "Rocky",
        healthPoints: 100,
        moodState: "HAPPY",
        streakCount: 0,
        lastCheckInDate: new Date().toISOString().split('T')[0],
        habits: [],
        hasNamedRock: false
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFirstTimeModalOpen, setIsFirstTimeModalOpen] = useState(false);
    const [newHabitTitle, setNewHabitTitle] = useState("");
    const [dialogue, setDialogue] = useState("Tap me, slacker. Let's see your progress.");
    const [isDialogueVisible, setIsDialogueVisible] = useState(true);

    // --- Expression, Layout Tabs, and Custom Customization Hooks ---
    const [activeTab, setActiveTab] = useState("HOME"); // HOME, SETTINGS, ABOUT
    const [difficulty, setDifficulty] = useState("NORMAL"); // EASY, NORMAL, HARDCORE
    const [rockColor, setRockColor] = useState("ORANGE");   // ORANGE, NEON_BLUE, GOLD
    const [accessory, setAccessory] = useState("NONE");     // NONE, CROWN, HAT
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");
    const [isBlinking, setIsBlinking] = useState(false);
    const [isTalking, setIsTalking] = useState(false);
    const [isJumping, setIsJumping] = useState(false);

    // --- Built-in Offline HTML5 Sound Constructor Engine ---
    const playSound = (soundFileName) => {
        const audio = new Audio(`/sounds/${soundFileName}`);
        audio.volume = 0.4;
        audio.play().catch(() => console.log("Audio waiting for user-tap interaction layer activation"));
    };

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
            habits: [],
            hasNamedRock: false
        };

        if (!currentData.hasNamedRock) {
            setIsFirstTimeModalOpen(true);
        }

        if (currentData.lastCheckInDate !== todayStr) {
            const total = currentData.habits.length;
            const completed = currentData.habits.filter(h => h.isCompletedToday).length;
            const missed = total - completed;

            if (missed > 0) {
                // Apply penalty weight based on current active difficulty state multiplier
                const weight = difficulty === "EASY" ? 10 : (difficulty === "HARDCORE" ? 30 : 20);
                currentData.healthPoints = Math.max(0, currentData.healthPoints - (missed * weight));
                currentData.streakCount = 0;
                playSound('damage.mp3'); // Plays crunch damage audio alert
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
        setTempName(currentData.rockName);
    }, [difficulty]);

    // --- Speech Text Fading System ---
    useEffect(() => {
        setIsDialogueVisible(true);
        const timer = setTimeout(() => {
            setIsDialogueVisible(false);
        }, 4000);
        return () => clearTimeout(timer);
    }, [dialogue]);

    // --- Autonomous Eye Blinking Loop ---
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 150);
        }, 4000);
        return () => clearInterval(blinkInterval);
    }, []);

    const saveState = (updatedState) => {
        localStorage.setItem("ROCKSTEADY_DATA", JSON.stringify(updatedState));
        setGameState(updatedState);
    };
    const toggleHabit = (id) => {
        const habitToToggle = gameState.habits.find(h => h.id === id);

        if (habitToToggle && !habitToToggle.isCompletedToday) {
            playSound('success.mp3'); // Play high-chime victory reward audio

            confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.65 },
                colors: ['#FF94E8', '#5CE1E6', '#FFDE4D', '#B6FFA1']
            });

            setIsJumping(true);
            setTimeout(() => setIsJumping(false), 600);
            setDialogue("YAY! High discipline energy right there!");
        } else {
            playSound('tap.mp3');
        }

        const updatedHabits = gameState.habits.map(h =>
            h.id === id ? { ...h, isCompletedToday: !h.isCompletedToday } : h
        );
        saveState({ ...gameState, habits: updatedHabits });
    };

    const deleteHabit = (id) => {
        playSound('tap.mp3');
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

        playSound('tap.mp3');
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
        playSound('squish.mp3'); // Play squishy clay speech bubble sound
        setIsTalking(true);
        setTimeout(() => setIsTalking(false), 1200);

        const quotes = [
            `Hey! Gentle with the clicks, human!`,
            `My name is ${gameState.rockName}. Use settings to dress me up!`,
            `Daily streak is looking sweet at ${gameState.streakCount}!`,
            `Every checked box fuels my mineral power!`,
            `Current difficulty mode is set to ${difficulty}. Keep pushing!`
        ];
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setDialogue(quotes[randomIndex]);
    };

    const saveNewName = () => {
        if (tempName.trim()) {
            playSound('success.mp3');
            const updated = { ...gameState, rockName: tempName.trim(), hasNamedRock: true };
            saveState(updated);
            setIsEditingName(false);
            setIsFirstTimeModalOpen(false);
            setDialogue(`Awesome! My name is now officially ${tempName.trim()}!`);
        }
    };
    return (
        <div className="app-container">
            {/* Top Header Row Controls */}
            <div className="header-bar">
                {isEditingName ? (
                    <div className="name-edit-box">
                        <input
                            className="inline-name-input"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            maxLength={12}
                            autoFocus
                        />
                        <button className="inline-save-btn" onClick={saveNewName}>✓</button>
                    </div>
                ) : (
                    <strong className="editable-name-label" onClick={() => setIsEditingName(true)}>
                        {gameState.rockName}
                        <svg className="edit-pencil-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </strong>
                )}
                <div className="streak-badge">🔥 {gameState.streakCount}</div>
            </div>

            {/* Metric Loader Health tracking header track */}
            <div className="health-container">
                <label>HEALTH TRACKER ({gameState.healthPoints}%)</label>
                <div className="health-bar-bg">
                    <div className="health-bar-fill" style={{ width: `${gameState.healthPoints}%` }}></div>
                </div>
            </div>

            {/* Central Gaming Shell Board character deck layout panel */}
            <div className="rock-area">
                <div className={`speech-bubble ${isDialogueVisible ? 'fade-in' : 'fade-out'}`}>
                    {dialogue}
                </div>

                <div
                    className={`pet-rock 
                        ${gameState.moodState} color-${rockColor}
                        ${isTalking ? 'talking-mouth-anim' : ''} 
                        ${isJumping ? 'jump-active-anim' : 'rock-breathing-idle'}
                    `}
                    onClick={handleRockClick}
                >
                    {/* 👑 High-Fidelity Vector-Based Custom Accessories Art Overlay */}
                    {accessory === "CROWN" && (
                        <svg className="rock-accessory crown-asset" width="50" height="40" viewBox="0 0 24 24" version="1.1">
                            <path d="M2,19 L22,19 L20,8 L16,13 L12,5 L8,13 L4,8 Z" fill="#FFD166" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
                            <circle cx="12" cy="4" r="1.5" fill="#FF7B9C" stroke="#000" strokeWidth="1.5" />
                            <circle cx="3.5" cy="7.5" r="1.5" fill="#5CE1E6" stroke="#000" strokeWidth="1.5" />
                            <circle cx="20.5" cy="7.5" r="1.5" fill="#5CE1E6" stroke="#000" strokeWidth="1.5" />
                        </svg>
                    )}
                    {accessory === "HAT" && (
                        <svg className="rock-accessory hat-asset" width="50" height="40" viewBox="0 0 24 24" version="1.1">
                            <path d="M4,18 C4,15 6,15 7,15 L7,6 C7,5 8,4 10,4 L14,4 C16,4 17,5 17,6 L17,15 C18,15 20,15 20,18 C20,19.5 18,20 12,20 C6,20 4,19.5 4,18 Z" fill="#111111" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M7,14 L17,14" stroke="#FF7B9C" strokeWidth="3" strokeLinecap="round" /> {/* Fun Pink Ribbon accent */}
                        </svg>
                    )}


                    <div className="eyes-container">
                        <div className={`cartoon-eye ${isBlinking ? 'blink-active' : ''}`}></div>
                        <div className={`cartoon-eye ${isBlinking ? 'blink-active' : ''}`}></div>
                    </div>
                    <div className="cartoon-mouth"></div>
                </div>
            </div>

            {/* --- Core Routing Tabs View Switcher Block --- */}
            {activeTab === "HOME" && (
                <>
                    <div className="habit-header">
                        <span>HABITS MAPPED ({gameState.habits.length}/5)</span>
                        <button className="add-btn" onClick={() => setIsModalOpen(true)} disabled={gameState.habits.length >= 5}>
                            + ADD
                        </button>
                    </div>

                    <div className="habit-list">
                        {gameState.habits.map(h => (
                            <div className="habit-item" key={h.id}>
                                <label style={{ display: 'flex', gap: '14px', cursor: 'pointer', alignItems: 'center' }}>
                                    <input type="checkbox" checked={h.isCompletedToday} onChange={() => toggleHabit(h.id)} />
                                    <span className={h.isCompletedToday ? "completed-text" : ""}>{h.title}</span>
                                </label>
                                <button className="delete-icon-btn" onClick={() => deleteHabit(h.id)}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === "SETTINGS" && (
                <div className="subview-panel-container">
                    <h3>SETTINGS</h3>

                    <div className="setting-section-box">
                        <span className="setting-label">DIFFICULTY DECAY RATE</span>
                        <div className="setting-pill-row">
                            <button className={`pill-opt ${difficulty === 'EASY' ? 'selected' : ''}`} onClick={() => { setDifficulty('EASY'); playSound('tap.mp3'); }}>Easy</button>
                            <button className={`pill-opt ${difficulty === 'NORMAL' ? 'selected' : ''}`} onClick={() => { setDifficulty('NORMAL'); playSound('tap.mp3'); }}>Normal</button>
                            <button className={`pill-opt ${difficulty === 'HARDCORE' ? 'selected' : ''}`} onClick={() => { setDifficulty('HARDCORE'); playSound('tap.mp3'); }}>Hard</button>
                        </div>
                    </div>

                    <div className="setting-section-box">
                        <span className="setting-label">ROCK THEME COLOR</span>
                        <div className="setting-pill-row">
                            <button className={`pill-opt ${rockColor === 'ORANGE' ? 'selected' : ''}`} onClick={() => { setRockColor('ORANGE'); playSound('tap.mp3'); }}>Orange</button>
                            <button className={`pill-opt ${rockColor === 'NEON_BLUE' ? 'selected' : ''}`} onClick={() => { setRockColor('NEON_BLUE'); playSound('tap.mp3'); }}>Blue</button>
                            <button className={`pill-opt ${rockColor === 'GOLD' ? 'selected' : ''}`} onClick={() => { setRockColor('GOLD'); playSound('tap.mp3'); }}>Gold</button>
                            <button className={`pill-opt ${rockColor === 'PINK' ? 'selected' : ''}`} onClick={() => { setRockColor('PINK'); playSound('tap.mp3'); }}>Pink</button>
                            <button className={`pill-opt ${rockColor === 'GREEN' ? 'selected' : ''}`} onClick={() => { setRockColor('GREEN'); playSound('tap.mp3'); }}>Green</button>
                        </div>
                    </div>


                    <div className="setting-section-box">
                        <span className="setting-label">DRESS UP ACCESSORIES</span>
                        <div className="setting-pill-row">
                            <button className={`pill-opt ${accessory === 'NONE' ? 'selected' : ''}`} onClick={() => { setAccessory('NONE'); playSound('tap.mp3'); }}>None</button>
                            <button className={`pill-opt ${accessory === 'CROWN' ? 'selected' : ''}`} onClick={() => { setAccessory('CROWN'); playSound('tap.mp3'); }}>Crown</button>
                            <button className={`pill-opt ${accessory === 'HAT' ? 'selected' : ''}`} onClick={() => { setAccessory('HAT'); playSound('tap.mp3'); }}>Hat</button>
                        </div>
                    </div>

                    <button className="reset-game-btn" onClick={() => {
                        playSound('tap.mp3');
                        if (confirm("Are you sure you want to completely erase game data?")) {
                            localStorage.removeItem("ROCKSTEADY_DATA");
                            window.location.reload();
                        }
                    }}>
                        RESET GAME DATA 💥
                    </button>
                </div>
            )}

            {activeTab === "ABOUT" && (
                <div className="subview-panel-container">
                    <h3>ABOUT</h3>
                    <p className="about-body-text">
                        <strong>Rocksteady</strong> is a Habit Tracker Game that gamifies your daily tasks and habits by giving you a cute pet rock companion. 
                        Take care of your rock by completing your habits, and watch it thrive! Miss tasks, and your rock's health will decline. 
                        Customize your rock's appearance and accessories in the settings. 
                    </p>
                    <span className="version-tag">VibeCoded By Tharun Vijay - Version 1.0.0 (Build 2026)</span>
                </div>
            )}

            {/* Standard Habit Modal Input Card Popup */}
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

            {/* Adoption Setup Popup Form */}
            {isFirstTimeModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content first-time-modal">
                        <h2>WELCOME! 🎉</h2>
                        <p>Adopt your new accountability pet rock. Give them a special name to get started!</p>
                        <input className="modal-input first-name-field" type="text" placeholder="Name your rock (e.g. Rocky...)" value={tempName} onChange={(e) => setTempName(e.target.value)} maxLength={12} required />
                        <button className="save-modal-btn start-game-btn" onClick={saveNewName}>ADOPT PET ROCK 🪨</button>
                    </div>
                </div>
            )}

            {/* Floating iOS Style Navigation Control Deck */}
            <div className="footer-buttons">
                <button
                    className={`footer-btn ${activeTab === "HOME" ? "active-nav" : ""}`}
                    onClick={() => { setActiveTab("HOME"); playSound('tap.mp3'); }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span className="nav-label">Home</span>
                </button>

                <button
                    className={`footer-btn ${activeTab === "SETTINGS" ? "active-nav" : ""}`}
                    onClick={() => { setActiveTab("SETTINGS"); playSound('tap.mp3'); }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    <span className="nav-label">Settings</span>
                </button>

                <button
                    className={`footer-btn ${activeTab === "ABOUT" ? "active-nav" : ""}`}
                    onClick={() => { setActiveTab("ABOUT"); playSound('tap.mp3'); }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span className="nav-label">About</span>
                </button>
            </div>
        </div>
    );
}

export default App;
