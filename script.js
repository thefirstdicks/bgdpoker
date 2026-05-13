<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>BGD POKER</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Montserrat:wght@300;600;900&display=swap');

        :root { 
            --gold-gradient: linear-gradient(145deg, #f9e498 0%, #d4af37 45%, #a67c00 100%);
            --dark-surface: linear-gradient(145deg, #1a1a1a, #0a0a0a);
            --neon-gold: rgba(212, 175, 55, 0.4);
            --die-red: #ff4d4d;
            --radius-main: 16px;
            --transition-smooth: 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        body { 
            background: #050505; color: #fff; 
            font-family: 'Montserrat', sans-serif; 
            margin: 0; overflow: hidden; height: 100vh;
            display: flex; justify-content: center;
        }

        /* 로비 스타일 */
        #home-screen {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(circle at 50% 50%, #1a1a1a 0%, #050505 100%);
            z-index: 2000; display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 20px; box-sizing: border-box;
        }
        .home-logo {
            font-family: 'Cinzel Decorative', cursive; font-size: 32px; color: #d4af37;
            margin-bottom: 30px; text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
            letter-spacing: 5px; text-align: center;
        }
        .lobby-desc {
            font-size: 11px; color: #666; margin-bottom: 30px; letter-spacing: 2px; font-weight: 900;
        }
        
        .player-selection {
            display: flex; justify-content: center; gap: 15px; 
            width: 100%; max-width: 1000px; margin: 0 auto;
            padding: 20px 10px; overflow-x: auto; scroll-snap-type: x mandatory;
            scrollbar-width: none; -ms-overflow-style: none;
        }
        .player-selection::-webkit-scrollbar { display: none; }

        .select-card {
            flex: 0 0 110px; height: 160px; scroll-snap-align: center;
            background: #111; border: 1px solid #333; border-radius: 12px;
            padding: 15px; display: flex; flex-direction: column; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative;
        }
        .select-card.selected {
            border-color: #d4af37; background: rgba(212, 175, 55, 0.1);
            box-shadow: 0 10px 25px rgba(212, 175, 55, 0.2);
            transform: scale(1.05) translateY(-10px);
        }
        .select-card.disabled { opacity: 0.2; cursor: not-allowed; pointer-events: none; filter: grayscale(1); }
        .select-card .avatar { font-size: 32px; margin-bottom: 12px; }
        .select-card .name { font-size: 12px; font-weight: 900; color: #aaa; letter-spacing: 1px; text-align: center; }
        .select-card .balance { font-size: 10px; color: #d4af37; margin-top: 8px; font-weight: 600; }
        .select-card.selected .name { color: #d4af37; }

        .start-btn {
            margin-top: 40px; padding: 18px 60px; font-size: 16px; font-weight: 900; color: #000;
            background: var(--gold-gradient); border: none; border-radius: 50px;
            cursor: pointer; transition: all 0.3s; opacity: 0.2; pointer-events: none;
            letter-spacing: 2px; box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
        }
        .start-btn.active { opacity: 1; pointer-events: auto; }

        .reset-data-btn {
            position: fixed; bottom: 15px; right: 20px; font-size: 9px; color: #444; 
            background: none; border: none; cursor: pointer; text-decoration: underline; letter-spacing: 1px;
        }

        /* 게임 화면 스타일 */
        .bg-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at 50% 50%, #1a1a1a 0%, #050505 100%); z-index: -1; }
        .rank-btn { position: fixed; top: 20px; right: 20px; padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(212, 175, 55, 0.5); background: rgba(0,0,0,0.5); color: #d4af37; font-size: 10px; font-weight: 900; letter-spacing: 2px; cursor: pointer; z-index: 100; backdrop-filter: blur(5px); }
        .rank-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 1000; display: none; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(10px); }
        .rank-content { width: 85%; max-width: 400px; background: var(--dark-surface); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: var(--radius-main); padding: 30px 20px; }
        .rank-title { font-family: 'Cinzel Decorative', cursive; color: #d4af37; text-align: center; font-size: 20px; margin-bottom: 25px; border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 15px; }
        .rank-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .rank-prob { font-size: 11px; font-weight: 900; color: #d4af37; }
        .close-rank { margin-top: 25px; width: 100%; height: 45px; background: transparent; border: 1px solid #444; color: #888; border-radius: 8px; font-weight: 900; }

        .table-layout { width: 100%; max-width: 600px; height: 100vh; display: flex; flex-direction: column; padding: 40px 20px; box-sizing: border-box; }
        .pot-area { text-align: center; margin-bottom: 40px; }
        .pot-value { font-size: 90px; font-weight: 900; color: #fff; text-shadow: 0 10px 20px rgba(0,0,0,0.5); }
        .rake-info { font-size: 11px; color: #ff4d4d; font-weight: 900; opacity: 0; transition: 0.5s; }
        .rake-info.visible { opacity: 1; }

        .players-area { display: flex; justify-content: space-between; align-items: flex-end; flex: 1; margin-bottom: 50px; }
        .player-node { width: 30%; transition: all var(--transition-smooth); display: flex; flex-direction: column; align-items: center; opacity: 0.3; }
        .player-node.active { opacity: 1; transform: translateY(-15px); }
        .player-node.selectable { cursor: pointer; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
        
        .avatar-circle { width: 80px; height: 80px; border-radius: 50%; background: var(--dark-surface); border: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: center; align-items: center; font-size: 35px; position: relative; }
        .player-node.active .avatar-circle { border: 2px solid #d4af37; box-shadow: 0 0 30px var(--neon-gold); }
        .turn-indicator { position: absolute; bottom: -5px; width: 10px; height: 10px; background: #d4af37; border-radius: 50%; display: none; box-shadow: 0 0 15px #d4af37; }
        .player-node.active .turn-indicator { display: block; }
        .player-money { font-size: 20px; font-weight: 900; margin: 5px 0; }
        .player-name { font-size: 9px; color: #555; letter-spacing: 2px; }
        .status-tag { font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 4px; background: #d4af37; color: #000; display: none; margin-top: 5px; }
        .player-node.all-in .status-tag { display: block; }

        .controls-area { position: relative; width: 100%; height: 260px; }
        .button-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        button { height: 80px; border-radius: var(--radius-main); border: 1px solid rgba(255,255,255,0.08); background: #0f0f0f; color: #fff; font-size: 16px; font-weight: 900; cursor: pointer; transition: 0.2s; }
        button:disabled { opacity: 0; pointer-events: none; }
        .btn-half { background: var(--gold-gradient); color: #000; }
        .btn-die { grid-column: span 2; height: 60px; color: var(--die-red); }
        button span { display: block; font-size: 10px; font-weight: 400; opacity: 0.5; }

        .btn-next-container { position: absolute; top: 0; left: 0; width: 100%; height: 80px; display: none; gap: 12px; animation: slideUp 0.4s; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .btn-next-lobby { background: #1a1a1a; color: #888; flex: 1; }
        .btn-next-game { background: #fff; color: #000; flex: 1; }

        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
    </style>
</head>
<body>

<div id="home-screen">
    <div class="home-logo">BGD POKER</div>
    <div class="lobby-desc">SELECT THE BRAVE THREE</div>
    <div class="player-selection">
        <!-- JS에서 동적 생성됨 -->
        <div class="select-card" id="card-0" onclick="selectMember(0)">
            <div class="avatar" id="lobby-avatar-0">🧠</div>
            <div class="name" id="lobby-name-0">한찬욱</div>
            <div class="balance">🪙 <span id="bal-0">0</span></div>
        </div>
        <div class="select-card" id="card-1" onclick="selectMember(1)">
            <div class="avatar" id="lobby-avatar-1">⚖️</div>
            <div class="name" id="lobby-name-1">이태현</div>
            <div class="balance">🪙 <span id="bal-1">0</span></div>
        </div>
        <div class="select-card" id="card-2" onclick="selectMember(2)">
            <div class="avatar" id="lobby-avatar-2">🎩</div>
            <div class="name" id="lobby-name-2">조승훈</div>
            <div class="balance">🪙 <span id="bal-2">0</span></div>
        </div>
        <div class="select-card" id="card-3" onclick="selectMember(3)">
            <div class="avatar" id="lobby-avatar-3">💰</div>
            <div class="name" id="lobby-name-3">김명현</div>
            <div class="balance">🪙 <span id="bal-3">0</span></div>
        </div>
        <div class="select-card" id="card-4" onclick="selectMember(4)">
            <div class="avatar" id="lobby-avatar-4">🃏</div>
            <div class="name" id="lobby-name-4">김규완</div>
            <div class="balance">🪙 <span id="bal-4">0</span></div>
        </div>
    </div>
    <button id="start-btn-lobby" class="start-btn" onclick="startGame()">CONFIRM SELECTION</button>
    <button class="reset-data-btn" onclick="resetAllData()">RESET SYSTEM</button>
</div>

<div class="bg-overlay"></div>
<div class="rank-btn" onclick="toggleRank(true)">RANK</div>

<div class="rank-overlay" id="rank-layer" onclick="toggleRank(false)">
    <div class="rank-content" onclick="event.stopPropagation()">
        <div class="rank-title">HAND RANKINGS</div>
        <div class="rank-list">
            <div class="rank-item"><span>7-STRAIGHT</span><span class="rank-prob">0.44%</span></div>
            <div class="rank-item"><span>3 PAIR</span><span class="rank-prob">0.51%</span></div>
            <div class="rank-item"><span>6-STRAIGHT</span><span class="rank-prob">1.77%</span></div>
            <div class="rank-item"><span>5-STRAIGHT</span><span class="rank-prob">6.21%</span></div>
            <div class="rank-item"><span>2 PAIR</span><span class="rank-prob">16.02%</span></div>
            <div class="rank-item"><span>1 PAIR</span><span class="rank-prob">45.77%</span></div>
        </div>
        <button class="close-rank" onclick="toggleRank(false)">CLOSE</button>
    </div>
</div>

<div class="table-layout">
    <div class="pot-area">
        <div class="pot-value" id="pot-display">0</div>
        <div class="rake-info" id="rake-display">RAKE: -0 (5%)</div>
    </div>

    <div class="players-area">
        <div id="p0-node" class="player-node" onclick="handleWinnerSelection(0)">
            <div class="avatar-circle" id="p0-avatar">🧠<div class="turn-indicator"></div></div>
            <div class="player-money">🪙<span id="p0-chips">0</span></div>
            <div class="player-name" id="p0-name">PLAYER I</div>
            <div class="status-tag">ALL-IN</div>
        </div>
        <div id="p1-node" class="player-node" onclick="handleWinnerSelection(1)">
            <div class="avatar-circle" id="p1-avatar">⚖️<div class="turn-indicator"></div></div>
            <div class="player-money">🪙<span id="p1-chips">0</span></div>
            <div class="player-name" id="p1-name">PLAYER II</div>
            <div class="status-tag">ALL-IN</div>
        </div>
        <div id="p2-node" class="player-node" onclick="handleWinnerSelection(2)">
            <div class="avatar-circle" id="p2-avatar">🎩<div class="turn-indicator"></div></div>
            <div class="player-money">🪙<span id="p2-chips">0</span></div>
            <div class="player-name" id="p2-name">PLAYER III</div>
            <div class="status-tag">ALL-IN</div>
        </div>
    </div>

    <div class="controls-area">
        <div class="button-grid" id="button-group">
            <button id="btn-check" onclick="handleBet('check')">CHECK</button>
            <button id="btn-call" onclick="handleBet('call')">CALL<span id="call-amt">0</span></button>
            <button id="btn-quarter" onclick="handleBet('quarter')">QUARTER<span id="quarter-amt">0</span></button>
            <button class="btn-half" id="btn-half" onclick="handleBet('half')">HALF<span id="half-amt">0</span></button>
            <button class="btn-die" id="btn-die" onclick="handleBet('die')">DIE</button>
        </div>
        <div class="btn-next-container" id="next-container">
            <button class="btn-next-lobby" id="btn-lobby" onclick="returnToLobby()">LOBBY</button>
            <button class="btn-next-game" id="btn-main-next">CONTINUE</button>
        </div>
    </div>
</div>

<script>
    const STORAGE_KEY = 'bgd_poker_data';
    const BACKUP_KEY = 'bgd_poker_backup';
    const SECRET_SALT = 'BGD_POKER_SECURE_KEY_2026';
    const ADMIN_PASSWORD = 'ggm';
    const ANTE_AMOUNT = 50000;
    const RAKE_PERCENT = 0.05;

    const gameState = {
        members: {
            0: { name: "한찬욱", emoji: "🧠", balance: 10000000 },
            1: { name: "이태현", emoji: "⚖️", balance: 10000000 },
            2: { name: "조승훈", emoji: "🎩", balance: 10000000 },
            3: { name: "김명현", emoji: "💰", balance: 10000000 },
            4: { name: "김규완", emoji: "🃏", balance: 10000000 }
        },
        table: [], 
        pot: 0, phase: 2, turn: 0, callVal: 0, actCount: 0, firstPlayerIdx: -1, isWinnerSelectionMode: false,

        save() {
            const bals = {};
            Object.keys(this.members).forEach(id => bals[id] = this.members[id].balance);
            const dataStr = JSON.stringify(bals);
            const payload = { balances: bals, checksum: this.getChecksum(dataStr) };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            localStorage.setItem(BACKUP_KEY, dataStr);
        },
        load() {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return;
            try {
                const { balances, checksum } = JSON.parse(saved);
                if (checksum === this.getChecksum(JSON.stringify(balances))) {
                    Object.keys(balances).forEach(id => this.members[id].balance = balances[id]);
                }
            } catch (e) {}
        },
        getChecksum(s) {
            let h = 0; s += SECRET_SALT;
            for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i), h |= 0;
            return h.toString();
        }
    };

    const DOM = {
        home: document.getElementById('home-screen'),
        pot: document.getElementById('pot-display'),
        rake: document.getElementById('rake-display'),
        controls: document.getElementById('button-group'),
        nextAction: document.getElementById('next-container'),
        btnNext: document.getElementById('btn-main-next'),
        players: [0, 1, 2].map(i => ({
            node: document.getElementById(`p${i}-node`),
            chips: document.getElementById(`p${i}-chips`),
            name: document.getElementById(`p${i}-name`),
            avatar: document.getElementById(`p${i}-avatar`)
        }))
    };

    function render(prevPot = gameState.pot) {
        animateValue(DOM.pot, prevPot, gameState.pot, 800);
        gameState.table.forEach((p, i) => {
            const m = gameState.members[p.memberId];
            DOM.players[i].chips.innerText = m.balance.toLocaleString();
            DOM.players[i].node.classList.toggle('active', i === gameState.turn);
            DOM.players[i].node.classList.toggle('all-in', p.allIn);
            DOM.players[i].node.style.opacity = p.folded ? "0.05" : (i === gameState.turn ? "1" : "0.3");
        });
        const curP = gameState.table[gameState.turn];
        const diff = gameState.callVal - curP.currentBet;
        document.getElementById('call-amt').innerText = `-${diff.toLocaleString()}`;
        document.getElementById('quarter-amt').innerText = `+${Math.floor(gameState.pot/4).toLocaleString()}`;
        document.getElementById('half-amt').innerText = `+${Math.floor(gameState.pot/2).toLocaleString()}`;
        
        const canAct = !curP.allIn && !curP.folded;
        document.getElementById('btn-check').disabled = !canAct || diff > 0;
        document.getElementById('btn-call').disabled = !canAct || diff === 0;
    }

    function selectMember(id) {
        const card = document.getElementById(`card-${id}`);
        if (card.classList.toggle('selected')) {
            if (gameState.table.length >= 3) return card.classList.remove('selected');
            gameState.table.push({ memberId: id, currentBet: 0, folded: false, allIn: false });
        } else {
            gameState.table = gameState.table.filter(p => p.memberId !== id);
        }
        document.getElementById('start-btn-lobby').classList.toggle('active', gameState.table.length === 3);
    }

    function startGame() {
        gameState.table.forEach((p, i) => {
            const m = gameState.members[p.memberId];
            DOM.players[i].avatar.innerHTML = `${m.emoji}<div class="turn-indicator"></div>`;
            DOM.players[i].name.innerText = m.name;
        });
        DOM.home.style.display = 'none';
        resetGame();
    }

    function handleBet(type) {
        const p = gameState.table[gameState.turn];
        const m = gameState.members[p.memberId];
        let prev = gameState.pot;
        let amt = 0;

        if (type === 'call') amt = Math.min(m.balance, gameState.callVal - p.currentBet);
        else if (type === 'half') amt = Math.min(m.balance, (gameState.callVal - p.currentBet) + Math.floor(gameState.pot/2));
        else if (type === 'die') p.folded = true;

        if (amt > 0) {
            m.balance -= amt; p.currentBet += amt; gameState.pot += amt;
            if (p.currentBet > gameState.callVal) gameState.callVal = p.currentBet;
            if (m.balance === 0) p.allIn = true;
        }
        gameState.actCount++;
        
        const survivors = gameState.table.filter(s => !s.folded);
        if (survivors.length === 1) return startWinnerSelection(gameState.table.indexOf(survivors[0]));

        if (gameState.actCount >= survivors.length && survivors.every(s => s.currentBet === gameState.callVal || s.allIn)) {
            DOM.controls.style.display = 'none';
            DOM.nextAction.style.display = 'flex';
            DOM.btnNext.onclick = (gameState.phase >= 5) ? () => startWinnerSelection() : () => nextPhase();
        } else {
            do { gameState.turn = (gameState.turn + 1) % 3; } while (gameState.table[gameState.turn].folded || gameState.table[gameState.turn].allIn);
        }
        gameState.save(); render(prev);
    }

    function startWinnerSelection(idx = null) {
        gameState.isWinnerSelectionMode = true;
        DOM.nextAction.style.display = 'none';
        gameState.table.forEach((p, i) => {
            if (!p.folded) DOM.players[i].node.classList.add('selectable');
        });
        if (idx !== null) handleWinnerSelection(idx, true);
    }

    function handleWinnerSelection(idx, force = false) {
        const rake = Math.floor((gameState.pot * RAKE_PERCENT)/1000)*1000;
        gameState.members[gameState.table[idx].memberId].balance += (gameState.pot - rake);
        gameState.pot = 0; gameState.save();
        DOM.nextAction.style.display = 'flex';
        DOM.btnNext.innerText = "NEW GAME";
        DOM.btnNext.onclick = resetGame;
    }

    function resetGame() {
        gameState.phase = 2; gameState.pot = 0; gameState.callVal = 0; gameState.actCount = 0;
        gameState.table.forEach(p => {
            const m = gameState.members[p.memberId];
            p.currentBet = Math.min(m.balance, ANTE_AMOUNT);
            m.balance -= p.currentBet; gameState.pot += p.currentBet;
            p.folded = false; p.allIn = (m.balance === 0);
        });
        gameState.turn = 0; DOM.nextAction.style.display = 'none'; DOM.controls.style.display = 'grid';
        render(0);
    }

    function nextPhase() {
        gameState.phase++; gameState.actCount = 0; gameState.callVal = 0;
        gameState.table.forEach(p => p.currentBet = 0);
        DOM.controls.style.display = 'grid'; DOM.nextAction.style.display = 'none'; render();
    }

    function returnToLobby() { location.reload(); }
    function animateValue(o, s, e, d) {
        let st = null;
        const f = (t) => {
            if (!st) st = t;
            const p = Math.min((t - st) / d, 1);
            o.innerHTML = Math.floor(p * (e - s) + s).toLocaleString();
            if (p < 1) requestAnimationFrame(f);
        };
        requestAnimationFrame(f);
    }
    function toggleRank(s) { document.getElementById('rank-layer').style.display = s ? 'flex' : 'none'; }
    function resetAllData() { if (confirm("RESET?")) { localStorage.clear(); location.reload(); } }

    gameState.load();
    for(let i=0; i<5; i++) document.getElementById(`bal-${i}`).innerText = gameState.members[i].balance.toLocaleString();
</script>
</body>
</html>
