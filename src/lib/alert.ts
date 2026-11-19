import { Alert as NativeAlert, Platform, type AlertButton } from 'react-native';

/**
 * Drop-in for react-native's Alert. On the web `Alert.alert` is a no-op, so
 * confirmations (like "delete") never appeared. Here we fall back to the
 * browser's own dialogs.
 */
export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[]) {
    if (Platform.OS !== 'web') {
      NativeAlert.alert(title, message, buttons);
      return;
    }

    const text = message ? `${title}\n\n${message}` : title;
    const cancel = buttons?.find((button) => button.style === 'cancel');
    const actions = buttons?.filter((button) => button !== cancel) ?? [];

    if (actions.length === 0) {
      window.alert(text);
      cancel?.onPress?.();
      return;
    }

    if (window.confirm(text)) {
      actions[0].onPress?.();
    } else {
      cancel?.onPress?.();
    }
  },
};
