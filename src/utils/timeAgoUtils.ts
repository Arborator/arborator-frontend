import { useI18n } from 'vue-i18n';

const i18n = useI18n({ useScope: 'global' });

export function timeAgo(secsAgo: number) {
  const formatter = new Intl.RelativeTimeFormat(i18n.locale.value, { style: 'long' });
  // const ranges: { [key in Intl.RelativeTimeFormatUnit]?: number } = {
  // const ranges: Partial<Record<Intl.RelativeTimeFormatUnit, number>> = {
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
      return formatter.format(Math.round(delta), key as Intl.RelativeTimeFormatUnit);
    }
  }
  return formatter.format(secsAgo, 'seconds'); // should be useless
}
