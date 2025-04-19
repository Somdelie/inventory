// getNormalDate.tsx
export function getNormalDate(
  inputDate: string | Date | null | undefined
): string {
  if (!inputDate) {
    return "N/A";
  }

  let dateObj: Date;

  if (typeof inputDate === "string") {
    dateObj = new Date(inputDate);
  } else if (inputDate instanceof Date) {
    dateObj = inputDate;
  } else {
    return "Invalid date";
  }

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
    dateObj
  );

  const day = dateObj.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
      ? "nd"
      : day === 3 || day === 23
      ? "rd"
      : "th";

  return formattedDate.replace(/\b(\d{1,2})\b/, `$1${suffix}`);
}
