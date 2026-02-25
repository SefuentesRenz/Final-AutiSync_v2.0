/**
 * SafeStreetCrossingGame.jsx
 * 
 * A Frogger-style street crossing game designed for autism-friendly learning.
 * The player controls a child character and must safely cross multiple lanes
 * of traffic to reach the other side of the road.
 * 
 * Features:
 * - Arrow keys + WASD movement
 * - Multiple car lanes with varying speeds
 * - Traffic lights (red, yellow, green) with walk signal
 * - Pedestrian crosswalk markings
 * - Score tracking & increasing difficulty per level
 * - Collision detection with Game Over / Restart
 * - Win condition with level progression
 * - Simple sound effects
 * - Responsive canvas design
 * - Autism-friendly colors (soft, not flashy)
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';

// ==============================================================
// CONSTANTS & CONFIGURATION
// ==============================================================

/** Base canvas dimensions (logical pixels). The canvas scales to fit. */
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 700;

/** Grid / tile size for movement snapping */
const TILE = 50;

/** Player size */
const PLAYER_W = 36;
const PLAYER_H = 44;

/** Car dimensions */
const CAR_W = 80;
const CAR_H = 38;

/** Movement speed (pixels per key press) */
const MOVE_STEP = 2;

/** Number of traffic lanes */
const LANE_COUNT = 5;

/** Lane vertical layout constants */
const SIDEWALK_TOP_H = 70;       // Destination sidewalk
const SIDEWALK_BOTTOM_H = 70;    // Starting sidewalk
const ROAD_TOP = SIDEWALK_TOP_H; // Where the road begins
const LANE_H = (CANVAS_HEIGHT - SIDEWALK_TOP_H - SIDEWALK_BOTTOM_H) / (LANE_COUNT + 2);
// +2 accounts for the two pedestrian crossing areas at top/bottom of road

// Traffic light states & durations (ms)
const LIGHT_GREEN_MS = 5000;
const LIGHT_YELLOW_MS = 2000;
const LIGHT_RED_MS = 10000;

// Autism-friendly color palette (soft, muted, calming)
const COLORS = {
  skyBlue: '#B5D8F7',
  grass: '#A8D5A2',
  sidewalk: '#D4C9A8',
  road: '#6B6B6B',
  roadLine: '#E8E8E8',
  crosswalk: '#FFFFFF',
  crosswalkStripe: '#F5F5F5',
  playerBody: '#5B9BD5',
  playerSkin: '#FFD5B8',
  playerHair: '#5C3D2E',
  carColors: ['#E88B8B', '#8BB8E8', '#A8D5A2', '#E8D58B', '#C9A8E8'],
  trafficRed: '#D96060',
  trafficYellow: '#E8C84A',
  trafficGreen: '#6BBF6B',
  textDark: '#3A3A3A',
  textLight: '#FAFAFA',
  overlay: 'rgba(0,0,0,0.55)',
  uiPanel: 'rgba(255,255,255,0.92)',
};

// ==============================================================
// SOUND EFFECTS (Web Audio API – tiny inline bleeps)
// ==============================================================

/** Create a short beep/tone using Web Audio API */
const playTone = (frequency, duration, volume = 0.15, type = 'sine') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  } catch (_) {
    // Silently fail if audio not available
  }
};

const SFX = {
  move: () => playTone(440, 0.05, 0.08),
  hit: () => playTone(200, 0.4, 0.2, 'sawtooth'),
  win: () => {
    playTone(523, 0.15, 0.15);
    setTimeout(() => playTone(659, 0.15, 0.15), 150);
    setTimeout(() => playTone(784, 0.3, 0.15), 300);
  },
  levelUp: () => {
    playTone(600, 0.1, 0.12);
    setTimeout(() => playTone(800, 0.1, 0.12), 120);
    setTimeout(() => playTone(1000, 0.2, 0.12), 240);
  },
  lightChange: () => playTone(880, 0.08, 0.06),
};

// Pedestrian lane boundaries (must match drawing code)
const PED_LANE_LEFT = CANVAS_WIDTH / 2 - 28;
const PED_LANE_RIGHT = CANVAS_WIDTH / 2 + 28;

// ==============================================================
// HELPER: Generate cars for a given level
// ==============================================================

/**
 * Create an array of car objects spread across lanes.
 * Each level increases base speed.
 */
const generateCars = (level) => {
  const cars = [];
  const baseSpeed = 1 + level * 0.35; // Increases each level

  for (let lane = 0; lane < LANE_COUNT; lane++) {
    // Alternate direction per lane
    const direction = lane % 2 === 0 ? 1 : -1;
    // Speed varies per lane with a small random factor
    const speed = (baseSpeed + (lane % 3) * 0.4) * direction;
    // Stagger 2-3 cars per lane
    const carsInLane = level < 3 ? 2 : 3;
    const laneY = ROAD_TOP + LANE_H + lane * LANE_H + (LANE_H - CAR_H) / 2;

    for (let c = 0; c < carsInLane; c++) {
      const gap = CANVAS_WIDTH / carsInLane;
      // For level 4+, some cars are flagged as "blockers" that may stop on the pedestrian lane
      // Level 4: ~35% chance per car, Level 5: ~70% chance (more blockers)
      const blockChance = level >= 5 ? 0.70 : 0.35;
      const canBlockPedLane = level >= 4 && Math.random() < blockChance;
      cars.push({
        x: c * gap + Math.random() * 40,
        y: laneY,
        w: CAR_W,
        h: CAR_H,
        speed,
        color: COLORS.carColors[(lane + c) % COLORS.carColors.length],
        lane,
        canBlockPedLane, // Whether this car is allowed to stop on ped lane
      });
    }
  }
  return cars;
};

// ==============================================================
// DRAWING HELPERS
// ==============================================================

/** Draw a rounded rectangle */
const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

/** Draw the little kid character */
const drawPlayer = (ctx, x, y, frame) => {
  const bobY = Math.sin(frame * 0.15) * 2; // Gentle walking bob

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  ctx.beginPath();
  ctx.ellipse(x + PLAYER_W / 2, y + PLAYER_H + 2, PLAYER_W / 2.2, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (shirt)
  ctx.fillStyle = COLORS.playerBody;
  roundRect(ctx, x + 6, y + 18 + bobY, PLAYER_W - 12, 18, 4);
  ctx.fill();

  // Legs
  const legSwing = Math.sin(frame * 0.2) * 3;
  ctx.fillStyle = '#4A7A9B';
  ctx.fillRect(x + 10, y + 34 + bobY, 6, 10 + legSwing);
  ctx.fillRect(x + 20, y + 34 + bobY, 6, 10 - legSwing);

  // Shoes
  ctx.fillStyle = '#D96060';
  roundRect(ctx, x + 8, y + 42 + bobY + legSwing, 10, 5, 2);
  ctx.fill();
  roundRect(ctx, x + 18, y + 42 + bobY - legSwing, 10, 5, 2);
  ctx.fill();

  // Head
  ctx.fillStyle = COLORS.playerSkin;
  ctx.beginPath();
  ctx.arc(x + PLAYER_W / 2, y + 12 + bobY, 11, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = COLORS.playerHair;
  ctx.beginPath();
  ctx.arc(x + PLAYER_W / 2, y + 8 + bobY, 11, Math.PI, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#3A3A3A';
  ctx.beginPath();
  ctx.arc(x + PLAYER_W / 2 - 4, y + 12 + bobY, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + PLAYER_W / 2 + 4, y + 12 + bobY, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.strokeStyle = '#3A3A3A';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x + PLAYER_W / 2, y + 15 + bobY, 4, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // Arms
  ctx.strokeStyle = COLORS.playerSkin;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const armSwing = Math.sin(frame * 0.2) * 5;
  // Left arm
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 22 + bobY);
  ctx.lineTo(x + 2, y + 32 + bobY + armSwing);
  ctx.stroke();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(x + PLAYER_W - 8, y + 22 + bobY);
  ctx.lineTo(x + PLAYER_W - 2, y + 32 + bobY - armSwing);
  ctx.stroke();
};

/** Draw a car */
const drawCar = (ctx, car) => {
  const { x, y, w, h, color, speed } = car;
  const facingRight = speed > 0;

  // Car body
  ctx.fillStyle = color;
  roundRect(ctx, x, y + 6, w, h - 6, 6);
  ctx.fill();

  // Roof
  ctx.fillStyle = shadeColor(color, -15);
  const roofX = facingRight ? x + w * 0.3 : x + w * 0.15;
  roundRect(ctx, roofX, y, w * 0.5, h * 0.5, 5);
  ctx.fill();

  // Windshield
  ctx.fillStyle = '#B5D8F7';
  const wsX = facingRight ? x + w * 0.55 : x + w * 0.18;
  roundRect(ctx, wsX, y + 3, w * 0.22, h * 0.4, 3);
  ctx.fill();

  // Wheels
  ctx.fillStyle = '#3A3A3A';
  ctx.beginPath();
  ctx.arc(x + w * 0.22, y + h, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + w * 0.78, y + h, 6, 0, Math.PI * 2);
  ctx.fill();

  // Wheel caps
  ctx.fillStyle = '#888';
  ctx.beginPath();
  ctx.arc(x + w * 0.22, y + h, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + w * 0.78, y + h, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Headlights
  ctx.fillStyle = '#FFF7AA';
  if (facingRight) {
    ctx.fillRect(x + w - 4, y + 12, 4, 6);
  } else {
    ctx.fillRect(x, y + 12, 4, 6);
  }
};

/** Darken / lighten a hex color */
function shadeColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

/** Draw traffic light */
const drawTrafficLight = (ctx, x, y, activeLight) => {
  // Pole
  ctx.fillStyle = '#555';
  ctx.fillRect(x + 12, y + 70, 6, 30);

  // Housing
  ctx.fillStyle = '#3A3A3A';
  roundRect(ctx, x, y, 30, 70, 6);
  ctx.fill();

  // Lights
  const lights = [
    { cy: y + 14, color: COLORS.trafficRed, active: activeLight === 'red' },
    { cy: y + 35, color: COLORS.trafficYellow, active: activeLight === 'yellow' },
    { cy: y + 56, color: COLORS.trafficGreen, active: activeLight === 'green' },
  ];
  lights.forEach(({ cy, color, active }) => {
    ctx.fillStyle = active ? color : '#2A2A2A';
    ctx.beginPath();
    ctx.arc(x + 15, cy, 8, 0, Math.PI * 2);
    ctx.fill();
    if (active) {
      // Glow effect
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + 15, cy, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });
};

/** Draw the walk signal */
const drawWalkSignal = (ctx, x, y, isWalk) => {
  // Housing
  ctx.fillStyle = '#3A3A3A';
  roundRect(ctx, x, y, 34, 40, 5);
  ctx.fill();

  if (isWalk) {
    // Green walk icon – walking person
    ctx.fillStyle = COLORS.trafficGreen;
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🚶', x + 17, y + 29);
  } else {
    // Red stop hand
    ctx.fillStyle = COLORS.trafficRed;
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✋', x + 17, y + 29);
  }
};

// ==============================================================
// MAIN GAME COMPONENT
// ==============================================================

const SafeStreetCrossingGame = ({ onGameComplete, onBack }) => {
  const canvasRef = useRef(null);
  const gameStateRef = useRef(null);
  const animFrameRef = useRef(null);
  const keysRef = useRef({});
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing' | 'gameover' | 'win'
  const [level, setLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [displayLevel, setDisplayLevel] = useState(1);
  const [showInstructions, setShowInstructions] = useState(true);

  // -----------------------------------------------------------
  // Initialise / reset game state
  // -----------------------------------------------------------
  const initGame = useCallback((lvl) => {
    const startX = CANVAS_WIDTH / 2 - PLAYER_W / 2;
    const startY = CANVAS_HEIGHT - SIDEWALK_BOTTOM_H + (SIDEWALK_BOTTOM_H - PLAYER_H) / 2;

    gameStateRef.current = {
      player: { x: startX, y: startY },
      cars: generateCars(lvl),
      trafficLight: 'green', // Start green so player can try to cross
      lightTimer: 0,
      frame: 0,
      level: lvl,
      paused: false,
    };
  }, []);

  // -----------------------------------------------------------
  // Start new level
  // -----------------------------------------------------------
  const startLevel = useCallback((lvl) => {
    initGame(lvl);
    setGameStatus('playing');
    setDisplayLevel(lvl);
  }, [initGame]);

  // -----------------------------------------------------------
  // Handle keyboard input
  // -----------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        keysRef.current[key] = true;
      }
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // -----------------------------------------------------------
  // Core game loop (requestAnimationFrame)
  // -----------------------------------------------------------
  useEffect(() => {
    if (showInstructions) return;

    // Initialise game
    initGame(level);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const gameLoop = () => {
      const gs = gameStateRef.current;
      if (!gs || gs.paused) {
        // Keep the loop alive so it resumes when unpaused (e.g. after restart)
        animFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      gs.frame++;

      // -------------------------------------------------------
      // UPDATE: Player movement
      // -------------------------------------------------------
      const keys = keysRef.current;
      let moved = false;
      if (keys['arrowup'] || keys['w']) { gs.player.y -= MOVE_STEP; moved = true; }
      if (keys['arrowdown'] || keys['s']) { gs.player.y += MOVE_STEP; moved = true; }
      if (keys['arrowleft'] || keys['a']) { gs.player.x -= MOVE_STEP; moved = true; }
      if (keys['arrowright'] || keys['d']) { gs.player.x += MOVE_STEP; moved = true; }

      // Play soft step sound (throttled)
      if (moved && gs.frame % 8 === 0) SFX.move();

      // Clamp player within canvas
      gs.player.x = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_W, gs.player.x));
      gs.player.y = Math.max(0, Math.min(CANVAS_HEIGHT - PLAYER_H, gs.player.y));

      // -------------------------------------------------------
      // UPDATE: Traffic light cycling
      // -------------------------------------------------------
      gs.lightTimer++;
      const lightCycle = LIGHT_GREEN_MS + LIGHT_YELLOW_MS + LIGHT_RED_MS;
      const elapsed = (gs.lightTimer * 16.67) % lightCycle; // ~60fps
      let prevLight = gs.trafficLight;
      if (elapsed < LIGHT_GREEN_MS) {
        gs.trafficLight = 'green';
      } else if (elapsed < LIGHT_GREEN_MS + LIGHT_YELLOW_MS) {
        gs.trafficLight = 'yellow';
      } else {
        gs.trafficLight = 'red';
      }
      if (prevLight !== gs.trafficLight) SFX.lightChange();

      // -------------------------------------------------------
      // UPDATE: Move cars (only when light is green/yellow for cars = red/yellow for pedestrians)
      // Cars stop when traffic light is RED (pedestrian has green walk signal)
      // -------------------------------------------------------
      const carsMoving = gs.trafficLight !== 'red';
      if (carsMoving) {
        gs.cars.forEach((car) => {
          car.stopped = false; // Reset stopped state while moving
          car.x += car.speed;
          // Wrap around
          if (car.speed > 0 && car.x > CANVAS_WIDTH + 20) {
            car.x = -car.w - Math.random() * 100;
          } else if (car.speed < 0 && car.x + car.w < -20) {
            car.x = CANVAS_WIDTH + Math.random() * 100;
          }
        });
      } else {
        // Light is RED — cars are stopped.
        // For levels 1-3: nudge ALL cars off the pedestrian lane so it stays clear.
        // For levels 4+: only nudge cars that are NOT flagged as blockers.
        gs.cars.forEach((car) => {
          if (car.stopped) return; // Already adjusted

          const carLeft = car.x;
          const carRight = car.x + car.w;
          const overlaps = carRight > PED_LANE_LEFT && carLeft < PED_LANE_RIGHT;

          if (overlaps && !car.canBlockPedLane) {
            // Nudge car out of the pedestrian lane
            // Move it to whichever side is closer
            const distToLeft = carRight - PED_LANE_LEFT;   // How far car pokes into ped lane from left
            const distToRight = PED_LANE_RIGHT - carLeft;  // How far from right
            if (distToLeft < distToRight) {
              // Easier to nudge car to the left of the ped lane
              car.x = PED_LANE_LEFT - car.w - 4;
            } else {
              // Nudge car to the right of the ped lane
              car.x = PED_LANE_RIGHT + 4;
            }
          }
          car.stopped = true;
        });
      }

      // -------------------------------------------------------
      // UPDATE: Collision detection
      // -------------------------------------------------------
      const p = gs.player;
      for (const car of gs.cars) {
        if (
          p.x < car.x + car.w - 8 &&
          p.x + PLAYER_W > car.x + 8 &&
          p.y < car.y + car.h - 4 &&
          p.y + PLAYER_H > car.y + 4
        ) {
          // Collision! Deduct 5 points (min 0)
          SFX.hit();
          setTotalScore((prev) => Math.max(0, prev - 5));
          gs.paused = true;
          setGameStatus('gameover');
          animFrameRef.current = requestAnimationFrame(gameLoop);
          return;
        }
      }

      // -------------------------------------------------------
      // UPDATE: Win condition – reached top sidewalk
      // -------------------------------------------------------
      if (p.y <= SIDEWALK_TOP_H - PLAYER_H / 2) {
        SFX.win();
        gs.paused = true;
        setTotalScore((prev) => prev + 20);

        // Auto-advance for levels 1-4, show final overlay for level 5
        if (gs.level >= 5) {
          setGameStatus('win');
        } else {
          // Brief pause then auto-advance to next level
          setGameStatus('advancing');
          setTimeout(() => {
            const nextLvl = gs.level + 1;
            setLevel(nextLvl);
            setDisplayLevel(nextLvl);
            SFX.levelUp();
            initGame(nextLvl);
            setGameStatus('playing');
          }, 1200);
        }
        animFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // -------------------------------------------------------
      // DRAW: Background
      // -------------------------------------------------------
      // Sky / top sidewalk (destination)
      ctx.fillStyle = COLORS.sidewalk;
      ctx.fillRect(0, 0, CANVAS_WIDTH, SIDEWALK_TOP_H);

      // Destination label
      ctx.fillStyle = COLORS.grass;
      ctx.fillRect(0, 0, CANVAS_WIDTH, 20);
      ctx.fillStyle = '#5C8A50';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🏁 SAFE ZONE — Reach here! 🏁', CANVAS_WIDTH / 2, 14);

      // Sidewalk pattern (top)
      ctx.strokeStyle = '#C4B998';
      ctx.lineWidth = 0.5;
      for (let sx = 0; sx < CANVAS_WIDTH; sx += 30) {
        ctx.beginPath();
        ctx.moveTo(sx, 20);
        ctx.lineTo(sx, SIDEWALK_TOP_H);
        ctx.stroke();
      }

      // -------------------------------------------------------
      // DRAW: Road
      // -------------------------------------------------------
      const roadY = ROAD_TOP;
      const roadH = CANVAS_HEIGHT - SIDEWALK_TOP_H - SIDEWALK_BOTTOM_H;
      ctx.fillStyle = COLORS.road;
      ctx.fillRect(0, roadY, CANVAS_WIDTH, roadH);

      // -------------------------------------------------------
      // DRAW: Pedestrian crosswalk at top of road
      // -------------------------------------------------------
      const crosswalkTopY = roadY;
      ctx.fillStyle = COLORS.crosswalk;
      for (let cx = 20; cx < CANVAS_WIDTH - 20; cx += 40) {
        ctx.fillRect(cx, crosswalkTopY, 20, LANE_H);
      }

      // Crosswalk label
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PEDESTRIAN CROSSING', CANVAS_WIDTH / 2, crosswalkTopY + LANE_H / 2 + 4);
      ctx.restore();

      // -------------------------------------------------------
      // DRAW: Vertical pedestrian lane (zebra crossing connecting
      // bottom crosswalk to top crosswalk across all lanes)
      // -------------------------------------------------------
      const pedLaneX = CANVAS_WIDTH / 2 - 28; // Centered on canvas
      const pedLaneW = 56; // Width of the pedestrian lane
      const pedTop = crosswalkTopY + LANE_H; // Just below top crosswalk
      const pedBot = CANVAS_HEIGHT - SIDEWALK_BOTTOM_H - LANE_H; // Just above bottom crosswalk
      const pedH = pedBot - pedTop;

      // Semi-transparent background for the pedestrian lane
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(pedLaneX, pedTop, pedLaneW, pedH);
      ctx.restore();

      // Zebra stripes (horizontal white bars across the vertical lane)
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      const stripeH = 6;
      const stripeGap = 14;
      for (let sy = pedTop + 4; sy < pedBot - stripeH; sy += stripeH + stripeGap) {
        ctx.fillRect(pedLaneX + 3, sy, pedLaneW - 6, stripeH);
      }

      // Border lines on each side of the pedestrian lane
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(pedLaneX, pedTop);
      ctx.lineTo(pedLaneX, pedBot);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pedLaneX + pedLaneW, pedTop);
      ctx.lineTo(pedLaneX + pedLaneW, pedBot);
      ctx.stroke();

      // Small "WALK HERE" label in the middle of the pedestrian lane
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.translate(CANVAS_WIDTH / 2, pedTop + pedH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('🚶 PEDESTRIAN LANE 🚶', 0, 3);
      ctx.restore();

      // -------------------------------------------------------
      // DRAW: Lane dividers (dashed center lines)
      // -------------------------------------------------------
      ctx.strokeStyle = COLORS.roadLine;
      ctx.lineWidth = 2;
      ctx.setLineDash([15, 15]);
      for (let i = 1; i <= LANE_COUNT; i++) {
        const ly = roadY + LANE_H + i * LANE_H;
        ctx.beginPath();
        ctx.moveTo(30, ly);
        ctx.lineTo(CANVAS_WIDTH - 30, ly);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // -------------------------------------------------------
      // DRAW: Pedestrian crosswalk at bottom of road
      // -------------------------------------------------------
      const crosswalkBotY = CANVAS_HEIGHT - SIDEWALK_BOTTOM_H - LANE_H;
      ctx.fillStyle = COLORS.crosswalk;
      for (let cx = 20; cx < CANVAS_WIDTH - 20; cx += 40) {
        ctx.fillRect(cx, crosswalkBotY, 20, LANE_H);
      }
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PEDESTRIAN CROSSING', CANVAS_WIDTH / 2, crosswalkBotY + LANE_H / 2 + 4);
      ctx.restore();

      // -------------------------------------------------------
      // DRAW: Bottom sidewalk (starting area)
      // -------------------------------------------------------
      ctx.fillStyle = COLORS.sidewalk;
      ctx.fillRect(0, CANVAS_HEIGHT - SIDEWALK_BOTTOM_H, CANVAS_WIDTH, SIDEWALK_BOTTOM_H);
      // Pattern
      ctx.strokeStyle = '#C4B998';
      ctx.lineWidth = 0.5;
      for (let sx = 0; sx < CANVAS_WIDTH; sx += 30) {
        ctx.beginPath();
        ctx.moveTo(sx, CANVAS_HEIGHT - SIDEWALK_BOTTOM_H);
        ctx.lineTo(sx, CANVAS_HEIGHT);
        ctx.stroke();
      }

      // Starting label
      ctx.fillStyle = COLORS.grass;
      ctx.fillRect(0, CANVAS_HEIGHT - 18, CANVAS_WIDTH, 18);
      ctx.fillStyle = '#5C8A50';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🏠 START HERE — Use Arrow Keys or WASD to move 🏠', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 5);

      // -------------------------------------------------------
      // DRAW: Cars
      // -------------------------------------------------------
      gs.cars.forEach((car) => drawCar(ctx, car));

      // -------------------------------------------------------
      // DRAW: Player
      // -------------------------------------------------------
      drawPlayer(ctx, gs.player.x, gs.player.y, gs.frame);

      // -------------------------------------------------------
      // DRAW: Traffic light (right side)
      // -------------------------------------------------------
      drawTrafficLight(ctx, CANVAS_WIDTH - 45, SIDEWALK_TOP_H + 10, gs.trafficLight);
      // Walk signal (left side)
      const isWalk = gs.trafficLight === 'red'; // Red for cars = Walk for pedestrians
      drawWalkSignal(ctx, 8, SIDEWALK_TOP_H + 15, isWalk);

      // -------------------------------------------------------
      // DRAW: Traffic light status hint (top bar)
      // -------------------------------------------------------
      ctx.save();
      const hintBg = gs.trafficLight === 'red' ? 'rgba(107,191,107,0.85)'
        : gs.trafficLight === 'yellow' ? 'rgba(232,200,74,0.85)'
        : 'rgba(217,96,96,0.75)';
      ctx.fillStyle = hintBg;
      roundRect(ctx, CANVAS_WIDTH / 2 - 130, SIDEWALK_TOP_H + 3, 260, 22, 8);
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      const hintText = gs.trafficLight === 'red'
        ? '🚶 WALK SIGNAL — Safe to cross!'
        : gs.trafficLight === 'yellow'
        ? '⚠️ CAUTION — Light changing...'
        : '✋ STOP — Cars are moving!';
      ctx.fillText(hintText, CANVAS_WIDTH / 2, SIDEWALK_TOP_H + 17);
      ctx.restore();

      // -------------------------------------------------------
      // DRAW: HUD (score & level) – top-left
      // -------------------------------------------------------
      ctx.save();
      ctx.fillStyle = COLORS.uiPanel;
      roundRect(ctx, 8, 22, 120, 42, 8);
      ctx.fill();
      ctx.fillStyle = COLORS.textDark;
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`⭐ Score: ${totalScore}/100`, 16, 40);
      ctx.fillText(`📊 Level: ${gs.level} / 5`, 16, 56);
      ctx.restore();

      // Continue loop
      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [level, showInstructions, initGame, totalScore]);

  // -----------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------
  const handleRestart = () => {
    startLevel(level);
  };

  /** Maximum level — game ends after this */
  const MAX_LEVEL = 5;

  const handleNextLevel = () => {
    if (level >= MAX_LEVEL) {
      // Should not be called at max level, but safety fallback
      handleFinishGame();
      return;
    }
    const nextLvl = level + 1;
    setLevel(nextLvl);
    SFX.levelUp();
    startLevel(nextLvl);
  };

  const handleFinishGame = () => {
    // 20 points per round completed, max 100 (5 rounds)
    const finalScore = totalScore;
    const totalRounds = level; // Each level counts as a "round"
    if (onGameComplete) {
      onGameComplete(finalScore, totalRounds, level);
    }
  };

  const handleStartGame = () => {
    setShowInstructions(false);
  };

  // -----------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[500px] select-none"
      style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
      
      {/* ============ INSTRUCTION SCREEN ============ */}
      {showInstructions && (
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full border-2 border-blue-200 text-center">
          <div className="text-5xl mb-4">🚦</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Safe Street Crossing</h2>
          <p className="text-gray-600 mb-4 text-base leading-relaxed">
            Help the child cross the street safely! Avoid the cars and reach the other side.
          </p>

          <div className="bg-blue-50 rounded-2xl p-4 mb-4 text-left border border-blue-100">
            <h3 className="font-bold text-gray-700 mb-2 text-sm">🎮 How to Play:</h3>
            <ul className="text-sm text-gray-600 space-y-1.5">
              <li>⬆️ Use <strong>Arrow Keys</strong> or <strong>WASD</strong> to move</li>
              <li>🚶 Cross when the <strong>WALK signal</strong> is on (cars stop!)</li>
              <li>✋ <strong>Wait</strong> when cars are moving (green/yellow light)</li>
              <li>🚗 <strong>Avoid cars!</strong> Getting hit means Game Over</li>
              <li>🏁 Reach the <strong>SAFE ZONE</strong> at the top to win!</li>
              <li>📊 Each level gets <strong>harder</strong> with faster cars</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-xl p-3 mb-5 border border-green-100">
            <p className="text-sm text-green-700 font-medium">
              💡 <strong>Tip:</strong> Watch the traffic light! When it turns RED for cars, 
              you'll see a 🚶 WALK signal — that's the safest time to cross!
            </p>
          </div>

          <button
            onClick={handleStartGame}
            className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 
              text-white font-bold text-lg px-10 py-3 rounded-full shadow-lg transition-all duration-200 
              transform hover:scale-105 active:scale-95"
          >
            🎮 Start Game
          </button>
        </div>
      )}

      {/* ============ GAME CANVAS ============ */}
      {!showInstructions && (
        <div className="relative">
          {/* Score bar above canvas */}
          <div className="flex items-center justify-between bg-white rounded-t-2xl px-5 py-2 border-2 border-b-0 border-blue-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-bold text-gray-700">⭐ Score: {totalScore}/100</span>
              <span className="text-sm font-bold text-gray-700">📊 Level: {displayLevel} / 5</span>
            </div>
            <div className="flex items-center space-x-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={handleFinishGame}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                Finish
              </button>
            </div>
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-blue-200 rounded-b-2xl shadow-lg block"
            style={{
              maxWidth: '100%',
              height: 'auto',
              imageRendering: 'pixelated',
              background: COLORS.skyBlue,
            }}
            tabIndex={0}
          />

          {/* ============ GAME OVER OVERLAY ============ */}
          {gameStatus === 'gameover' && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
              style={{ background: COLORS.overlay }}>
              <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm w-full mx-4 border-2 border-red-200">
                <div className="text-5xl mb-3">😵</div>
                <h2 className="text-2xl font-bold text-red-500 mb-2">Oh no! Game Over</h2>
                <p className="text-gray-600 mb-1 text-sm">You got hit by a car! <span className="text-red-500 font-bold">-5 points</span></p>
                <p className="text-gray-500 text-xs mb-4">
                  💡 Remember: Wait for the 🚶 WALK signal before crossing!
                </p>
                <div className="bg-red-50 rounded-xl p-3 mb-5 border border-red-100">
                  <p className="text-sm font-semibold text-gray-700">
                    Score: <span className="text-blue-600">{totalScore}</span> &nbsp;|&nbsp; 
                    Level: <span className="text-blue-600">{displayLevel}</span>
                  </p>
                </div>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={handleRestart}
                    className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 
                      text-white font-bold px-6 py-2.5 rounded-full shadow transition-all duration-200 
                      transform hover:scale-105 active:scale-95"
                  >
                    🔄 Try Again
                  </button>
                  <button
                    onClick={handleFinishGame}
                    className="bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 
                      text-gray-700 font-bold px-6 py-2.5 rounded-full shadow transition-all duration-200 
                      transform hover:scale-105 active:scale-95"
                  >
                    🏠 Finish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============ WIN OVERLAY (final level only) ============ */}
          {gameStatus === 'win' && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
              style={{ background: 'rgba(107,191,107,0.35)' }}>
              <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm w-full mx-4 border-2 border-green-200">
                <div className="text-5xl mb-3">🏆</div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Congratulations!</h2>
                <p className="text-gray-600 mb-1 text-sm">You completed all 5 levels!</p>
                <p className="text-green-600 text-xs font-semibold mb-4">
                  +20 points! 🌟 Amazing work!
                </p>
                <div className="bg-green-50 rounded-xl p-3 mb-5 border border-green-100">
                  <p className="text-sm font-semibold text-gray-700">
                    Final Score: <span className="text-green-600">{totalScore}/100</span> &nbsp;|&nbsp;
                    Levels Completed: <span className="text-green-600">5 / 5</span>
                  </p>
                </div>
                <button
                  onClick={handleFinishGame}
                  className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 
                    text-white font-bold px-8 py-3 rounded-full shadow transition-all duration-200 
                    transform hover:scale-105 active:scale-95 text-lg"
                >
                  ✅ Finish & Submit Score
                </button>
              </div>
            </div>
          )}

          {/* ============ AUTO-ADVANCING OVERLAY (brief flash between rounds) ============ */}
          {gameStatus === 'advancing' && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
              style={{ background: 'rgba(107,191,107,0.30)' }}>
              <div className="bg-white/95 rounded-3xl p-6 text-center shadow-xl max-w-xs w-full mx-4 border-2 border-green-200">
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="text-xl font-bold text-green-600 mb-1">Level Complete!</h2>
                <p className="text-gray-500 text-sm">Next level starting...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SafeStreetCrossingGame;
