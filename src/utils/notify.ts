import { AxiosError } from 'axios';
import { Notify } from 'quasar';
import { i18n } from 'src/boot/i18n';

const MAX_NOTIFICATION_ERROR_ITEMS = 10;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function splitErrorEntries(message: string) {
  const normalizedMessage = message.replace(/\r\n/g, '\n').trim();

  if (!normalizedMessage.includes('sent_id =')) {
    return null;
  }

  const firstEntryIndex = normalizedMessage.indexOf('sent_id =');
  const header = normalizedMessage.slice(0, firstEntryIndex).trim().replace(/[\s:-]+$/, '');
  const entries = normalizedMessage
    .slice(firstEntryIndex)
    .split(/(?=sent_id\s*=)/g)
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (!entries.length) {
    return null;
  }

  return { header, entries };
}

function formatErrorMessage(message: string) {
  const parsedError = splitErrorEntries(message);

  if (!parsedError || parsedError.entries.length <= 1) {
    return {
      message,
      html: false,
      classes: '',
    };
  }

  const visibleEntries = parsedError.entries.slice(0, MAX_NOTIFICATION_ERROR_ITEMS);
  const hiddenEntriesCount = parsedError.entries.length - visibleEntries.length;
  const title = parsedError.header || 'Parsing errors';
  const summary = hiddenEntriesCount > 0 ? `<p class="notify-error-summary">+ ${hiddenEntriesCount} more errors</p>` : '';
  const items = visibleEntries
    .map((entry) => `<li>${escapeHtml(entry)}</li>`)
    .join('');

  return {
    message: `
      <div class="notify-error-list">
        <p class="notify-error-title">${escapeHtml(title)}</p>
        <ol>${items}</ol>
        ${summary}
      </div>
    `,
    html: true,
    classes: 'notify-error-message',
  };
}

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
  error: string | AxiosError;
  caller?: string; // Name of the function which calls the API, for better error reporting
  timeout?: number; // in milliseconds
}

export function notifyError(ArboratorGrewError: ArboratorGrewError_t) {
  console.error('ArboratorGrewError : ', ArboratorGrewError);

  const timeout = ArboratorGrewError.timeout ?? 10000;
  if (typeof ArboratorGrewError.error === 'string') {
    const formattedMessage = formatErrorMessage(ArboratorGrewError.error);

    Notify.create({
      message: formattedMessage.message,
      type: 'negative',
      icon: 'warning',
      position: 'top',
      closeBtn: 'X',
      timeout,
      html: formattedMessage.html,
      classes: formattedMessage.classes,
    });
    return;
  }

  let msg;
  const error = ArboratorGrewError.error as AxiosError;
  if (error.response) {
    if (error.response.status === 403) {
      msg = error.response.data ? error.response.data.message : i18n.global.t('error403');
    } else if (error.response.status === 404) {
      msg = error.response.data ? error.response.data.message.split('.')[0] : i18n.global.t('error404');
    } else if (error.response.status === 401) {
      msg = error.response.data ? error.response.data.message : i18n.global.t('error401');
    } else if (error.response.status === 406) {
      const grewErrorMessage = error.response.data.message || 'Unknown error, please contact the administrators';
      msg = `Grew internal error : ${grewErrorMessage}`;
    } else if (error.response.status === 415) {
      msg = error.response.data ? error.response.data.message : i18n.global.t('error415');
    } else {
      msg = error.response.data ? error.response.data.message : `${error.response.statusText} error ${error.response.status}`;
    }
  } else if (error.message !== undefined) {
    msg = error.message;
  } else {
    msg = `Oops, an unexpected error occured, please contact the administrators`;
  }
  if (ArboratorGrewError.caller) {
    msg = `[${ArboratorGrewError.caller}] ${msg}`;
  }

  const formattedMessage = formatErrorMessage(msg);

  Notify.create({
    message: formattedMessage.message,
    type: 'negative',
    icon: 'warning',
    closeBtn: 'X',
    position: 'top',
    timeout,
    html: formattedMessage.html,
    classes: formattedMessage.classes,
  });
}
