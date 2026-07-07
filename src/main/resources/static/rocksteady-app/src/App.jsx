import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import './App.css';

function App() {
    const [gameState, setGameState] = useState({
        rockName: "Rocky",
        healthPoints: 100,
        moodState: "HAPPY",
        streakCount: 0,
        lastCheckInDate: new Date().toISOString().split('T'),
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

    // --- Layout viewports and animation navigation tracking hooks ---
    const [activeTab, setActiveTab] = useState("HOME");
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");
    const [isBlinking, setIsBlinking] = useState(false);
    const [isTalking, setIsTalking] = useState(false);
    const [isJumping, setIsJumping] = useState(false);

    const playSound = (soundFileName) => {
        const audio = new Audio(`/sounds/${soundFileName}`);
        audio.volume = 0.4;
        audio.play().catch(() => console.log("Audio waiting for active interaction layers"));
    };
    useEffect(() => {
        const saved = localStorage.getItem("ROCKSTEADY_DATA");
        const todayStr = new Date().toISOString().split('T');

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

            currentData.habits = currentData.habits.map(h => ({ ...h, isCompletedToday: false }));
            currentData.lastCheckInDate = todayStr;
        }

        if (currentData.healthPoints <= 15) currentData.moodState = "CRACKED";
        else if (currentData.healthPoints <= 50) currentData.moodState = "DEPRESSED";
        else if (currentData.healthPoints <= 80) currentData.moodState = "BORED";
        else currentData.moodState = "HAPPY";

        localStorage.setItem("ROCKSTEADY_DATA", JSON.stringify(currentData));
        setGameState(currentData);
        setTempName(currentData.rockName);
    }, []);
    // --- 🆕 FIX B: Auto-Refreshes Timer on Rapid Tap Cycles ---
    useEffect(() => {
        setIsDialogueVisible(true);
        const timer = setTimeout(() => {
            setIsDialogueVisible(false);
        }, 4000);
        return () => clearTimeout(timer); // Clears previous pending timeouts on click bursts
    }, [dialogue]); // Reacts immediately whenever a fresh text string drops in


    useEffect(() => {
        const blinkInterval = setInterval(() => {
            if (gameState.moodState === "HAPPY" || gameState.moodState === "DEPRESSED") {
                setIsBlinking(true);
                setTimeout(() => setIsBlinking(false), 150);
            }
        }, 4000);
        return () => clearInterval(blinkInterval);
    }, [gameState.moodState]);

    const saveState = (updatedState) => {
        let currentHP = updatedState.healthPoints;
        if (currentHP <= 15) updatedState.moodState = "CRACKED";
        else if (currentHP <= 50) updatedState.moodState = "DEPRESSED";
        else if (currentHP <= 80) updatedState.moodState = "BORED";
        else updatedState.moodState = "HAPPY";

        localStorage.setItem("ROCKSTEADY_DATA", JSON.stringify(updatedState));
        setGameState(updatedState);
    };

    const updateGameSetting = (key, value) => {
        let updated = { ...gameState, [key]: value };
        if (key === 'healthPoints') {
            let hp = value;
            if (hp <= 15) updated.moodState = "CRACKED";
            else if (hp <= 50) updated.moodState = "DEPRESSED";
            else if (hp <= 80) updated.moodState = "BORED";
            else updated.moodState = "HAPPY";
        }
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
                colors: ['#FF52C1', '#00E5FF', '#FFD500', '#26E65B']
            });
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

        // 🎲 DYNAMIC PHYSICS DICE ROLL: Randomly choose between a jump or squish animation
        const isLuckyJump = Math.random() > 0.6;
        if (isLuckyJump && gameState.moodState !== "CRACKED") {
            setIsJumping(true);
            setTimeout(() => setIsJumping(false), 600);
        }

        let quotes = [];
        if (gameState.moodState === "CRACKED") {
            quotes = [
                "BOO! Your laziness literally shattered my physical rock skin! 👻",
                "I am haunting your notifications until you finish a task!",
                "Look at what you did! I am a spectral stone cloud now. Do your chores!",
                "Ghost rocks never rest... and neither should slackers. Go check a box!"
            ];
        } else if (gameState.moodState === "DEPRESSED") {
            quotes = [
                "Ugh... my mineral core is fading... check off a box quick! 🤒",
                "I am shivering under this blanket because you are procrastinating!",
                "Call a doctor! Or better yet, go complete your daily tracker!",
                "Help me... this thermometer is about to explode from high slacker stress!"
            ];
        } else if (gameState.moodState === "BORED") {
            quotes = [
                "Yawn... scrolling social media is contagious, I see. 🥱",
                "Wake me up when you actually decide to be productive today.",
                "This snot bubble is the only exciting thing happening in this app right now.",
                "Are we going to hit our goals today or just stare at my eyelids?"
            ];
        } else {
            // HAPPY / FULL HEALTH QUOTES
            quotes = [
                "Ow! Gentle with the clicks, human! I'm feeling strong today! 💪",
                "Look at these sparkly eyes! Peak discipline performance right here!",
                "Daily streak is absolute fire! Keep feeding my mineral matrix!",
                "100% health feels incredible. Let's crush our remaining open tasks!"
            ];
        }

        const randomIndex = Math.floor(Math.random() * quotes.length);
        setDialogue(quotes[randomIndex]);

        const selectedQuote = quotes[randomIndex];

        // 🛡️ SAFETY CHECKER FALLBACK: Catch empty elements instantly
        if (!selectedQuote || selectedQuote.trim() === "") {
            setDialogue(`Hey! I'm feeling extra sturdy right now! 🔥`);
        } else {
            setDialogue(selectedQuote);
        }

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
                        {/* Top Arcade Header Bar */}
            <div className="header-bar">
                {isEditingName ? (
                    <div className="name-edit-box">
                        <input 
                            className="inline-name-input" 
                            value={tempName} 
                            onChange={(e) => setTempName(e.target.value)} 
                            maxLength={12} 
                            autoFocus 
                            onBlur={saveNewName} /* Automatically saves name if user clicks away */
                            onKeyDown={(e) => e.key === 'Enter' && saveNewName()} /* Saves on Enter */
                        />
                        <button className="inline-save-btn" onClick={saveNewName}>✓</button>
                    </div>
                ) : (
                    /* 🏷️ STYLIZED STICKER BANNER: Tap anywhere on the block to rename */
                    <div className="stylized-name-badge" onClick={() => setIsEditingName(true)}>
                        <span className="app-title-prefix">PET</span>
                        <strong className="main-rock-name-text">{gameState.rockName}</strong>
                    </div>
                )}
                
                {/* 🆕 UPGRADE: Replaced standard browser alert popup with interactive in-game speech dialog */}
                <div 
                    className="streak-badge" 
                    onClick={() => {
                        playSound('success.mp3');
                        setDialogue(`🔥 Streak Info: You have a ${gameState.streakCount}-day discipline streak! Keep feeding my mineral matrix!`);
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    🔥 {gameState.streakCount}
                </div>
            </div>


            {/* Health Meter Container */}
            <div className="health-container">
                <label>HEALTH TRACKER ({gameState.healthPoints}%)</label>
                <div className="health-bar-bg">
                    <motion.div
                        className="health-bar-fill"
                        initial={{ width: "0%" }}
                        animate={{ width: `${gameState.healthPoints}%` }}
                        transition={{ type: "spring", stiffness: 60 }}
                    />
                </div>
            </div>
            {/* Central Gaming View Deck Panel Screen */}
            {/* Central Gaming View Deck Panel Screen Matrix */}
            <div className="rock-area">

                {/* 🔒 1. PERMANENT RESPONSIVE DIALOGUE TRACK LAYER */}
                <div className="dialogue-zone-wrapper">
                    <AnimatePresence mode="popLayout">
                        {isDialogueVisible && (
                            <motion.div
                                key={dialogue}
                                className="speech-bubble"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                style={{ transformOrigin: "bottom center" }}
                            >
                                {dialogue}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 🔒 2. PERMANENT RESPONSIVE PET ROCK CANVAS LAYER */}
                <div className="character-zone-wrapper">
                    <AnimatePresence mode="wait">
                        {gameState.moodState === "CRACKED" ? (
                            /* 👻 STATE 4 DESIGN: THE FLOATING GHOST SPIRIT VIEWPORT (Fires under 15% HP) */
                            <motion.div
                                key="ghost-view" className="ghost-stage-wrapper"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ type: "spring", bounce: 0.4 }}
                            >
                                <div className="broken-rock-shell">
                                    <div className="shell-crack-line"></div>
                                </div>
                                <motion.div
                                    className="ghost-character ghost-float-anim"
                                    onClick={handleRockClick}
                                    whileTap={{ scale: 0.93, y: 5 }}
                                >
                                    <div className="ghost-tail"></div>
                                    <div className="ghost-eyes-container">
                                        <div className="ghost-cross-eye">✕</div>
                                        <div className="ghost-cross-eye">✕</div>
                                    </div>
                                    <div className="ghost-wavy-mouth"></div>
                                </motion.div>
                            </motion.div>
                        ) : (
                            /* 🪨 STATES 1-3 DESIGN: SINGLE-MESH MOTION INTERFACE WITH PERFECT ACCESSORIES ORDER */
                            <motion.div
                                key="rock-view"
                                className={`pet-rock color-${gameState.rockColor} ${gameState.moodState} ${isTalking ? 'talking-mouth-anim' : ''} ${isJumping ? 'jump-active-anim' : ''}`}
                                onClick={handleRockClick}
                                animate={{
                                    y: [0, -4, 0],
                                    scaleX: [1, 1.03, 1],
                                    scaleY: [1, 0.97, 1]
                                }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.85, scaleY: 0.7, scaleX: 1.25, rotate: 2 }}
                            >
                                {/* 👑 1. ACCESSORIES LAYER (PLACED FIRST AT THE TOP OF THE MESH) */}
                                {gameState.accessory === "NONE" && (
                                    <div className="rock-accessory sprout-leaves-asset">
                                        <svg width="60" height="35" viewBox="0 0 60 35">
                                            <path d="M30,35 L30,22" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
                                            <path d="M30,22 C15,12 10,24 5,16 C10,4 25,12 30,22 Z" fill="#26E65B" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
                                            <path d="M30,22 C45,12 50,24 55,16 C50,4 35,12 30,22 Z" fill="#26E65B" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}

                                {gameState.accessory === "CROWN" && (
                                    <svg className="rock-accessory crown-asset" width="56" height="42" viewBox="0 0 24 24" version="1.1">
                                        <path d="M2,19 L22,19 L20,7 L16,12 L12,4 L8,12 L4,7 Z" fill="#000" />
                                        <path d="M3,18 L21,18 L19,8 L15,13 L12,5 L9,13 L5,8 Z" fill="#FFD500" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
                                        <circle cx="12" cy="5" r="1.5" fill="#FF52C1" stroke="#000" strokeWidth="1" />
                                        <circle cx="5" cy="8" r="1.5" fill="#00E5FF" stroke="#000" strokeWidth="1" />
                                        <circle cx="19" cy="8" r="1.5" fill="#00E5FF" stroke="#000" strokeWidth="1" />
                                    </svg>
                                )}

                                {gameState.accessory === "HAT" && (
                                    <svg className="rock-accessory hat-asset" width="55" height="42" viewBox="0 0 24 24" version="1.1">
                                        <path d="M4,18 C4,15 5,15 6,15 L6,6 L17,6 L17,15 C19,15 21,15 21,18 Z" fill="#111" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
                                        <path d="M6,14 L18,14" stroke="#FF52C1" strokeWidth="3.5" strokeLinecap="round" />
                                    </svg>
                                )}

                                {gameState.accessory === "PARTY" && (
                                    <svg className="rock-accessory party-asset" width="55" height="55" viewBox="0 0 24 24" version="1.1">
                                        <path d="M12,1 L2.5,19.5 L21.5,19.5 Z" fill="#000000" />
                                        <path d="M12,2 L3,19 L21,19 Z" fill="#FF52C1" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
                                        <path d="M6.5,13 L14.5,7" stroke="#FFD500" strokeWidth="3" strokeLinecap="round" />
                                        <path d="M9.5,17 L18,11" stroke="#00E5FF" strokeWidth="3" strokeLinecap="round" />
                                        <circle cx="12" cy="2" r="3" fill="#FFD500" stroke="#000000" strokeWidth="2.5" />
                                    </svg>
                                )}

                                {gameState.accessory === "GLASSES" && (
                                    <div className="premium-glasses-rig">
                                        <svg width="106" height="36" viewBox="0 0 106 36"><rect x="25" y="11" width="56" height="6" fill="#000000" rx="3" /><circle cx="23" cy="17" r="16" fill="#000000" /><circle cx="23" cy="17" r="12" fill="#111111" /><path d="M15,14 C19,10 23,12 25,15" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" /><circle cx="83" cy="17" r="16" fill="#000000" /><circle cx="83" cy="17" r="12" fill="#111111" /><path d="M75,14 C79,10 83,12 85,15" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" /></svg>
                                    </div>
                                )}

                                {/* 👀 2. FACE LAYER (PLACED UNDERNEATH ACCESSORIES) */}
                                <div className="rock-blush blush-left"></div>
                                <div className="rock-blush blush-right"></div>

                                <div className="eyes-container">
                                    <div className="cartoon-eye"><div className="cartoon-eye-glint-two"></div></div>
                                    <div className="cartoon-eye"><div className="cartoon-eye-glint-two"></div></div>
                                </div>

                                <div className="cartoon-mouth"></div>
                                {/* 💤 ANIME SLACKER SLEEPY BUBBLE EFFECT (Fires only during BORED state) */}
                                {gameState.moodState === "BORED" && (
                                    <div className="anime-sleepy-bubble">
                                        <svg width="40" height="40" viewBox="0 0 40 40">
                                            <circle cx="20" cy="20" r="16" fill="#A0F4FF" stroke="#000" strokeWidth="3" />
                                            <path d="M12,12 C15,9 18,9 20,10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                                        </svg>
                                        <span className="sleepy-zzz-tag">Z</span>
                                    </div>
                                )}

                                {/* ⚡ HEALTH CONDITION EXPRESSION OVERLAYS */}
                                {gameState.healthPoints <= 80 && (
                                    <div className="rock-fracture-cracks">
                                        <svg width="125" height="115" viewBox="0 0 125 115" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                                            <path d="M15,25 L30,32 L24,45" stroke="#000000" strokeWidth="3" strokeLinecap="round" fill="none" />
                                            <path d="M105,95 L92,80 L98,68 L88,60" stroke="#000000" strokeWidth="3" strokeLinecap="round" fill="none" />
                                        </svg>
                                    </div>
                                )}

                                {gameState.healthPoints <= 50 && (
                                    <>
                                        <div className="hospital-ice-pack"><svg width="40" height="25" viewBox="0 0 40 25"><ellipse cx="20" cy="15" rx="16" ry="8" fill="#00E5FF" stroke="#000" strokeWidth="2.5" /><path d="M20,7 L20,2" stroke="#000" strokeWidth="3" /><circle cx="20" cy="2" r="2" fill="#000" /></svg></div>
                                        <div className="hospital-blanket"><div className="blanket-fold-line"></div><span className="medical-cross-symbol">＋</span></div>
                                        <div className="hospital-thermometer"></div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* --- Core Routing Tabs View Switcher Block --- */}
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
                                <button className="delete-icon-btn" onClick={() => deleteHabit(h.id)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg></button>
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
                            <button className={`pill-opt ${gameState.accessory === 'NONE' ? 'selected' : ''}`} onClick={() => updateGameSetting('accessory', 'NONE')}>Leaves</button>
                            <button className={`pill-opt ${gameState.accessory === 'CROWN' ? 'selected' : ''}`} onClick={() => updateGameSetting('accessory', 'CROWN')}>Crown</button>
                            <button className={`pill-opt ${gameState.accessory === 'HAT' ? 'selected' : ''}`} onClick={() => updateGameSetting('accessory', 'HAT')}>Hat</button>
                            <button className={`pill-opt ${gameState.accessory === 'PARTY' ? 'selected' : ''}`} onClick={() => updateGameSetting('accessory', 'PARTY')}>Party</button>
                            <button className={`pill-opt ${gameState.accessory === 'GLASSES' ? 'selected' : ''}`} onClick={() => updateGameSetting('accessory', 'GLASSES')}>Cool</button>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === "ABOUT" && (
                <div className="subview-panel-container">
                    <h3>ABOUT PET PEBBLE 🪨</h3>
                    <p className="about-body-text" style={{ marginBottom: '10px' }}>
                        <strong>Pet Pebble</strong> is a high-discipline accountability game designed to keep your habits rock-solid!
                    </p>

                    <div style={{ textAlign: 'left', background: '#FFDE4D', color: '#000000', padding: '12px', borderRadius: '16px', border: '3px solid #000000', boxShadow: '4px 4px 0px #FF52C1', marginBottom: '14px' }}>
                        <span style={{ fontFamily: 'Lexend Mega', fontSize: '0.65rem', fontWeight: 900, color: '#000000', display: 'block', marginBottom: '6px' }}>🎮 HOW TO PLAY:</span>
                        <ul style={{ paddingLeft: '16px', fontFamily: 'Fredoka', fontSize: '0.8rem', lineHeight: '1.4', listStyleType: 'square' }}>
                            <li>Add up to <strong>5 custom habits</strong> on the home tab.</li>
                            <li>Check them off daily to fuel your pebble's <strong>Mineral Energy</strong>.</li>
                            <li>Leave tasks incomplete past midnight, and your pebble takes <strong>Heavy Fracture Damage</strong>!</li>
                            <li>Keep a perfect streak alive to dress your pebble up in rare, premium accessories.</li>
                        </ul>
                    </div>

                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', borderTop: '3px solid #000', paddingTop: '10px', marginTop: 'auto' }}>
                        <span style={{ fontFamily: 'Lexend Mega', fontSize: '0.65rem', fontWeight: 900, color: '#00E5FF' }}>DESIGNED & DEVELOPED BY:</span>
                        <strong style={{ fontFamily: 'Lexend Mega', fontSize: '0.9rem', fontWeight: 900, color: '#000' }}>THARUN VIJAY 🚀</strong>
                        <span className="version-tag" style={{ marginTop: '4px' }}>Version 1.0.0 (Build 2026)</span>
                    </div>

                    {/* 🛠️ INTEGRATED LIVE HEALTH STATE TEST PANEL */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px', borderTop: '2px dashed #000', paddingTop: '8px' }}>
                        <span style={{ fontSize: '0.55rem', fontFamily: 'Lexend Mega', fontWeight: 900 }}>TAP TO TEST VISUAL STAGES:</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button type="button" style={{ padding: '6px 4px', fontSize: '0.65rem', flex: 1, fontFamily: 'Fredoka', fontWeight: 700, cursor: 'pointer' }} onClick={() => updateGameSetting('healthPoints', 100)}>100 (Happy)</button>
                            <button type="button" style={{ padding: '6px 4px', fontSize: '0.65rem', flex: 1, fontFamily: 'Fredoka', fontWeight: 700, cursor: 'pointer' }} onClick={() => updateGameSetting('healthPoints', 65)}>65 (Bored)</button>
                            <button type="button" style={{ padding: '6px 4px', fontSize: '0.65rem', flex: 1, fontFamily: 'Fredoka', fontWeight: 700, cursor: 'pointer' }} onClick={() => updateGameSetting('healthPoints', 35)}>35 (Sad)</button>
                            <button type="button" style={{ padding: '6px 4px', fontSize: '0.65rem', flex: 1, fontFamily: 'Fredoka', fontWeight: 700, cursor: 'pointer' }} onClick={() => updateGameSetting('healthPoints', 5)}>5 (Ghost! 👻)</button>
                        </div>
                    </div>
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
                        <input className="modal-input first-name-field" type="text" placeholder="Name your rock..." value={tempName} onChange={(e) => setTempName(e.target.value)} maxLength={12} required />
                        <button className="save-modal-btn start-game-btn" onClick={saveNewName}>ADOPT PET ROCK 🪨</button>
                    </div>
                </div>
            )}

            <div className="footer-buttons">
                <button className={`footer-btn ${activeTab === "HOME" ? "active-nav" : ""}`} onClick={() => { setActiveTab("HOME"); playSound('tap.mp3'); }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg><span className="nav-label">Home</span></button>
                <button className={`footer-btn ${activeTab === "SETTINGS" ? "active-nav" : ""}`} onClick={() => { setActiveTab("SETTINGS"); playSound('tap.mp3'); }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1-2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1-2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg><span className="nav-label">Settings</span></button>
                <button className={`footer-btn ${activeTab === "ABOUT" ? "active-nav" : ""}`} onClick={() => { setActiveTab("ABOUT"); playSound('tap.mp3'); }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg><span className="nav-label">About</span></button>
            </div>
        </div>
    );
}

export default App;
