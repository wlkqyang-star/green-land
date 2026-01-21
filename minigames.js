// 小游戏实现

class MiniGame {
    constructor(container, config, onComplete) {
        this.container = container;
        this.config = config;
        this.onComplete = onComplete;
    }

    start() {
        // 子类实现
    }

    end(success) {
        this.onComplete(success);
    }
}

// 节奏游戏
class RhythmGame extends MiniGame {
    start() {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        canvas.className = 'game-canvas';
        this.container.innerHTML = '';
        this.container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const info = document.createElement('div');
        info.className = 'game-info';
        info.textContent = '分数: 0 | 按空格键击打音符！';
        this.container.appendChild(info);

        let score = 0;
        let notes = [];
        let gameTime = 0;
        const targetScore = this.config.difficulty === 'easy' ? 10 : this.config.difficulty === 'medium' ? 15 : 20;
        const gameDuration = 30000; // 30秒

        // 生成音符
        const spawnNote = () => {
            notes.push({
                x: 400,
                y: 0,
                speed: this.config.difficulty === 'easy' ? 2 : this.config.difficulty === 'medium' ? 3 : 4
            });
        };

        // 键盘事件
        const keyHandler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                // 检查是否击中音符
                for (let i = notes.length - 1; i >= 0; i--) {
                    if (notes[i].y > 500 && notes[i].y < 580) {
                        score++;
                        notes.splice(i, 1);
                        info.textContent = `分数: ${score} | 目标: ${targetScore}`;
                        break;
                    }
                }
            }
        };
        document.addEventListener('keydown', keyHandler);

        // 游戏循环
        const gameLoop = () => {
            if (gameTime >= gameDuration) {
                document.removeEventListener('keydown', keyHandler);
                this.end(score >= targetScore);
                return;
            }

            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, 800, 600);

            // 绘制击打区域
            ctx.fillStyle = '#4fc3f7';
            ctx.fillRect(350, 550, 100, 10);

            // 更新和绘制音符
            for (let i = notes.length - 1; i >= 0; i--) {
                notes[i].y += notes[i].speed;
                
                ctx.fillStyle = '#ff6b6b';
                ctx.beginPath();
                ctx.arc(notes[i].x, notes[i].y, 20, 0, Math.PI * 2);
                ctx.fill();

                if (notes[i].y > 600) {
                    notes.splice(i, 1);
                }
            }

            gameTime += 16;
            if (Math.random() < 0.02) {
                spawnNote();
            }

            requestAnimationFrame(gameLoop);
        };

        gameLoop();
    }
}

// 潜行游戏
class StealthGame extends MiniGame {
    start() {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        canvas.className = 'game-canvas';
        this.container.innerHTML = '';
        this.container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const info = document.createElement('div');
        info.className = 'game-info';
        info.textContent = '使用方向键移动，到达绿色区域！';
        this.container.appendChild(info);

        let player = { x: 50, y: 300, size: 20 };
        let target = { x: 750, y: 300, size: 30 };
        let guards = [];
        
        const guardCount = this.config.difficulty === 'easy' ? 2 : this.config.difficulty === 'medium' ? 3 : 4;
        for (let i = 0; i < guardCount; i++) {
            guards.push({
                x: 200 + i * 150,
                y: 200 + Math.random() * 200,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: 25
            });
        }

        const keys = {};
        const keyDownHandler = (e) => {
            keys[e.key] = true;
        };
        const keyUpHandler = (e) => {
            keys[e.key] = false;
        };
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);

        const gameLoop = () => {
            // 移动玩家
            if (keys['ArrowUp']) player.y -= 3;
            if (keys['ArrowDown']) player.y += 3;
            if (keys['ArrowLeft']) player.x -= 3;
            if (keys['ArrowRight']) player.x += 3;

            player.x = Math.max(0, Math.min(800 - player.size, player.x));
            player.y = Math.max(0, Math.min(600 - player.size, player.y));

            // 更新守卫
            guards.forEach(guard => {
                guard.x += guard.vx;
                guard.y += guard.vy;
                if (guard.x < 0 || guard.x > 800) guard.vx *= -1;
                if (guard.y < 0 || guard.y > 600) guard.vy *= -1;
            });

            // 碰撞检测
            for (let guard of guards) {
                const dx = player.x - guard.x;
                const dy = player.y - guard.y;
                if (Math.sqrt(dx * dx + dy * dy) < player.size + guard.size) {
                    document.removeEventListener('keydown', keyDownHandler);
                    document.removeEventListener('keyup', keyUpHandler);
                    this.end(false);
                    return;
                }
            }

            // 到达目标
            const dx = player.x - target.x;
            const dy = player.y - target.y;
            if (Math.sqrt(dx * dx + dy * dy) < player.size + target.size) {
                document.removeEventListener('keydown', keyDownHandler);
                document.removeEventListener('keyup', keyUpHandler);
                this.end(true);
                return;
            }

            // 绘制
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, 800, 600);

            ctx.fillStyle = '#4caf50';
            ctx.beginPath();
            ctx.arc(target.x, target.y, target.size, 0, Math.PI * 2);
            ctx.fill();

            guards.forEach(guard => {
                ctx.fillStyle = '#ff6b6b';
                ctx.beginPath();
                ctx.arc(guard.x, guard.y, guard.size, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.fillStyle = '#4fc3f7';
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
            ctx.fill();

            requestAnimationFrame(gameLoop);
        };

        gameLoop();
    }
}

// 准星游戏
class AimGame extends MiniGame {
    start() {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        canvas.className = 'game-canvas';
        this.container.innerHTML = '';
        this.container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const info = document.createElement('div');
        info.className = 'game-info';
        this.container.appendChild(info);

        let score = 0;
        let targets = [];
        let gameTime = 0;
        const targetScore = this.config.difficulty === 'easy' ? 5 : this.config.difficulty === 'medium' ? 8 : 12;
        const gameDuration = 20000;

        info.textContent = `分数: ${score} | 目标: ${targetScore}`;

        const spawnTarget = () => {
            targets.push({
                x: 50 + Math.random() * 700,
                y: 50 + Math.random() * 500,
                size: this.config.difficulty === 'easy' ? 40 : this.config.difficulty === 'medium' ? 30 : 20,
                life: 60
            });
        };

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            for (let i = targets.length - 1; i >= 0; i--) {
                const dx = x - targets[i].x;
                const dy = y - targets[i].y;
                if (Math.sqrt(dx * dx + dy * dy) < targets[i].size) {
                    score++;
                    targets.splice(i, 1);
                    info.textContent = `分数: ${score} | 目标: ${targetScore}`;
                    break;
                }
            }
        });

        const gameLoop = () => {
            if (gameTime >= gameDuration) {
                this.end(score >= targetScore);
                return;
            }

            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, 800, 600);

            for (let i = targets.length - 1; i >= 0; i--) {
                targets[i].life--;
                if (targets[i].life <= 0) {
                    targets.splice(i, 1);
                    continue;
                }

                ctx.fillStyle = '#ff6b6b';
                ctx.beginPath();
                ctx.arc(targets[i].x, targets[i].y, targets[i].size, 0, Math.PI * 2);
                ctx.fill();
            }

            gameTime += 16;
            if (Math.random() < 0.03) {
                spawnTarget();
            }

            requestAnimationFrame(gameLoop);
        };

        gameLoop();
    }
}

// 躲避游戏
class DodgeGame extends MiniGame {
    start() {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        canvas.className = 'game-canvas';
        this.container.innerHTML = '';
        this.container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const info = document.createElement('div');
        info.className = 'game-info';
        this.container.appendChild(info);

        let player = { x: 400, y: 300, size: 20 };
        let obstacles = [];
        let gameTime = 0;
        const surviveTime = this.config.difficulty === 'easy' ? 15000 : this.config.difficulty === 'medium' ? 20000 : 25000;

        const keys = {};
        const keyDownHandler = (e) => { keys[e.key] = true; };
        const keyUpHandler = (e) => { keys[e.key] = false; };
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);

        const spawnObstacle = () => {
            const side = Math.floor(Math.random() * 4);
            let x, y, vx, vy;
            const speed = this.config.difficulty === 'easy' ? 2 : this.config.difficulty === 'medium' ? 3 : 4;

            if (side === 0) { x = Math.random() * 800; y = -20; vx = 0; vy = speed; }
            else if (side === 1) { x = Math.random() * 800; y = 620; vx = 0; vy = -speed; }
            else if (side === 2) { x = -20; y = Math.random() * 600; vx = speed; vy = 0; }
            else { x = 820; y = Math.random() * 600; vx = -speed; vy = 0; }

            obstacles.push({ x, y, vx, vy, size: 15 });
        };

        const gameLoop = () => {
            const remainTime = Math.max(0, surviveTime - gameTime);
            info.textContent = `存活时间: ${(remainTime / 1000).toFixed(1)}秒`;

            if (gameTime >= surviveTime) {
                document.removeEventListener('keydown', keyDownHandler);
                document.removeEventListener('keyup', keyUpHandler);
                this.end(true);
                return;
            }

            if (keys['ArrowUp']) player.y -= 4;
            if (keys['ArrowDown']) player.y += 4;
            if (keys['ArrowLeft']) player.x -= 4;
            if (keys['ArrowRight']) player.x += 4;

            player.x = Math.max(player.size, Math.min(800 - player.size, player.x));
            player.y = Math.max(player.size, Math.min(600 - player.size, player.y));

            for (let i = obstacles.length - 1; i >= 0; i--) {
                obstacles[i].x += obstacles[i].vx;
                obstacles[i].y += obstacles[i].vy;

                const dx = player.x - obstacles[i].x;
                const dy = player.y - obstacles[i].y;
                if (Math.sqrt(dx * dx + dy * dy) < player.size + obstacles[i].size) {
                    document.removeEventListener('keydown', keyDownHandler);
                    document.removeEventListener('keyup', keyUpHandler);
                    this.end(false);
                    return;
                }

                if (obstacles[i].x < -50 || obstacles[i].x > 850 || obstacles[i].y < -50 || obstacles[i].y > 650) {
                    obstacles.splice(i, 1);
                }
            }

            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, 800, 600);

            ctx.fillStyle = '#4fc3f7';
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
            ctx.fill();

            obstacles.forEach(obs => {
                ctx.fillStyle = '#ff6b6b';
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.size, 0, Math.PI * 2);
                ctx.fill();
            });

            gameTime += 16;
            if (Math.random() < 0.02) {
                spawnObstacle();
            }

            requestAnimationFrame(gameLoop);
        };

        gameLoop();
    }
}

// 策略游戏
class StrategyGame extends MiniGame {
    start() {
        this.container.innerHTML = `
            <div style="text-align: center; color: white;">
                <h2 class="minigame-title">${this.config.description}</h2>
                <p class="minigame-description">这是一个策略决策游戏，请做出明智的选择。</p>
                <div style="margin-top: 30px;">
                    <button class="minigame-btn minigame-start" onclick="strategyGameChoice(true)">选择A：积极应对</button>
                    <button class="minigame-btn minigame-skip" onclick="strategyGameChoice(false)">选择B：保守策略</button>
                </div>
            </div>
        `;

        window.strategyGameChoice = (choice) => {
            delete window.strategyGameChoice;
            this.end(choice);
        };
    }
}

// 创建小游戏实例
function createMiniGame(gameType, config, container, onComplete) {
    switch (gameType) {
        case 'rhythm':
            return new RhythmGame(container, config, onComplete);
        case 'stealth':
            return new StealthGame(container, config, onComplete);
        case 'aim':
            return new AimGame(container, config, onComplete);
        case 'dodge':
            return new DodgeGame(container, config, onComplete);
        case 'strategy':
            return new StrategyGame(container, config, onComplete);
        default:
            return null;
    }
}
