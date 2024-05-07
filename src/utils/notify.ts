import { Notify } from 'quasar';
import { i18n } from 'src/boot/i18n';

interface ArboratorMessage_t {
  message: string;
  timeout?: number;
  color?: string;
  type?: 'positive' | 'negative' | 'warning';
  position?: 'top-right' | 'top' | 'bottom';
  icon?: string;
}

export function notifyMessage(arboratorMessage: ArboratorMessage_t) {
  const message = arboratorMessage.message;
  const timeout = arboratorMessage.timeout ?? 10000;
  const position = arboratorMessage.position ?? 'top-right';
  const type = arboratorMessage.type ?? 'positive';
  const icon = arboratorMessage.icon;

  Notify.create({
    message,
    timeout,
    type,
    position,
    closeBtn: 'X',
    html: true,
    icon,
  });
}

interface ArboratorGrewError_t {
  error: string | any;
  timeout?: number; // in milliseconds
}

export function notifyError(ArboratorGrewError: ArboratorGrewError_t) {
  console.error('ArboratorGrewError : ', ArboratorGrewError);

  const timeout = 0;
  if (typeof ArboratorGrewError.error === 'string') {
    Notify.create({
      message: ArboratorGrewError.error,
      type: 'negative',
      icon: 'warning',
      position: 'top', 
      closeBtn: 'X',
      timeout,
    });
    return;
  }

  let msg;
  const error = ArboratorGrewError.error;
  if (error !== undefined) {
    if (error.response) {
      if (error.response.status === 403) {
        msg = error.response.data ? error.response.data.message.message : i18n.global.t('error403');
      } else if (error.response.status === 401) {
        msg = error.response.data ? error.response.data.message.message : i18n.global.t('error401');
      } else if (error.response.status === 406) {
        const grewErrorMessage = error.response.data.message || 'Unknown error, please contact the administrators';
        msg = `Grew internal error : ${grewErrorMessage}`;
      } else if (error.response.status === 415) {
        msg = error.response.data ? error.response.data.message.message : i18n.global.t('error415');
      } else {
        msg = error.response.data ? error.response.data.message.message : `${error.response.statusText} error ${error.response.status}`;
      }
    }
  } else if (error.message !== undefined) {
    msg = error.message;
  } else {
    msg = `Oops, an unexpected error occured, please contact the administrators`;
  }
  Notify.create({
    message: msg,
    type: 'negative',
    icon: 'warning',
    closeBtn: 'X',
    position: 'top',
    timeout,
  });
}
