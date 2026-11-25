// 가상의 동네 카페 매출 데이터 (10일 × 메뉴 10종)
// 虚构社区咖啡店销售数据（10天 × 10种菜单）

const CAFE_INFO = {
  nameKo: "별빛 골목 카페",
  nameZh: "星光小巷咖啡馆",
  period: "2026-11-02 ~ 2026-11-11",
  currency: "원"
};

const MENU_ITEMS = [
  { id: "americano", name: "아메리카노 · 美式咖啡", shortName: "아메리카노(美式)", price: 4000 },
  { id: "latte", name: "카페라떼 · 拿铁咖啡", shortName: "카페라떼(拿铁)", price: 4800 },
  { id: "vanilla", name: "바닐라라떼 · 香草拿铁", shortName: "바닐라라떼(香草)", price: 5300 },
  { id: "cappuccino", name: "카푸치노 · 卡布奇诺", shortName: "카푸치노(卡布)", price: 4800 },
  { id: "matcha", name: "말차라떼 · 抹茶拿铁", shortName: "말차라떼(抹茶)", price: 5500 },
  { id: "yuja", name: "유자차 · 柚子茶", shortName: "유자차(柚子茶)", price: 4500 },
  { id: "lemonade", name: "레몬에이드 · 柠檬汽水", shortName: "레몬에이드(柠檬)", price: 5000 },
  { id: "chocoCake", name: "초코케이크 · 巧克力蛋糕", shortName: "초코케이크(蛋糕)", price: 6500 },
  { id: "croissant", name: "크루아상 · 可颂面包", shortName: "크루아상(可颂)", price: 3800 },
  { id: "tiramisu", name: "티라미수 · 提拉米苏", shortName: "티라미수(提拉米苏)", price: 6200 }
];

const WEEKDAY_ORDER = [
  { key: "mon", label: "월요일 · 周一" },
  { key: "tue", label: "화요일 · 周二" },
  { key: "wed", label: "수요일 · 周三" },
  { key: "thu", label: "목요일 · 周四" },
  { key: "fri", label: "금요일 · 周五" },
  { key: "sat", label: "토요일 · 周六" },
  { key: "sun", label: "일요일 · 周日" }
];

// 10일 × 10종 메뉴 판매 수량 테이블 (각 행은 하루, 각 열은 MENU_ITEMS 순서)
const RAW_DAILY_QUANTITIES = [
  { date: "2026-11-02", weekdayKey: "mon", shortLabel: "11/02(월/一)", quantities: [42, 26, 16, 12, 14, 11, 9, 10, 18, 8] },
  { date: "2026-11-03", weekdayKey: "tue", shortLabel: "11/03(화/二)", quantities: [45, 29, 18, 14, 13, 12, 10, 11, 20, 9] },
  { date: "2026-11-04", weekdayKey: "wed", shortLabel: "11/04(수/三)", quantities: [48, 30, 19, 13, 16, 14, 11, 12, 22, 10] },
  { date: "2026-11-05", weekdayKey: "thu", shortLabel: "11/05(목/四)", quantities: [50, 32, 21, 15, 17, 13, 12, 14, 21, 11] },
  { date: "2026-11-06", weekdayKey: "fri", shortLabel: "11/06(금/五)", quantities: [56, 36, 24, 18, 19, 15, 16, 18, 26, 15] },
  { date: "2026-11-07", weekdayKey: "sat", shortLabel: "11/07(토/六)", quantities: [68, 46, 30, 22, 25, 20, 22, 26, 34, 21] },
  { date: "2026-11-08", weekdayKey: "sun", shortLabel: "11/08(일/日)", quantities: [62, 42, 28, 20, 23, 18, 20, 24, 30, 19] },
  { date: "2026-11-09", weekdayKey: "mon", shortLabel: "11/09(월/一)", quantities: [44, 27, 17, 13, 15, 12, 10, 11, 19, 9] },
  { date: "2026-11-10", weekdayKey: "tue", shortLabel: "11/10(화/二)", quantities: [47, 31, 20, 15, 16, 13, 11, 13, 21, 10] },
  { date: "2026-11-11", weekdayKey: "wed", shortLabel: "11/11(수/三)", quantities: [53, 35, 23, 16, 18, 15, 14, 16, 25, 13] }
];

// 각 일자·메뉴별 판매량(qty)과 매출(revenue)을 포함한 구조화 데이터
const DAILY_SALES = RAW_DAILY_QUANTITIES.map((day) => {
  const records = MENU_ITEMS.map((menu, idx) => {
    const qty = day.quantities[idx];
    const revenue = qty * menu.price;
    return {
      menuId: menu.id,
      menuName: menu.name,
      unitPrice: menu.price,
      qty: qty,
      revenue: revenue
    };
  });

  const totalQty = records.reduce((sum, r) => sum + r.qty, 0);
  const totalRevenue = records.reduce((sum, r) => sum + r.revenue, 0);

  return {
    date: day.date,
    weekdayKey: day.weekdayKey,
    shortLabel: day.shortLabel,
    records: records,
    totalQty: totalQty,
    totalRevenue: totalRevenue
  };
});
