import { i18n } from 'src/boot/i18n';

export function timeAgo(secsAgo: number) {
  const formatter = new Intl.RelativeTimeFormat(i18n.global.locale.value, { style: 'long' });
  const ranges: { [key: string]: number } = {
    years: 3600 * 24 * 365,
    months: 3600 * 24 * 30,
    weeks: 3600 * 24 * 7,
    days: 3600 * 24,
    hours: 3600,
    minutes: 60,
    seconds: 1,
  };
  for (const key in ranges) {
    if (ranges[key] < Math.abs(secsAgo)) {
      const delta = secsAgo / ranges[key];
      if (Math.round(delta) < -4 && key === 'years') {
        return i18n.global.locale.value === 'en' ? 'a long time ago' : 'Il y a longtemps'
      }
      else {
        return formatter.format(Math.round(delta), key as Intl.RelativeTimeFormatUnit);
      }
    }    
  }
  return formatter.format(secsAgo, 'seconds'); // should be useless
}
