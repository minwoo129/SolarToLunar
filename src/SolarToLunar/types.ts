export type lunarCalcArgs = lunarCalcArgs1 | lunarCalcArgs2;
type lunarCalcArgs1 = {
  /** 입력값(연) */
  year: number;
  /** 입력값(월) */
  month: number;
  /** 입력값(일) */
  day: number;
  /**
   * 1: 양력 -> 음력
   * 2: 음력 -> 양력
   */
  type: 1;
};
type lunarCalcArgs2 = {
  /** 입력값(연) */
  year: number;
  /** 입력값(월) */
  month: number;
  /** 입력값(일) */
  day: number;
  /**
   * 1: 양력 -> 음력
   * 2: 음력 -> 양력
   */
  type: 2;
  /**
   * 입력값(윤달 여부)
   * - 현재 미사용
   */
  leapmonth: number;
};

export type calculateGapjaArgs = {
  /** 입력값(연) */
  year: number;
  /** 입력값(월) */
  month: number;
  /** 입력값(일) */
  day: number;
  /** 음력날짜 */
  lunarDateStr: string;
  /** 윤달인지 여부 */
  isLeapMonth: boolean;
};

export type calculateTotalLunarDaysArgs = {
  /** 음력(연) */
  lunYear: number;
  /** 음력(월) */
  lunMonth: number;
  /** 음력(일) */
  lunDay: number;
  /** 윤년 여부(1: 참, 0: 거짓) */
  leapYear: number;
};

export interface DateResultType extends DateResultTestType {
  nextMonthGapjaResult: DateResultGapja;
  jeolgiResult: JeolgiItemDataType | null;
  holidayResult: string | null;
  isLeapMonth: boolean;
  beforeMonthGapjaResult: DateResultGapja;
}

export type DateResultGapja = {
  yearGapja: string;
  monthGapja: string;
  dayGapja: string;
  yearGapjaKor: string;
  monthGapjaKor: string;
  dayGapjaKor: string;
};

// ===============================================================
export type JeolgiDataType = {
  [key in string]: JeolgiItemDataType;
};
export type holidayDataType = {
  [key in string]: string;
};

export type JeolgiItemDataType = {
  jeolgi: string;
  jeolgi_time: string;
};

export type MonthJeolgiDatesType = {
  [key in string]: string;
};

export interface DateResultTestType {
  solarDate: string;
  lunarDate: string;
  gapjaResult: DateResultGapja;
}
