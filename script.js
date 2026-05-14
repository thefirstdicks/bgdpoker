// /**
//  * BGD POKER CORE ENGINE v2.0
//  * 리팩터링 포인트: Single Source of Truth, UI-Logic 분리, 자동 저장
//  */

// // 1. 상수 및 초기 설정
// const STORAGE_KEY = 'bgd_poker_data';
// const BACKUP_KEY = 'bgd_poker_backup';
// const SECRET_SALT = 'BGD_POKER_SECURE_KEY_2026';
// const ADMIN_PASSWORD = 'ggm';
// const ANTE_AMOUNT = 50000;
// const RAKE_PERCENT = 0.05;

// // 2. 통합 게임 상태 (Single Source of Truth)
// const gameState = {
//     members: {
//         0: { id: 0, name: "한찬욱", emoji: "🧠", balance: 10000000 },
//         1: { id: 1, name: "이태현", emoji: "⚖️", balance: 10000000 },
//         2: { id: 2, name: "조승훈", emoji: "🎩", balance: 10000000 },
//         3: { id: 3, name: "김명현", emoji: "💰", balance: 10000000 },
//         4: { id: 4, name: "김규완", emoji: "🃏", balance: 10000000 }
//     },
//     table: [], // 현재 선택된 플레이어 3명 { memberId, currentBet, folded, allIn }
//     pot: 0,
//     phase: 2,
//     turn: 0,
//     callVal: 0,
//     actCount: 0,
//     firstPlayerIdx: -1,
//     isWinnerSelectionMode: false,

//     // [데이터 관리] 체크섬 생성
//     getChecksum(dataStr) {
//         let hash = 0;
//         const combined = dataStr + SECRET_SALT;
//         for (let i = 0; i < combined.length; i++) {
//             hash = ((hash << 5) - hash) + combined.charCodeAt(i);
//             hash |= 0;
//         }
//         return hash.toString();
//     },

//     // [데이터 관리] 저장
//     save() {
//         const balances = {};
//         Object.keys(this.members).forEach(id => balances[id] = this.members[id].balance);
//         const dataStr = JSON.stringify(balances);
//         localStorage.setItem(STORAGE_KEY, JSON.stringify({ balances, checksum: this.getChecksum(dataStr) }));
//         localStorage.setItem(BACKUP_KEY, dataStr);
//     },

//     // [데이터 관리] 불러오기
//     load() {
//         const saved = localStorage.getItem(STORAGE_KEY);
//         if (!saved) return;
//         try {
//             const { balances, checksum } = JSON.parse(saved);
//             if (checksum === this.getChecksum(JSON.stringify(balances))) {
//                 Object.keys(balances).forEach(id => this.members[id].balance = balances[id]);
//             } else {
//                 alert("⚠️ 데이터 조작 감지! 백업 데이터 사용.");
//                 const backup = JSON.parse(localStorage.getItem(BACKUP_KEY));
//                 if (backup) Object.keys(backup).forEach(id => this.members[id].balance = backup[id]);
//             }
//         } catch (e) { console.error("Load Error", e); }
//     }
// };

// // 3. UI 매핑 객체 (캐싱)
// const DOM = {
//     home: document.getElementById('home-screen'),
//     pot: document.getElementById('pot-display'),
//     rake: document.getElementById('rake-display'),
//     controls: document.getElementById('button-group'),
//     nextAction: document.getElementById('next-container'),
//     btnNext: document.getElementById('btn-main-next'),
//     rankLayer: document.getElementById('rank-layer'),
//     players: [0, 1, 2].map(i => ({
//         node: document.getElementById(`p${i}-node`),
//         chips: document.getElementById(`p${i}-chips`),
//         name: document.getElementById(`p${i}-name`),
//         avatar: document.getElementById(`p${i}-avatar`),
//         tag: document.querySelector(`#p${i}-node .status-tag`)
//     })),
//     amounts: {
//         call: document.getElementById('call-amt'),
//         qtr: document.getElementById('quarter-amt'),
//         half: document.getElementById('half-amt')
//     }
// };

// // 4. 핵심 렌더링 엔진 (데이터를 UI에 동기화)
// function render(prevPot = gameState.pot) {
//     if (prevPot !== gameState.pot) animateValue(DOM.pot, prevPot, gameState.pot, 800);
    
//     if (gameState.isWinnerSelectionMode) return;

//     gameState.table.forEach((p, i) => {
//         const member = gameState.members[p.memberId];
//         const ui = DOM.players[i];
        
//         ui.chips.innerText = member.balance.toLocaleString();
//         ui.node.classList.toggle('active', i === gameState.turn);
//         ui.node.classList.toggle('all-in', p.allIn);
//         ui.node.style.opacity = p.folded ? "0.05" : (i === gameState.turn ? "1" : "0.3");
//     });

//     // 배팅 금액 텍스트 업데이트
//     const curP = gameState.table[gameState.turn];
//     const member = gameState.members[curP.memberId];
//     const diff = gameState.callVal - curP.currentBet;

//     DOM.amounts.call.innerText = diff > member.balance ? `ALL-IN (${member.balance.toLocaleString()})` : `-${diff.toLocaleString()}`;
//     DOM.amounts.qtr.innerText = `+${Math.floor(gameState.pot / 4).toLocaleString()}`;
//     DOM.amounts.half.innerText = `+${Math.floor(gameState.pot / 2).toLocaleString()}`;

//     // 버튼 활성 상태 제어
//     const canAct = !curP.allIn && !curP.folded;
//     document.getElementById('btn-check').disabled = !canAct || diff > 0 || (gameState.phase === 2 && gameState.actCount === 0);
//     document.getElementById('btn-call').disabled = !canAct || diff === 0;
//     ['btn-quarter', 'btn-half', 'btn-die'].forEach(id => document.getElementById(id).disabled = !canAct);
// }

// // 5. 게임 로직 함수들
// function selectMember(id) {
//     const member = gameState.members[id];
//     if (member.balance < ANTE_AMOUNT) return;

//     const card = document.getElementById(`card-${id}`);
//     const isSelected = card.classList.toggle('selected');

//     if (isSelected) {
//         if (gameState.table.length >= 3) {
//             card.classList.remove('selected');
//             return;
//         }
//         gameState.table.push({ memberId: id, currentBet: 0, folded: false, allIn: false });
//     } else {
//         gameState.table = gameState.table.filter(p => p.memberId !== id);
//     }
    
//     document.getElementById('start-btn-lobby').classList.toggle('active', gameState.table.length === 3);
// }

// function startGame() {
//     if (gameState.table.length !== 3) return;
    
//     gameState.table.forEach((p, i) => {
//         const m = gameState.members[p.memberId];
//         DOM.players[i].avatar.innerHTML = `${m.emoji}<div class="turn-indicator"></div>`;
//         DOM.players[i].name.innerText = m.name;
//     });

//     DOM.home.style.opacity = '0';
//     setTimeout(() => { DOM.home.style.display = 'none'; resetGame(); }, 500);
// }

// function handleBet(type) {
//     const p = gameState.table[gameState.turn];
//     const member = gameState.members[p.memberId];
//     let prevPot = gameState.pot;
//     let betAmt = 0;

//     // 배팅액 계산
//     if (type === 'half' || type === 'quarter') {
//         const ratio = type === 'half' ? 2 : 4;
//         const raise = Math.floor(gameState.pot / ratio);
//         betAmt = Math.min(member.balance, (gameState.callVal - p.currentBet) + raise);
        
//         // 피드백 (진동/화면 흔들기)
//         const dur = type === 'half' ? 270 : 150;
//         document.body.style.animation = `shake ${dur/1000}s ease-in-out`;
//         setTimeout(() => document.body.style.animation = "", dur);
//         if (navigator.vibrate) navigator.vibrate(type === 'half' ? 60 : 15);
//     } 
//     else if (type === 'call') betAmt = Math.min(member.balance, gameState.callVal - p.currentBet);
//     else if (type === 'die') p.folded = true;

//     // 잔액 차감 및 상태 반영
//     if (betAmt > 0) {
//         member.balance -= betAmt;
//         p.currentBet += betAmt;
//         gameState.pot += betAmt;
//         if (p.currentBet > gameState.callVal) gameState.callVal = p.currentBet;
//         if (member.balance === 0) p.allIn = true;
//     }

//     gameState.actCount++;
//     gameState.save();

//     // 승부/턴 종료 체크
//     const survivors = gameState.table.filter(tp => !tp.folded);
//     if (survivors.length === 1) {
//         gameState.isWinnerSelectionMode = true;
//         render(prevPot);
//         startWinnerSelection(gameState.table.indexOf(survivors[0]));
//         return;
//     }

//     const canAct = survivors.filter(tp => !tp.allIn);
//     const isRoundEnd = (survivors.every(tp => tp.currentBet === gameState.callVal || tp.allIn) && gameState.actCount >= survivors.length) || canAct.length <= 1;

//     if (isRoundEnd) {
//         endRound(canAct.length <= 1 || survivors.every(tp => tp.allIn));
//     } else {
//         do { gameState.turn = (gameState.turn + 1) % 3; } 
//         while (gameState.table[gameState.turn].folded || gameState.table[gameState.turn].allIn);
//         render(prevPot);
//     }
// }

// function endRound(isShowdown) {
//     DOM.controls.style.opacity = '0';
//     setTimeout(() => {
//         DOM.controls.style.display = 'none';
//         DOM.nextAction.style.display = 'flex';
//         document.getElementById('btn-lobby').style.display = 'none';
        
//         if (gameState.phase >= 5 || isShowdown) {
//             DOM.btnNext.innerText = "SHOWDOWN";
//             DOM.btnNext.onclick = () => startWinnerSelection();
//         } else {
//             DOM.btnNext.innerText = "CONTINUE";
//             DOM.btnNext.onclick = () => nextPhase();
//         }
//     }, 500);
//     render(gameState.pot);
// }

// function startWinnerSelection(autoIdx = null) {
//     gameState.isWinnerSelectionMode = true;
//     DOM.nextAction.style.display = 'none';
//     DOM.controls.style.display = 'none';

//     gameState.table.forEach((p, i) => {
//         DOM.players[i].node.classList.remove('active');
//         if (!p.folded) {
//             DOM.players[i].node.style.opacity = "0.3";
//             DOM.players[i].node.classList.add('selectable');
//         }
//     });

//     if (autoIdx !== null) setTimeout(() => handleWinnerSelection(autoIdx, true), 300);
// }

// function handleWinnerSelection(idx, force = false) {
//     if ((!gameState.isWinnerSelectionMode && !force) || (gameState.table[idx].folded && !force)) return;

//     let prevPot = gameState.pot;
//     let rake = Math.floor((gameState.pot * RAKE_PERCENT) / 1000) * 1000;
//     let netGain = gameState.pot - rake;

//     DOM.rake.innerText = `RAKE: -${rake.toLocaleString()} (5%)`;
//     DOM.rake.classList.add('visible');

//     gameState.members[gameState.table[idx].memberId].balance += netGain;
//     gameState.pot = 0;
//     gameState.isWinnerSelectionMode = false;

//     gameState.save();
//     animateValue(DOM.pot, prevPot, 0, 800);

//     DOM.players.forEach((ui, i) => {
//         ui.node.classList.remove('selectable', 'active');
//         ui.node.style.opacity = (i === idx) ? "1" : "0.05";
//         if (i === idx) ui.node.classList.add('active');
//     });

//     setTimeout(() => {
//         DOM.nextAction.style.display = 'flex';
//         document.getElementById('btn-lobby').style.display = 'block';
//         DOM.btnNext.innerText = "NEW GAME";
//         DOM.btnNext.onclick = () => resetGame();
//     }, 850);
// }

// function resetGame() {
//     gameState.phase = 2; gameState.pot = 0; gameState.callVal = 0; gameState.actCount = 0;
//     gameState.isWinnerSelectionMode = false;
//     gameState.firstPlayerIdx = (gameState.firstPlayerIdx + 1) % 3;
//     DOM.rake.classList.remove('visible');

//     gameState.table.forEach((p, i) => {
//         const member = gameState.members[p.memberId];
//         p.currentBet = 0; p.folded = false;
        
//         let ante = Math.min(member.balance, ANTE_AMOUNT);
//         member.balance -= ante;
//         p.currentBet = ante;
//         gameState.pot += ante;
//         p.allIn = (member.balance === 0);
        
//         DOM.players[i].node.classList.remove('active', 'selectable', 'all-in');
//     });

//     gameState.turn = gameState.firstPlayerIdx;
//     while(gameState.table[gameState.turn].allIn) gameState.turn = (gameState.turn + 1) % 3;

//     gameState.save();
//     DOM.nextAction.style.display = 'none';
//     DOM.controls.style.display = 'grid';
//     DOM.controls.style.opacity = '1';
//     render(0);
// }

// function nextPhase() {
//     gameState.phase++; gameState.actCount = 0; gameState.callVal = 0;
//     gameState.table.forEach(p => p.currentBet = 0);
    
//     gameState.turn = gameState.firstPlayerIdx;
//     while(gameState.table[gameState.turn].folded || gameState.table[gameState.turn].allIn) {
//         gameState.turn = (gameState.turn + 1) % 3;
//     }

//     DOM.controls.style.display = 'grid';
//     setTimeout(() => DOM.controls.style.opacity = '1', 10);
//     DOM.nextAction.style.display = 'none';
//     render();
// }

// // 헬퍼: 애니메이션 숫자
// function animateValue(obj, start, end, duration) {
//     let startTimestamp = null;
//     const step = (timestamp) => {
//         if (!startTimestamp) startTimestamp = timestamp;
//         const progress = Math.min((timestamp - startTimestamp) / duration, 1);
//         obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
//         if (progress < 1) window.requestAnimationFrame(step);
//     };
//     window.requestAnimationFrame(step);
// }

// // 헬퍼: 데이터 초기화
// function resetAllData() {
//     if (prompt("ADMIN PASSWORD:") === ADMIN_PASSWORD && confirm("모든 잔액을 초기화하시겠습니까?")) {
//         localStorage.clear(); location.reload();
//     }
// }

// function toggleRank(show) { DOM.rankLayer.style.display = show ? 'flex' : 'none'; }

// // 초기화 실행
// gameState.load();
// // 로비 화면 초기 잔액 표시
// for(let i=0; i<=4; i++) {
//     document.getElementById(`bal-${i}`).innerText = gameState.members[i].balance.toLocaleString();
//     document.getElementById(`lobby-name-${i}`).innerText = gameState.members[i].name;
//     document.getElementById(`lobby-avatar-${i}`).innerText = gameState.members[i].emoji;
// }
