import assert from 'node:assert/strict';

const modules = process.env.CODEX_NODE_MODULES;
if (!modules) throw new Error('CODEX_NODE_MODULES is required');
const { chromium } = await import(`${modules}/playwright/index.mjs`);
const browser = await chromium.launch({
  headless: process.env.HEADED !== '1',
  executablePath: process.env.BRAVE_EXECUTABLE_PATH || '/usr/bin/brave-browser',
  args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
});

async function open(viewport, url = 'http://127.0.0.1:8000/') {
  const context = await browser.newContext({ viewport, hasTouch: true, isMobile: viewport.width < 900 });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  return { context, page };
}

try {
  {
    const { context, page } = await open({ width: 390, height: 844 });
    const visible = await page.locator('#rotate-device').isVisible();
    assert.equal(visible, true, 'portrait must show a rotate-device gate');
    await page.screenshot({ path: '/tmp/rescate-eco-portrait.png' });
    await context.close();
  }

  {
    const { context, page } = await open({ width: 844, height: 390 }, 'http://127.0.0.1:8000/?levelDebug=1');
    await page.waitForFunction(() => window.game?.scene?.getScene('Level1Scene')?.uiManager, null, { timeout: 20000 });
    await page.waitForTimeout(3300);
    const result = await page.evaluate(() => {
      const scene = window.game.scene.getScene('Level1Scene');
      scene.uiManager.showMessage('PRUEBA DE MENSAJE', '#ffffff', 1200);
      const gameRect = document.querySelector('#game').getBoundingClientRect();
      const canvasRect = document.querySelector('canvas').getBoundingClientRect();
      return {
        rotateVisible: getComputedStyle(document.querySelector('#rotate-device')).display !== 'none',
        gameHeight: Math.round(gameRect.height),
        canvasHeight: Math.round(canvasRect.height),
        hudScale: scene.uiManager.container.scaleX,
        messageY: scene.uiManager.activeMessage.y,
        mobileButtons: scene.children.list.filter(child => child.name?.startsWith('mobile-control-')).length,
      };
    });
    assert.equal(result.rotateVisible, false, 'landscape must not show the rotate gate');
    assert.ok(result.canvasHeight >= 370, `landscape canvas is too small: ${result.canvasHeight}`);
    assert.ok(result.hudScale >= 0.85, `HUD is too small: ${result.hudScale}`);
    assert.ok(result.messageY <= 150, `guidance covers gameplay center at y=${result.messageY}`);
    assert.ok(result.mobileButtons >= 12, `touch controls or puzzle answers missing: ${result.mobileButtons}`);

    const beforeTouch = await page.evaluate(() => window.game.scene.getScene('Level1Scene').player.x);
    const canvas = await page.locator('canvas').boundingBox();
    const rightX = canvas.x + canvas.width * (152 / 1280);
    const controlsY = canvas.y + canvas.height * (646 / 720);
    await page.mouse.move(rightX, controlsY);
    await page.mouse.down();
    await page.waitForTimeout(150);
    const heldTouch = await page.evaluate(() => {
      const scene = window.game.scene.getScene('Level1Scene');
      return { right: scene.player.virtualInput.right, x: scene.player.x, velocityX: scene.player.body.velocity.x, accelerationX: scene.player.body.acceleration.x, blocked: scene.player.body.blocked, moves: scene.player.body.moves, paused: scene.physics.world.isPaused };
    });
    assert.equal(heldTouch.right, true, `right control did not remain held: ${JSON.stringify(heldTouch)}`);
    await page.waitForTimeout(210);
    await page.mouse.up();
    const afterTouch = await page.evaluate(() => window.game.scene.getScene('Level1Scene').player.x);
    assert.ok(afterTouch > beforeTouch + 8, `touch movement did not move Paola: ${beforeTouch} -> ${afterTouch}; ${JSON.stringify(heldTouch)}`);

    await page.waitForFunction(() => window.game.scene.getScene('Level1Scene').player.isGrounded, null, { timeout: 5000 });
    const point = x => ({ x: canvas.x + canvas.width * (x / 1280), y: controlsY });
    await page.mouse.click(point(838).x, point(838).y);
    await page.waitForTimeout(60);
    const airborne = await page.evaluate(() => window.game.scene.getScene('Level1Scene').player.body.velocity.y < 0);
    assert.equal(airborne, true, 'touch jump must launch Paola');
    await page.mouse.click(point(1006).x, point(1006).y);
    await page.waitForTimeout(60);
    await page.mouse.click(point(1174).x, point(1174).y);
    await page.waitForTimeout(60);
    const firstControls = await page.evaluate(() => {
      const scene = window.game.scene.getScene('Level1Scene');
      return {
        projectiles: scene.projectiles.getChildren().filter(item => item.active).length,
        shieldActive: scene.player.shieldActive,
      };
    });
    assert.ok(firstControls.projectiles > 0, 'touch ranged input must create a projectile');
    assert.ok(firstControls.shieldActive > 0, 'touch shield input must activate protection');
    await page.waitForFunction(() => {
      const player = window.game.scene.getScene('Level1Scene').player;
      return player.isGrounded && player.attackCooldown <= 0;
    }, null, { timeout: 5000 });
    await page.mouse.click(point(922).x, point(922).y);
    await page.waitForTimeout(50);
    const meleeCooldown = await page.evaluate(() => window.game.scene.getScene('Level1Scene').player.attackCooldown);
    assert.ok(meleeCooldown > 0, 'touch melee input must start attack cooldown');
    await page.screenshot({ path: '/tmp/rescate-eco-landscape.png' });
    await context.close();
  }

  {
    const { context, page } = await open({ width: 1440, height: 900 });
    await page.waitForFunction(() => window.game?.scene?.isActive('MenuScene'), null, { timeout: 20000 });
    const usesWorldArt = await page.evaluate(() => {
      const scene = window.game.scene.getScene('MenuScene');
      return scene.children.list.some(child => child.texture?.key === 'bg-romantic' && child.displayWidth >= 1200);
    });
    assert.equal(usesWorldArt, true, 'menu must use the existing detailed romantic pixel-art background');
    await page.screenshot({ path: '/tmp/rescate-eco-menu.png' });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log('elite-eco smoke: PASS');
