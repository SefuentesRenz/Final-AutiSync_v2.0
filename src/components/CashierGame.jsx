import React, { useState, useEffect, useCallback, useRef } from 'react';

/* ══════════════════════════════════════════════════════════════
   🏪  CASHIER GAME — Autism-Friendly Money & Food Game
   ══════════════════════════════════════════════════════════════
   Flow per round:
     Step 1  → Customer greets & orders food
     Step 2  → Student selects the correct food items   (+5 pts)
     Step 3  → System shows total; customer gives money
     Step 4  → Student gives correct change from tray   (+5 pts)
     Step 5  → Feedback & next round

   5 rounds  ×  10 pts max  =  50 pts maximum
   ──────────────────────────────────────────────────────────── */

// ── Menu items (same food as existing game) ──────────────────
const MENU = [
  { name: 'Burger',    image: '🍔', price: 150 },
  { name: 'Fries',     image: '🍟', price: 80  },
  { name: 'Pizza',     image: '🍕', price: 200 },
  { name: 'Hot Dog',   image: '🌭', price: 100 },
  { name: 'Drink',     image: '🥤', price: 50  },
  { name: 'Ice Cream', image: '🍦', price: 90  },
];

// ── Philippine currency denominations ────────────────────────
const BILLS_AND_COINS = [
  { value: 1000, label: '₱1,000', type: 'bill',  color: 'from-blue-100 to-blue-200 border-blue-400' },
  { value: 500,  label: '₱500',   type: 'bill',  color: 'from-yellow-100 to-yellow-200 border-yellow-400' },
  { value: 200,  label: '₱200',   type: 'bill',  color: 'from-green-100 to-green-200 border-green-400' },
  { value: 100,  label: '₱100',   type: 'bill',  color: 'from-purple-100 to-purple-200 border-purple-400' },
  { value: 50,   label: '₱50',    type: 'coin',  color: 'from-amber-100 to-amber-200 border-amber-400' },
  { value: 20,   label: '₱20',    type: 'coin',  color: 'from-orange-100 to-orange-200 border-orange-400' },
  { value: 10,   label: '₱10',    type: 'coin',  color: 'from-slate-100 to-slate-200 border-slate-400' },
  { value: 5,    label: '₱5',     type: 'coin',  color: 'from-zinc-100 to-zinc-200 border-zinc-400' },
  { value: 1,    label: '₱1',     type: 'coin',  color: 'from-gray-100 to-gray-200 border-gray-400' },
];

// ── Helper: shuffle array ────────────────────────────────────
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ── Generate 5 rounds based on difficulty ────────────────────
const generateRounds = (difficulty) => {
  const rounds = [];
  const usedCombos = new Set();

  const diffConfig = {
    Easy:   { itemCounts: [1, 1, 2, 2, 1], exactChance: 0.4 },   // ~40% exact, 60% need change
    Medium: { itemCounts: [2, 3, 3, 2, 3], exactChance: 0.2 },   // ~20% exact
    Hard:   { itemCounts: [3, 4, 4, 5, 3], exactChance: 0.0 },   // always needs change
  };
  const config = diffConfig[difficulty] || diffConfig.Easy;

  // Guarantee at least 1 exact and 1 non-exact round (except Hard which is always non-exact)
  const exactFlags = Array.from({ length: 5 }, () => Math.random() < config.exactChance);
  // For Easy/Medium, ensure at least one of each if possible
  if (config.exactChance > 0) {
    if (!exactFlags.includes(true))  exactFlags[Math.floor(Math.random() * 5)] = true;
    if (!exactFlags.includes(false)) exactFlags[Math.floor(Math.random() * 5)] = false;
  }

  for (let i = 0; i < 5; i++) {
    const count = config.itemCounts[i];
    let items, key;
    do {
      items = shuffle(MENU).slice(0, count);
      key = items.map(it => it.name).sort().join(',');
    } while (usedCombos.has(key));
    usedCombos.add(key);

    const totalPrice = items.reduce((s, it) => s + it.price, 0);

    // Decide payment amount — mix of exact and overpayment
    let payment;
    if (exactFlags[i]) {
      payment = totalPrice; // exact, no change
    } else {
      // Pick a bill that's larger than total
      const bills = [200, 500, 1000];
      const validBills = bills.filter(b => b > totalPrice);
      payment = validBills.length > 0
        ? validBills[Math.floor(Math.random() * validBills.length)]
        : 1000;
    }

    const change = payment - totalPrice;

    // Build customer dialogue
    const names = items.map(it => `${it.name} ${it.image}`);
    let orderText;
    if (names.length === 1) {
      orderText = `I'd like 1 ${names[0]}, please!`;
    } else {
      const last = names[names.length - 1];
      const rest = names.slice(0, -1).join(', ');
      orderText = `I'd like ${rest} and ${last}, please!`;
    }

    rounds.push({
      roundNum: i + 1,
      orderedItems: items,
      menuOptions: shuffle([...MENU]),
      totalPrice,
      payment,
      change,
      orderText,
    });
  }
  return rounds;
};

// ── Guided-mode step labels ──────────────────────────────────
const GUIDE_STEPS = {
  order:     { num: 1, text: 'Step 1: Read the customer\'s order.' },
  select:    { num: 2, text: 'Step 2: Select the ordered food.' },
  checkFood: { num: 3, text: 'Step 3: Let\'s check your food selection!' },
  showTotal: { num: 3, text: 'Step 3: Check the total amount.' },
  giveMoney: { num: 4, text: 'Step 4: Customer gives money.' },
  change:    { num: 5, text: 'Step 5: Select the correct bills/coins for change.' },
  done:      { num: 6, text: 'Round complete!' },
};

// ══════════════════════════════════════════════════════════════
//  Component
// ══════════════════════════════════════════════════════════════
export default function CashierGame({ difficulty = 'Easy', onGameComplete, onBack }) {
  // ── state ──────────────────────────────────────────────────
  const [rounds, setRounds]             = useState([]);
  const [roundIdx, setRoundIdx]         = useState(0);
  const [phase, setPhase]               = useState('order');   // order | select | checkFood | showTotal | giveMoney | change | feedback | done
  const [selectedFood, setSelectedFood] = useState([]);
  const [selectedChange, setSelectedChange] = useState([]);
  const [foodCorrect, setFoodCorrect]   = useState(null);     // null | true | false
  const [changeCorrect, setChangeCorrect] = useState(null);
  const [score, setScore]               = useState(0);
  const [roundScoreFood, setRoundScoreFood] = useState(0);
  const [roundScoreChange, setRoundScoreChange] = useState(0);
  const [guidedMode, setGuidedMode]     = useState(true);
  const [voiceOn, setVoiceOn]           = useState(false);
  const [showCalcHelper, setShowCalcHelper] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [customerEmotion, setCustomerEmotion] = useState('neutral'); // neutral | happy | thinking
  const [shakeWrong, setShakeWrong] = useState(''); // 'food' | 'change' | ''
  const [slowMode, setSlowMode]         = useState(false);
  const feedbackTimerRef = useRef(null);

  // ── Initialise rounds ──────────────────────────────────────
  useEffect(() => {
    setRounds(generateRounds(difficulty));
  }, [difficulty]);

  const round = rounds[roundIdx];

  // ── TTS helper ─────────────────────────────────────────────
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

  // ── Speak order when round starts ──────────────────────────
  useEffect(() => {
    if (round && phase === 'order') {
      speak(round.orderText);
      setCustomerEmotion('neutral');
    }
  }, [round, phase, speak]);

  // ── Cleanup ────────────────────────────────────────────────
  useEffect(() => () => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  // ── Actions ────────────────────────────────────────────────
  const handleReadOrder = () => {
    setPhase('select');
    setSelectedFood([]);
    setFoodCorrect(null);
    speak('Now select the food the customer ordered.');
  };

  const handleFoodSelect = (item) => {
    if (phase !== 'select') return;
    // Speak item name
    speak(item.name);
    setSelectedFood(prev => [...prev, item]);
  };

  const handleFoodRemove = (idx) => {
    setSelectedFood(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFoodSubmit = () => {
    const picked = selectedFood.map(f => f.name).sort();
    const correct = round.orderedItems.map(f => f.name).sort();
    const isCorrect = JSON.stringify(picked) === JSON.stringify(correct);
    setFoodCorrect(isCorrect);

    if (isCorrect) {
      setRoundScoreFood(5);
      setCustomerEmotion('happy');
      speak('Great job! You picked the correct food!');
      // Move to total/payment after short delay
      feedbackTimerRef.current = setTimeout(() => {
        if (round.change === 0) {
          // Exact payment — skip change step
          setPhase('showTotal');
        } else {
          setPhase('showTotal');
        }
      }, slowMode ? 2500 : 1800);
    } else {
      setShakeWrong('food');
      setCustomerEmotion('thinking');
      speak("Let's try again. Check the order carefully.");
      setTimeout(() => setShakeWrong(''), 600);
      // Allow retry — don't advance
      setRoundScoreFood(0);
    }
  };

  const handleProceedToPayment = () => {
    if (round.change === 0) {
      // No change needed — award change points automatically and go to feedback
      setChangeCorrect(true);
      setRoundScoreChange(5);
      speak('Exact payment! No change needed. Well done!');
      setPhase('feedback');
    } else {
      speak(`The customer gives ₱${round.payment.toLocaleString()}. How much change?`);
      setPhase('change');
      setSelectedChange([]);
      setChangeCorrect(null);
    }
  };

  const handleChangeDenomSelect = (denom) => {
    if (phase !== 'change') return;
    setSelectedChange(prev => [...prev, denom]);
  };

  const handleChangeRemove = (idx) => {
    setSelectedChange(prev => prev.filter((_, i) => i !== idx));
  };

  const selectedChangeTotal = selectedChange.reduce((s, d) => s + d.value, 0);

  const handleChangeSubmit = () => {
    const isCorrect = selectedChangeTotal === round.change;
    setChangeCorrect(isCorrect);

    if (isCorrect) {
      setRoundScoreChange(5);
      setCustomerEmotion('happy');
      speak('Perfect! You gave the correct change!');
      setPhase('feedback');
    } else {
      setShakeWrong('change');
      setCustomerEmotion('thinking');
      speak("That's not quite right. Check the amount and try again.");
      setTimeout(() => setShakeWrong(''), 600);
      setRoundScoreChange(0);
    }
  };

  const handleNextRound = () => {
    const earned = roundScoreFood + roundScoreChange;
    const newScore = score + earned;
    setScore(newScore);

    if (roundIdx + 1 >= 5) {
      // Game finished
      setGameFinished(true);
      if (onGameComplete) {
        onGameComplete(newScore, 5, roundIdx + 1);
      }
    } else {
      setRoundIdx(roundIdx + 1);
      setPhase('order');
      setSelectedFood([]);
      setSelectedChange([]);
      setFoodCorrect(null);
      setChangeCorrect(null);
      setRoundScoreFood(0);
      setRoundScoreChange(0);
      setCustomerEmotion('neutral');
    }
  };

  // ── Formatting helpers ─────────────────────────────────────
  const formatPeso = (v) => `₱${v.toLocaleString()}`;

  // ── Customer phrases ───────────────────────────────────────
  const getCustomerGreeting = () => {
    const greetings = [
      'Hello! 😊',
      'Hi there! 👋',
      'Good day! 🌞',
      'Hey! Nice to meet you! 😄',
    ];
    return greetings[roundIdx % greetings.length];
  };

  const getCustomerThanks = () => {
    if (foodCorrect && changeCorrect) return 'Thank you so much! You\'re a great cashier! 🌟';
    if (foodCorrect) return 'Thank you! 😊';
    return 'Thanks for trying! Keep practicing! 💪';
  };

  // ──────────────────────────────────────────────────────────
  //  RENDER
  // ──────────────────────────────────────────────────────────
  if (!round) return null;

  const guideInfo = GUIDE_STEPS[phase] || GUIDE_STEPS.done;
  const isExactPayment = round.change === 0;

  return (
    <div className="w-full max-w-6xl mx-auto select-none">
      {/* ── Top Bar: Round / Score / Settings ─────────────── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold border border-blue-300">
            Round {roundIdx + 1} / 5
          </span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold border border-green-300">
            Score: {score} pts
          </span>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold border border-purple-300">
            {difficulty}
          </span>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setVoiceOn(v => !v)}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${voiceOn ? 'bg-blue-200 border-blue-400 text-blue-800' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
            🔊 Voice {voiceOn ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => setShowCalcHelper(v => !v)}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${showCalcHelper ? 'bg-amber-200 border-amber-400 text-amber-800' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
            🧮 Helper {showCalcHelper ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => setGuidedMode(v => !v)}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${guidedMode ? 'bg-green-200 border-green-400 text-green-800' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
            📋 Guided {guidedMode ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => setSlowMode(v => !v)}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${slowMode ? 'bg-pink-200 border-pink-400 text-pink-800' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
            🐢 Slow {slowMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* ── Guided Step Banner ────────────────────────────── */}
      {guidedMode && (
        <div className="bg-gradient-to-r from-sky-50 to-teal-50 border-2 border-sky-200 rounded-xl px-4 py-2 mb-3 text-center">
          <p className="text-base font-bold text-sky-800">{guideInfo.text}</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          GAME FINISHED SCREEN
          ═══════════════════════════════════════════════════ */}
      {gameFinished ? (
        <div className="bg-gradient-to-b from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-8 text-center space-y-4">
          <div className="text-6xl mb-2">🏆</div>
          <h2 className="text-3xl font-extrabold text-purple-700">Great Job, Cashier!</h2>
          <p className="text-xl text-gray-700">You earned <span className="text-2xl font-bold text-green-600">{score}</span> out of <span className="text-2xl font-bold text-pink-600">50</span> points!</p>
          <p className="text-lg text-gray-600 italic">
            {score >= 45 ? 'Amazing! You\'re a cashier superstar! 🌟' :
             score >= 35 ? 'Excellent work! Almost perfect! ⭐' :
             score >= 25 ? 'Great job! Keep practicing! 💪' :
             'Nice try! You\'ll do even better next time! 🤗'}
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <button onClick={() => { setGameFinished(false); setRounds(generateRounds(difficulty)); setRoundIdx(0); setScore(0); setPhase('order'); setFoodCorrect(null); setChangeCorrect(null); setRoundScoreFood(0); setRoundScoreChange(0); setCustomerEmotion('neutral'); }}
              className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg cursor-pointer">
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
          {/* ─── LEFT: Food Display ─────────────────────── */}
          <div className="col-span-4 bg-gradient-to-b from-sky-50 to-blue-50 rounded-2xl border-2 border-sky-200 p-3">
            <h3 className="text-center font-bold text-sky-800 text-sm mb-2 flex items-center justify-center gap-1">
              <span className="text-lg">🍽️</span> Food Menu
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {round.menuOptions.map((item, i) => {
                const isOrdered = round.orderedItems.some(o => o.name === item.name);
                const isSelected = selectedFood.some(f => f.name === item.name);
                const canSelect = phase === 'select' && !foodCorrect;
                return (
                  <button key={i}
                    onClick={() => canSelect && handleFoodSelect(item)}
                    disabled={!canSelect}
                    className={`
                      relative rounded-xl p-2 transition-all duration-200 border-2 text-center
                      ${canSelect ? 'cursor-pointer hover:scale-105 hover:shadow-md' : 'cursor-default'}
                      ${isSelected ? 'bg-green-100 border-green-400 ring-2 ring-green-300' : 'bg-white border-gray-200 hover:border-sky-300'}
                      ${foodCorrect === true && isOrdered ? 'bg-green-100 border-green-500' : ''}
                      ${foodCorrect === false && isSelected && !isOrdered ? 'bg-red-50 border-red-300' : ''}
                    `}
                  >
                    <div className="text-3xl mb-1">{item.image}</div>
                    <div className="font-bold text-gray-800 text-xs leading-tight">{item.name}</div>
                    <div className="text-green-700 font-semibold text-xs">{formatPeso(item.price)}</div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow">✓</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── CENTER: Counter / Action Area ──────────── */}
          <div className="col-span-4 flex flex-col gap-3">
            {/* Counter header */}
            <div className="bg-gradient-to-t from-amber-200 to-amber-100 rounded-xl border-2 border-amber-400 p-2 text-center shadow">
              <span className="font-bold text-amber-900 text-sm">🏪 Restaurant Counter</span>
            </div>

            {/* ── Phase: ORDER ── */}
            {phase === 'order' && (
              <div className="bg-white rounded-xl border-2 border-sky-200 p-4 text-center space-y-3 flex-1 flex flex-col justify-center">
                <div className="text-5xl mb-1">👩‍🦱</div>
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
                  <p className="text-sm font-bold text-pink-700 mb-1">{getCustomerGreeting()}</p>
                  <p className="text-base font-bold text-gray-800 leading-snug">"{round.orderText}"</p>
                </div>
                <button onClick={handleReadOrder}
                  className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white py-3 px-6 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg cursor-pointer">
                  ✅ Take Order
                </button>
              </div>
            )}

            {/* ── Phase: SELECT FOOD ── */}
            {phase === 'select' && (
              <div className={`bg-white rounded-xl border-2 border-blue-200 p-3 space-y-2 flex-1 ${shakeWrong === 'food' ? 'animate-shake' : ''}`}>
                <p className="text-sm font-bold text-blue-800 text-center">🍽️ Tap the food the customer wants</p>
                {/* Order reminder */}
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-2 text-center">
                  <p className="text-xs text-pink-700 font-semibold">Customer said: "{round.orderText}"</p>
                </div>

                {/* Selected tray */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 min-h-[60px]">
                  <p className="text-xs font-bold text-green-700 mb-1">Your tray:</p>
                  {selectedFood.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center">Tap food from the left menu</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedFood.map((f, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 bg-white border border-green-300 rounded-lg px-2 py-1 text-xs font-semibold">
                          {f.image} {f.name}
                          {!foodCorrect && (
                            <button onClick={() => handleFoodRemove(idx)} className="text-red-400 hover:text-red-600 ml-1 cursor-pointer">✕</button>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Food feedback */}
                {foodCorrect === false && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                    <p className="text-sm font-semibold text-red-600">🔄 Not quite right. Check the order and try again.</p>
                  </div>
                )}
                {foodCorrect === true && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                    <p className="text-sm font-semibold text-green-600">✅ Correct food! +5 points!</p>
                  </div>
                )}

                {/* Submit food */}
                {selectedFood.length > 0 && !foodCorrect && (
                  <div className="text-center">
                    <button onClick={handleFoodSubmit}
                      className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white py-2 px-5 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow cursor-pointer">
                      🎯 Serve Food
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Phase: SHOW TOTAL ── */}
            {phase === 'showTotal' && (
              <div className="bg-white rounded-xl border-2 border-green-200 p-4 space-y-3 flex-1 flex flex-col justify-center">
                <p className="text-sm font-bold text-green-800 text-center">🧾 Order Total</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                  {round.orderedItems.map((it, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{it.image} {it.name}</span>
                      <span className="font-bold">{formatPeso(it.price)}</span>
                    </div>
                  ))}
                  <div className="border-t border-green-300 mt-2 pt-2 flex justify-between text-base font-extrabold text-green-800">
                    <span>Total:</span>
                    <span>{formatPeso(round.totalPrice)}</span>
                  </div>
                </div>

                {isExactPayment && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                    <p className="text-sm text-blue-700 font-semibold">💰 Customer pays {formatPeso(round.payment)} — Exact payment!</p>
                  </div>
                )}

                <button onClick={handleProceedToPayment}
                  className="bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white py-3 px-5 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg cursor-pointer mx-auto">
                  {isExactPayment ? '✅ Complete Order' : '💵 Proceed to Payment'}
                </button>
              </div>
            )}

            {/* ── Phase: CHANGE ── */}
            {phase === 'change' && (
              <div className={`bg-white rounded-xl border-2 border-amber-200 p-3 space-y-2 flex-1 ${shakeWrong === 'change' ? 'animate-shake' : ''}`}>
                <p className="text-sm font-bold text-amber-800 text-center">💰 Give the Correct Change</p>
                {/* Payment info */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center space-y-1">
                  <p className="text-xs text-gray-600">Total: <span className="font-bold">{formatPeso(round.totalPrice)}</span></p>
                  <p className="text-xs text-gray-600">Customer paid: <span className="font-bold">{formatPeso(round.payment)}</span></p>
                  <p className="text-sm font-extrabold text-amber-800">Change needed: {formatPeso(round.change)}</p>
                </div>

                {/* Calculation helper */}
                {showCalcHelper && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center font-mono text-sm">
                    <p>{formatPeso(round.payment)}</p>
                    <p>− {formatPeso(round.totalPrice)}</p>
                    <div className="border-t border-yellow-300 mt-1 pt-1 font-bold text-green-700">= {formatPeso(round.change)}</div>
                  </div>
                )}

                {/* Selected change */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 min-h-[48px]">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-green-700">Your change:</p>
                    <p className={`text-xs font-bold ${selectedChangeTotal === round.change ? 'text-green-600' : selectedChangeTotal > round.change ? 'text-red-600' : 'text-amber-600'}`}>
                      {formatPeso(selectedChangeTotal)} / {formatPeso(round.change)}
                    </p>
                  </div>
                  {selectedChange.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center">Select bills/coins from the right panel →</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedChange.map((d, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 bg-white border border-green-300 rounded-lg px-2 py-1 text-xs font-semibold">
                          {d.label}
                          {!changeCorrect && (
                            <button onClick={() => handleChangeRemove(idx)} className="text-red-400 hover:text-red-600 ml-1 cursor-pointer">✕</button>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Change feedback */}
                {changeCorrect === false && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                    <p className="text-sm font-semibold text-red-600">🔄 Not the right amount. Let's try again.</p>
                  </div>
                )}

                {/* Submit change */}
                {selectedChange.length > 0 && !changeCorrect && (
                  <div className="text-center">
                    <button onClick={handleChangeSubmit}
                      className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white py-2 px-5 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow cursor-pointer">
                      💵 Give Change
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Phase: FEEDBACK ── */}
            {phase === 'feedback' && (
              <div className="bg-white rounded-xl border-2 border-purple-200 p-4 text-center space-y-3 flex-1 flex flex-col justify-center">
                <div className="text-5xl mb-1">{foodCorrect && changeCorrect ? '🎉' : '👍'}</div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                  <p className="text-base font-bold text-purple-800 mb-1">{getCustomerThanks()}</p>
                  <div className="flex justify-center gap-4 text-sm mt-2">
                    <span className={`px-2 py-1 rounded-full font-bold ${roundScoreFood > 0 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      Food: {roundScoreFood > 0 ? '+5 ✅' : '0 ❌'}
                    </span>
                    <span className={`px-2 py-1 rounded-full font-bold ${roundScoreChange > 0 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      Change: {roundScoreChange > 0 ? '+5 ✅' : '0 ❌'}
                    </span>
                  </div>
                  <p className="text-lg font-extrabold text-purple-700 mt-2">
                    Round Score: {roundScoreFood + roundScoreChange} / 10
                  </p>
                </div>
                <button onClick={handleNextRound}
                  className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white py-3 px-6 rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg cursor-pointer">
                  {roundIdx + 1 >= 5 ? '🏆 Finish Game' : '➡️ Next Customer'}
                </button>
              </div>
            )}
          </div>

          {/* ─── RIGHT: Customer / Money Panel ─────────── */}
          <div className="col-span-4 bg-gradient-to-b from-pink-50 to-purple-50 rounded-2xl border-2 border-pink-200 p-3 flex flex-col gap-3">
            {/* Customer avatar */}
            <div className="text-center">
              <div className="text-5xl mb-1">
                {customerEmotion === 'happy' ? '😊' : customerEmotion === 'thinking' ? '🤔' : '👩‍🦱'}
              </div>
              <span className="bg-pink-200 text-pink-800 px-3 py-1 rounded-full text-xs font-bold">Customer</span>
            </div>

            {/* Customer speech bubble */}
            {phase !== 'feedback' && phase !== 'order' && (
              <div className="bg-white border border-pink-200 rounded-xl p-2 text-center">
                <p className="text-xs font-semibold text-gray-700">
                  {phase === 'select' && !foodCorrect ? `"${round.orderText}"` : ''}
                  {phase === 'select' && foodCorrect === true ? '"That looks right! 😊"' : ''}
                  {phase === 'select' && foodCorrect === false ? '"Hmm, that doesn\'t look right... 🤔"' : ''}
                  {phase === 'showTotal' ? `"Here's my payment: ${formatPeso(round.payment)} 💵"` : ''}
                  {phase === 'change' && !changeCorrect ? '"I\'m waiting for my change... 💰"' : ''}
                  {phase === 'change' && changeCorrect === false ? '"That doesn\'t seem right... 🤔"' : ''}
                </p>
              </div>
            )}

            {/* Money given display */}
            {(phase === 'showTotal' || phase === 'change') && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-green-700 mb-1">💵 Money Given</p>
                <p className="text-2xl font-extrabold text-green-800">{formatPeso(round.payment)}</p>
              </div>
            )}

            {/* Money tray — only during change phase */}
            {phase === 'change' && (
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-800 text-center mb-2">💰 Money Tray — Tap to add</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {BILLS_AND_COINS.map((denom, i) => (
                    <button key={i}
                      onClick={() => handleChangeDenomSelect(denom)}
                      disabled={!!changeCorrect}
                      className={`
                        bg-gradient-to-b ${denom.color} border-2 rounded-lg p-1.5 text-center transition-all duration-150
                        ${!changeCorrect ? 'cursor-pointer hover:scale-105 hover:shadow-md active:scale-95' : 'opacity-60 cursor-default'}
                      `}
                    >
                      <p className="font-extrabold text-xs text-gray-800">{denom.label}</p>
                      <p className="text-[10px] text-gray-500">{denom.type}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Scoreboard mini */}
            <div className="bg-white border border-purple-200 rounded-xl p-2 mt-auto">
              <p className="text-xs font-bold text-purple-700 text-center mb-1">📊 Score</p>
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-lg font-extrabold text-green-600">{score}</p>
                  <p className="text-[10px] text-gray-500">Points</p>
                </div>
                <div className="border-l border-purple-100 mx-2"></div>
                <div>
                  <p className="text-lg font-extrabold text-purple-600">50</p>
                  <p className="text-[10px] text-gray-500">Max</p>
                </div>
                <div className="border-l border-purple-100 mx-2"></div>
                <div>
                  <p className="text-lg font-extrabold text-blue-600">{roundIdx + 1}/5</p>
                  <p className="text-[10px] text-gray-500">Round</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Shake animation keyframes (injected once) ───── */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
