import { h, render } from 'preact';
import { bindActionCreators } from 'redux';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';

import { loadLocale } from 'utils/loadLocale';
import { parseMessage } from 'utils/post-message';
import { ConnectedRoot } from 'components/root';
import { Profile } from 'components/profile';
import { store } from 'store';
import { NODE_ID, BASE_URL } from 'common/constants';
import { StaticStore } from 'common/static-store';
import { getConfig } from 'common/api';
import { fetchHiddenUsers } from 'store/user/actions';
import { restoreCollapsedThreads } from 'store/thread/actions';
import { locale, theme, rawParams, styling } from 'common/settings';
import { isThemeStyling, setThemeStyling } from 'common/theme';
import { Theme } from 'common/types';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

async function init(): Promise<void> {
  __webpack_public_path__ = `${BASE_URL}/web/`;

  const node = document.getElementById(NODE_ID);

  if (!node) {
    throw new Error("Remark42: Can't find root node.");
  }

  const messages = await loadLocale(locale).catch(() => ({}));
  const boundActions = bindActionCreators({ fetchHiddenUsers, restoreCollapsedThreads }, store.dispatch);

  node.innerHTML = '';

  window.addEventListener('message', (evt) => {
    const data = parseMessage(evt);
    if (data.theme) {
      setTheme(data.theme);
    }
    if (isThemeStyling(data.styling)) {
      setThemeStyling(data.styling);
      store.dispatch({ type: 'STYLING/SET', styling: data.styling });
    }
  });

  if (theme) {
    setTheme(theme);
  }
  if (styling) {
    setThemeStyling(styling);
    store.dispatch({ type: 'STYLING/SET', styling });
  }

  boundActions.fetchHiddenUsers();
  boundActions.restoreCollapsedThreads();

  const config = await getConfig();
  StaticStore.config = {
    ...config,
    simple_view: config.simple_view || rawParams.simple_view === 'true',
  };

  render(
    <IntlProvider locale={locale} messages={messages}>
      <Provider store={store}>{rawParams.page === 'profile' ? <Profile /> : <ConnectedRoot />}</Provider>
    </IntlProvider>,
    node
  );
}

const setTheme = (theme: Theme) => {
  if (theme === 'light') {
    document.body.classList.remove('dark');
  }
  if (theme === 'dark') {
    document.body.classList.add('dark');
  }
};
