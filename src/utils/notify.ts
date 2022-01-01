import { Notify } from 'quasar';
import { i18n } from 'src/boot/i18n';

export default function notifyError({ error, timeout }: { error: any; timeout?: number }) {
  let msg;
  let caption = '';
  if (error.message !== undefined) {
    msg = error.message;
  } else if (error.response) {
    if (error.response.status === 403) {
      msg = error.response.message ? error.response.message : i18n.global.t('error403');
    } else if (error.response.status === 401) {
      msg = error.response.message ? error.response.message : i18n.global.t('error401');
    } else {
      msg = error.response.message ? error.response.message : `${error.response.statusText} error ${error.response.status}`;
    }
  } else {
    msg = `oops${error}`;
  }
  if (error.caption) {
    caption = error.caption;
  }
  if (error.permanent) {
    Notify.create({
      message: msg,
      position: 'top-right',
      color: 'negative',
      icon: 'warning',
      caption,
      timeout: 0,
      closeBtn: 'Dismiss',
      html: true,
    });
  } else {
    timeout = timeout || 5000;
    Notify.create({
      message: msg,
      position: 'top-right',
      color: 'negative',
      icon: 'warning',
      caption,
      timeout,
    });
  }
}
