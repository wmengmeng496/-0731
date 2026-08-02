export type ZodiacSign = {
  name: string;
  en: string;
  date: string;
  element: "火" | "土" | "风" | "水";
  icon: string;
};

export const zodiacSigns: ZodiacSign[] = [
  { name: "白羊座", en: "Aries", date: "3.21 - 4.19", element: "火", icon: "♈" },
  { name: "金牛座", en: "Taurus", date: "4.20 - 5.20", element: "土", icon: "♉" },
  { name: "双子座", en: "Gemini", date: "5.21 - 6.21", element: "风", icon: "♊" },
  { name: "巨蟹座", en: "Cancer", date: "6.22 - 7.22", element: "水", icon: "♋" },
  { name: "狮子座", en: "Leo", date: "7.23 - 8.22", element: "火", icon: "♌" },
  { name: "处女座", en: "Virgo", date: "8.23 - 9.22", element: "土", icon: "♍" },
  { name: "天秤座", en: "Libra", date: "9.23 - 10.23", element: "风", icon: "♎" },
  { name: "天蝎座", en: "Scorpio", date: "10.24 - 11.22", element: "水", icon: "♏" },
  { name: "射手座", en: "Sagittarius", date: "11.23 - 12.21", element: "火", icon: "♐" },
  { name: "摩羯座", en: "Capricorn", date: "12.22 - 1.19", element: "土", icon: "♑" },
  { name: "水瓶座", en: "Aquarius", date: "1.20 - 2.18", element: "风", icon: "♒" },
  { name: "双鱼座", en: "Pisces", date: "2.19 - 3.20", element: "水", icon: "♓" },
];

const zodiacBoundaries: Array<{ start: [number, number]; sign: ZodiacSign }> = [
  { start: [1, 20], sign: zodiacSigns[10] },
  { start: [2, 19], sign: zodiacSigns[11] },
  { start: [3, 21], sign: zodiacSigns[0] },
  { start: [4, 20], sign: zodiacSigns[1] },
  { start: [5, 21], sign: zodiacSigns[2] },
  { start: [6, 22], sign: zodiacSigns[3] },
  { start: [7, 23], sign: zodiacSigns[4] },
  { start: [8, 23], sign: zodiacSigns[5] },
  { start: [9, 23], sign: zodiacSigns[6] },
  { start: [10, 24], sign: zodiacSigns[7] },
  { start: [11, 23], sign: zodiacSigns[8] },
  { start: [12, 22], sign: zodiacSigns[9] },
];

export function getZodiacSign(month: number, day: number) {
  const validMonth = Number.isInteger(month) && month >= 1 && month <= 12;
  const validDay = Number.isInteger(day) && day >= 1 && day <= 31;
  if (!validMonth || !validDay) return null;

  let selected = zodiacSigns[9];
  for (const boundary of zodiacBoundaries) {
    const [startMonth, startDay] = boundary.start;
    if (month > startMonth || (month === startMonth && day >= startDay)) {
      selected = boundary.sign;
    }
  }
  return selected;
}

export function parseBirthDate(value: string) {
  const match = value.trim().match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (!match) return null;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return { year, month, day };
}

export function getZodiacSignFromDate(value: string) {
  const parsed = parseBirthDate(value);
  if (!parsed) return null;
  return getZodiacSign(parsed.month, parsed.day);
}
