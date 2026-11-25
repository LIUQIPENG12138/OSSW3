(function () {
  "use strict";

  function formatKRW(amount) {
    return `${Math.round(amount).toLocaleString("ko-KR")}원`;
  }

  // 1. 핵심 KPI 계산 / 计算核心指标
  const totalRevenue = DAILY_SALES.reduce((sum, day) => sum + day.totalRevenue, 0);
  const totalQty = DAILY_SALES.reduce((sum, day) => sum + day.totalQty, 0);
  const avgDailyRevenue = totalRevenue / DAILY_SALES.length;
  const bestDay = DAILY_SALES.reduce((best, day) =>
    day.totalRevenue > best.totalRevenue ? day : best
  );

  document.getElementById("kpi-total-revenue").textContent = formatKRW(totalRevenue);
  document.getElementById("kpi-total-qty").textContent = `${totalQty.toLocaleString("ko-KR")}개`;
  document.getElementById("kpi-avg-daily").textContent = formatKRW(avgDailyRevenue);
  document.getElementById("kpi-best-day").textContent = bestDay.shortLabel;
  document.getElementById("kpi-best-day-sub").textContent = formatKRW(bestDay.totalRevenue);

  // 2. ① 일별 매출 꺾은선 차트 / 按日销售额折线图
  const dailyLabels = DAILY_SALES.map((day) => day.shortLabel);
  const dailyRevenues = DAILY_SALES.map((day) => day.totalRevenue);

  const dailyCtx = document.getElementById("dailyRevenueChart").getContext("2d");
  new Chart(dailyCtx, {
    type: "line",
    data: {
      labels: dailyLabels,
      datasets: [
        {
          label: "일별 매출 (원) · 日销售额",
          data: dailyRevenues,
          borderColor: "#b45309",
          backgroundColor: "rgba(180, 83, 9, 0.14)",
          borderWidth: 3,
          pointBackgroundColor: "#3b261d",
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.28
        }
      ]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top"
        },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              return `매출 · 销售额: ${formatKRW(ctx.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function (value) {
              return `${(value / 10000).toFixed(0)}만원`;
            }
          }
        }
      }
    }
  });

  // 3. ② 메뉴별 판매량 막대 차트 / 各菜单销量柱状图
  const menuTotals = MENU_ITEMS.map((menu) => {
    const qtySum = DAILY_SALES.reduce((sum, day) => {
      const rec = day.records.find((r) => r.menuId === menu.id);
      return sum + (rec ? rec.qty : 0);
    }, 0);
    return {
      label: menu.shortName,
      qty: qtySum
    };
  });

  const barColors = [
    "#3b261d",
    "#6b4226",
    "#b45309",
    "#d97706",
    "#2f6f5e",
    "#0f766e",
    "#2563eb",
    "#7c3aed",
    "#db2777",
    "#475569"
  ];

  const menuCtx = document.getElementById("menuQtyChart").getContext("2d");
  new Chart(menuCtx, {
    type: "bar",
    data: {
      labels: menuTotals.map((m) => m.label),
      datasets: [
        {
          label: "판매량 (잔/개) · 销量",
          data: menuTotals.map((m) => m.qty),
          backgroundColor: barColors,
          borderRadius: 6
        }
      ]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              return `판매량 · 销量: ${ctx.parsed.y}개`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 40,
            minRotation: 25,
            font: { size: 11 }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 100
          }
        }
      }
    }
  });

  // 4. ③ 요일별 평균 매출 표 / 按星期统计的平均销售额表格
  const weekdayStats = WEEKDAY_ORDER.map((wd) => {
    const matchingDays = DAILY_SALES.filter((d) => d.weekdayKey === wd.key);
    const sum = matchingDays.reduce((acc, d) => acc + d.totalRevenue, 0);
    const avg = matchingDays.length > 0 ? sum / matchingDays.length : 0;
    return {
      key: wd.key,
      label: wd.label,
      count: matchingDays.length,
      total: sum,
      average: avg
    };
  });

  const maxWeekdayAvg = Math.max(...weekdayStats.map((w) => w.average));
  const tbody = document.getElementById("weekday-table-body");

  weekdayStats.forEach((stat) => {
    const tr = document.createElement("tr");

    const tdLabel = document.createElement("td");
    tdLabel.textContent = stat.label;
    if (stat.average === maxWeekdayAvg) {
      const tag = document.createElement("span");
      tag.className = "peak-tag";
      tag.textContent = "최고 · 最高";
      tdLabel.appendChild(tag);
    }

    const tdCount = document.createElement("td");
    tdCount.className = "num";
    tdCount.textContent = `${stat.count}일 · ${stat.count}天`;

    const tdTotal = document.createElement("td");
    tdTotal.className = "num";
    tdTotal.textContent = formatKRW(stat.total);

    const tdAvg = document.createElement("td");
    tdAvg.className = "num";
    tdAvg.style.fontWeight = "700";
    tdAvg.textContent = formatKRW(stat.average);

    tr.appendChild(tdLabel);
    tr.appendChild(tdCount);
    tr.appendChild(tdTotal);
    tr.appendChild(tdAvg);
    tbody.appendChild(tr);
  });
})();
