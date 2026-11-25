(function () {
  "use strict";

  const STORAGE_KEY = "ossw3_game_roulette_list_v1";
  const SPIN_DURATION_MS = 2000;

  const SLICE_COLORS = [
    "#ef4444",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#06b6d4",
    "#84cc16"
  ];

  const SAMPLE_GAMES = [
    "배틀필드 5 · 战地5",
    "리그 오브 레전드 · 英雄联盟",
    "발로란트 · 无畏契约",
    "에이펙스 레전드 · Apex英雄"
  ];

  const canvas = document.getElementById("roulette-canvas");
  const ctx = canvas.getContext("2d");
  const spinBtn = document.getElementById("spin-btn");
  const addForm = document.getElementById("add-form");
  const gameInput = document.getElementById("game-input");
  const gameListEl = document.getElementById("game-list");
  const emptyHintEl = document.getElementById("empty-hint");
  const countLabelEl = document.getElementById("count-label");
  const feedbackEl = document.getElementById("form-feedback");
  const resultBoxEl = document.getElementById("result-box");
  const resultTextEl = document.getElementById("result-text");
  const sampleBtn = document.getElementById("sample-btn");
  const clearBtn = document.getElementById("clear-btn");

  let games = loadGames();
  let currentRotation = 0;
  let isSpinning = false;

  function loadGames() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((item) => typeof item === "string" && item.trim().length > 0)
        : [];
    } catch (e) {
      return [];
    }
  }

  function saveGames() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
    } catch (e) {
      showFeedback("브라우저 저장소(localStorage) 저장에 실패했습니다. / 本地存储保存失败。");
    }
  }

  function showFeedback(message) {
    feedbackEl.textContent = message;
  }

  function truncateLabel(text, maxLen) {
    return text.length > maxLen ? text.slice(0, maxLen - 1) + "…" : text;
  }

  function drawWheel() {
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, size, size);

    if (games.length === 0) {
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#1e293b";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#334155";
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("게임을 추가해 주세요", center, center - 14);
      ctx.font = "15px sans-serif";
      ctx.fillText("请先在右侧添加游戏", center, center + 16);
      return;
    }

    const sliceAngle = (Math.PI * 2) / games.length;

    for (let i = 0; i < games.length; i++) {
      const startAngle = currentRotation + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const color = SLICE_COLORS[i % SLICE_COLORS.length];

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#0f172a";
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.font = games.length > 8 ? "bold 12px sans-serif" : "bold 13px sans-serif";
      ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
      ctx.shadowBlur = 4;
      ctx.fillText(truncateLabel(games[i], 14), radius - 16, 0, radius - 56);
      ctx.restore();
    }

    // Center hub
    ctx.beginPath();
    ctx.arc(center, center, 24, 0, Math.PI * 2);
    ctx.fillStyle = "#0f172a";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#fbbf24";
    ctx.stroke();
  }

  function renderList() {
    gameListEl.innerHTML = "";
    countLabelEl.textContent = `총 ${games.length}개 · 共 ${games.length} 项`;
    emptyHintEl.style.display = games.length === 0 ? "block" : "none";
    spinBtn.disabled = isSpinning || games.length === 0;
    clearBtn.disabled = isSpinning || games.length === 0;
    sampleBtn.disabled = isSpinning;

    games.forEach((name, index) => {
      const li = document.createElement("li");
      li.className = "game-item";

      const left = document.createElement("div");
      left.className = "game-item-left";

      const dot = document.createElement("span");
      dot.className = "color-dot";
      dot.style.backgroundColor = SLICE_COLORS[index % SLICE_COLORS.length];

      const label = document.createElement("span");
      label.className = "game-name";
      label.textContent = name;

      left.appendChild(dot);
      left.appendChild(label);

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn-delete";
      delBtn.textContent = "삭제 · 删除";
      delBtn.disabled = isSpinning;
      delBtn.addEventListener("click", function () {
        deleteGame(index);
      });

      li.appendChild(left);
      li.appendChild(delBtn);
      gameListEl.appendChild(li);
    });
  }

  function syncUI() {
    saveGames();
    renderList();
    drawWheel();
  }

  function addGame(rawName) {
    const name = rawName.trim();
    if (!name) {
      showFeedback("게임 이름을 입력해 주세요. / 请输入游戏名称。");
      return;
    }
    if (games.includes(name)) {
      showFeedback("이미 목록에 있는 게임입니다. / 该游戏已在列表中。");
      return;
    }
    showFeedback("");
    games.push(name);
    gameInput.value = "";
    syncUI();
  }

  function deleteGame(index) {
    if (isSpinning) return;
    games.splice(index, 1);
    showFeedback("");
    if (games.length === 0) {
      resultBoxEl.classList.remove("winner");
      resultTextEl.textContent = "게임을 추가하고 돌려주세요 · 请先添加游戏并旋转";
    }
    syncUI();
  }

  function getWinnerIndex(rotation) {
    const n = games.length;
    const sliceAngle = (Math.PI * 2) / n;
    const pointerAngle = -Math.PI / 2; // Top 12 o'clock pointer
    const fullTurn = Math.PI * 2;
    const rel = (((pointerAngle - rotation) % fullTurn) + fullTurn) % fullTurn;
    return Math.floor(rel / sliceAngle) % n;
  }

  function spinWheel() {
    if (isSpinning || games.length === 0) return;

    isSpinning = true;
    showFeedback("");
    resultBoxEl.classList.remove("winner");
    resultTextEl.textContent = "룰렛 회전 중... · 轮盘旋转中...";
    renderList();

    const startRotation = currentRotation;
    const extraTurns = 5 + Math.floor(Math.random() * 3); // 5~7 full spins
    const randomOffset = Math.random() * Math.PI * 2;
    const totalDelta = extraTurns * Math.PI * 2 + randomOffset;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / SPIN_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out

      currentRotation = startRotation + totalDelta * eased;
      drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        currentRotation = startRotation + totalDelta;
        drawWheel();
        isSpinning = false;
        const winnerIdx = getWinnerIndex(currentRotation);
        const winnerName = games[winnerIdx];
        resultBoxEl.classList.add("winner");
        resultTextEl.textContent = `🎉 ${winnerName}`;
        renderList();
      }
    }

    requestAnimationFrame(animate);
  }

  addForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (isSpinning) return;
    addGame(gameInput.value);
  });

  spinBtn.addEventListener("click", spinWheel);

  sampleBtn.addEventListener("click", function () {
    if (isSpinning) return;
    let added = 0;
    SAMPLE_GAMES.forEach((g) => {
      if (!games.includes(g)) {
        games.push(g);
        added++;
      }
    });
    showFeedback(added > 0 ? "" : "예시 게임이 이미 모두 들어 있습니다. / 示例游戏已全部在列表中。");
    syncUI();
  });

  clearBtn.addEventListener("click", function () {
    if (isSpinning) return;
    games = [];
    showFeedback("");
    resultBoxEl.classList.remove("winner");
    resultTextEl.textContent = "게임을 추가하고 돌려주세요 · 请先添加游戏并旋转";
    syncUI();
  });

  renderList();
  drawWheel();
})();
