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
        hasNamedRock: false,
        difficulty: "NORMAL",
        rockColor: "ORANGE",
        accessory: "NONE"
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFirstTimeModalOpen, setIsFirstTimeModalOpen] = useState(false);
    const [newHabitTitle, setNewHabitTitle] = useState("");
    const [dialogue, setDialogue] = useState("Tap me, slacker. Let's see your progress.");
    const [isDialogueVisible, setIsDialogueVisible] = useState(true);

    // --- Expression, Navigation, and Live Feedback State Hooks ---
    const [activeTab, setActiveTab] = useState("HOME");
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");
    const [isBlinking, setIsBlinking] = useState(false);
    const [isTalking, setIsTalking] = useState(false);
    const [isJumping, setIsJumping] = useState(false);

    // --- Native HTML5 Local Audio Sound Playback Engine ---
    const playSound = (soundFileName) => {
        const audio = new Audio(`/sounds/${soundFileName}`);
        audio.volume = 0.4;
        audio.play().catch(() => console.log("Audio waiting for user-tap interaction layer activation"));
    };
    // --- Lifecycle Handler: Evaluates Storage, Time Decay, and Fail-safes ---
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
            hasNamedRock: false,
            difficulty: "NORMAL",
            rockColor: "ORANGE",
            accessory: "NONE"
        };

        // Inject default properties for existing data caches
        if (currentData.difficulty === undefined) currentData.difficulty = "NORMAL";
        if (currentData.rockColor === undefined) currentData.rockColor = "ORANGE";
        if (currentData.accessory === undefined) currentData.accessory = "NONE";

        if (!currentData.hasNamedRock) {
            setIsFirstTimeModalOpen(true);
        }

        if (currentData.lastCheckInDate !== todayStr) {
            const total = currentData.habits.length;
            const completed = currentData.habits.filter(h => h.isCompletedToday).length;
            const missed = total - completed;

            if (missed > 0) {
                const weight = currentData.difficulty === "EASY" ? 10 : (currentData.difficulty === "HARDCORE" ? 30 : 20);
                currentData.healthPoints = Math.max(0, currentData.healthPoints - (missed * weight));
                currentData.streakCount = 0;
                playSound('damage.mp3');
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
    }, []);
    useEffect(() => {
        setIsDialogueVisible(true);
        const timer = setTimeout(() => {
            setIsDialogueVisible(false);
        }, 4000);
        return () => clearTimeout(timer);
    }, [dialogue]);

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

    const updateGameSetting = (key, value) => {
        const updated = { ...gameState, [key]: value };
        saveState(updated);
    };

    const toggleHabit = (id) => {
        const habitToToggle = gameState.habits.find(h => h.id === id);
        if (habitToToggle && !habitToToggle.isCompletedToday) {
            playSound('success.mp3');
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
        const newHabit = { id: Date.now(), title: newHabitTitle, isCompletedToday: false };
        saveState({ ...gameState, habits: [...gameState.habits, newHabit] });
        setNewHabitTitle("");
        setIsModalOpen(false);
    };
    const handleRockClick = () => {
        playSound('squish.mp3');
        setIsTalking(true);
        setTimeout(() => setIsTalking(false), 1200);
        const quotes = [
            `Hey! Gentle with the clicks, human!`,
            `My name is ${gameState.rockName}. Use settings to dress me up!`,
            `Daily streak is looking sweet at ${gameState.streakCount}!`,
            `Every checked box fuels my mineral power!`,
            `Current difficulty mode is set to ${gameState.difficulty}. Keep pushing!`
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
            <div className="header-bar">
                {isEditingName ? (
                    <div className="name-edit-box">
                        <input className="inline-name-input" value={tempName} onChange={(e) => setTempName(e.target.value)} maxLength={12} autoFocus />
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

            <div className="health-container">
                <label>HEALTH TRACKER ({gameState.healthPoints}%)</label>
                <div className="health-bar-bg">
                    <div className="health-bar-fill" style={{ width: `${gameState.healthPoints}%` }}></div>
                </div>
            </div>
            <div className="rock-area">
                <div className={`speech-bubble ${isDialogueVisible ? 'fade-in' : 'fade-out'}`}>{dialogue}</div>
                <div
                    className={`pet-rock 
        ${gameState.moodState} color-${gameState.rockColor}
        ${isTalking ? 'talking-mouth-anim' : ''} 
        ${isJumping ? 'jump-active-anim' : 'rock-breathing-idle'}
    `}
                    onClick={handleRockClick}
                >
                    {/* 🌿 Vector Sprout Leaf: Renders as high-fidelity cartoon art when 'NONE' is active */}
                    {gameState.accessory === "NONE" && (
                        <div className="rock-accessory sprout-leaves-asset">
                            <svg width="60" height="35" viewBox="0 0 60 35" version="1.1">
                                <path d="M30,35 L30,22" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
                                <path d="M30,22 C15,12 10,24 5,16 C10,4 25,12 30,22 Z" fill="#B6FFA1" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
                                <path d="M30,22 C45,12 50,24 55,16 C50,4 35,12 30,22 Z" fill="#B6FFA1" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
                                <path d="M12,18 C18,15 24,18 27,21" stroke="#5EBC3F" strokeWidth="2" strokeLinecap="round" fill="none" />
                                <path d="M48,18 C42,15 36,18 33,21" stroke="#5EBC3F" strokeWidth="2" strokeLinecap="round" fill="none" />
                            </svg>
                        </div>
                    )}

                    {/* 👑 Other Dynamic Accessories Overlays */}
                    {/* Accessories Overlays with Re-calculated Baselines */}
                    {gameState.accessory === "CROWN" && (
                        <svg className="rock-accessory crown-asset" width="56" height="42" viewBox="0 0 24 24" version="1.1">
                            {/* Thick block shadow backing */}
                            <path d="M2,19 L22,19 L20,7 L16,12 L12,4 L8,12 L4,7 Z" fill="#000" />
                            {/* Main Yellow Crown Body */}
                            <path d="M3,18 L21,18 L19,8 L15,13 L12,5 L9,13 L5,8 Z" fill="#FFD166" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
                            {/* Ruby and Sapphire gems details */}
                            <circle cx="12" cy="5" r="1.5" fill="#FF7B9C" stroke="#000" strokeWidth="1" />
                            <circle cx="5" cy="8" r="1.5" fill="#5CE1E6" stroke="#000" strokeWidth="1" />
                            <circle cx="19" cy="8" r="1.5" fill="#5CE1E6" stroke="#000" strokeWidth="1" />
                            <rect x="7" y="15" width="3" height="3" fill="#FF7B9C" rx="0.5" />
                            <rect x="14" y="15" width="3" height="3" fill="#5CE1E6" rx="0.5" />
                        </svg>
                    )}
                    {gameState.accessory === "HAT" && (
                        <svg className="rock-accessory hat-asset" width="55" height="42" viewBox="0 0 24 24" version="1.1">
                            <path d="M3,18 C3,15 5,15 6,15 L6,6 C6,5 7,4 9,4 L15,4 C17,4 18,5 18,6 L18,15 C19,15 21,15 21,18 C21,19.5 19,20 12,20 C5,20 3,19.5 3,18 Z" fill="#111111" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
                            <path d="M6,14 L18,14" stroke="#FF7B9C" strokeWidth="3.5" strokeLinecap="round" />
                        </svg>
                    )}
                    {gameState.accessory === "PARTY" && (
                        <svg className="rock-accessory party-asset" width="55" height="55" viewBox="0 0 24 24" version="1.1">
                            <path d="M12,1 L2.5,19.5 L21.5,19.5 Z" fill="#000000" />
                            <path d="M12,2 L3,19 L21,19 Z" fill="#FF94E8" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
                            <path d="M6.5,13 L14.5,7" stroke="#FFDE4D" strokeWidth="3" strokeLinecap="round" />
                            <path d="M9.5,17 L18,11" stroke="#5CE1E6" strokeWidth="3" strokeLinecap="round" />
                            <circle cx="12" cy="2" r="3" fill="#FFDE4D" stroke="#000000" strokeWidth="2.5" />
                        </svg>
                    )}
                    {gameState.accessory === "GLASSES" && (
                        <div className="premium-glasses-rig">
                            <svg width="106" height="36" viewBox="0 0 106 36" version="1.1">
                                <rect x="25" y="11" width="56" height="6" fill="#000000" rx="3" />
                                <circle cx="23" cy="17" r="16" fill="#000000" />
                                <circle cx="23" cy="17" r="12" fill="#111111" />
                                <path d="M15,14 C19,10 23,12 25,15" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                                <circle cx="83" cy="17" r="16" fill="#000000" />
                                <circle cx="83" cy="17" r="12" fill="#111111" />
                                <path d="M75,14 C79,10 83,12 85,15" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                            </svg>
                        </div>
                    )}


                    {/* Symmetric Cheek Element Duos */}
                    <div className="rock-blush blush-left"></div>
                    <div className="rock-blush blush-right"></div>

                    {/* Central Sparkly Eyes Layout Container */}
                    <div className="eyes-container">
                        <div className={`cartoon-eye ${isBlinking ? 'blink-active' : ''}`}></div>
                        <div className={`cartoon-eye ${isBlinking ? 'blink-active' : ''}`}></div>
                    </div>

                    {/* The Talking Mouth element */}
                    <div className="cartoon-mouth"></div>
                </div>

            </div>

            {activeTab === "HOME" && (
                <>
                    <div className="habit-header">
                        <span>HABITS MAPPED ({gameState.habits.length}/5)</span>
                        <button className="add-btn" onClick={() => setIsModalOpen(true)} disabled={gameState.habits.length >= 5}>+ ADD</button>
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
                            <button className={`pill-opt ${gameState.difficulty === 'EASY' ? 'selected' : ''}`} onClick={() => updateGameSetting('difficulty', 'EASY')}>Easy</button>
                            <button className={`pill-opt ${gameState.difficulty === 'NORMAL' ? 'selected' : ''}`} onClick={() => updateGameSetting('difficulty', 'NORMAL')}>Normal</button>
                            <button className={`pill-opt ${gameState.difficulty === 'HARDCORE' ? 'selected' : ''}`} onClick={() => updateGameSetting('difficulty', 'HARDCORE')}>Hard</button>
                        </div>
                    </div>
                    <div className="setting-section-box">
                        <span className="setting-label">ROCK THEME COLOR</span>
                        <div className="setting-pill-row">
                            <button className={`pill-opt ${gameState.rockColor === 'ORANGE' ? 'selected' : ''}`} onClick={() => updateGameSetting('rockColor', 'ORANGE')}>Orange</button>
                            <button className={`pill-opt ${gameState.rockColor === 'NEON_BLUE' ? 'selected' : ''}`} onClick={() => updateGameSetting('rockColor', 'NEON_BLUE')}>Blue</button>
                            <button className={`pill-opt ${gameState.rockColor === 'GOLD' ? 'selected' : ''}`} onClick={() => updateGameSetting('rockColor', 'GOLD')}>Gold</button>
                            <button className={`pill-opt ${gameState.rockColor === 'PINK' ? 'selected' : ''}`} onClick={() => updateGameSetting('rockColor', 'PINK')}>Pink</button>
                            <button className={`pill-opt ${gameState.rockColor === 'GREEN' ? 'selected' : ''}`} onClick={() => updateGameSetting('rockColor', 'GREEN')}>Green</button>
                        </div>
                    </div>
                    <div className="setting-section-box">
                        <span className="setting-label">DRESS UP ACCESSORIES</span>
                        <div className="setting-pill-row">
                            <button className={`pill-opt ${gameState.accessory === 'NONE' ? 'selected' : ''}`} onClick={() => updateGameSetting('accessory', 'NONE')}>None</button>
                            <button className={`pill-opt ${gameState.accessory === 'CROWN' ? 'selected' : ''}`} onClick={() => updateGameSetting('accessory', 'CROWN')}>Crown</button>
                            <button className={`pill-opt ${gameState.accessory === 'HAT' ? 'selected' : ''}`} onClick={() => updateGameSetting('accessory', 'HAT')}>Hat</button>
                            <button className={`pill-opt ${gameState.accessory === 'PARTY' ? 'selected' : ''}`} onClick={() => updateGameSetting('accessory', 'PARTY')}>Party</button>
                            <button className={`pill-opt ${gameState.accessory === 'GLASSES' ? 'selected' : ''}`} onClick={() => updateGameSetting('accessory', 'GLASSES')}>Cool</button>
                        </div>
                    </div>
                    <button className="reset-game-btn" onClick={() => { playSound('tap.mp3'); if (confirm("Are you sure you want to completely erase game data?")) { localStorage.removeItem("ROCKSTEADY_DATA"); window.location.reload(); } }}>RESET GAME DATA 💥</button>
                </div>
            )}

            {activeTab === "ABOUT" && (
                <div className="subview-panel-container">
                    <h3>ABOUT</h3>
                    <p className="about-body-text"><strong>Rocksteady</strong> is a local-first, privacy-focused utility built with Vite React wrapped inside Capacitor cross-platform plugins.</p>
                    <span className="version-tag">Version 1.0.0 (Build 2026)</span>
                </div>
            )}

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

            <div className="footer-buttons">
                <button className={`footer-btn ${activeTab === "HOME" ? "active-nav" : ""}`} onClick={() => { setActiveTab("HOME"); playSound('tap.mp3'); }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg><span className="nav-label">Home</span></button>
                <button className={`footer-btn ${activeTab === "SETTINGS" ? "active-nav" : ""}`} onClick={() => { setActiveTab("SETTINGS"); playSound('tap.mp3'); }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg><span className="nav-label">Settings</span></button>
                <button className={`footer-btn ${activeTab === "ABOUT" ? "active-nav" : ""}`} onClick={() => { setActiveTab("ABOUT"); playSound('tap.mp3'); }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg><span className="nav-label">About</span></button>
            </div>
        </div>
    );
}

export default App;
