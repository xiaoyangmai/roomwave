/* Original canvas artwork for the bot's side-scrolling platform game. */
(() => {
  'use strict';
  function draw(context, frame, state, { width, height, reduced = false } = {}) {
    if (!context || !frame?.player || !(width > 0) || !(height > 0)) return;
    const ctx = context, scale = height / 500, viewWidth = width / scale, camera = frame.cameraX;
    const circle = (x, y, r, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
    const line = (points, stroke, lineWidth) => { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.beginPath(); points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
    const round = (x, y, w, h, r, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); };
    const triangle = (x, y, w, h, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x - w / 2, y); ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill(); };
    const star = (x, y, radius, fill) => {
      ctx.fillStyle = fill; ctx.beginPath();
      for (let point = 0; point < 10; point++) {
        const angle = -Math.PI / 2 + point * Math.PI / 5, r = point % 2 ? radius * .44 : radius;
        const xx = x + Math.cos(angle) * r, yy = y + Math.sin(angle) * r;
        if (point === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.closePath(); ctx.fill();
    };
    ctx.clearRect(0, 0, width, height); ctx.save(); ctx.scale(scale, scale); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const sky = ctx.createLinearGradient(0, 0, 0, 500); sky.addColorStop(0, '#62c7f2'); sky.addColorStop(.74, '#cef4f1'); sky.addColorStop(1, '#b4dfb4');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, viewWidth, 500);
    circle(viewWidth - 80 - camera * .025, 76, 36, '#fff4b9'); circle(viewWidth - 80 - camera * .025, 76, 26, '#fffbd9');
    for (let index = -1; index < Math.ceil(viewWidth / 260) + 2; index++) {
      const x = index * 260 - camera * .12 % 260, y = 68 + Math.abs(index % 3) * 34;
      round(x, y, 120, 23, 13, '#ffffffbd'); circle(x + 36, y - 4, 27, '#ffffffe8'); circle(x + 69, y - 12, 34, '#ffffffe8'); circle(x + 99, y + 1, 23, '#ffffffe8');
    }
    function hills(step, baseY, amplitude, tint, factor) {
      ctx.fillStyle = tint; ctx.beginPath(); ctx.moveTo(0, 500);
      const offset = camera * factor % step;
      for (let x = -step - offset; x < viewWidth + step; x += step) { ctx.lineTo(x, baseY); ctx.quadraticCurveTo(x + step / 2, baseY - amplitude, x + step, baseY); }
      ctx.lineTo(viewWidth, 500); ctx.closePath(); ctx.fill();
    }
    hills(410, 350, 230, '#74cbaa', .19);
    // A distant storybook castle, drawn separately from foreground gameplay.
    const castleX = 530 - camera * .16;
    round(castleX, 195, 130, 136, 8, '#f9eed4'); round(castleX + 13, 183, 27, 137, 4, '#fff7df'); round(castleX + 93, 177, 27, 143, 4, '#fff7df');
    round(castleX + 47, 161, 38, 165, 4, '#f4dfc2');
    triangle(castleX + 27, 187, 46, 42, '#f1a0af'); triangle(castleX + 106, 181, 45, 44, '#e991a7'); triangle(castleX + 66, 165, 56, 56, '#b394d9');
    for (const [x, y] of [[26, 218], [106, 213], [66, 190], [66, 235]]) round(castleX + x - 5, y, 11, 20, 5, '#83a9ba');
    round(castleX + 49, 277, 34, 56, 17, '#869bac'); line([[castleX + 66, 110], [castleX + 66, 87]], '#647d84', 3);
    ctx.fillStyle = '#fff4a4'; ctx.beginPath(); ctx.moveTo(castleX + 66, 87); ctx.lineTo(castleX + 91, 93); ctx.lineTo(castleX + 66, 101); ctx.fill();
    hills(310, 414, 160, '#55b991', .33); hills(220, 445, 100, '#369879', .5);
    for (let index = Math.floor(camera * .65 / 150) - 1; index < Math.ceil((camera * .65 + viewWidth) / 150) + 1; index++) {
      const x = index * 150 - camera * .65, top = 288 + Math.abs(index % 3) * 18;
      round(x + 28, top + 15, 12, 140, 5, '#64896b'); circle(x + 32, top, 48, '#4baf77'); circle(x + 4, top + 16, 31, '#65bf82'); circle(x + 59, top + 21, 33, '#65bf82');
    }
    ctx.save(); ctx.translate(-camera, 0);
    for (const platform of frame.platforms) {
      if (platform.x + platform.w < camera - 20 || platform.x > camera + viewWidth + 20) continue;
      const { x, y, w, h } = platform;
      const soil = ctx.createLinearGradient(0, y, 0, y + h); soil.addColorStop(0, '#bd8763'); soil.addColorStop(1, '#866149');
      round(x, y, w, h, 5, soil);
      ctx.save(); ctx.beginPath(); ctx.rect(x, y + 12, w, h - 12); ctx.clip();
      for (let row = 0; row < h / 24; row++) {
        const yy = y + 17 + row * 24; line([[x, yy], [x + w, yy]], '#d7ac7b75', 2);
        for (let xx = x + (row % 2 ? 0 : 23); xx < x + w; xx += 47) line([[xx, yy], [xx, yy + 24]], '#80594366', 2);
      }
      ctx.restore();
      round(x - 2, y - 3, w + 4, 15, 6, '#338965'); round(x - 2, y - 6, w + 4, 10, 5, '#8bdd67');
      for (let xx = x + 8; xx < x + w; xx += 17) triangle(xx, y + 3, 8, 6 + Math.abs(Math.sin(xx)) * 4, '#73ca59');
      if (h > 50) for (let xx = x + 22; xx < x + w; xx += 100) {
        line([[xx, y - 3], [xx, y - 15]], '#4f974b', 2); circle(xx, y - 17, 5, '#fff0bb'); circle(xx, y - 17, 2, '#eda055');
      }
    }
    for (let index = 1; index < frame.checkpoints.length; index++) {
      const checkpoint = frame.checkpoints[index], x = checkpoint.x;
      line([[x, checkpoint.y - 3], [x, checkpoint.y - 73]], '#f8efd4', 4);
      ctx.fillStyle = checkpoint.reached ? '#8cf3c0' : '#aec9d0'; ctx.beginPath(); ctx.moveTo(x + 2, checkpoint.y - 72); ctx.lineTo(x + 35, checkpoint.y - 64); ctx.lineTo(x + 2, checkpoint.y - 48); ctx.fill();
    }
    const goal = frame.goal;
    line([[goal.x, goal.y], [goal.x, goal.y - 172]], '#fff4d4', 7); circle(goal.x, goal.y - 175, 8, '#ffdb70');
    ctx.fillStyle = '#ca8df0'; ctx.beginPath(); ctx.moveTo(goal.x + 4, goal.y - 167); ctx.quadraticCurveTo(goal.x + 38, goal.y - 153, goal.x + 66, goal.y - 162); ctx.lineTo(goal.x + 66, goal.y - 111); ctx.quadraticCurveTo(goal.x + 37, goal.y - 101, goal.x + 4, goal.y - 116); ctx.fill();
    ctx.font = '26px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff3b2'; ctx.fillText('★', goal.x + 34, goal.y - 130);
    for (const item of frame.items) {
      if (!item.active || item.x < camera - 40 || item.x > camera + viewWidth + 40) continue;
      if (item.kind === 'coin') {
        const gleam = reduced ? 1 : .82 + Math.cos(frame.clock / 190 + item.id) * .18;
        ctx.save(); ctx.translate(item.x, item.y); ctx.scale(gleam, 1);
        circle(0, 0, 11, '#b78120'); circle(0, -1, 9.3, '#ffda4d'); line([[0, -6], [0, 4]], '#fff3a6', 3); ctx.restore();
      } else if (item.kind === 'banana') {
        ctx.save();
        if (item.spent) ctx.globalAlpha = Math.max(0, Math.min(1, (item.remaining || 0) / 400));
        if (item.falling === true) {
          // The seated gift drops through the game viewport, never the camera below it.
          ctx.beginPath(); ctx.rect(camera, 0, viewWidth, 500); ctx.clip();
        }
        ctx.translate(item.x, item.y - 4);
        if (item.falling === true) {
          if (!reduced) {
            for (const [x, top, bottom] of [[-14, -39, -25], [0, -52, -33], [14, -35, -22]]) line([[x, top], [x, bottom]], '#fff6bcaa', 2.5);
            const fallTime = Number.isFinite(item.age) ? item.age : frame.clock;
            ctx.rotate(Math.sin(fallTime / 145) * .22);
          }
          ctx.scale(1.4, 1.4);
        }
        ctx.strokeStyle = '#b28523'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.quadraticCurveTo(0, 5, 3, -12); ctx.quadraticCurveTo(4, 3, 14, 0); ctx.stroke();
        ctx.strokeStyle = '#ffe977'; ctx.lineWidth = 6; ctx.stroke(); line([[2, -13], [4, -18]], '#6f7e43', 3); ctx.restore();
      } else {
        const bounce = reduced ? 0 : Math.sin(frame.clock / 160 + item.x) * 1.8;
        ctx.fillStyle = '#ec987c'; ctx.beginPath(); ctx.ellipse(item.x, item.y - 12 + bounce, 16, 13, 0, Math.PI, 0); ctx.lineTo(item.x + 16, item.y - 1); ctx.lineTo(item.x - 16, item.y - 1); ctx.fill();
        circle(item.x - 5, item.y - 12 + bounce, 3, '#fff9e9'); circle(item.x + 5, item.y - 12 + bounce, 3, '#fff9e9'); circle(item.x - 4, item.y - 12 + bounce, 1.5, '#5a3c4c'); circle(item.x + 6, item.y - 12 + bounce, 1.5, '#5a3c4c');
      }
    }
    const player = frame.player, running = player.grounded && player.vx > 10, phase = reduced ? 0 : player.x / 8;
    const starPower = frame.starPower === true;
    const starElapsed = Number.isFinite(frame.effects?.star) ? frame.effects.star : (Number.isFinite(frame.clock) ? frame.clock : 0);
    // A continuous hue cycle gives the power-up its rainbow look without flashing.
    const starHue = (starElapsed / 5200 * 360) % 360;
    const fur = (original, offset = 0, lightness = 68) => starPower ? (reduced ? '#f6ce6c' : `hsl(${(starHue + offset) % 360} 82% ${lightness}%)`) : original;
    ctx.save(); ctx.translate(player.x, player.y);
    if (frame.recovering) ctx.globalAlpha = .45;
    else if (frame.invincible && !starPower && !reduced) ctx.globalAlpha = .55 + .45 * Math.abs(Math.sin(frame.clock / 90));
    if (starPower) {
      for (let index = 0; index < 5; index++) {
        const angle = index * Math.PI * 2 / 5 + (reduced ? 0 : starElapsed / 1350);
        star(Math.cos(angle) * 32, -33 + Math.sin(angle) * 35, 4.5 + index % 2, reduced ? '#ffefaf' : `hsl(${(starHue + index * 65) % 360} 95% 78%)`);
      }
      if (!reduced && player.vx > 10) for (let index = 0; index < 4; index++) {
        const travel = (starElapsed / 900 + index / 4) % 1;
        star(-26 - travel * 59, -22 - index * 8 + Math.sin(travel * Math.PI) * 9, 5 - travel * 3, `hsl(${(starHue + index * 55) % 360} 95% 82%)`);
      }
    }
    if (frame.effects?.boost !== undefined || frame.action === 'boost') {
      ctx.strokeStyle = '#d8ffffb0'; ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) line([[-19 - i * 8, -18 - i * 9], [-40 - i * 8, -18 - i * 9]], '#d8ffffb0', 3);
    }
    ctx.strokeStyle = fur('#8060b8', 50, 61); ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-9, -21); ctx.quadraticCurveTo(-29, -10, -26, -35 + (running ? Math.sin(phase) * 3 : 0)); ctx.stroke();
    const swing = running ? Math.sin(phase) * 10 : 0;
    line([[-6, -15], [-7 + swing * .4, -8], [-8 + swing, player.grounded ? -2 : -9]], fur('#6c479d', 75, 55), 8);
    line([[6, -15], [6 - swing * .4, -8], [8 - swing, player.grounded ? -2 : -6]], fur('#8962bb', 35, 62), 8);
    round(-14 + swing, player.grounded ? -4 : -12, 15, 7, 3, '#fff1c6'); round(3 - swing, player.grounded ? -4 : -9, 15, 7, 3, '#ffe3ad');
    ctx.fillStyle = fur('#ac82da', 25); ctx.beginPath(); ctx.ellipse(0, -25, 14, 17, 0, 0, Math.PI * 2); ctx.fill();
    round(-9, -34, 19, 22, 7, '#f3c66e'); line([[-9, -28], [-17, player.grounded ? -20 - swing * .4 : -37]], fur('#9066bb', 60, 60), 7); line([[10, -28], [18, player.grounded ? -20 + swing * .4 : -37]], fur('#b48ade', 20), 7);
    triangle(-9, -48, 14, 18, fur('#8b63b9', 30, 60)); triangle(9, -48, 14, 18, fur('#a67dd3', 10)); triangle(-9, -51, 7, 10, '#f7b5dc'); triangle(9, -51, 7, 10, '#f7b5dc');
    ctx.fillStyle = fur('#b892e0'); ctx.beginPath(); ctx.ellipse(0, -45, 18, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f9e9d8'; ctx.beginPath(); ctx.ellipse(7, -40, 10, 8, -.15, 0, Math.PI * 2); ctx.fill();
    circle(0, -46, 4.4, '#fffaf5'); circle(11, -46, 4, '#fffaf5'); circle(1.5, -46, 2.7, '#433764'); circle(12.2, -46, 2.5, '#433764'); circle(2.4, -47.2, 1, '#fff'); circle(12.8, -47, .9, '#fff');
    circle(8, -40, 2, '#bd7a9c'); ctx.strokeStyle = '#714869'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(8, -37, 3, 0, Math.PI); ctx.stroke();
    circle(-9, -39, 3, '#efb1d2'); ctx.restore();
    if (frame.coinFlash > 0 && frame.lastCoin) {
      const fade = frame.coinFlash / 500; ctx.save(); ctx.globalAlpha = Math.min(1, fade * 2);
      ctx.font = '800 20px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff3a5'; ctx.strokeStyle = '#8d622c'; ctx.lineWidth = 3;
      const yy = frame.lastCoin.y - 17 - (reduced ? 0 : 1 - fade) * 25; ctx.strokeText('+10', frame.lastCoin.x, yy); ctx.fillText('+10', frame.lastCoin.x, yy); ctx.restore();
    }
    ctx.restore();
    if (starPower) {
      const remaining = Number.isFinite(frame.starRemaining) ? Math.max(0, Math.ceil(frame.starRemaining / 1000)) : 0;
      // Keep the status readable in CSS pixels and clear of the room header.
      const badgeScale = Math.min(1, width / 174, height / 54);
      const badgeX = width / badgeScale - 162, badgeY = height / badgeScale - 40;
      ctx.save(); ctx.scale(badgeScale / scale, badgeScale / scale);
      round(badgeX, badgeY, 150, 26, 9, '#273352ed'); star(badgeX + 15, badgeY + 13, 7, '#ffe88e');
      ctx.font = '800 12px system-ui'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff4c3';
      ctx.fillText(`Star Power · ${remaining}s`, badgeX + 29, badgeY + 13.5);
      ctx.restore();
    }
    if (frame.celebration || frame.recovering) {
      const title = frame.celebration ? '★  STAGE CLEAR!  +150' : 'Back to the checkpoint';
      ctx.font = '800 22px system-ui'; const boxWidth = Math.min(viewWidth - 40, 330);
      round((viewWidth - boxWidth) / 2, 151, boxWidth, 48, 16, '#273352ed'); ctx.fillStyle = '#fff2b6'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(title, viewWidth / 2, 176);
    }
    ctx.restore();
  }
  globalThis.GamingPlatform = Object.freeze({ draw });
})();
