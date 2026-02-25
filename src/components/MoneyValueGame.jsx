import React, { useState, useEffect, useCallback, useRef } from 'react';

/* ══════════════════════════════════════════════════════════════
   💰  MONEY VALUE GAME — Sari-Sari Store Shopping
   ══════════════════════════════════════════════════════════════
   Teaches:  Money recognition · Budget awareness ·
             Decision-making · Real-life buying behaviour

   Scoring:  +10 pts per correct round  →  5 rounds  →  50 max
   ──────────────────────────────────────────────────────────── */

// ── Sari-sari / convenience store item pool ──────────────────
const STORE_ITEMS = [
  // Snacks & candy
  { name: 'Candy',       image: '🍬', price: 5   },
  { name: 'Gum',         image: '🫧', price: 5   },
  { name: 'Biscuit',     image: '🍪', price: 8   },
  { name: 'Chips',       image: '🥔', price: 15  },
  { name: 'Chocolate',   image: '🍫', price: 28  },
  // Drinks
  { name: 'Water',       image: '💧', price: 8   },
  { name: 'Juice',       image: '🥤', price: 15  },
  { name: 'Soda',        image: '🧋', price: 18  },
  { name: 'Milk',        image: '🥛', price: 25  },
  { name: 'Coffee',      image: '☕', price: 30  },
  // Food
  { name: 'Bread',       image: '🍞', price: 15  },
  { name: 'Egg',         image: '🥚', price: 8   },
  { name: 'Banana',      image: '🍌', price: 10  },
  { name: 'Mango',       image: '🥭', price: 15  },
  { name: 'Apple',       image: '🍎', price: 18  },
  { name: 'Noodles',     image: '🍜', price: 12  },
  { name: 'Rice',        image: '🍚', price: 45  },
  { name: 'Hotdog',      image: '🌭', price: 35  },
  { name: 'Pancake',     image: '🥞', price: 40  },
  { name: 'Sandwich',    image: '🥪', price: 55  },
  { name: 'Burger',      image: '🍔', price: 85  },
  { name: 'Ice Cream',   image: '🍦', price: 30  },
  // School supplies
  { name: 'Pencil',      image: '✏️', price: 8   },
  { name: 'Eraser',      image: '🩹', price: 5   },
  { name: 'Ruler',       image: '📏', price: 20  },
  { name: 'Crayon',      image: '🖍️', price: 35  },
  { name: 'Notebook',    image: '📓', price: 45  },
  // Household
  { name: 'Soap',        image: '🧼', price: 25  },
  { name: 'Shampoo',     image: '🧴', price: 55  },
  { name: 'Toothpaste',  image: '🪥', price: 40  },
  { name: 'Candle',      image: '🕯️', price: 10  },
  // Slightly more expensive
  { name: 'Mug',         image: '🍵', price: 85  },
  { name: 'Umbrella',    image: '☂️', price: 150 },
  { name: 'Toy Car',     image: '🚗', price: 120 },
  { name: 'Doll',        image: '🪆', price: 150 },
  { name: 'Book',        image: '📚', price: 200 },
  { name: 'Bag',         image: '🎒', price: 250 },
  { name: 'Shirt',       image: '👕', price: 200 },
  { name: 'Shoes',       image: '👟', price: 350 },
];

// ── Shuffle helper ───────────────────────────────────────────
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ── Round generator ──────────────────────────────────────────
const generateRounds = (difficulty) => {
  /*
    Each round randomly picks a mode:
      'single' → student picks exactly 1 item
      'multi'  → student picks as many items as they want
    Hard always uses multi with mustBuy=2.
    Easy/Medium: ~half single, ~half multi (at least 1 of each).
  */
  const rounds = [];

  const configs = {
    Easy: [
      { budget: 50,   itemCount: 4, affordableCount: 2 },
      { budget: 100,  itemCount: 4, affordableCount: 3 },
      { budget: 75,   itemCount: 4, affordableCount: 2 },
      { budget: 150,  itemCount: 4, affordableCount: 3 },
      { budget: 200,  itemCount: 4, affordableCount: 3 },
    ],
    Medium: [
      { budget: 100,  itemCount: 5, affordableCount: 3 },
      { budget: 150,  itemCount: 6, affordableCount: 4 },
      { budget: 200,  itemCount: 5, affordableCount: 3 },
      { budget: 250,  itemCount: 6, affordableCount: 4 },
      { budget: 300,  itemCount: 5, affordableCount: 3 },
    ],
    Hard: [
      { budget: 100,  itemCount: 6, mustBuy: 2 },
      { budget: 200,  itemCount: 7, mustBuy: 2 },
      { budget: 150,  itemCount: 6, mustBuy: 2 },
      { budget: 300,  itemCount: 8, mustBuy: 2 },
      { budget: 250,  itemCount: 7, mustBuy: 2 },
    ],
  };

  const roundConfigs = configs[difficulty] || configs.Easy;

  // For Easy/Medium, randomly assign 'single' or 'multi' but guarantee at least 1 of each
  let modes;
  if (difficulty === 'Hard') {
    modes = ['multi', 'multi', 'multi', 'multi', 'multi'];
  } else {
    // Generate random mix, then enforce at least 1 single + 1 multi
    modes = Array.from({ length: 5 }, () => Math.random() < 0.5 ? 'single' : 'multi');
    if (!modes.includes('single')) modes[Math.floor(Math.random() * 5)] = 'single';
    if (!modes.includes('multi'))  modes[Math.floor(Math.random() * 5)] = 'multi';
  }

  for (let i = 0; i < 5; i++) {
    const cfg = roundConfigs[i];
    const budget = cfg.budget;
    const isHard = difficulty === 'Hard';

    // Pool partitions
    const affordable = shuffle(STORE_ITEMS.filter(it => it.price <= budget));
    const notAffordable = shuffle(STORE_ITEMS.filter(it => it.price > budget));

    let items;
    if (isHard) {
      // Hard: need at least 2 items whose prices sum ≤ budget
      // Find valid pairs first
      const validPairs = [];
      for (let a = 0; a < affordable.length; a++) {
        for (let b = a + 1; b < affordable.length; b++) {
          if (affordable[a].price + affordable[b].price <= budget) {
            validPairs.push([affordable[a], affordable[b]]);
          }
        }
      }
      const pair = validPairs.length > 0
        ? validPairs[Math.floor(Math.random() * validPairs.length)]
        : affordable.slice(0, 2); // fallback

      // Fill remaining slots with a mix
      const remainingAffordable = affordable.filter(it => !pair.includes(it)).slice(0, 1);
      const expensiveCount = cfg.itemCount - pair.length - remainingAffordable.length;
      const expensive = notAffordable.slice(0, Math.max(0, expensiveCount));
      items = shuffle([...pair, ...remainingAffordable, ...expensive]);
    } else {
      // Easy / Medium
      const affSlice = affordable.slice(0, cfg.affordableCount);
      const expCount = cfg.itemCount - affSlice.length;
      const expSlice = notAffordable.slice(0, expCount);
      items = shuffle([...affSlice, ...expSlice]);
    }

    rounds.push({
      roundNum: i + 1,
      budget,
      items: items.map((it, idx) => ({ ...it, id: i * 10 + idx })),
      mustBuy: cfg.mustBuy || 1,
      mode: modes[i],  // 'single' or 'multi'
    });
  }

  return rounds;
};

// ── Guided-mode labels ───────────────────────────────────────
const getGuideText = (phase, budget, mustBuy, mode) => {
  if (phase === 'shopping') {
    if (mustBuy > 1) return `Step 1: You have ₱${budget}. Buy exactly ${mustBuy} items that fit your budget!`;
    if (mode === 'single') return `Step 1: You have ₱${budget}. Pick 1 item you can afford!`;
    return `Step 1: You have ₱${budget}. Pick the items you can afford — you can buy more than one!`;
  }
  if (phase === 'choose') return 'Step 2: Choose items you can afford.';
  if (phase === 'feedback') return 'Step 3: Let\'s see how you did!';
  if (phase === 'recap') return 'Great! Here\'s what happened with your money.';
  return '';
};

// ══════════════════════════════════════════════════════════════
export default function MoneyValueGame({ difficulty = 'Easy', onGameComplete, onBack }) {
  // ── State ──────────────────────────────────────────────────
  const [rounds, setRounds]               = useState([]);
  const [roundIdx, setRoundIdx]           = useState(0);
  const [phase, setPhase]                 = useState('shopping'); // shopping | feedback | recap | done
  const [selectedItems, setSelectedItems] = useState([]);
  const [score, setScore]                 = useState(0);
  const [roundCorrect, setRoundCorrect]   = useState(null); // null | true | false
  const [feedbackMsg, setFeedbackMsg]     = useState('');
  const [gameFinished, setGameFinished]   = useState(false);

  // Accessibility toggles
  const [guidedMode, setGuidedMode]       = useState(true);
  const [voiceOn, setVoiceOn]             = useState(false);
  const [showCalcHelper, setShowCalcHelper] = useState(false);
  const [slowMode, setSlowMode]           = useState(false);
  const [highlightAffordable, setHighlightAffordable] = useState(false);

  const [shakeWrong, setShakeWrong]       = useState(false);
  const feedbackTimer = useRef(null);

  const isHard = difficulty === 'Hard';

  // ── Init ───────────────────────────────────────────────────
  useEffect(() => {
    setRounds(generateRounds(difficulty));
  }, [difficulty]);

  const round = rounds[roundIdx];
  const roundMode = round ? round.mode : 'multi';  // 'single' or 'multi'
  const isSingleMode = roundMode === 'single' && !isHard;

  // ── TTS ────────────────────────────────────────────────────
  const speak = useCallback((text) => {
    if (!voiceOn || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = slowMode ? 0.7 : 0.9;
    u.pitch = 1.0;
    u.volume = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes('Google UK English Female') ||
      v.name.includes('Google US English Female') ||
      v.name.includes('Microsoft Zira') ||
      (v.lang.startsWith('en') && v.name.includes('Female'))
    ) || voices.find(v => v.lang.startsWith('en'));
    if (preferred) u.voice = preferred;
    window.speechSynthesis.speak(u);
  }, [voiceOn, slowMode]);

  // Speak when round starts
  useEffect(() => {
    if (round && phase === 'shopping') {
      let msg;
      if (isHard) {
        msg = `You have ${round.budget} pesos. Pick exactly ${round.mustBuy} items that fit your budget!`;
      } else if (round.mode === 'single') {
        msg = `You have ${round.budget} pesos. Pick 1 item you can afford!`;
      } else {
        msg = `You have ${round.budget} pesos. Pick the items you can afford! You can buy more than one!`;
      }
      speak(msg);
    }
  }, [round, phase, speak, isHard]);

  // Cleanup
  useEffect(() => () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  // ── Derived ────────────────────────────────────────────────
  const totalSelected = selectedItems.reduce((s, it) => s + it.price, 0);
  const remaining = round ? round.budget - totalSelected : 0;

  // ── Actions ────────────────────────────────────────────────
  const handleSelectItem = (item) => {
    if (phase !== 'shopping') return;

    // Toggle: if already selected, remove it
    if (selectedItems.some(s => s.id === item.id)) {
      setSelectedItems(prev => prev.filter(s => s.id !== item.id));
      return;
    }

    // Single mode (non-hard): only allow 1 item at a time
    if (isSingleMode) {
      setSelectedItems([item]);
      speak(item.name);
      return;
    }

    // Multi mode: add to basket
    setSelectedItems(prev => [...prev, item]);
    speak(item.name);
  };

  const handleRemoveItem = (idx) => {
    if (phase !== 'shopping') return;
    setSelectedItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitBasket = () => {
    if (selectedItems.length === 0) {
      setFeedbackMsg('Please pick at least 1 item!');
      speak('Please pick at least 1 item.');
      return;
    }

    const total = selectedItems.reduce((s, it) => s + it.price, 0);

    // Hard mode: enforce exact item count
    if (isHard && selectedItems.length !== round.mustBuy) {
      setFeedbackMsg(`Please pick exactly ${round.mustBuy} items.`);
      speak(`Please pick exactly ${round.mustBuy} items.`);
      return;
    }

    if (total <= round.budget) {
      setRoundCorrect(true);
      const names = selectedItems.map(it => it.name).join(', ');
      if (selectedItems.length === 1) {
        setFeedbackMsg(`Great choice! You bought ${names} for ₱${total}!`);
        speak(`Great choice! You bought ${names}!`);
      } else {
        setFeedbackMsg(`Smart shopping! You bought ${selectedItems.length} items (${names}) for ₱${total} — within your ₱${round.budget} budget!`);
        speak(`Smart shopping! You bought ${selectedItems.length} items within your budget!`);
      }
      setScore(prev => prev + 10);
    } else {
      setRoundCorrect(false);
      setShakeWrong(true);
      setFeedbackMsg(`Too expensive! Your items cost ₱${total}, but you only have ₱${round.budget}. That's ₱${total - round.budget} over budget.`);
      speak(`Too expensive! Your items cost ${total} pesos. That's over your budget.`);
      setTimeout(() => setShakeWrong(false), 500);
    }
    setPhase('feedback');
  };

  const handleContinueToRecap = () => {
    setPhase('recap');
  };

  const handleNextRound = () => {
    if (roundIdx + 1 >= 5) {
      setGameFinished(true);
      if (onGameComplete) {
        onGameComplete(score, 5);
      }
    } else {
      setRoundIdx(roundIdx + 1);
      setPhase('shopping');
      setSelectedItems([]);
      setRoundCorrect(null);
      setFeedbackMsg('');
    }
  };

  // ── Render helpers ─────────────────────────────────────────
  const formatPeso = (v) => `₱${v.toLocaleString()}`;

  if (!round) return null;

  const affordableList = round.items.filter(it => it.price <= round.budget);

  // ──────────────────────────────────────────────────────────
  //  RENDER
  // ──────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-6xl mx-auto select-none">
      {/* ── Top Bar ───────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-2 px-1 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold border border-green-300">
            Round {roundIdx + 1} / 5
          </span>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold border border-yellow-300">
            Score: {score} pts
          </span>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold border border-purple-300">
            {difficulty}
          </span>
        </div>
        {/* Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => setVoiceOn(v => !v)}
            className={`px-2 py-1 rounded-full text-xs font-bold border transition-all ${voiceOn ? 'bg-blue-200 border-blue-400 text-blue-800' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
            🔊 {voiceOn ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => setShowCalcHelper(v => !v)}
            className={`px-2 py-1 rounded-full text-xs font-bold border transition-all ${showCalcHelper ? 'bg-amber-200 border-amber-400 text-amber-800' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
            🧮 {showCalcHelper ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => setGuidedMode(v => !v)}
            className={`px-2 py-1 rounded-full text-xs font-bold border transition-all ${guidedMode ? 'bg-green-200 border-green-400 text-green-800' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
            📋 Guide {guidedMode ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => setSlowMode(v => !v)}
            className={`px-2 py-1 rounded-full text-xs font-bold border transition-all ${slowMode ? 'bg-pink-200 border-pink-400 text-pink-800' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
            🐢 Slow {slowMode ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => setHighlightAffordable(v => !v)}
            className={`px-2 py-1 rounded-full text-xs font-bold border transition-all ${highlightAffordable ? 'bg-teal-200 border-teal-400 text-teal-800' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
            👁 Hint {highlightAffordable ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* ── Guided banner ─────────────────────────────────── */}
      {guidedMode && (
        <div className="bg-gradient-to-r from-sky-50 to-teal-50 border-2 border-sky-200 rounded-xl px-4 py-2 mb-2 text-center">
          <p className="text-sm font-bold text-sky-800">{getGuideText(phase, round.budget, round.mustBuy, round.mode)}</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          GAME FINISHED
          ═══════════════════════════════════════════════════ */}
      {gameFinished ? (
        <div className="bg-gradient-to-b from-yellow-50 to-green-50 rounded-2xl border-2 border-yellow-200 p-8 text-center space-y-4">
          <div className="text-6xl mb-2">🏆</div>
          <h2 className="text-3xl font-extrabold text-green-700">Great Shopping!</h2>
          <p className="text-xl text-gray-700">
            You earned <span className="text-2xl font-bold text-green-600">{score}</span> out of <span className="text-2xl font-bold text-yellow-600">50</span> points!
          </p>
          <p className="text-lg text-gray-600 italic">
            {score >= 45 ? 'Amazing! You\'re a money expert! 🌟' :
             score >= 35 ? 'Excellent budget skills! ⭐' :
             score >= 20 ? 'Great job learning! Keep it up! 💪' :
             'Nice try! You\'ll do even better next time! 🤗'}
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <button onClick={() => { setGameFinished(false); setRounds(generateRounds(difficulty)); setRoundIdx(0); setScore(0); setPhase('shopping'); setSelectedItems([]); setRoundCorrect(null); setFeedbackMsg(''); }}
              className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg cursor-pointer">
              🔄 Play Again
            </button>
            {onBack && (
              <button onClick={onBack}
                className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 px-6 py-3 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg cursor-pointer">
                🏠 Back
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════
           THREE-COLUMN LAYOUT
           ═══════════════════════════════════════════════════ */
        <div className="grid grid-cols-12 gap-3">

          {/* ─── LEFT: Store Shelf ──────────────────────── */}
          <div className="col-span-5 bg-gradient-to-b from-green-50 to-blue-50 rounded-2xl border-2 border-green-200 p-3">
            {/* Store header */}
            <div className="bg-gradient-to-r from-green-200 to-teal-200 rounded-xl px-3 py-2 mb-3 text-center border border-green-300">
              <h3 className="font-extrabold text-green-900 text-sm flex items-center justify-center gap-1">
                <span className="text-lg">🏪</span> Sari-Sari Store
              </h3>
            </div>

            {/* Items grid */}
            <div className={`grid ${round.items.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
              {round.items.map((item) => {
                const isAffordable = item.price <= round.budget;
                const isSelected = selectedItems.some(s => s.id === item.id);
                const canClick = phase === 'shopping';

                return (
                  <button key={item.id}
                    onClick={() => canClick && handleSelectItem(item)}
                    disabled={!canClick || (phase !== 'shopping')}
                    className={`
                      relative rounded-xl p-2 transition-all duration-200 border-2 text-center
                      ${canClick ? 'cursor-pointer hover:scale-105 hover:shadow-md' : 'cursor-default'}
                      ${isSelected ? 'bg-green-100 border-green-400 ring-2 ring-green-300' : ''}
                      ${!isSelected && highlightAffordable && isAffordable ? 'border-green-300 bg-green-50' : ''}
                      ${!isSelected && highlightAffordable && !isAffordable ? 'border-gray-200 bg-gray-50 opacity-60' : ''}
                      ${!isSelected && !highlightAffordable ? 'bg-white border-gray-200 hover:border-green-300' : ''}
                      ${roundCorrect !== null && !isAffordable && isSelected ? 'bg-red-50 border-red-300' : ''}
                    `}
                  >
                    <div className="text-3xl mb-1">{item.image}</div>
                    <div className="font-bold text-gray-800 text-xs leading-tight">{item.name}</div>
                    <div className="text-green-700 font-extrabold text-sm mt-0.5">{formatPeso(item.price)}</div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow">✓</div>
                    )}
                    {/* "Not enough" overlay when highlighting is on */}
                    {highlightAffordable && !isAffordable && !isSelected && (
                      <div className="absolute inset-0 rounded-xl flex items-end justify-center pb-1">
                        <span className="bg-red-100 text-red-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Not enough</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── CENTER: Budget + Basket + Actions ──────── */}
          <div className="col-span-4 flex flex-col gap-2">
            {/* Budget display — BIG & CLEAR */}
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-yellow-300 p-3 text-center">
              <p className="text-xs font-bold text-yellow-800 mb-1">💰 You Have</p>
              <p className="text-3xl font-extrabold text-green-700">{formatPeso(round.budget)}</p>
              {isHard ? (
                <p className="text-xs font-bold text-orange-700 mt-1">Pick exactly {round.mustBuy} items!</p>
              ) : isSingleMode ? (
                <p className="text-xs font-bold text-blue-700 mt-1">Pick 1 item you can afford! 🛍️</p>
              ) : (
                <p className="text-xs font-bold text-blue-700 mt-1">Buy as many as you can afford! 🛍️</p>
              )}
            </div>

            {/* ── Shopping phase: basket ── */}
            {phase === 'shopping' && (
              <div className={`bg-white rounded-xl border-2 border-blue-200 p-3 flex-1 flex flex-col ${shakeWrong ? 'animate-shake' : ''}`}>
                <p className="text-xs font-bold text-blue-800 mb-2 text-center">🛒 Your Basket</p>
                {selectedItems.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-xs text-gray-400 italic text-center">Tap an item from the store</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 flex-1">
                    {selectedItems.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-2 py-1.5">
                        <span className="text-lg">{it.image}</span>
                        <span className="text-xs font-bold flex-1">{it.name}</span>
                        <span className="text-xs font-bold text-green-700">{formatPeso(it.price)}</span>
                        <button onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-600 text-xs cursor-pointer">✕</button>
                      </div>
                    ))}
                    {selectedItems.length > 0 && (
                      <div className="border-t border-gray-200 pt-1 flex justify-between text-sm font-extrabold text-gray-800">
                        <span>Total:</span>
                        <span className={totalSelected > round.budget ? 'text-red-600' : 'text-green-700'}>{formatPeso(totalSelected)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit button — shown when items are selected */}
                {selectedItems.length > 0 && phase === 'shopping' && (
                  <button onClick={handleSubmitBasket}
                    className="mt-2 bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white py-2 px-4 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow cursor-pointer w-full">
                    {isHard ? '🎯 Buy These Items' : isSingleMode ? '🛒 Buy This!' : '🛒 Done Shopping!'}
                  </button>
                )}

                {/* Calc helper */}
                {showCalcHelper && selectedItems.length > 0 && (
                  <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center font-mono text-xs">
                    <p className="text-gray-600">{formatPeso(round.budget)} (budget)</p>
                    <p className="text-gray-600">− {formatPeso(totalSelected)} (spent)</p>
                    <div className="border-t border-yellow-300 mt-1 pt-1 font-bold text-green-700">= {formatPeso(remaining)} left</div>
                  </div>
                )}
              </div>
            )}

            {/* ── Feedback phase ── */}
            {phase === 'feedback' && (
              <div className={`rounded-xl border-2 p-4 text-center flex-1 flex flex-col justify-center gap-3
                ${roundCorrect ? 'bg-green-50 border-green-300' : 'bg-orange-50 border-orange-300'}`}>
                <div className="text-5xl">{roundCorrect ? '✅' : '💭'}</div>
                <p className={`text-sm font-bold leading-snug ${roundCorrect ? 'text-green-800' : 'text-orange-800'}`}>
                  {feedbackMsg}
                </p>
                {/* Price comparison for wrong */}
                {!roundCorrect && selectedItems.length > 0 && (
                  <div className="bg-white border border-orange-200 rounded-lg p-2 text-xs font-mono">
                    {selectedItems.map((it, idx) => (
                      <p key={idx} className="text-red-600">{it.image} {it.name}: {formatPeso(it.price)}</p>
                    ))}
                    <p className="text-red-600 font-bold border-t border-orange-100 pt-1 mt-1">Total: {formatPeso(totalSelected)}</p>
                    <p className="text-green-600">{formatPeso(round.budget)} (your money)</p>
                    <p className="font-bold text-gray-800 mt-1">{formatPeso(totalSelected)} {'>'} {formatPeso(round.budget)}</p>
                  </div>
                )}
                <button onClick={handleContinueToRecap}
                  className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white py-2 px-5 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow cursor-pointer mx-auto">
                  📋 See Summary
                </button>
              </div>
            )}

            {/* ── Recap phase (learning reinforcement) ── */}
            {phase === 'recap' && (
              <div className="bg-gradient-to-b from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 p-4 flex-1 flex flex-col justify-center gap-2 text-center">
                <p className="text-sm font-bold text-purple-800">📝 What Happened</p>
                <div className="bg-white border border-purple-200 rounded-lg p-3 space-y-1 text-sm text-left">
                  <p>💰 You had: <span className="font-bold text-green-700">{formatPeso(round.budget)}</span></p>
                  {selectedItems.map((it, idx) => (
                    <p key={idx}>🛍️ You picked: <span className="font-bold">{it.name}</span> for <span className="font-bold text-green-700">{formatPeso(it.price)}</span></p>
                  ))}
                  {roundCorrect ? (
                    <>
                      <p className="border-t border-purple-100 pt-1">✅ Total spent: <span className="font-bold text-green-700">{formatPeso(totalSelected)}</span></p>
                      <p>💵 Money left: <span className="font-bold text-blue-700">{formatPeso(round.budget - totalSelected)}</span></p>
                    </>
                  ) : (
                    <p className="border-t border-purple-100 pt-1 text-red-600 font-bold">❌ Not enough money for this choice.</p>
                  )}
                </div>
                {roundCorrect && (
                  <p className="text-xs text-green-700 font-bold">+10 points! 🌟</p>
                )}
                <button onClick={handleNextRound}
                  className="bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white py-2.5 px-5 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg cursor-pointer mx-auto mt-1">
                  {roundIdx + 1 >= 5 ? '🏆 Finish Game' : '➡️ Next Round'}
                </button>
              </div>
            )}
          </div>

          {/* ─── RIGHT: Info Panel ──────────────────────── */}
          <div className="col-span-3 bg-gradient-to-b from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200 p-3 flex flex-col gap-3">
            {/* Store clerk */}
            <div className="text-center">
              <div className="text-5xl mb-1">🧑‍🏫</div>
              <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">Store Keeper</span>
            </div>

            {/* Clerk speech */}
            <div className="bg-white border border-yellow-200 rounded-xl p-2 text-center">
              <p className="text-xs font-semibold text-gray-700">
                {phase === 'shopping' && isSingleMode && '"Pick 1 item you want to buy! 😊"'}
                {phase === 'shopping' && !isSingleMode && !isHard && '"Pick the items you want to buy! You can pick more than one! 😊"'}
                {phase === 'shopping' && isHard && `"Pick exactly ${round.mustBuy} items. Make sure the total fits your budget! 🧮"` }
                {phase === 'feedback' && roundCorrect && '"Great shopping! You really know your money! 🌟"'}
                {phase === 'feedback' && !roundCorrect && '"That\'s okay! Let\'s learn from this. 😊"'}
                {phase === 'recap' && '"Let\'s see what happened with your money! 📋"'}
              </p>
            </div>

            {/* Quick price list */}
            <div className="bg-white border border-green-200 rounded-xl p-2 flex-1 overflow-auto">
              <p className="text-xs font-bold text-green-700 text-center mb-1">🏷️ Price List</p>
              <div className="space-y-0.5">
                {round.items.map(it => {
                  const canAfford = it.price <= round.budget;
                  return (
                    <div key={it.id} className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${canAfford ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <span className="text-sm">{it.image}</span>
                      <span className="flex-1 font-semibold text-gray-700">{it.name}</span>
                      <span className={`font-bold ${canAfford ? 'text-green-700' : 'text-red-500'}`}>{formatPeso(it.price)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Score mini */}
            <div className="bg-white border border-purple-200 rounded-xl p-2 mt-auto">
              <p className="text-xs font-bold text-purple-700 text-center mb-1">📊 Progress</p>
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-lg font-extrabold text-green-600">{score}</p>
                  <p className="text-[10px] text-gray-500">Points</p>
                </div>
                <div className="border-l border-purple-100 mx-1"></div>
                <div>
                  <p className="text-lg font-extrabold text-yellow-600">50</p>
                  <p className="text-[10px] text-gray-500">Max</p>
                </div>
                <div className="border-l border-purple-100 mx-1"></div>
                <div>
                  <p className="text-lg font-extrabold text-blue-600">{roundIdx + 1}/5</p>
                  <p className="text-[10px] text-gray-500">Round</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}
