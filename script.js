const PLAYER_NAMES = {
    0: "한찬욱",
    1: "이태현",
    2: "조승훈",
    3: "김명현",
    4: "김규완"
};

const PLAYER_EMOJIS = {
    0: "🧠",
    1: "⚖️",
    2: "🎩",
    3: "💰",
    4: "🃏"
};

const STORAGE_KEY = 'bgd_poker_data';
const BACKUP_KEY = 'bgd_poker_backup'; 
const SECRET_SALT = 'BGD_POKER_SECURE_KEY_2026';
const ADMIN_PASSWORD = 'ggm';
let START_CHIPS_DEFAULT = 10000000;
let ANTE_AMOUNT = 50000;
const RAKE_PERCENT = 0.05; 

let allMemberBalances = {
    0: START_CHIPS_DEFAULT,
    1: START_CHIPS_DEFAULT,
    2: START_CHIPS_DEFAULT,
    3: START_CHIPS_DEFAULT,
    4: START_CHIPS_DEFAULT
};

function generateChecksum(dataStr) {
    let hash = 0;
    const combined = dataStr + SECRET_SALT;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash.toString();
}

function loadBalances() {
    const savedRaw = localStorage.getItem(STORAGE_KEY);
    const backupRaw = localStorage.getItem(BACKUP_KEY);

    if (savedRaw) {
        try {
            const parsed = JSON.parse(savedRaw);
            const dataStr = JSON.stringify(parsed.balances);
            
            if (parsed.checksum === generateChecksum(dataStr)) {
                allMemberBalances = parsed.balances;
            } else {
                alert("⚠️ 데이터 조작 감지! 백업 데이터로 복원합니다.");
                if (backupRaw) {
                    allMemberBalances = JSON.parse(backupRaw);
                    saveBalances(); 
                } else {
                    saveBalances();
                }
            }
        } catch (e) {
            saveBalances();
        }
    }
    
    for (let i = 0; i <= 4; i++) {
        const balSpan = document.getElementById(`bal-${i}`);
        if(balSpan) balSpan.innerText = (allMemberBalances[i] || 0).toLocaleString();
        
        const nameDiv = document.getElementById(`lobby-name-${i}`);
        if(nameDiv) nameDiv.innerText = PLAYER_NAMES[i];

        const avatarDiv = document.getElementById(`lobby-avatar-${i}`);
        if(avatarDiv) avatarDiv.innerText = PLAYER_EMOJIS[i];
        
        const card = document.getElementById(`card-${i}`);
        if(card) {
            if ((allMemberBalances[i] || 0) < ANTE_AMOUNT) {
                card.classList.add('disabled');
            } else {
                card.classList.remove('disabled');
            }
        }
    }
}

function saveBalances() {
    if (selectedPlayers.length > 0 && players[0].chips !== undefined) {
        selectedPlayers.forEach((p, i) => {
            allMemberBalances[p.id] = players[i].chips;
        });
    }
    const dataStr = JSON.stringify(allMemberBalances);
    const payload = {
        balances: allMemberBalances,
        checksum: generateChecksum(dataStr)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    localStorage.setItem(BACKUP_KEY, dataStr); 
}

function resetAllData() {
    const inputPw = prompt("ADMIN PASSWORD:");
    if (inputPw === ADMIN_PASSWORD) {
        if(confirm("모든 잔액을 초기화하시겠습니까?")) {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(BACKUP_KEY);
            location.reload();
        }
    } else if (inputPw !== null) {
        alert("WRONG PASSWORD.");
    }
}

let selectedPlayers = [];

function selectMember(id) {
    if (allMemberBalances[id] < ANTE_AMOUNT) return;

    const card = document.getElementById(`card-${id}`);
    if (card.classList.contains('selected')) {
        card.classList.remove('selected');
        selectedPlayers = selectedPlayers.filter(p => p.id !== id);
    } else {
        if (selectedPlayers.length < 3) {
            card.classList.add('selected');
            selectedPlayers.push({id, avatar: PLAYER_EMOJIS[id], name: PLAYER_NAMES[id], chips: allMemberBalances[id]});
        }
    }
    const startBtn = document.getElementById('start-btn-lobby');
    if (selectedPlayers.length === 3) {
        startBtn.classList.add('active');
    } else {
        startBtn.classList.remove('active');
    }
}

function startGame() {
    if (selectedPlayers.length !== 3) return;
    selectedPlayers.forEach((p, i) => {
        document.getElementById(`p${i}-avatar`).innerHTML = `${p.avatar}<div class="turn-indicator"></div>`;
        document.getElementById(`p${i}-name`).innerText = p.name;
        players[i].chips = p.chips;
    });
    const home = document.getElementById('home-screen');
    home.style.transition = 'opacity 0.5s ease';
    home.style.opacity = '0';
    setTimeout(() => {
        home.style.display = 'none';
        resetGame();
    }, 500);
}

function returnToLobby() {
    location.reload();
}

let players = [
    {chips: 0, bet: 0, totalBet: 0, folded: false, allIn: false}, 
    {chips: 0, bet: 0, totalBet: 0, folded: false, allIn: false}, 
    {chips: 0, bet: 0, totalBet: 0, folded: false, allIn: false}
];
let phase, pot, turn, callVal, actCount, isWinnerSelectionMode = false;
let firstPlayer = -1; 

const UI = {
    pot: document.getElementById('pot-display'),
    rake: document.getElementById('rake-display'),
    group: document.getElementById('button-group'),
    container: document.getElementById('next-container'),
    btnNext: document.getElementById('btn-main-next'),
    callAmt: document.getElementById('call-amt'),
    qtrAmt: document.getElementById('quarter-amt'),
    halfAmt: document.getElementById('half-amt'),
    rankLayer: document.getElementById('rank-layer')
};

function toggleRank(show) {
    UI.rankLayer.style.display = show ? 'flex' : 'none';
}

function animateValue(id, start, end, duration) {
    const obj = (typeof id === 'string') ? document.getElementById(id) : id;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function updateUI(prevPot, isTurnEnd = false) {
    animateValue(UI.pot, prevPot, pot, 1000);
    if (isWinnerSelectionMode) return;

    let p = players[turn];
    let diff = callVal - p.bet;
    
    UI.callAmt.innerText = diff > p.chips ? `ALL-IN (${p.chips.toLocaleString()})` : `-${diff.toLocaleString()}`;
    UI.qtrAmt.innerText = `+${Math.floor(pot / 4).toLocaleString()}`;
    UI.halfAmt.innerText = `+${Math.floor(pot / 2).toLocaleString()}`;

    players.forEach((p, i) => {
        const node = document.getElementById(`p${i}-node`);
        document.getElementById(`p${i}-chips`).innerText = p.chips.toLocaleString();
        
        if (isTurnEnd) {
            node.classList.remove('active');
            node.style.opacity = p.folded ? "0.05" : "1.0"; 
        } else {
            node.classList.toggle('active', i === turn);
            node.classList.toggle('all-in', p.allIn);
            node.style.opacity = p.folded ? "0.05" : (i === turn ? "1" : "0.3");
        }
    });

    if (!isTurnEnd) {
        const needCall = callVal > p.bet;
        document.getElementById('btn-check').disabled = (phase === 2 && actCount === 0) || needCall || p.allIn;
        document.getElementById('btn-call').disabled = !needCall || p.allIn;
        document.getElementById('btn-quarter').disabled = p.allIn;
        document.getElementById('btn-half').disabled = p.allIn;
        document.getElementById('btn-die').disabled = p.allIn;
    } else {
        UI.group.querySelectorAll('button').forEach(btn => btn.disabled = true);
    }
}

function handleBet(type) {
    let p = players[turn];
    let prevPot = pot;
    let actualBet = 0;

    if (type === 'half' || type === 'quarter') {
        const shakeDuration = (type === 'half') ? 0.27 : 0.15;
        document.body.style.animation = `shake ${shakeDuration}s ease-in-out`;
        setTimeout(() => document.body.style.animation = "", shakeDuration * 1000);
        if (navigator.vibrate) navigator.vibrate((type === 'half') ? [60] : [15]);
        let diff = callVal - p.bet;
        actualBet = Math.min(p.chips, diff + Math.floor(pot / (type === 'half' ? 2 : 4)));
    } else if (type === 'call') {
        actualBet = Math.min(p.chips, callVal - p.bet);
    } else if (type === 'die') {
        p.folded = true;
    }

    if (actualBet > 0) {
        p.chips -= actualBet; p.bet += actualBet; p.totalBet += actualBet; pot += actualBet;
        if (p.chips === 0) p.allIn = true;
        if (p.bet > callVal) callVal = p.bet;
    }
    
    actCount++;
    const survivors = players.filter(pl => !pl.folded);
    const canAct = survivors.filter(pl => !pl.allIn);

    if (survivors.length === 1) { 
        isWinnerSelectionMode = true;
        updateUI(prevPot, true);
        startWinnerSelection(players.indexOf(survivors[0])); 
        return; 
    }

    let isTurnEnd = false;
    if ((survivors.every(pl => pl.bet === callVal || pl.allIn) && actCount >= survivors.length) || canAct.length <= 1) {
        isTurnEnd = true;
        UI.group.style.opacity = '0';
        setTimeout(() => {
            UI.group.style.display = 'none';
            UI.container.style.display = 'flex';
            document.getElementById('btn-lobby').style.display = 'none';
            if (phase >= 5 || survivors.every(pl => pl.allIn) || canAct.length <= 1) {
                UI.btnNext.innerText = "SHOWDOWN";
                UI.btnNext.onclick = () => startWinnerSelection(); 
            } else {
                UI.btnNext.innerText = "CONTINUE";
                UI.btnNext.onclick = () => nextPhase();
            }
        }, 500);
    } else {
        do { turn = (turn + 1) % 3; } while (players[turn].folded || players[turn].allIn);
    }
    updateUI(prevPot, isTurnEnd);
}

function startWinnerSelection(autoWinnerIdx = null) {
    isWinnerSelectionMode = true;
    UI.container.style.display = 'none';
    UI.group.style.display = 'none';
    
    setTimeout(() => {
        players.forEach((p, i) => {
            const node = document.getElementById(`p${i}-node`);
            node.classList.remove('active');
            if (!p.folded) {
                node.style.opacity = "0.3"; node.classList.add('selectable');
            } else {
                node.style.opacity = "0.05"; node.classList.remove('selectable');
            }
        });
        if (autoWinnerIdx !== null) setTimeout(() => handleWinnerSelection(autoWinnerIdx, true), 300);
    }, 50);
}

function handleWinnerSelection(idx, force = false) {
    if ((!isWinnerSelectionMode && !force) || (players[idx].folded && !force)) return;

    let prevPot = pot;
    let rawRake = pot * RAKE_PERCENT;
    let rake = Math.floor(rawRake / 1000) * 1000; 
    let winnerNetGain = pot - rake;

    UI.rake.innerText = `RAKE: -${rake.toLocaleString()} (5%)`;
    UI.rake.classList.add('visible');

    players[idx].chips += winnerNetGain;
    pot = 0;
    isWinnerSelectionMode = false;

    players.forEach((_, i) => {
        const node = document.getElementById(`p${i}-node`);
        node.classList.remove('selectable', 'active');
        if (i === idx) {
            node.style.opacity = "1"; node.classList.add('active'); 
        } else {
            node.style.opacity = "0.05";
        }
    });

    animateValue(UI.pot, prevPot, 0, 800);
    saveBalances();

    setTimeout(() => {
        document.getElementById(`p${idx}-chips`).innerText = players[idx].chips.toLocaleString();
        UI.container.style.display = 'flex';
        document.getElementById('btn-lobby').style.display = 'block';
        UI.btnNext.innerText = "NEW GAME";
        UI.btnNext.onclick = () => resetGame();
    }, 850);
}

function resetGame() {
    phase = 2; pot = 0; callVal = 0; actCount = 0;
    isWinnerSelectionMode = false;
    firstPlayer = (firstPlayer + 1) % 3;
    
    UI.rake.classList.remove('visible');
    
    let startIdx = firstPlayer;
    while (players[startIdx].chips < ANTE_AMOUNT && players.some(pl => pl.chips >= ANTE_AMOUNT)) {
        startIdx = (startIdx + 1) % 3;
    }
    turn = startIdx;

    players.forEach((p, i) => {
        p.bet = 0; p.totalBet = 0; p.folded = false;
        p.allIn = (p.chips <= 0);
        const node = document.getElementById(`p${i}-node`);
        node.classList.remove('active', 'selectable', 'all-in');
        node.style.opacity = "0.3";
        if (p.chips > 0) {
            let actualAnte = Math.min(p.chips, ANTE_AMOUNT);
            p.chips -= actualAnte; p.totalBet = actualAnte; pot += actualAnte;
            if(p.chips === 0) p.allIn = true;
        }
        document.getElementById(`p${i}-chips`).innerText = p.chips.toLocaleString();
    });

    saveBalances();
    UI.container.style.display = 'none';
    UI.group.style.display = 'grid';
    UI.group.style.opacity = '1';
    updateUI(0);
}

function nextPhase() {
    phase++; actCount = 0; callVal = 0;
    players.forEach(p => p.bet = 0);
    let startIdx = firstPlayer;
    while (players[startIdx].folded || players[startIdx].allIn) {
        startIdx = (startIdx + 1) % 3;
    }
    turn = startIdx;
    UI.group.style.display = 'grid';
    setTimeout(() => UI.group.style.opacity = '1', 10);
    UI.container.style.display = 'none';
    updateUI(pot, false); 
}

// 초기 실행
loadBalances();
