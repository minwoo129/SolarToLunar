import dayjs from "dayjs";
import {
  DateResultType,
  calculateGapjaArgs,
  calculateTotalLunarDaysArgs,
  lunarCalcArgs,
} from "./types";
import {
  LUNAR_LAST_MAX_YEAR,
  LUNAR_LAST_MIN_YEAR,
  LunarAddedYearDays,
  SixGapjaIdx,
  SixGapjaValue,
  TotalLunarMonthDays,
  lunarMonthTable,
} from "./defaultData";
import _ from "lodash";
import { jeolgiData } from "./calendarDatas/jeolgi";
import { holidayData } from "./calendarDatas/holiday";

export const convertSolarToLunar = (date: string) => {
  const solarDate = date;

  const [year, month, day] = date.split("-");
  const lunarData = solarToLunar(date);
  if (!lunarData) return;

  const { lunarDate, isLeapMonth } = lunarData;
  const gapjaResult = calculateGapja({
    year: parseInt(year),
    month: parseInt(month),
    day: parseInt(day),
    isLeapMonth,
    lunarDateStr: lunarDate,
  });

  const nextMonthDate = dayjs(solarDate)
    .add(1, "month")
    .startOf("month")
    .format("YYYY-MM-DD");
  const [nextYear, nextMonth, nextDay] = nextMonthDate.split("-");
  const nextMonthGapjaResult = calculateGapja({
    year: parseInt(nextYear),
    month: parseInt(nextMonth),
    day: parseInt(nextDay),
    isLeapMonth,
    lunarDateStr: lunarDate,
  });

  const beforeMonthDate = dayjs(solarDate)
    .subtract(1, "month")
    .startOf("month")
    .format("YYYY-MM-DD");
  const [beforeYear, beforeMonth, beforeDay] = beforeMonthDate.split("-");
  const beforeMonthGapjaResult = calculateGapja({
    year: parseInt(beforeYear),
    month: parseInt(beforeMonth),
    day: parseInt(beforeDay),
    isLeapMonth,
    lunarDateStr: lunarDate,
  });

  const jeolgiResult = findJeolgi(solarDate);
  const holidayResult = findHoliday(solarDate);
  const resultData: DateResultType = {
    solarDate,
    lunarDate,
    gapjaResult,
    nextMonthGapjaResult,
    jeolgiResult,
    holidayResult,
    isLeapMonth,
    beforeMonthGapjaResult,
  };
  return resultData;
};

// 양력을 음력날짜로 변환
const solarToLunar = (solDate: string) => {
  const [_year, _month, _day] = solDate.split("-");
  /** 입력값(연) */
  const solYear = parseInt(_year);
  /** 입력값(월) */
  const solMonth = parseInt(_month);
  /** 입력값(일) */
  const solDay = parseInt(_day);
  // 양력의 달마다의 일수
  let solMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  /* 윤년일 시 2월에 1일 추가 */
  if (solYear % 400 == 0 || (solYear % 4 == 0 && solYear % 100 != 0)) {
    solMonthDays[1] += 1;
  }

  /* 양력/음력 변환 */
  let date = lunarCalc({
    year: solYear,
    month: solMonth,
    day: solDay,
    type: 1,
  });

  if (!date) return;

  const isLeapMonth = date.leapMonth ? true : false;

  const year1 = date.year < 10 ? `0${date.year}` : date.year;
  const month1 = date.month < 10 ? `0${date.month}` : date.month;
  const day1 = date.day < 10 ? `0${date.day}` : date.day;
  const lunarDate = `${year1}-${month1}-${day1}`;
  return {
    lunarDate,
    isLeapMonth,
  };
};

const lunarCalc = (args: lunarCalcArgs) => {
  const { year, day, month, type } = args;
  /** 양력(연) */
  let solYear: number;
  /** 양력(월) */
  let solMonth: number;
  /** 양력(일) */
  let solDay: number;
  /** 음력(연) */
  let lunYear: number;
  /** 음력(월) */
  let lunMonth: number;
  /** 음력(일) */
  let lunDay: number;

  /**
   * 음력(윤달 여부)
   * - 0: 음달
   * - 1: 윤달
   */
  let lunLeapMonth: number;
  /** 음력(월 마지막 날짜) */
  let lunMonthDay: number;
  /** 음력(연도 index) */
  let lunIndex: number;

  /** 양력(월별 전체 일수) */
  let solMonthDay = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  /* range check */
  if (year < LUNAR_LAST_MIN_YEAR || year > LUNAR_LAST_MAX_YEAR) {
    console.log("1899년부터 2100년까지만 지원합니다");
    return;
  }

  /* 속도 개선을 위해 기준 일자를 여러개로 한다 */
  if (year >= 2000) {
    /* 기준일자 양력 2000년 1월 1일 (음력 1999년 11월 25일) */
    solYear = 2000;
    solMonth = 1;
    solDay = 1;
    lunYear = 1999;
    lunMonth = 11;
    lunDay = 25;
    lunLeapMonth = 0;

    solMonthDay[1] = 29; /* 2000 년 2월 28일 */
    lunMonthDay = 30; /* 1999년 11월 */
  } else if (year >= 1970) {
    /* 기준일자 양력 1970년 1월 1일 (음력 1969년 11월 24일) */
    solYear = 1970;
    solMonth = 1;
    solDay = 1;
    lunYear = 1969;
    lunMonth = 11;
    lunDay = 24;
    lunLeapMonth = 0;

    solMonthDay[1] = 28; /* 1970 년 2월 28일 */
    lunMonthDay = 30; /* 1969년 11월 */
  } else {
    /* 기준일자 양력 1940년 1월 1일 (음력 1939년 11월 22일) */
    solYear = 1900;
    solMonth = 1;
    solDay = 1;
    lunYear = 1899;
    lunMonth = 12;
    lunDay = 1;
    lunLeapMonth = 0;

    solMonthDay[1] = 28; /* 1940 년 2월 28일 */
    lunMonthDay = 30; /* 1939년 11월 */
  }

  lunIndex = lunYear - LUNAR_LAST_MIN_YEAR;

  // type이 1일때는 입력받은 양력 값에 대한 음력값을 반환
  // 2일 때는 입력받은 음력 값에 대한 양력값을 반환
  // 반복문이 돌면서 양력 값들과 음력 값들을 1일 씩 증가시키고
  // 입력받은 날짜값과 양력 값이 일치할 때 음력값을 반환함
  while (true) {
    // 양력 -> 음력
    if (type == 1) {
      if (year == solYear && month == solMonth && day == solDay) {
        return new myDate(lunYear, lunMonth, lunDay, lunLeapMonth);
      }
    }
    // 음력 -> 양력
    else if (type == 2) {
      const { leapmonth } = args;
      if (
        year == lunYear &&
        month == lunMonth &&
        day == lunDay &&
        leapmonth == lunLeapMonth
      ) {
        return new myDate(solYear, solMonth, solDay, 0);
      }
    }

    // 양력의 마지막 날일 경우 년도를 증가시키고 나머지 초기화
    if (solMonth == 12 && solDay == 31) {
      solYear++;
      solMonth = 1;
      solDay = 1;

      // 윤년일 시 2월달의 총 일수를 1일 증가
      if ((solYear % 4 === 0 && solYear % 100 !== 0) || solYear % 400 === 0) {
        solMonthDay[1] = 29;
      } else {
        solMonthDay[1] = 28;
      }
    }
    // 현재 날짜가 달의 마지막 날짜를 가리키고 있을 시 달을 증가시키고 날짜 1로 초기화
    else if (solMonthDay[solMonth - 1] == solDay) {
      solMonth++;
      solDay = 1;
    } else solDay++;

    /**
     * 음력 달력 배열 값
     * - 연도와 월에 따라 음력의 마지막 날짜가 다름
     */
    const lunarMonthValue = lunarMonthTable[lunIndex][lunMonth - 1];

    // 음력의 마지막 날인 경우 년도를 증가시키고 달과 일수를 초기화
    if (
      lunMonth == 12 &&
      ((lunarMonthValue == 1 && lunDay == 29) ||
        (lunarMonthValue == 2 && lunDay == 30))
    ) {
      lunYear++;
      lunMonth = 1;
      lunDay = 1;

      if (lunYear > LUNAR_LAST_MAX_YEAR) {
        console.log("입력하신 달은 없습니다.");
        return;
      }

      // 년도가 바꼈으니 index값 수정
      lunIndex = lunYear - LUNAR_LAST_MIN_YEAR;

      // 음력의 1월에는 1 or 2만 있으므로 1과 2만 비교하면됨
      if (lunarMonthValue == 1) lunMonthDay = 29;
      else if (lunarMonthValue == 2) lunMonthDay = 30;
    }
    // 현재날짜가 이번달의 마지막날짜와 일치할 경우
    else if (lunDay == lunMonthDay) {
      // 윤달인데 윤달계산을 안했을 경우 달의 숫자는 증가시키면 안됨
      if (lunarMonthValue >= 3 && lunLeapMonth == 0) {
        lunDay = 1;
        lunLeapMonth = 1;
      }
      // 음달이거나 윤달을 계산 했을 겨우 달을 증가시키고 lunLeapMonth값 초기화
      else {
        lunMonth++;
        lunDay = 1;
        lunLeapMonth = 0;

        // 달이 12를 넘어가면 다음 해로 넘어가야 함
        if (lunMonth > 12) {
          lunYear++;
          lunMonth = 1;
          lunIndex = lunYear - LUNAR_LAST_MIN_YEAR;
        }
      }

      // 음력의 달에 맞는 마지막날짜 초기화
      if (lunarMonthValue == 1) lunMonthDay = 29;
      else if (lunarMonthValue == 2) lunMonthDay = 30;
      else if (lunarMonthValue == 3) lunMonthDay = 29;
      else if (lunarMonthValue == 4 && lunLeapMonth == 0) lunMonthDay = 29;
      else if (lunarMonthValue == 4 && lunLeapMonth == 1) lunMonthDay = 30;
      else if (lunarMonthValue == 5 && lunLeapMonth == 0) lunMonthDay = 30;
      else if (lunarMonthValue == 5 && lunLeapMonth == 1) lunMonthDay = 29;
      else if (lunarMonthValue == 6) lunMonthDay = 30;
    } else lunDay++;
  }
};

class myDate {
  year;
  month;
  day;
  leapMonth;

  constructor(year: number, month: number, day: number, leapMonth: number) {
    this.year = year;
    this.month = month;
    this.day = day;
    this.leapMonth = leapMonth;
  }
}

/**
 * 갑자 계산
 */
const calculateGapja = (args: calculateGapjaArgs) => {
  const { year, month, day, lunarDateStr, isLeapMonth } = args;

  // 기준일 갑자 인덱스
  /**
   * 기준일 갑자 인덱스
   * - 연도
   */
  const baseYearIndex = SixGapjaIdx["庚子"]; //양력으로 1900.1.1의 년주
  /**
   * 기준일 갑자 인덱스
   * - 월
   */
  const baseMonthIndex = SixGapjaIdx["丁丑"]; //양력으로 1900.1.1의 월주
  /**
   * 기준일 갑자 인덱스
   * - 일
   */
  const baseDayIndex = SixGapjaIdx["己酉"]; //음력으로 1899.1.1 일의 일주

  // 년도 갑자 계산
  let yearIndex = (year - 1900 + baseYearIndex) % 60;
  const [yearGapja, yearGapjaKor] = SixGapjaValue[yearIndex];

  // 월 갑자 계산
  let totalMonths = (year - 1900) * 12 + (month - 1);
  let monthIndex = (totalMonths + baseMonthIndex) % 60;
  const [monthGapja, monthGapjaKor] = SixGapjaValue[monthIndex];

  // 양력 날짜를 음력으로 변환
  const [_lunYear, _lunMonth, _lunDay] = lunarDateStr.split("-");
  const lunYear = parseInt(_lunYear);
  const lunMonth = parseInt(_lunMonth);
  const lunDay = parseInt(_lunDay);
  const leapYear = isLeapMonth ? 1 : 0;

  let dayIndex =
    calculateTotalLunarDays({ lunYear, lunMonth, lunDay, leapYear }) +
    baseDayIndex;
  const [dayGapja, dayGapjaKor] = SixGapjaValue[dayIndex % 60];

  return {
    yearGapja: yearGapja,
    monthGapja: monthGapja,
    dayGapja: dayGapja,
    yearGapjaKor: yearGapjaKor,
    monthGapjaKor: monthGapjaKor,
    dayGapjaKor: dayGapjaKor,
  };
};

const calculateTotalLunarDays = (args: calculateTotalLunarDaysArgs) => {
  const { leapYear, lunDay, lunMonth, lunYear } = args;
  let totalDays = 0;

  // 1899년부터 해당 음력 년도 전년도까지의 총 일수 계산
  for (let y = LUNAR_LAST_MIN_YEAR; y < lunYear; y++) {
    let yearIndex = y - LUNAR_LAST_MIN_YEAR;

    for (let m = 0; m < 12; m++) {
      let monthType = lunarMonthTable[yearIndex][m];
      if (monthType === 1 || monthType === 3 || monthType === 4) {
        totalDays += 29;
      } else if (monthType === 2 || monthType === 5 || monthType === 6) {
        totalDays += 30;
      }

      // 윤달 처리
      if (monthType === 3 || monthType === 5) {
        totalDays += 29; // 윤달 29일
      } else if (monthType === 4 || monthType === 6) {
        totalDays += 30; // 윤달 30일
      }
    }
  }

  // 해당 음력 년도의 1월부터 해당 달 전까지의 일수 계산
  let yearIndex = lunYear - LUNAR_LAST_MIN_YEAR;

  for (let m = 0; m < lunMonth - 1; m++) {
    let monthType = lunarMonthTable[yearIndex][m];

    if (monthType === 1 || monthType === 3 || monthType === 4) {
      totalDays += 29;
    } else if (monthType === 2 || monthType === 5 || monthType === 6) {
      totalDays += 30;
    }

    // 윤달 처리
    if (monthType === 3 || monthType === 5) {
      totalDays += 29; // 윤달 29일
    } else if (monthType === 4 || monthType === 6) {
      totalDays += 30; // 윤달 30일
    }
  }

  if (leapYear === 1) {
    let monthType = lunarMonthTable[yearIndex][lunMonth - 1];

    if (monthType === 3 || monthType === 4) {
      totalDays += 29;
    } else if (monthType === 5 || monthType === 6) {
      totalDays += 30;
    }
  }

  // 해당 달의 일수 추가
  totalDays += lunDay - 1;

  return totalDays;
};
const findJeolgi = (selectedDate: string) => {
  return jeolgiData[selectedDate] ?? null;
};

const findHoliday = (selectedDate: string) => {
  return holidayData[selectedDate] ?? null;
};
