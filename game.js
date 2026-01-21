// 主游戏逻辑

class GameEngine {
    constructor() {
        this.currentScriptId = null;
        this.visitedNodes = new Set();
        this.init();
    }

    init() {
        // 绑定开始按钮
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });

        // 绑定重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => {
            location.reload();
        });

        // 绑定继续按钮
        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextNode();
        });
    }

    startGame() {
        document.getElementById('start-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        
        // 找到第一个节点（支持narrator、dialogue等类型）
        const firstNode = SCRIPTS[0];
        if (firstNode) {
            this.loadScript(firstNode.id);
        }
    }

    loadScript(scriptId) {
        const script = getScriptById(scriptId);
        if (!script) {
            console.error('Script not found:', scriptId);
            return;
        }

        this.currentScriptId = scriptId;
        this.visitedNodes.add(scriptId);

        // 设置背景
        if (script.backgroundImage) {
            const bgElement = document.getElementById('background');
            bgElement.style.backgroundImage = `url('${script.backgroundImage}')`;
            bgElement.style.backgroundSize = 'cover';
            bgElement.style.backgroundPosition = 'center';
            bgElement.style.backgroundRepeat = 'no-repeat';
        }

        // 处理不同类型的节点
        switch (script.nodeType) {
            case 'narrator':
            case 'dialogue':
                this.showDialogue(script);
                break;
            case 'choice':
                this.showChoice(script);
                break;
            case 'minigame':
                this.showMiniGame(script);
                break;
            case 'ending':
                this.showEnding(script);
                break;
        }
    }

    showDialogue(script) {
        const character = getCharacterById(script.characterId);
        const characterDiv = document.getElementById('character');
        const dialogueBox = document.getElementById('dialogue-box');
        const choiceBox = document.getElementById('choice-box');

        // 显示对话框，隐藏选择框
        dialogueBox.style.display = 'block';
        choiceBox.classList.add('hidden');

        // 设置角色立绘
        if (character && script.emotion) {
            const emotionField = 'sprite' + script.emotion.charAt(0).toUpperCase() + script.emotion.slice(1);
            const spriteUrl = character[emotionField];
            if (spriteUrl) {
                characterDiv.style.backgroundImage = `url('${spriteUrl}')`;
                characterDiv.style.opacity = '1';
            }
        } else {
            characterDiv.style.opacity = '0';
        }

        // 设置对话内容
        document.getElementById('character-name').textContent = character ? character.name : '';
        document.getElementById('dialogue-text').textContent = script.content || '';
    }

    showChoice(script) {
        const character = getCharacterById(script.characterId);
        const characterDiv = document.getElementById('character');
        const dialogueBox = document.getElementById('dialogue-box');
        const choiceBox = document.getElementById('choice-box');

        // 显示选择框，隐藏对话框
        dialogueBox.style.display = 'none';
        choiceBox.classList.remove('hidden');

        // 设置角色立绘
        if (character && script.emotion) {
            const emotionField = 'sprite' + script.emotion.charAt(0).toUpperCase() + script.emotion.slice(1);
            const spriteUrl = character[emotionField];
            if (spriteUrl) {
                characterDiv.style.backgroundImage = `url('${spriteUrl}')`;
                characterDiv.style.opacity = '1';
            }
        }

        // 解析选择项
        let choices = [];
        try {
            choices = typeof script.choices === 'string' ? JSON.parse(script.choices) : script.choices;
        } catch (e) {
            console.error('Failed to parse choices:', e);
        }

        // 渲染选择按钮
        const choicesDiv = document.getElementById('choices');
        choicesDiv.innerHTML = '';
        
        choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice.text || `选项 ${index + 1}`;
            btn.addEventListener('click', () => {
                if (choice.nextNodeId) {
                    this.loadScript(choice.nextNodeId);
                }
            });
            choicesDiv.appendChild(btn);
        });
    }

    showMiniGame(script) {
        const miniGame = getMiniGameById(script.miniGameId);
        if (!miniGame) {
            console.error('MiniGame not found:', script.miniGameId);
            this.nextNode();
            return;
        }

        const container = document.getElementById('minigame-container');
        container.classList.remove('hidden');
        document.getElementById('dialogue-box').style.display = 'none';

        // 显示小游戏介绍
        container.innerHTML = `
            <h2 class="minigame-title">${miniGame.description || '小游戏挑战'}</h2>
            <p class="minigame-description">
                难度: ${miniGame.difficulty === 'easy' ? '简单' : miniGame.difficulty === 'medium' ? '中等' : '困难'}
            </p>
            <div class="minigame-buttons">
                <button class="minigame-btn minigame-start" id="minigame-start-btn">开始游戏</button>
                <button class="minigame-btn minigame-skip" id="minigame-skip-btn">跳过游戏</button>
            </div>
        `;

        document.getElementById('minigame-start-btn').addEventListener('click', () => {
            const game = createMiniGame(
                miniGame.gameType,
                miniGame,
                container,
                (success) => this.onMiniGameComplete(success)
            );
            if (game) {
                game.start();
            }
        });

        document.getElementById('minigame-skip-btn').addEventListener('click', () => {
            this.onMiniGameComplete(true); // 跳过视为成功
        });
    }

    onMiniGameComplete(success) {
        const container = document.getElementById('minigame-container');
        
        // 显示结果
        container.innerHTML = `
            <h2 class="minigame-title">${success ? '挑战成功！' : '挑战失败'}</h2>
            <p class="minigame-description">${success ? '你成功完成了挑战，继续你的旅程。' : '虽然失败了，但故事还在继续...'}</p>
            <button class="minigame-btn minigame-start" id="continue-btn">继续</button>
        `;

        document.getElementById('continue-btn').addEventListener('click', () => {
            container.classList.add('hidden');
            document.getElementById('dialogue-box').style.display = 'block';
            this.nextNode();
        });
    }

    showEnding(script) {
        document.getElementById('dialogue-box').style.display = 'none';
        document.getElementById('choice-box').classList.add('hidden');
        
        const endingScreen = document.getElementById('ending-screen');
        endingScreen.classList.remove('hidden');
        
        document.getElementById('ending-title').textContent = '结局';
        document.getElementById('ending-content').textContent = script.content || '';
    }

    nextNode() {
        const currentScript = getScriptById(this.currentScriptId);
        if (!currentScript) return;

        if (currentScript.nextNodeId) {
            this.loadScript(currentScript.nextNodeId);
        } else {
            // 尝试找到下一个节点（按ID顺序）
            const currentIndex = SCRIPTS.findIndex(s => s.id === this.currentScriptId);
            if (currentIndex >= 0 && currentIndex < SCRIPTS.length - 1) {
                this.loadScript(SCRIPTS[currentIndex + 1].id);
            } else {
                // 游戏结束
                this.showEnding({ content: '感谢游玩！' });
            }
        }
    }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
    new GameEngine();
});
