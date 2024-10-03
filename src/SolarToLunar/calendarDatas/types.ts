export type convertMonthJeolgiDatesArgs = {
  splitByYear?: boolean;
  splitByMonth?: boolean;
  forDetail?: boolean;
  splitByJeolgiFirstDate?: boolean;
  validationCheck?: boolean;
  returnValue?: boolean;
};

export type convertLunarDatesArgs = {
  forMonth?: boolean;
  forDecade?: boolean;
  forAddedYear?: boolean;
};

export type SplitJeolgiDates<T = string> = {
  [key in string]: T[];
};
