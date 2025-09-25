export function format(first?: string, middle?: string, last?: string): string {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}


export function schoolYearOptions(
  currentValue: number,
  pastYears: boolean = false,
  startingYear?: number,
) {
  if (!startingYear) startingYear = new Date().getFullYear() + 1;

  let start = pastYears ? -3 : 0;
  let end = 5;

  const isBeforeJuly = new Date().getMonth() < 6;
  if (isBeforeJuly) {
    start -= 1;
    end -= 1;
  }

  const ret = [];
  for (let i = start; i < end; i++) {
    ret.push(startingYear + i);
  }

  if (!isNaN(currentValue) && !ret.includes(currentValue)) {
    ret.unshift(currentValue);
  }

  return ret.map((y) => ({
    label: `${y}/${y + 1}`,
    value: y,
  }));
}