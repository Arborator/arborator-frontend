import { i18n } from 'src/boot/i18n';

export function checkFilename(filename: string): string {
    const forbiddenChars = /[\/\\:*?"<>|\t\r\n]/;
		const forbiddenNames = ["", ".", ".."]
		if (forbiddenChars.test(filename)) { return i18n.global.t('invalidChar') }
		if (forbiddenNames.includes(filename)) { return i18n.global.t('invalidName') }
		if (filename.trim() !== filename) { return i18n.global.t('trailingWhitespace') }
		return ""
}

