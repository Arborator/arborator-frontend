import { Notify } from 'quasar';
import { i18n } from 'src/boot/i18n';

interface ArboratorGrewError_t {
  error: any;
  timeout: number; // in milliseconds
  message: string;
}

export default function notifyError(ArboratorGrewError: ArboratorGrewError_t) {
  console.log('ArboratorGrewError : ', ArboratorGrewError);
  let msg;
  let caption = '';

  const error = ArboratorGrewError.error;
  const timeout = ArboratorGrewError.timeout;
  const message = ArboratorGrewError.message;
  if (message !== undefined) {
    msg = message;
  } else if (error.message !== undefined) {
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
