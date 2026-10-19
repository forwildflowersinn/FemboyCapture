import {
  PlayerState,
  EnemyState,
  BulletState,
  WeaponPickupState,
  HazardPuddle,
  WEAPON_DEFS,
  MapEnvironment,
  MovingCar,
  Civilian,
  HeartPickup,
} from './logic.ts';
import { GAME_TEXT, type ArchetypeKey } from '../gameText.ts';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  cameraX: number;
  cameraY: number;
  player: PlayerState;
  enemies: EnemyState[];
  bullets: BulletState[];
  pickups: WeaponPickupState[];
  puddles: HazardPuddle[];
  hearts?: HeartPickup[];
  adorationLevel?: number;
  activeUpgrades?: string[];
  particles: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    radius: number;
    life: number;
    maxLife: number;
  }[];
  mapEnv: MapEnvironment;
  cars: MovingCar[];
  civilians: Civilian[];
  arenaWidth: number;
  arenaHeight: number;
  gameTime: number;
}

/** Draws the arena floor, environment terrain, walls, and roads */
export function drawArena(r: RenderContext) {
  const { ctx, cameraX, cameraY, canvasWidth, canvasHeight, mapEnv, arenaWidth, arenaHeight } = r;

  ctx.fillStyle = '#060810';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  if (mapEnv.id === 'forest') {
    // --- RICH NATURAL ENCHANTED FOREST ENVIRONMENT ---
    // Deep mossy loam and pine-needle forest floor
    ctx.fillStyle = '#08170d';
    ctx.fillRect(0, 0, arenaWidth, arenaHeight);

    // Organic mossy earth patches
    const mossPatches = [
      { x: 300, y: 400, r: 240, c: '#0f2918' },
      { x: 900, y: 800, r: 320, c: '#0d2215' },
      { x: 1700, y: 600, r: 280, c: '#12331f' },
      { x: 500, y: 1600, r: 300, c: '#0f2918' },
      { x: 1300, y: 1500, r: 350, c: '#0e2417' },
      { x: 2100, y: 1400, r: 260, c: '#143822' },
    ];
    for (const mp of mossPatches) {
      const grad = ctx.createRadialGradient(mp.x, mp.y, 40, mp.x, mp.y, mp.r);
      grad.addColorStop(0, mp.c);
      grad.addColorStop(1, '#08170d');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mp.x, mp.y, mp.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Natural Forest Stream / Creek (Silvery dark cyan with gentle current ripples)
    ctx.save();
    ctx.strokeStyle = '#0e3a40';
    ctx.lineWidth = 110;
    ctx.beginPath();
    ctx.moveTo(100, 200);
    ctx.quadraticCurveTo(600, 600, 750, 1100);
    ctx.quadraticCurveTo(900, 1600, 400, 2200);
    ctx.stroke();

    // Creek water center flow
    ctx.strokeStyle = '#155e75';
    ctx.lineWidth = 65;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(103, 232, 249, 0.3)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(150, 250);
    ctx.quadraticCurveTo(610, 620, 755, 1100);
    ctx.stroke();

    // Stream wooden footbridge & stepping stones
    const stones = [
      { x: 740, y: 1060 },
      { x: 760, y: 1090 },
      { x: 735, y: 1120 },
    ];
    for (const st of stones) {
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(st.x, st.y, 14, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();

    // Main Winding Dirt & Cobblestone Trail
    ctx.save();
    // Rough pebble trail outer border
    ctx.strokeStyle = '#27170c';
    ctx.lineWidth = 175;
    ctx.beginPath();
    ctx.moveTo(200, 300);
    ctx.quadraticCurveTo(800, 900, 1400, 700);
    ctx.quadraticCurveTo(2000, 500, 2400, 1600);
    ctx.stroke();

    // Main beaten earth path
    ctx.strokeStyle = '#382313';
    ctx.lineWidth = 135;
    ctx.stroke();

    // Fine gravel center track
    ctx.strokeStyle = '#452c18';
    ctx.lineWidth = 85;
    ctx.stroke();

    // Secondary woodland footpath to southern campsite
    ctx.strokeStyle = '#2f1c0f';
    ctx.lineWidth = 90;
    ctx.beginPath();
    ctx.moveTo(600, 2000);
    ctx.quadraticCurveTo(1200, 1450, 2000, 1800);
    ctx.stroke();

    // Cobblestone stepping stones embedded along the trail
    for (let tx = 250; tx < arenaWidth - 250; tx += 95) {
      const stoneY = 700 + Math.sin(tx * 0.003) * 220;
      ctx.fillStyle = tx % 2 === 0 ? '#64748b' : '#475569';
      ctx.beginPath();
      ctx.ellipse(tx + (tx % 30), stoneY + (tx % 20), 12, 8, (tx % 5) * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // --- CAMPSITE CLEARING AT (1400, 1050) ---
    // Campfire clearing ground
    ctx.fillStyle = '#22150a';
    ctx.beginPath();
    ctx.ellipse(1400, 1050, 120, 80, 0, 0, Math.PI * 2);
    ctx.fill();

    // Split-log campsite benches
    ctx.fillStyle = '#5c3514';
    ctx.beginPath();
    ctx.roundRect(1320, 990, 70, 16, 6);
    ctx.roundRect(1410, 990, 70, 16, 6);
    ctx.roundRect(1340, 1100, 120, 16, 6);
    ctx.fill();
    ctx.strokeStyle = '#381e09';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Circular stone campfire ring
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(1400, 1050, 22, 0, Math.PI * 2);
    ctx.fill();

    const ringStones = 8;
    for (let rs = 0; rs < ringStones; rs++) {
      const stoneAngle = (rs * Math.PI * 2) / ringStones;
      const sx = 1400 + Math.cos(stoneAngle) * 22;
      const sy = 1050 + Math.sin(stoneAngle) * 22;
      ctx.fillStyle = rs % 2 === 0 ? '#94a3b8' : '#64748b';
      ctx.beginPath();
      ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Flickering campfire flame & embers
    const flameFlicker = Math.sin(r.gameTime * 12) * 2;
    const fireGrad = ctx.createRadialGradient(1400, 1050, 3, 1400, 1050, 48 + flameFlicker);
    fireGrad.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
    fireGrad.addColorStop(0.35, 'rgba(249, 115, 22, 0.6)');
    fireGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.25)');
    fireGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.arc(1400, 1050, 48 + flameFlicker, 0, Math.PI * 2);
    ctx.fill();

    // Charred crossed logs
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(1392, 1042);
    ctx.lineTo(1408, 1058);
    ctx.moveTo(1392, 1058);
    ctx.lineTo(1408, 1042);
    ctx.stroke();

    // Campfire ember sparks
    for (let em = 0; em < 4; em++) {
      const sparkY = 1050 - ((r.gameTime * 25 + em * 14) % 28);
      const sparkX = 1400 + Math.sin(r.gameTime * 6 + em) * 8;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Carved Trail Signpost
    ctx.fillStyle = '#78350f';
    ctx.fillRect(1510, 1020, 8, 36);
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(1485, 1005, 58, 20, 3);
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 7px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PINES TRAIL', 1514, 1018);

    // --- BIOLUMINESCENT FAIRY MUSHROOM CLUSTERS ---
    const fairyMushrooms = [
      { x: 380, y: 350, c: '#2dd4bf', cap: '#0d9488' },
      { x: 1220, y: 440, c: '#f472b6', cap: '#db2777' },
      { x: 1850, y: 580, c: '#38bdf8', cap: '#0284c7' },
      { x: 580, y: 1450, c: '#f472b6', cap: '#db2777' },
      { x: 1100, y: 1700, c: '#2dd4bf', cap: '#0d9488' },
      { x: 1980, y: 1500, c: '#a78bfa', cap: '#7c3aed' },
    ];
    for (const fm of fairyMushrooms) {
      // Ambient radial glow
      const mGlow = ctx.createRadialGradient(fm.x, fm.y, 2, fm.x, fm.y, 22);
      mGlow.addColorStop(0, fm.c + '55');
      mGlow.addColorStop(1, fm.c + '00');
      ctx.fillStyle = mGlow;
      ctx.beginPath();
      ctx.arc(fm.x, fm.y, 22, 0, Math.PI * 2);
      ctx.fill();

      // Mushroom cap 1
      ctx.fillStyle = fm.cap;
      ctx.beginPath();
      ctx.ellipse(fm.x - 4, fm.y, 5, 4, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(fm.x - 5, fm.y, 2, 4);

      // Mushroom cap 2
      ctx.fillStyle = fm.c;
      ctx.beginPath();
      ctx.ellipse(fm.x + 3, fm.y + 2, 6, 4.5, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(fm.x + 2, fm.y + 2, 2.5, 4);
    }

    // Lush Wild Woodland Ferns & Bluebells
    const flowerPatches = [
      { x: 450, y: 490 },
      { x: 820, y: 600 },
      { x: 1350, y: 780 },
      { x: 1720, y: 480 },
      { x: 950, y: 1300 },
      { x: 1650, y: 1380 },
    ];
    for (const fp of flowerPatches) {
      // Fern leaves
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2;
      for (let f = 0; f < 5; f++) {
        const fAngle = (f * Math.PI) / 4 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(fp.x, fp.y);
        ctx.lineTo(fp.x + Math.cos(fAngle) * 14, fp.y + Math.sin(fAngle) * 14);
        ctx.stroke();
      }
      // Bluebell dots
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(fp.x - 6, fp.y - 8, 2.5, 0, Math.PI * 2);
      ctx.arc(fp.x + 5, fp.y - 10, 2.5, 0, Math.PI * 2);
      ctx.arc(fp.x, fp.y - 14, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Natural Bushes with multi-shaded leaves & berries
    for (const b of mapEnv.bushes) {
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.25, b.y - b.radius * 0.25, b.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(b.x + b.radius * 0.2, b.y - b.radius * 0.2, b.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Red sweet wild berries
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(b.x + b.radius * 0.35, b.y - b.radius * 0.2, 3.5, 0, Math.PI * 2);
      ctx.arc(b.x - b.radius * 0.3, b.y + b.radius * 0.25, 3.5, 0, Math.PI * 2);
      ctx.arc(b.x, b.y + b.radius * 0.4, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (mapEnv.id === 'home') {
    // --- SUBURBAN HOME: FULLY FURNISHED ARCHITECTURAL INTERIOR ---
    // Outer grass yard surrounding the house
    ctx.fillStyle = '#08170e';
    ctx.fillRect(0, 0, arenaWidth, arenaHeight);

    // Concrete house foundation slab
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(70, 70, 1760, 1310);

    // 1. KITCHEN & DINING ROOM FLOOR (North-West: 80, 80, 660, 660)
    // Checkered ceramic kitchen tiles
    const tileSize = 44;
    for (let tx = 80; tx < 740; tx += tileSize) {
      for (let ty = 80; ty < 740; ty += tileSize) {
        const isWhite = (Math.floor(tx / tileSize) + Math.floor(ty / tileSize)) % 2 === 0;
        ctx.fillStyle = isWhite ? '#f8fafc' : '#cbd5e1';
        ctx.fillRect(tx, ty, tileSize, tileSize);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx, ty, tileSize, tileSize);
      }
    }

    // 2. LIVING ROOM FLOOR (North-East: 740, 80, 1052, 660)
    // Polished warm oak hardwood boards
    ctx.fillStyle = '#b45309';
    ctx.fillRect(740, 80, 1052, 660);
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.35)';
    ctx.lineWidth = 1.2;
    for (let px = 740; px < 1792; px += 36) {
      ctx.beginPath();
      ctx.moveTo(px, 80);
      ctx.lineTo(px, 740);
      ctx.stroke();
    }
    // Grand plush Persian-style living room carpet with ornamental trim
    ctx.fillStyle = '#831843';
    ctx.fillRect(960, 260, 440, 340);
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 4;
    ctx.strokeRect(960, 260, 440, 340);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(968, 268, 424, 324);
    // Carpet inner pattern
    ctx.fillStyle = 'rgba(251, 113, 133, 0.2)';
    ctx.beginPath();
    ctx.ellipse(1180, 430, 140, 90, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. MASTER BEDROOM FLOOR (South-East: 1080, 740, 712, 602)
    // Cherry parquet wood flooring
    ctx.fillStyle = '#78350f';
    ctx.fillRect(1080, 740, 712, 602);
    ctx.strokeStyle = 'rgba(69, 26, 3, 0.4)';
    ctx.lineWidth = 1;
    for (let by = 740; by < 1342; by += 32) {
      ctx.beginPath();
      ctx.moveTo(1080, by);
      ctx.lineTo(1792, by);
      ctx.stroke();
    }
    // Round bedside rug
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(1300, 1030, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 4. BATHROOM FLOOR (South-West: 80, 740, 560, 602)
    // Aquamarine mosaic tiles
    const bTile = 32;
    for (let bx = 80; bx < 640; bx += bTile) {
      for (let by = 740; by < 1342; by += bTile) {
        const isAqua = (Math.floor(bx / bTile) + Math.floor(by / bTile)) % 2 === 0;
        ctx.fillStyle = isAqua ? '#06b6d4' : '#e0f2fe';
        ctx.fillRect(bx, by, bTile, bTile);
        ctx.strokeStyle = 'rgba(8, 145, 178, 0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bTile, bTile);
      }
    }
    // Fluffy pink bath mat outside tub
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.roundRect(340, 785, 110, 65, 8);
    ctx.fill();
    ctx.strokeStyle = '#db2777';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. CENTRAL HALLWAY & FOYER (Center: 640, 740, 440, 602)
    ctx.fillStyle = '#92400e';
    ctx.fillRect(640, 740, 440, 602);
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.3)';
    ctx.lineWidth = 1.2;
    for (let hx = 640; hx < 1080; hx += 35) {
      ctx.beginPath();
      ctx.moveTo(hx, 740);
      ctx.lineTo(hx, 1342);
      ctx.stroke();
    }
    // Foyer welcome runner rug
    ctx.fillStyle = '#4c0519';
    ctx.fillRect(820, 840, 110, 460);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.strokeRect(820, 840, 110, 460);

    // --- REAL VISUAL DOORS & WINDOWS (No simple text labels!) ---
    for (const bp of mapEnv.breachPoints) {
      const bw = bp.w || 90;
      const bh = bp.h || 28;

      if (bp.isDoor) {
        // REAL WOODEN DOOR VISUAL
        ctx.save();
        ctx.translate(bp.x, bp.y);

        // Exterior Welcome / Entry Mat
        if (bp.id === 'front-door') {
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.roundRect(-bw * 0.45, bh * 0.7, bw * 0.9, 24, 4);
          ctx.fill();
          ctx.fillStyle = '#fde047';
          ctx.font = 'bold 9px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('WELCOME', 0, bh * 0.7 + 16);
        }

        // Door frame
        ctx.fillStyle = '#334155';
        ctx.fillRect(-bw / 2 - 4, -bh / 2, bw + 8, bh);

        // Open door swing arc with glowing caution breach marker
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(-bw / 2, -bh / 2, bw, 0, Math.PI / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Wooden paneled door swinging open into the room
        ctx.save();
        ctx.rotate(-0.4);
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.roundRect(-bw / 2, -bh / 2, bw, 10, 2);
        ctx.fill();
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Brass lever handle
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(bw / 2 - 8, -bh / 2 + 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
      } else if (bp.isWindow) {
        // REAL GLASS WINDOW VISUAL (4-pane crossbar, sill, curtains, reflection)
        ctx.save();
        ctx.translate(bp.x, bp.y);

        // Window casing and wooden sill
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-bw / 2 - 3, -bh / 2 - 3, bw + 6, bh + 6);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-bw / 2 - 3, -bh / 2 - 3, bw + 6, bh + 6);

        // Reflective tinted cyan glass pane
        ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
        ctx.fillRect(-bw / 2, -bh / 2, bw, bh);

        // Glass reflection diagonal glare stripes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-bw / 2 + 4, bh / 2 - 4);
        ctx.lineTo(bw / 2 - 4, -bh / 2 + 4);
        ctx.stroke();

        // 4-pane crossbars
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -bh / 2);
        ctx.lineTo(0, bh / 2);
        ctx.moveTo(-bw / 2, 0);
        ctx.lineTo(bw / 2, 0);
        ctx.stroke();

        // Fabric curtains draped on the sides
        ctx.fillStyle = '#f472b6';
        if (bw > bh) {
          ctx.beginPath();
          ctx.roundRect(-bw / 2 - 4, -bh / 2, 10, bh + 8, 3);
          ctx.roundRect(bw / 2 - 6, -bh / 2, 10, bh + 8, 3);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.roundRect(-bw / 2, -bh / 2 - 4, bw + 8, 10, 3);
          ctx.roundRect(-bw / 2, bh / 2 - 6, bw + 8, 10, 3);
          ctx.fill();
        }

        // Sparkling glass breach indicator
        ctx.fillStyle = 'rgba(244, 63, 94, 0.8)';
        ctx.font = 'bold 8px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ BREACH', 0, -bh / 2 - 6);

        ctx.restore();
      }
    }
  } else {
    // --- VIBRANT EXPANDED CITY METROPOLIS ---
    // Deep textured asphalt road surface
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, arenaWidth, arenaHeight);

    // Concrete Sidewalk Plazas with Curb Bevels & Tile Seams
    const sidewalkBands = [
      { y: 680, h: 160 },
      { y: 1120, h: 300 },
      { y: 1720, h: 140 },
    ];
    for (const sb of sidewalkBands) {
      // Concrete base
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, sb.y, arenaWidth, sb.h);

      // Granite curb stone borders
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, sb.y, arenaWidth, 6);
      ctx.fillRect(0, sb.y + sb.h - 6, arenaWidth, 6);

      // Concrete paver grid lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1;
      for (let px = 0; px < arenaWidth; px += 48) {
        ctx.beginPath();
        ctx.moveTo(px, sb.y);
        ctx.lineTo(px, sb.y + sb.h);
        ctx.stroke();
      }

      // Yellow Tactile Paving Warning Strips at Road Crossing Corners
      for (let tx = 800; tx < arenaWidth; tx += 950) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(tx, sb.y + 1, 90, 8);
        ctx.fillRect(tx, sb.y + sb.h - 9, 90, 8);
      }
    }

    // Wide Multi-Lane Boulevards (North Avenue & South Avenue)
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 840, arenaWidth, 280);
    ctx.fillRect(0, 1420, arenaWidth, 300);

    // Double Solid Yellow Lane Dividers
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 977);
    ctx.lineTo(arenaWidth, 977);
    ctx.moveTo(0, 983);
    ctx.lineTo(arenaWidth, 983);
    ctx.moveTo(0, 1567);
    ctx.lineTo(arenaWidth, 1567);
    ctx.moveTo(0, 1573);
    ctx.lineTo(arenaWidth, 1573);
    ctx.stroke();

    // White Dashed Lane Dividers
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.setLineDash([28, 22]);
    ctx.beginPath();
    ctx.moveTo(0, 910);
    ctx.lineTo(arenaWidth, 910);
    ctx.moveTo(0, 1050);
    ctx.lineTo(arenaWidth, 1050);
    ctx.moveTo(0, 1490);
    ctx.lineTo(arenaWidth, 1490);
    ctx.moveTo(0, 1650);
    ctx.lineTo(arenaWidth, 1650);
    ctx.stroke();
    ctx.setLineDash([]);

    // Solid White Stop Bars & Bold Zebra Crosswalks
    const crosswalkLocations = [850, 1850, 2850];
    for (const cx of crosswalkLocations) {
      // Stop bars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(cx - 30, 840, 8, 280);
      ctx.fillRect(cx - 30, 1420, 8, 300);

      // Zebra stripes
      for (let zx = cx; zx < cx + 110; zx += 24) {
        ctx.fillRect(zx, 840, 14, 280);
        ctx.fillRect(zx, 1420, 14, 300);
      }
    }

    // Cast-iron Manhole Covers & Storm Drain Grates
    const manholes = [
      { x: 500, y: 920 },
      { x: 1400, y: 1040 },
      { x: 2300, y: 920 },
      { x: 600, y: 1520 },
      { x: 1600, y: 1620 },
      { x: 2500, y: 1520 },
    ];
    for (const mh of manholes) {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(mh.x, mh.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(mh.x, mh.y, 9, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Street Furniture on Central Plaza (y: 1120-1420)
    // 1. Bus Stop Shelters
    const busShelters = [{ x: 1100, y: 1160 }, { x: 2100, y: 1160 }];
    for (const bs of busShelters) {
      // Glass shelter frame
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(bs.x - 35, bs.y - 15, 70, 30);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bs.x - 35, bs.y - 15, 70, 30);
      // Tinted glass back
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.fillRect(bs.x - 33, bs.y - 13, 66, 26);
      // Lit transit map
      ctx.fillStyle = '#fde047';
      ctx.fillRect(bs.x - 20, bs.y - 8, 14, 16);
      // Bench
      ctx.fillStyle = '#92400e';
      ctx.fillRect(bs.x - 15, bs.y + 4, 30, 6);
    }

    // 2. Japanese-style Beverage Vending Machines
    const vendingMachines = [
      { x: 650, y: 1150, c: '#ef4444', label: 'COLA' },
      { x: 700, y: 1150, c: '#06b6d4', label: 'TEA' },
      { x: 1750, y: 1150, c: '#ec4899', label: 'MILK' },
    ];
    for (const vm of vendingMachines) {
      ctx.fillStyle = vm.c;
      ctx.beginPath();
      ctx.roundRect(vm.x - 12, vm.y - 18, 24, 36, 3);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Lit display window
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(vm.x - 9, vm.y - 14, 18, 14);

      // Lit buttons
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(vm.x - 4, vm.y + 6, 2, 0, Math.PI * 2);
      ctx.arc(vm.x + 4, vm.y + 6, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Fire Hydrants
    const hydrants = [{ x: 450, y: 1140 }, { x: 1550, y: 1140 }, { x: 2650, y: 1140 }];
    for (const hy of hydrants) {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(hy.x - 6, hy.y - 10, 12, 20, 4);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(hy.x - 8, hy.y - 4, 16, 4);
    }

    // 4. Streetlamps casting warm lighting pools onto roads
    const streetlamps = [
      { x: 300, y: 840 },
      { x: 1000, y: 840 },
      { x: 1700, y: 840 },
      { x: 2400, y: 840 },
      { x: 600, y: 1420 },
      { x: 1300, y: 1420 },
      { x: 2000, y: 1420 },
      { x: 2700, y: 1420 },
    ];
    for (const sl of streetlamps) {
      // Warm circular light pool
      const slGrad = ctx.createRadialGradient(sl.x, sl.y, 10, sl.x, sl.y, 90);
      slGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
      slGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = slGrad;
      ctx.beginPath();
      ctx.arc(sl.x, sl.y, 90, 0, Math.PI * 2);
      ctx.fill();

      // Lamp pole base
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(sl.x, sl.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sl.x, sl.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- DRAW WALLS & STOREFRONTS ---
  for (const w of mapEnv.walls) {
    if (mapEnv.id === 'city') {
      // REAL ARCHITECTURAL METROPOLIS STOREFRONTS & BUILDINGS
      ctx.save();
      // Main structure block
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(w.x, w.y, w.w, w.h);

      // Neon Building Perimeter Roof Line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(w.x, w.y, w.w, w.h);

      // Upper floor lit windows grid
      const winW = 34;
      const winH = 26;
      for (let wx = w.x + 35; wx < w.x + w.w - 50; wx += 60) {
        for (let wy = w.y + 45; wy < w.y + w.h - 140; wy += 55) {
          const isLit = (Math.floor(wx / 60) + Math.floor(wy / 55)) % 3 !== 0;
          ctx.fillStyle = isLit ? 'rgba(254, 240, 138, 0.55)' : 'rgba(30, 41, 59, 0.8)';
          ctx.fillRect(wx, wy, winW, winH);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1;
          ctx.strokeRect(wx, wy, winW, winH);
        }
      }

      // Ground Floor Vibrant Storefronts on the street-facing side
      const isNorthBlock = w.y < 1000;
      const streetY = isNorthBlock ? w.y + w.h - 110 : w.y;

      if (w.label === 'Plaza Tower A') {
        // CHERRY SWEET BOUTIQUE
        // Pink & White Striped Awning
        const awningH = 34;
        const awningY = isNorthBlock ? streetY + 70 : streetY;
        const stripeW = 20;
        for (let ax = w.x + 20; ax < w.x + w.w - 20; ax += stripeW) {
          const isPink = Math.floor(ax / stripeW) % 2 === 0;
          ctx.fillStyle = isPink ? '#f43f5e' : '#f8fafc';
          ctx.fillRect(ax, awningY, stripeW, awningH);
        }

        // Store Display Window & Mannequins
        ctx.fillStyle = 'rgba(244, 114, 182, 0.35)';
        ctx.fillRect(w.x + 40, streetY + 15, w.w - 80, 50);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.strokeRect(w.x + 40, streetY + 15, w.w - 80, 50);

        // Neon Signboard
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 15px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 10;
        ctx.fillText('★ CHERRY SWEET BOUTIQUE ★', w.x + w.w / 2, streetY - 5);
        ctx.shadowBlur = 0;
      } else if (w.label === 'Grand Hotel B') {
        // CYBER ARCADE & GAMING
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 12;
        ctx.fillText('⚡ CYBER ARCADE 80s ⚡', w.x + w.w / 2, streetY - 5);
        ctx.shadowBlur = 0;

        // Glowing arcade pixel display marquee
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(w.x + 40, streetY + 15, w.w - 80, 55);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.strokeRect(w.x + 40, streetY + 15, w.w - 80, 55);

        // Neon CRT pixel graphics inside
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(w.x + 80, streetY + 25, 24, 24);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(w.x + 140, streetY + 25, 24, 24);
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(w.x + 200, streetY + 25, 24, 24);
      } else if (w.label === 'Financial Center C') {
        // METROPOLIS TOWER C
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 15px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fillText('METRO FINANCIAL CENTER', w.x + w.w / 2, streetY - 5);
        ctx.shadowBlur = 0;

        // Marble entrance & glass atrium
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(w.x + 60, streetY + 10, w.w - 120, 60);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(w.x + 60, streetY + 10, w.w - 120, 60);
      } else if (w.label === 'Metropolis Mall D') {
        // MATCHA BOBA CAFE
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 15px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 10;
        ctx.fillText('🍵 MATCHA BOBA TEA CAFE', w.x + w.w / 2, streetY + 30);
        ctx.shadowBlur = 0;

        // Green striped awning
        const stripeW = 20;
        for (let ax = w.x + 20; ax < w.x + w.w - 20; ax += stripeW) {
          const isGreen = Math.floor(ax / stripeW) % 2 === 0;
          ctx.fillStyle = isGreen ? '#059669' : '#f8fafc';
          ctx.fillRect(ax, streetY + 45, stripeW, 28);
        }
      } else if (w.label === 'Arcade Complex E') {
        // TOKYO MIDNIGHT RAMEN
        ctx.fillStyle = '#f97316';
        ctx.font = 'bold 15px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#fb923c';
        ctx.shadowBlur = 10;
        ctx.fillText('🍜 TOKYO MIDNIGHT RAMEN', w.x + w.w / 2, streetY + 30);
        ctx.shadowBlur = 0;

        // Glowing red paper lanterns
        for (let lx = w.x + 80; lx < w.x + w.w - 80; lx += 80) {
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.roundRect(lx - 10, streetY + 45, 20, 26, 6);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(lx - 2, streetY + 54, 4, 8);
        }
      } else {
        // 24/7 CONVENIENCE MART
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 15px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.fillText('🏪 24H CONVENIENCE MART', w.x + w.w / 2, streetY + 30);
        ctx.shadowBlur = 0;

        // Bright supermarket display window
        ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.fillRect(w.x + 40, streetY + 45, w.w - 80, 50);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(w.x + 40, streetY + 45, w.w - 80, 50);
      }

      ctx.restore();
    } else if (mapEnv.id === 'forest') {
      // ANCIENT CRACKED STONE RUIN WALLS WITH IVY & MOSS
      ctx.save();
      ctx.fillStyle = '#334155';
      ctx.fillRect(w.x, w.y, w.w, w.h);

      // Carved stone blocks
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(w.x, w.y, w.w, w.h);

      // Stone block seams
      const bLen = 42;
      for (let bx = w.x + bLen; bx < w.x + w.w; bx += bLen) {
        ctx.beginPath();
        ctx.moveTo(bx, w.y);
        ctx.lineTo(bx, w.y + w.h);
        ctx.stroke();
      }

      // Wild green creeping ivy & moss patches
      ctx.fillStyle = '#15803d';
      for (let ix = w.x + 12; ix < w.x + w.w - 12; ix += 34) {
        ctx.beginPath();
        ctx.arc(ix, w.y + 4, 7, 0, Math.PI * 2);
        ctx.arc(ix + 6, w.y + w.h - 4, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (mapEnv.id === 'home') {
      // REAL FURNITURE OBSTACLES & DETAILED WALLS
      const fType = w.furnitureType || 'wall';

      switch (fType) {
        case 'sofa': {
          // Cushioned plush sectional sofa
          ctx.fillStyle = '#be123c';
          ctx.beginPath();
          ctx.roundRect(w.x, w.y, w.w, w.h, 10);
          ctx.fill();
          ctx.strokeStyle = '#9f1239';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Individual cushion seams
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          const cushionCount = Math.max(2, Math.floor(w.w / 60));
          for (let c = 1; c < cushionCount; c++) {
            ctx.beginPath();
            ctx.moveTo(w.x + (w.w / cushionCount) * c, w.y + 6);
            ctx.lineTo(w.x + (w.w / cushionCount) * c, w.y + w.h - 6);
            ctx.stroke();
          }
          // Pastel throw pillows
          ctx.fillStyle = '#fde047';
          ctx.fillRect(w.x + 8, w.y + 8, 20, 20);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(w.x + w.w - 28, w.y + 8, 20, 20);
          break;
        }

        case 'table': {
          // Polished hardwood dining / coffee table
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.roundRect(w.x, w.y, w.w, w.h, 6);
          ctx.fill();
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Beveled inner edge
          ctx.strokeStyle = 'rgba(254, 215, 170, 0.3)';
          ctx.strokeRect(w.x + 4, w.y + 4, w.w - 8, w.h - 8);
          // Coffee mug / placemat
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(w.x + w.w / 2, w.y + w.h / 2, 5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'counter': {
          // Speckled granite kitchen counter with sink
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.roundRect(w.x, w.y, w.w, w.h, 4);
          ctx.fill();
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          // Double stainless sink basin
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(w.x + 30, w.y + 10, 40, 32);
          ctx.fillRect(w.x + 75, w.y + 10, 40, 32);
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(w.x + 72, w.y + 26, 4, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'island': {
          // Granite kitchen island with barstools
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(w.x, w.y, w.w, w.h, 8);
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Wooden barstools along bottom edge
          for (let s = 25; s < w.w - 20; s += 50) {
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.arc(w.x + s, w.y + w.h + 10, 9, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case 'fridge': {
          // Stainless steel french-door refrigerator
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.roundRect(w.x, w.y, w.w, w.h, 4);
          ctx.fill();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Vertical split & handles
          ctx.strokeStyle = '#334155';
          ctx.beginPath();
          ctx.moveTo(w.x + w.w / 2, w.y);
          ctx.lineTo(w.x + w.w / 2, w.y + w.h);
          ctx.stroke();
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(w.x + w.w / 2 - 5, w.y + 20, 2, 24);
          ctx.fillRect(w.x + w.w / 2 + 3, w.y + 20, 2, 24);
          break;
        }

        case 'bed': {
          // Master King Size Bed with duvet & 4 fluffy pillows
          // Wooden headboard
          ctx.fillStyle = '#451a03';
          ctx.fillRect(w.x, w.y, w.w, 18);
          // Mattress with soft pastel rose duvet
          ctx.fillStyle = '#fda4af';
          ctx.beginPath();
          ctx.roundRect(w.x + 8, w.y + 22, w.w - 16, w.h - 26, 8);
          ctx.fill();
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Folded sheet accent
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(w.x + 8, w.y + 22, w.w - 16, 28);
          // 4 Fluffy white pillows
          ctx.fillStyle = '#f8fafc';
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          const pw = (w.w - 40) / 2;
          ctx.beginPath();
          ctx.roundRect(w.x + 14, w.y + 26, pw, 24, 4);
          ctx.roundRect(w.x + 22 + pw, w.y + 26, pw, 24, 4);
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'tub': {
          // Porcelain white bathtub with chrome taps
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.roundRect(w.x, w.y, w.w, w.h, 16);
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 3;
          ctx.stroke();
          // Water basin
          ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.beginPath();
          ctx.roundRect(w.x + 8, w.y + 8, w.w - 16, w.h - 16, 12);
          ctx.fill();
          // Chrome faucet
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.arc(w.x + 20, w.y + w.h / 2, 5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'vanity': {
          // Vanity counter with double sink
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.roundRect(w.x, w.y, w.w, w.h, 4);
          ctx.fill();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          // Sinks
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(w.x + 45, w.y + w.h / 2, 22, 16, 0, 0, Math.PI * 2);
          ctx.ellipse(w.x + w.w - 45, w.y + w.h / 2, 22, 16, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'toilet': {
          // White ceramic toilet
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(w.x, w.y, w.w, 22); // tank
          ctx.beginPath();
          ctx.ellipse(w.x + w.w / 2, w.y + 44, 18, 24, 0, 0, Math.PI * 2); // bowl
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
        }

        case 'tv': {
          // OLED TV on media console
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(w.x, w.y, w.w, w.h);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(w.x, w.y, w.w, w.h);
          // Glowing screen line & standby LED
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.fillRect(w.x + 8, w.y + 4, w.w - 16, w.h - 8);
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(w.x + w.w - 10, w.y + w.h - 6, 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'wardrobe': {
          // Solid oak wardrobe
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.roundRect(w.x, w.y, w.w, w.h, 4);
          ctx.fill();
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Door divider and brass handles
          ctx.strokeStyle = '#290e02';
          ctx.beginPath();
          ctx.moveTo(w.x + w.w / 2, w.y);
          ctx.lineTo(w.x + w.w / 2, w.y + w.h);
          ctx.stroke();
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(w.x + w.w / 2 - 6, w.y + w.h / 2, 3, 0, Math.PI * 2);
          ctx.arc(w.x + w.w / 2 + 6, w.y + w.h / 2, 3, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        default: {
          // Solid interior drywall partition with baseboards
          ctx.fillStyle = '#334155';
          ctx.fillRect(w.x, w.y, w.w, w.h);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          ctx.strokeRect(w.x, w.y, w.w, w.h);
          break;
        }
      }
    } else {
      ctx.fillStyle = '#334155';
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(w.x, w.y, w.w, w.h);
    }
  }

  // Puddles
  for (const p of r.puddles) {
    if (p.type === 'caution') {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.fillStyle = 'rgba(120, 53, 15, 0.35)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  ctx.restore();
}

/** Draws moving traffic cars */
export function drawCars(r: RenderContext) {
  if (r.mapEnv.id !== 'city') return;
  const { ctx, cameraX, cameraY, cars } = r;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  for (const car of cars) {
    ctx.save();
    ctx.translate(car.x, car.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(-car.w / 2, -car.h / 2 + 5, car.w, car.h);

    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.roundRect(-car.w / 2, -car.h / 2, car.w, car.h, 8);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-car.w * 0.2, -car.h * 0.38, car.w * 0.45, car.h * 0.76);

    const headX = car.vx > 0 ? car.w / 2 : -car.w / 2;
    const beamDir = car.vx > 0 ? 1 : -1;
    const beamGrad = ctx.createRadialGradient(headX, 0, 5, headX + beamDir * 120, 0, 100);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(headX, -10);
    ctx.lineTo(headX + beamDir * 160, -35);
    ctx.lineTo(headX + beamDir * 160, 35);
    ctx.lineTo(headX, 10);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/** Draws neutral civilians in City that visually resemble pursuers and move erratically */
export function drawCivilians(r: RenderContext) {
  if (r.mapEnv.id !== 'city') return;
  const { ctx, cameraX, cameraY, civilians, gameTime } = r;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  for (const c of civilians) {
    ctx.save();
    ctx.translate(c.x, c.y);

    const moving = Math.hypot(c.vx, c.vy) > 5;
    const legBob = moving ? Math.sin(gameTime * 11 + c.id) * 3 : 0;
    const hairSwish = moving ? Math.sin(gameTime * 8 + c.id) * 2 : 0;
    const seed = c.id % 4;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 13, 9, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotate slightly towards facing angle
    if (c.facingAngle !== undefined) {
      // Facing angle orientation for walking
      const flip = Math.cos(c.facingAngle) < 0 ? -1 : 1;
      ctx.scale(flip, 1);
    }

    // Legs with stylish footwear (heels / boots)
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = seed === 0 ? '#1e293b' : seed === 1 ? '#475569' : '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-3, 6);
    ctx.lineTo(-3, 13 + legBob);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(3, 6);
    ctx.lineTo(3, 13 - legBob);
    ctx.stroke();

    // Cute shoes
    ctx.fillStyle = c.color;
    ctx.fillRect(-4.5, 12 + legBob, 3.5, 3);
    ctx.fillRect(1.5, 12 - legBob, 3.5, 3);

    // Chic stylish anime outfit (resembles pursuers!)
    if (seed === 0) {
      // Trench coat & dark turtleneck
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.roundRect(-7, -4, 14, 11, 2);
      ctx.fill();
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-3, -3, 6, 6);
    } else if (seed === 1) {
      // Fashionable blazer & pleated skirt
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.roundRect(-6.5, -4, 13, 10, 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6, 4, 12, 4);
    } else if (seed === 2) {
      // Stylish cropped casual jacket & belt
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(-6.5, -4, 13, 9, 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-2, -3, 4, 4);
    } else {
      // Oversized pastel knit sweater
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.roundRect(-7, -4, 14, 11, 4);
      ctx.fill();
    }

    // Head with porcelain fair skin
    ctx.fillStyle = '#ffe4e6';
    ctx.beginPath();
    ctx.arc(0, -10, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Anime hairstyles (blonde twintails, black bob, wavy auburn, etc.)
    if (seed === 0) {
      // Blonde twintails (looks like Gyaru!)
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -11, 8, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-8, -9 + hairSwish, 3.5, 7, -0.2, 0, Math.PI * 2);
      ctx.ellipse(8, -9 - hairSwish, 3.5, 7, 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (seed === 1) {
      // Sleek black bob with pink hairband
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(0, -11, 8.5, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-8, -10, 3, 9);
      ctx.fillRect(5, -10, 3, 9);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(-7, -13, 14, 2);
    } else if (seed === 2) {
      // Auburn wavy side ponytail (looks like Tomboy/Sheriff!)
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(0, -11, 8.5, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(8, -9 + hairSwish, 4, 8, 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Lavender-silver short chic haircut
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(0, -11, 8.5, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-6, -11);
      ctx.lineTo(-4, -5);
      ctx.lineTo(-2, -9);
      ctx.lineTo(1, -5);
      ctx.lineTo(4, -10);
      ctx.closePath();
      ctx.fill();
    }

    // Cute anime eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-2.5, -9, 1.3, 0, Math.PI * 2);
    ctx.arc(2.5, -9, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Accessory: Smartphone with glowing screen or chic shopping purse
    if (seed % 2 === 0) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(5, -1, 3, 4);
    } else {
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-8, 1, 4, 5);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-8, 1, 4, 5);
    }

    // Panic visual indicator
    if (c.isPanicked) {
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', 0, -18);
      // Sweatdrop
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(7, -14, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  ctx.restore();
}

/** Draws bouncing floating heart exp pickups with sparkling glow */
export function drawHearts(r: RenderContext) {
  const { ctx, cameraX, cameraY, hearts = [], gameTime } = r;
  if (!hearts || hearts.length === 0) return;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  for (const h of hearts) {
    const bob = Math.sin(gameTime * 5 + h.bobTimer) * 3.5;
    const pulse = 1.0 + Math.sin(gameTime * 7 + h.id) * 0.12;
    const currentScale = (h.scale || 1) * pulse;

    ctx.save();
    ctx.translate(h.x, h.y + bob);
    ctx.scale(currentScale, currentScale);

    // Soft outer pink glow
    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
    glow.addColorStop(0, 'rgba(244, 63, 94, 0.55)');
    glow.addColorStop(0.6, 'rgba(236, 72, 153, 0.25)');
    glow.addColorStop(1, 'rgba(236, 72, 153, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // Heart Shape
    ctx.fillStyle = h.color || '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.bezierCurveTo(-5, -3, -9, -9, 0, -11);
    ctx.bezierCurveTo(9, -9, 5, -3, 0, 3);
    ctx.fill();

    // Inner darker contour accent
    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Specular highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.ellipse(-2.5, -7.5, 2, 1.2, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/** Draws weapon pickups */
export function drawWeaponPickups(r: RenderContext) {
  const { ctx, cameraX, cameraY, pickups, gameTime } = r;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  for (const p of pickups) {
    const def = WEAPON_DEFS[p.weaponKey] || WEAPON_DEFS.pistol;
    const hoverY = Math.sin(gameTime * 4 + p.bobTimer) * 4;

    ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 12, p.radius * 1.3, p.radius * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(p.x, p.y + hoverY);

    ctx.strokeStyle = def.color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = def.color;
    ctx.shadowBlur = 10;
    ctx.strokeRect(-18, -18, 36, 36);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-18, -18, 36, 36);

    ctx.fillStyle = def.color;
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(def.shortName.slice(0, 4), 0, 0);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 11px Outfit, sans-serif';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(def.name, 0, -26);

    ctx.restore();
  }

  ctx.restore();
}

/**
 * REDESIGNED PLAYER: THIN, SMALL, AND CUTE FEMBOY
 * Petite, slender proportions, dainty waist, slim legs with striped pastel thigh-highs,
 * soft oversized cropped pastel hoodie with bow strings, delicate porcelain head,
 * huge sparkling anime eyes with star highlights, rosy blush, layered bangs with a star hairpin,
 * and a compact cute blaster with a dangling star charm.
 */
export function drawPlayer(r: RenderContext) {
  const { ctx, cameraX, cameraY, player, gameTime } = r;

  ctx.save();
  ctx.translate(player.x - cameraX, player.y - cameraY);

  if (player.invincibleTimer > 0 && Math.floor(gameTime * 20) % 2 === 0) {
    ctx.globalAlpha = 0.45;
  }

  // Delicate ethereal star-dust aura (soft cyan-rose-lavender)
  const auraGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 24);
  auraGrad.addColorStop(0, 'rgba(244, 114, 182, 0.35)');
  auraGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.2)');
  auraGrad.addColorStop(1, 'rgba(216, 180, 254, 0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.fill();

  // Petite shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 13, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const moving = Math.hypot(player.vx, player.vy) > 10;
  const legCycle = moving ? Math.sin(gameTime * 15) * 4 : 0;

  // Thin slender legs with cute striped pastel thigh-high socks
  ctx.lineWidth = 2.5;
  // Left leg
  ctx.strokeStyle = '#f472b6';
  ctx.beginPath();
  ctx.moveTo(-3.5, 6);
  ctx.lineTo(-3.5, 13 + legCycle);
  ctx.stroke();
  // Sock stripe accent
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-4.5, 8 + legCycle * 0.4);
  ctx.lineTo(-2.5, 8 + legCycle * 0.4);
  ctx.moveTo(-4.5, 10 + legCycle * 0.7);
  ctx.lineTo(-2.5, 10 + legCycle * 0.7);
  ctx.stroke();

  // Right leg
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#f472b6';
  ctx.beginPath();
  ctx.moveTo(3.5, 6);
  ctx.lineTo(3.5, 13 - legCycle);
  ctx.stroke();
  // Sock stripe accent
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(2.5, 8 - legCycle * 0.4);
  ctx.lineTo(4.5, 8 - legCycle * 0.4);
  ctx.moveTo(2.5, 10 - legCycle * 0.7);
  ctx.lineTo(4.5, 10 - legCycle * 0.7);
  ctx.stroke();

  // Dainty, cute low-top sneakers (white & pastel pink)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-5, 12 + legCycle, 4, 3);
  ctx.fillRect(1.5, 12 - legCycle, 4, 3);
  ctx.fillStyle = '#f472b6';
  ctx.fillRect(-5, 14 + legCycle, 4, 1.5);
  ctx.fillRect(1.5, 14 - legCycle, 4, 1.5);

  // Petite slender waist & cute cropped pastel lavender-pink hoodie
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.roundRect(-7, -3, 14, 11, 4);
  ctx.fill();
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Cute white collar & pink ribbon bow string
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(-3, -4, 6, 4, 2);
  ctx.fill();
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(-1, -1, 1.2, 0, Math.PI * 2);
  ctx.arc(1, -1, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Delicate head with porcelain fair complexion (petite 7.5 radius)
  ctx.fillStyle = '#fff1f2';
  ctx.beginPath();
  ctx.arc(0, -9.5, 7.5, 0, Math.PI * 2);
  ctx.fill();

  // Fluffy, layered soft pastel anime feminine hair (lavender-pink with fringe)
  ctx.fillStyle = '#e9d5ff';
  ctx.beginPath();
  ctx.arc(0, -11, 8.5, Math.PI, 0);
  ctx.fill();

  // Delicate side-swept bangs
  ctx.beginPath();
  ctx.moveTo(-7.5, -11);
  ctx.lineTo(-5.5, -6.5);
  ctx.lineTo(-2.5, -9);
  ctx.lineTo(0.5, -6.5);
  ctx.lineTo(3.5, -9);
  ctx.lineTo(6.5, -7);
  ctx.lineTo(7.5, -11);
  ctx.closePath();
  ctx.fill();

  // Cute golden star hairpin on the side of his hair
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 8px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★', 6, -11);

  // Large, ultra-expressive sparkling anime eyes with double star highlights
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(-3, -9, 1.8, 0, Math.PI * 2);
  ctx.arc(3, -9, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // Star sparkles in eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-3.5, -9.5, 0.7, 0, Math.PI * 2);
  ctx.arc(2.5, -9.5, 0.7, 0, Math.PI * 2);
  ctx.arc(-2.5, -8.5, 0.4, 0, Math.PI * 2);
  ctx.arc(3.5, -8.5, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Cute rosy blushing cheeks
  ctx.fillStyle = 'rgba(244, 63, 94, 0.6)';
  ctx.beginPath();
  ctx.arc(-4.5, -7.5, 1.6, 0, Math.PI * 2);
  ctx.arc(4.5, -7.5, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // --- CHARM EVOLUTIONS (Player looks more the part as Adoration Level rises!) ---
  const charmLvl = r.adorationLevel || 1;

  // Level >= 2: Blushing Cheeks & Pink Silk Hair Ribbons
  if (charmLvl >= 2) {
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(-5, -7.5, 2.2, 0, Math.PI * 2);
    ctx.arc(5, -7.5, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Twin pink ribbons in bangs
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.ellipse(-7.5, -12, 3, 1.8, -0.5, 0, Math.PI * 2);
    ctx.ellipse(7.5, -12, 3, 1.8, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Level >= 3: Velvet Choker with mini golden bell at neck
  if (charmLvl >= 3) {
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-3.5, -2, 7, 2);
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, -1, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Level >= 4: Pastel Maid Apron & Frills
  if (charmLvl >= 4) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-4.5, 2, 9, 5, 1.5);
    ctx.fill();
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Cute feline ear silhouettes
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.moveTo(-6, -14);
    ctx.lineTo(-4, -19);
    ctx.lineTo(-2, -14);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2, -14);
    ctx.lineTo(4, -19);
    ctx.lineTo(6, -14);
    ctx.closePath();
    ctx.fill();
  }

  // Level >= 5: Sparkling Stardust Orbital Aura
  if (charmLvl >= 5) {
    for (let st = 0; st < 5; st++) {
      const sAngle = r.gameTime * 2.8 + (st * Math.PI * 2) / 5;
      const sx = Math.cos(sAngle) * 20;
      const sy = Math.sin(sAngle) * 12;
      ctx.fillStyle = st % 2 === 0 ? '#fef08a' : '#f472b6';
      ctx.beginPath();
      ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Petite blaster in hand pointing towards target angle
  ctx.save();
  ctx.rotate(player.angle);
  const currentDef = WEAPON_DEFS[player.activeWeaponKey] || WEAPON_DEFS.pistol;

  ctx.fillStyle = currentDef.color;
  ctx.beginPath();
  ctx.roundRect(5, -2.5, 11, 5, 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Dangling star charm from blaster
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(10, 5, 2, 0, Math.PI * 2);
  ctx.fill();

  if (player.fireCooldown > currentDef.fireInterval - 0.05) {
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(18, 0, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();
}

/** Draws pursuers with attractive, distinctive archetype designs */
export function drawEnemies(r: RenderContext) {
  const { ctx, cameraX, cameraY, enemies, gameTime } = r;

  for (const e of enemies) {
    ctx.save();
    ctx.translate(e.x - cameraX, e.y - cameraY);

    if (e.hitFlashTimer > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, e.radius + 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- SHINY PURSUER PRISMATIC AURA & HALO ---
    if (e.isShiny) {
      const pulse = 1.0 + Math.sin(gameTime * 7 + e.id) * 0.12;
      const shinyGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, 44 * pulse);
      shinyGrad.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
      shinyGrad.addColorStop(0.35, 'rgba(244, 114, 182, 0.5)');
      shinyGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.35)');
      shinyGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');

      ctx.fillStyle = shinyGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 44 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Floating golden halo
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(0, -28, 14, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Orbiting sparkle stars
      for (let s = 0; s < 4; s++) {
        const starAngle = gameTime * 3.2 + (s * Math.PI) / 2;
        const sx = Math.cos(starAngle) * 26;
        const sy = Math.sin(starAngle) * 16;
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glowing Shiny Badge above head
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 9px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ SHINY ★', 0, -36);
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 14, e.radius * 0.85, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const legBob = Math.sin(gameTime * 12 + e.id) * 3;

    switch (e.archetype) {
      case 'sheriff': {
        // --- SHERIFF ABIGAIL: VISIBLE SEARCHLIGHT CONE & COWBOY ATTIRE ---
        ctx.save();
        const coneDist = r.activeUpgrades?.includes('sheriff_spotlight') ? 480 : 360;
        const coneSpread = r.activeUpgrades?.includes('sheriff_spotlight') ? Math.PI / 4 : Math.PI / 6;
        const isSpotted = !!e.isSpottedInCone;

        const coneGrad = ctx.createRadialGradient(0, -6, 10, 0, -6, coneDist);
        if (isSpotted) {
          coneGrad.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
          coneGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.28)');
          coneGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        } else {
          coneGrad.addColorStop(0, 'rgba(250, 204, 21, 0.38)');
          coneGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.16)');
          coneGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        }

        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.arc(0, -6, coneDist, e.angle - coneSpread, e.angle + coneSpread);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = isSpotted ? 'rgba(239, 68, 68, 0.65)' : 'rgba(250, 204, 21, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(Math.cos(e.angle - coneSpread) * coneDist, Math.sin(e.angle - coneSpread) * coneDist);
        ctx.moveTo(0, -6);
        ctx.lineTo(Math.cos(e.angle + coneSpread) * coneDist, Math.sin(e.angle + coneSpread) * coneDist);
        ctx.stroke();

        if (isSpotted) {
          ctx.fillStyle = '#ef4444';
          ctx.font = '900 11px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('TARGET SPOTTED!', 0, -32);
        } else if (!e.isKiting && (e.copsSummoned || 0) >= (e.stageQuota || 1)) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 9px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('! DIRECT CHASE !', 0, -30);
        }
        ctx.restore();

        // Leather boots
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-6, 11 + legBob, 4, 5);
        ctx.fillRect(2, 11 - legBob, 4, 5);

        // Leather sheriff duster coat & vest
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.roundRect(-9, -5, 18, 14, 3);
        ctx.fill();

        // Silver star badge
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(0, -2, 3, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(0, -11, 8.5, 0, Math.PI * 2);
        ctx.fill();

        // Auburn hair under hat
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(0, -13, 9, Math.PI, 0);
        ctx.fill();

        // Stetson / Cowboy Hat
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(0, -14, 15, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(-7, -21, 14, 8, 3);
        ctx.fill();

        // Confident eyes
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-3, -10, 1.8, 0, Math.PI * 2);
        ctx.arc(3, -10, 1.8, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'officer': {
        // --- OFFICER VIKI: Patrol Deputy with Peaked Cap & LoS Flashlight ---
        if (!e.isAlerted) {
          // Unalerted Patrol Mode: Focused small patrol flashlight beam
          ctx.save();
          const pAngle = e.angle;
          const pDist = r.activeUpgrades?.includes('officer_highbeam') ? 300 : 200;
          const pSpread = Math.PI / 5.2;

          const fGrad = ctx.createRadialGradient(0, -6, 6, 0, -6, pDist);
          fGrad.addColorStop(0, 'rgba(254, 240, 138, 0.42)');
          fGrad.addColorStop(0.6, 'rgba(254, 240, 138, 0.16)');
          fGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
          ctx.fillStyle = fGrad;
          ctx.beginPath();
          ctx.moveTo(0, -6);
          ctx.arc(0, -6, pDist, pAngle - pSpread, pAngle + pSpread);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = 'rgba(254, 240, 138, 0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, -6);
          ctx.lineTo(Math.cos(pAngle - pSpread) * pDist, Math.sin(pAngle - pSpread) * pDist);
          ctx.moveTo(0, -6);
          ctx.lineTo(Math.cos(pAngle + pSpread) * pDist, Math.sin(pAngle + pSpread) * pDist);
          ctx.stroke();

          // Soft patrol label
          ctx.fillStyle = '#94a3b8';
          ctx.font = '600 8px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('ON PATROL', 0, -28);
          ctx.restore();
        } else {
          // Alerted Mode: Flashing red/blue cruiser beacon
          const sirenRed = Math.floor(gameTime * 16) % 2 === 0;
          ctx.fillStyle = sirenRed ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)';
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 9px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('! PURSUIT !', 0, -28);
        }

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-6, 11 + legBob, 4, 5);
        ctx.fillRect(2, 11 - legBob, 4, 5);

        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.roundRect(-8, -5, 16, 12, 3);
        ctx.fill();

        ctx.fillStyle = '#facc15';
        ctx.fillRect(-1, -4, 2, 7);

        ctx.fillStyle = '#ffe4e6';
        ctx.beginPath();
        ctx.arc(0, -11, 8.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(0, -13, 9, Math.PI, 0);
        ctx.fill();

        // Peaked visor cap
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.arc(0, -15, 8.5, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-8, -15, 16, 3);
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, -17, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e40af';
        ctx.beginPath();
        ctx.arc(-3, -10, 1.8, 0, Math.PI * 2);
        ctx.arc(3, -10, 1.8, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'delinquent': {
        // --- DELINQUENT RYUKO: ATTRACTIVE SUKEBAN BEAUTY & VISIBLE DEFLECTIONS ---
        // Stylish dark leather combat boots
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-5.5, 11 + legBob, 4, 5);
        ctx.fillRect(1.5, 11 - legBob, 4, 5);

        // Pleated crimson plaid miniskirt with silver hip chain
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.roundRect(-7.5, 3, 15, 8, 2);
        ctx.fill();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(5, 5, 3, 0, Math.PI);
        ctx.stroke();

        // Cropped open sukeban jacket over sleek crimson bandeau top
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.roundRect(-8, -5, 16, 9, 3);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-3, -4, 6, 5);

        // Choker with silver ring
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-4, -6, 8, 2);
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(0, -5, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Fair complexion face
        ctx.fillStyle = '#fff1f2';
        ctx.beginPath();
        ctx.arc(0, -11, 8.5, 0, Math.PI * 2);
        ctx.fill();

        // Cute rebel band-aid on cheek
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(2, -9, 4, 2);

        // Luscious jet-black hair with fiery crimson streak highlights
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(0, -13, 9, Math.PI, 0);
        ctx.fill();
        // High swishing side ponytail with crimson streak
        ctx.beginPath();
        ctx.ellipse(9, -14, 5, 10, 0.4 + legBob * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.ellipse(8, -14, 2.5, 8, 0.4 + legBob * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Captivating ruby anime eyes with winged eyeliner & confident smirk
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.arc(-3, -10, 1.9, 0, Math.PI * 2);
        ctx.arc(3, -10, 1.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-3.5, -10.5, 0.7, 0, Math.PI * 2);
        ctx.arc(2.5, -10.5, 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Studded baseball bat held ready
        ctx.save();
        ctx.rotate(0.5);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(8, -18, 5, 26);
        ctx.fillStyle = '#f8fafc'; // white grip tape
        ctx.fillRect(8, -4, 5, 8);
        ctx.fillStyle = '#e2e8f0'; // metal studs
        ctx.fillRect(8, -16, 5, 2);
        ctx.fillRect(8, -12, 5, 2);
        ctx.restore();

        // --- VISIBLE DEFLECTION EFFECT ---
        if (e.deflectSparkTimer && e.deflectSparkTimer > 0) {
          ctx.save();
          // Glowing curved energy deflection barrier arc around bat
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(12, -4, 26, -Math.PI / 3, Math.PI / 3);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Flying deflected ricochet spark lines
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          for (let sp = 0; sp < 6; sp++) {
            const spA = (sp * Math.PI) / 3 + gameTime * 10;
            ctx.beginPath();
            ctx.moveTo(12 + Math.cos(spA) * 12, -4 + Math.sin(spA) * 12);
            ctx.lineTo(12 + Math.cos(spA) * 28, -4 + Math.sin(spA) * 28);
            ctx.stroke();
          }

          // Comic "CLANG!" popup text
          ctx.fillStyle = '#fde047';
          ctx.font = '900 13px Outfit, sans-serif';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3;
          ctx.strokeText('CLANG!', 18, -22);
          ctx.fillText('CLANG!', 18, -22);
          ctx.restore();
        }
        break;
      }

      case 'tomboy': {
        if (e.isDashing) {
          ctx.fillStyle = 'rgba(251, 146, 60, 0.4)';
          ctx.beginPath();
          ctx.arc(-Math.cos(e.angle) * 22, -Math.sin(e.angle) * 22, 10, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-8, 2, 16, 8);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-7, 10 + legBob, 5, 4);
        ctx.fillRect(2, 10 - legBob, 5, 4);

        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.roundRect(-9, -6, 18, 10, 3);
        ctx.fill();

        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(0, -11, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(0, -13, 9.5, Math.PI, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-8, -13, 6, 4, -0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(0, -15, 8.5, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(-8, -16, 5, 3);

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(-3, -10, 1.8, 0, Math.PI * 2);
        ctx.arc(3, -10, 1.8, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'goth': {
        const mistGrad = ctx.createRadialGradient(0, 5, 4, 0, 5, 26);
        mistGrad.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
        mistGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = mistGrad;
        ctx.beginPath();
        ctx.arc(0, 5, 26, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-6, 10 + legBob, 4, 5);
        ctx.fillRect(2, 10 - legBob, 4, 5);

        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.moveTo(-9, -5);
        ctx.lineTo(9, -5);
        ctx.lineTo(12, 11);
        ctx.lineTo(-12, 11);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#fdf4ff';
        ctx.beginPath();
        ctx.arc(0, -11, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(0, -13, 9.5, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(-9, -12, 4, 18);
        ctx.fillRect(5, -12, 4, 18);

        ctx.fillStyle = '#a855f7';
        ctx.fillRect(-4, -5, 8, 2);

        ctx.fillStyle = '#581c87';
        ctx.beginPath();
        ctx.arc(-3, -10, 1.8, 0, Math.PI * 2);
        ctx.arc(3, -10, 1.8, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'gyaru': {
        if (e.speedMultiplier > 1.0) {
          ctx.fillStyle = '#f472b6';
          ctx.font = '10px sans-serif';
          ctx.fillText('✨', 12, -18);
          ctx.fillText('💖', -16, -16);
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-7, 8 + legBob, 5, 6);
        ctx.fillRect(2, 8 - legBob, 5, 6);

        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.roundRect(-9, -5, 18, 12, 3);
        ctx.fill();

        ctx.fillStyle = '#fcd34d';
        ctx.beginPath();
        ctx.arc(0, -11, 8.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, -13, 9, Math.PI, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-11, -12, 5, 9, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(-13, -6, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(11, -12, 5, 9, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(13, -6, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#db2777';
        ctx.beginPath();
        ctx.arc(-3, -10, 2, 0, Math.PI * 2);
        ctx.arc(3, -10, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'senpai': {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-6, 11 + legBob, 4, 4);
        ctx.fillRect(2, 11 - legBob, 4, 4);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-8, 2, 16, 9);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(-8, -6, 16, 9, 3);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, -12, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(0, -14, 9.5, Math.PI, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -21, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-6, -12, 5, 4);
        ctx.strokeRect(1, -12, 5, 4);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(9, -2, 5, 7);
        break;
      }

      case 'yandere': {
        ctx.fillStyle = 'rgba(244, 63, 94, 0.3)';
        ctx.beginPath();
        ctx.arc(-Math.cos(e.angle) * 12, -Math.sin(e.angle) * 12, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-6, 9 + legBob, 4, 4);
        ctx.fillRect(2, 9 - legBob, 4, 4);

        ctx.fillStyle = '#4c0519';
        ctx.beginPath();
        ctx.roundRect(-8, -5, 16, 12, 3);
        ctx.fill();

        ctx.fillStyle = '#ffe4e6';
        ctx.beginPath();
        ctx.arc(0, -11, 8.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.arc(0, -13, 9.5, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(-9, -12, 4, 18);
        ctx.fillRect(5, -12, 4, 18);

        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('♥', -5, -8);
        ctx.fillText('♥', 2, -8);
        break;
      }
    }

    if (e.hp < e.maxHp) {
      const barWidth = 26;
      const barHeight = 4;
      const hpPct = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(-barWidth / 2, -28, barWidth, barHeight);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-barWidth / 2, -28, barWidth * hpPct, barHeight);
    }

    if (e.speechTimer > 0 && e.speechText) {
      ctx.save();
      const txt = e.speechText;
      ctx.font = '600 10px Outfit, sans-serif';
      const textWidth = ctx.measureText(txt).width;
      const boxW = textWidth + 12;
      const boxH = 18;
      const boxY = -48;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = GAME_TEXT.archetypes[e.archetype as ArchetypeKey]?.colorHex || '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-boxW / 2, boxY, boxW, boxH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-4, boxY + boxH);
      ctx.lineTo(0, boxY + boxH + 4);
      ctx.lineTo(4, boxY + boxH);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(txt, 0, boxY + boxH / 2);
      ctx.restore();
    }

    ctx.restore();
  }
}

/** Draws projectiles */
export function drawBullets(r: RenderContext) {
  const { ctx, cameraX, cameraY, bullets } = r;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  for (const b of bullets) {
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.trailColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    const speed = Math.hypot(b.vx, b.vy) || 1;
    const trailLen = Math.min(22, b.radius * 2.5);
    ctx.strokeStyle = b.trailColor;
    ctx.lineWidth = b.radius * 0.9;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - (b.vx / speed) * trailLen, b.y - (b.vy / speed) * trailLen);
    ctx.stroke();
  }

  ctx.restore();
}

/** Draws particles */
export function drawParticles(r: RenderContext) {
  const { ctx, cameraX, cameraY, particles } = r;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

/**
 * Draws atmospheric drifting Fog/Mist in the Forest environment
 */
export function drawForestFog(r: RenderContext) {
  if (r.mapEnv.id !== 'forest') return;
  const { ctx, cameraX, cameraY, arenaWidth, arenaHeight, gameTime } = r;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  // 12 drifting volumetric mist patches
  for (let i = 0; i < 12; i++) {
    const mistSpeed = 25 + (i % 4) * 8;
    const mistX = ((i * 320 + gameTime * mistSpeed) % (arenaWidth + 400)) - 200;
    const mistY = 150 + ((i * 190) % (arenaHeight - 300)) + Math.sin(gameTime * 0.8 + i) * 35;
    const mistR = 140 + (i % 3) * 50;

    const mistGrad = ctx.createRadialGradient(mistX, mistY, 20, mistX, mistY, mistR);
    mistGrad.addColorStop(0, 'rgba(209, 250, 229, 0.16)');
    mistGrad.addColorStop(0.5, 'rgba(167, 243, 208, 0.08)');
    mistGrad.addColorStop(1, 'rgba(167, 243, 208, 0)');

    ctx.fillStyle = mistGrad;
    ctx.beginPath();
    ctx.arc(mistX, mistY, mistR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Draws tree canopies overlay */
export function drawTreeCanopies(r: RenderContext) {
  if (r.mapEnv.id !== 'forest') return;
  const { ctx, cameraX, cameraY, mapEnv } = r;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  for (const t of mapEnv.trees) {
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.trunkRadius, 0, Math.PI * 2);
    ctx.fill();

    const canopyGrad = ctx.createRadialGradient(t.x, t.y, 20, t.x, t.y, t.canopyRadius);
    canopyGrad.addColorStop(0, 'rgba(20, 83, 45, 0.95)');
    canopyGrad.addColorStop(0.7, 'rgba(22, 101, 52, 0.88)');
    canopyGrad.addColorStop(1, 'rgba(34, 197, 94, 0.7)');

    ctx.fillStyle = canopyGrad;
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.canopyRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Draws the radar minimap */
export function drawMinimap(r: RenderContext) {
  const { ctx, player, enemies, pickups, arenaWidth, arenaHeight, canvasWidth } = r;

  const mapSize = 110;
  const padding = 16;
  const mapX = canvasWidth - mapSize - padding;
  const mapY = padding;

  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(mapX, mapY, mapSize, mapSize, 6);
  ctx.fill();
  ctx.stroke();

  const scaleX = mapSize / arenaWidth;
  const scaleY = mapSize / arenaHeight;

  // Pickups
  ctx.fillStyle = '#fbbf24';
  for (const p of pickups) {
    ctx.beginPath();
    ctx.arc(mapX + p.x * scaleX, mapY + p.y * scaleY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Enemies
  for (const e of enemies) {
    ctx.fillStyle = GAME_TEXT.archetypes[e.archetype as ArchetypeKey]?.colorHex || '#f43f5e';
    ctx.beginPath();
    ctx.arc(mapX + e.x * scaleX, mapY + e.y * scaleY, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Player
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(mapX + player.x * scaleX, mapY + player.y * scaleY, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();
}
