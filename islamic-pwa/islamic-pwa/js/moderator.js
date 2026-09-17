(() => {
  'use strict';

  const ADMIN_ENDPOINT = './api/admin/stories';
  const STATUS_LABELS = {
    pending: 'На проверке',
    published: 'Опубликована',
    rejected: 'Отклонена',
  };

  const state = {
    token: '',
    status: 'pending',
    stories: [],
    pendingAction: null,
    loading: false,
  };

  const elements = {
    accessCard: document.querySelector('#accessCard'),
    accessForm: document.querySelector('#accessForm'),
    adminToken: document.querySelector('#adminToken'),
    connectButton: document.querySelector('#connectButton'),
    accessStatus: document.querySelector('#accessStatus'),
    dashboard: document.querySelector('#dashboard'),
    disconnectButton: document.querySelector('#disconnectButton'),
    statusFilter: document.querySelector('#statusFilter'),
    refreshButton: document.querySelector('#refreshButton'),
    queueSummary: document.querySelector('#queueSummary'),
    dashboardStatus: document.querySelector('#dashboardStatus'),
    storiesList: document.querySelector('#storiesList'),
    confirmDialog: document.querySelector('#confirmDialog'),
    confirmForm: document.querySelector('#confirmForm'),
    confirmTitle: document.querySelector('#confirmTitle'),
    confirmCopy: document.querySelector('#confirmCopy'),
    confirmAction: document.querySelector('#confirmAction'),
    confirmMark: document.querySelector('#confirmMark'),
  };

  function setMessage(element, message = '', kind = '') {
    element.textContent = message;
    element.classList.remove('is-error', 'is-success');
    if (kind) element.classList.add(`is-${kind}`);
  }

  function setLoading(isLoading) {
    state.loading = isLoading;
    elements.connectButton.disabled = isLoading;
    elements.refreshButton.disabled = isLoading;
    elements.statusFilter.disabled = isLoading;
    elements.disconnectButton.disabled = isLoading;
    elements.storiesList.setAttribute('aria-busy', String(isLoading));
    elements.connectButton.textContent = isLoading && elements.dashboard.hidden ? 'Проверка…' : 'Открыть очередь';
    elements.refreshButton.replaceChildren();
    const refreshSymbol = document.createElement('span');
    refreshSymbol.setAttribute('aria-hidden', 'true');
    refreshSymbol.textContent = isLoading ? '…' : '↻';
    elements.refreshButton.append(refreshSymbol, document.createTextNode(isLoading ? ' Загрузка' : ' Обновить'));
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Дата не указана';
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  async function readResponse(response) {
    const type = response.headers.get('content-type') || '';
    if (!type.includes('application/json')) {
      throw new Error('Сервер вернул неожиданный ответ. Откройте панель через локальный сервер Nur.');
    }
    const payload = await response.json();
    if (!response.ok) {
      const message = payload?.error?.message || 'Не удалось выполнить запрос к серверу.';
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  async function api(path = '', options = {}) {
    const response = await fetch(`${ADMIN_ENDPOINT}${path}`, {
      ...options,
      cache: 'no-store',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'X-Admin-Token': state.token,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });
    return readResponse(response);
  }

  function setDashboardVisible(visible) {
    elements.dashboard.hidden = !visible;
    elements.accessCard.hidden = visible;
  }

  function createButton(label, action, id, style = 'button-secondary') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `button ${style}`;
    button.textContent = label;
    button.dataset.action = action;
    button.dataset.storyId = id;
    return button;
  }

  function renderEmpty() {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = state.status === 'pending'
      ? 'В очереди пока нет историй. Новые отправки появятся здесь после обновления.'
      : 'В этой категории пока нет историй.';
    elements.storiesList.replaceChildren(empty);
  }

  function actionButtonsFor(story) {
    const actions = document.createElement('div');
    actions.className = 'story-actions';

    if (story.status !== 'published') {
      actions.append(createButton('Опубликовать', 'published', story.id, 'button-primary'));
    }
    if (story.status !== 'pending') {
      actions.append(createButton('Вернуть на проверку', 'pending', story.id, 'button-secondary'));
    }
    if (story.status !== 'rejected') {
      actions.append(createButton('Отклонить', 'rejected', story.id, 'button-danger'));
    }
    return actions;
  }

  function createStoryCard(story) {
    const card = document.createElement('article');
    card.className = `story-card is-${story.status}`;

    const topline = document.createElement('div');
    topline.className = 'story-topline';

    const badge = document.createElement('span');
    badge.className = `status-badge is-${story.status}`;
    badge.textContent = STATUS_LABELS[story.status] || story.status;

    const meta = document.createElement('div');
    meta.className = 'story-meta';
    const created = document.createElement('span');
    created.textContent = `Получена: ${formatDate(story.createdAt)}`;
    meta.append(created);
    if (story.reviewedAt) {
      const reviewed = document.createElement('span');
      reviewed.textContent = `· Проверена: ${formatDate(story.reviewedAt)}`;
      meta.append(reviewed);
    }
    topline.append(badge, meta);

    const title = document.createElement('h3');
    title.textContent = story.title;
    const author = document.createElement('p');
    author.className = 'story-author';
    author.textContent = `Автор: ${story.author}`;
    const body = document.createElement('p');
    body.className = 'story-body';
    body.textContent = story.body;

    card.append(topline, title, author, body, actionButtonsFor(story));
    return card;
  }

  function renderStories() {
    if (!state.stories.length) {
      renderEmpty();
      return;
    }
    const fragment = document.createDocumentFragment();
    for (const story of state.stories) fragment.append(createStoryCard(story));
    elements.storiesList.replaceChildren(fragment);
  }

  function updateSummary(total) {
    const suffix = total === 1 ? 'история' : total >= 2 && total <= 4 ? 'истории' : 'историй';
    elements.queueSummary.textContent = `${total} ${suffix}`;
  }

  async function loadStories({ opening = false } = {}) {
    if (!state.token || state.loading) return;
    setLoading(true);
    setMessage(elements.dashboardStatus, '');
    if (opening) setMessage(elements.accessStatus, 'Проверяем доступ к очереди…');

    try {
      const payload = await api(`?status=${encodeURIComponent(state.status)}&limit=100`);
      state.stories = Array.isArray(payload.stories) ? payload.stories : [];
      setDashboardVisible(true);
      renderStories();
      updateSummary(Number(payload.total) || 0);
      setMessage(elements.dashboardStatus, 'Очередь обновлена.', 'success');
      setMessage(elements.accessStatus, '');
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Не удалось связаться с сервером.';
      if (error?.status === 401) {
        state.token = '';
        elements.adminToken.value = '';
        setDashboardVisible(false);
        setMessage(elements.accessStatus, 'Токен не принят. Проверьте его и попробуйте снова.', 'error');
        elements.adminToken.focus();
      } else if (opening) {
        setMessage(elements.accessStatus, detail, 'error');
      } else {
        setMessage(elements.dashboardStatus, detail, 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  function openConfirmation(story, nextStatus) {
    const label = STATUS_LABELS[nextStatus];
    state.pendingAction = { id: story.id, nextStatus };
    elements.confirmTitle.textContent = `${label}?`;
    elements.confirmCopy.textContent = `История «${story.title}» получит статус «${label.toLowerCase()}». Это можно изменить позже в этой панели.`;
    elements.confirmAction.textContent = label;
    elements.confirmAction.className = `button ${nextStatus === 'rejected' ? 'button-danger' : 'button-primary'}`;
    elements.confirmMark.textContent = nextStatus === 'rejected' ? '!' : nextStatus === 'published' ? '✓' : '↻';

    if (typeof elements.confirmDialog.showModal === 'function') {
      elements.confirmDialog.showModal();
      elements.confirmAction.focus();
      return;
    }

    const confirmed = window.confirm(`Изменить статус истории на «${label.toLowerCase()}»?`);
    if (confirmed) updateStoryStatus(state.pendingAction);
    else state.pendingAction = null;
  }

  async function updateStoryStatus(action) {
    if (!action || state.loading) return;
    setLoading(true);
    setMessage(elements.dashboardStatus, 'Сохраняем решение…');
    try {
      await api(`/${encodeURIComponent(action.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: action.nextStatus }),
      });
      state.pendingAction = null;
      // Release the mutation lock before refreshing the list. `loadStories`
      // deliberately ignores duplicate user refreshes while a request is active.
      setLoading(false);
      await loadStories();
      setMessage(elements.dashboardStatus, 'Статус истории сохранён.', 'success');
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Не удалось изменить статус истории.';
      setMessage(elements.dashboardStatus, detail, 'error');
    } finally {
      setLoading(false);
    }
  }

  function disconnect() {
    state.token = '';
    state.stories = [];
    state.pendingAction = null;
    elements.adminToken.value = '';
    elements.statusFilter.value = 'pending';
    state.status = 'pending';
    elements.storiesList.replaceChildren();
    elements.queueSummary.textContent = '';
    setMessage(elements.dashboardStatus, '');
    setDashboardVisible(false);
    setMessage(elements.accessStatus, 'Доступ закрыт. Токен удалён из памяти этой страницы.', 'success');
    elements.adminToken.focus();
  }

  elements.accessForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const token = elements.adminToken.value.trim();
    if (!token) {
      setMessage(elements.accessStatus, 'Введите административный токен.', 'error');
      elements.adminToken.focus();
      return;
    }
    state.token = token;
    loadStories({ opening: true });
  });

  elements.statusFilter.addEventListener('change', () => {
    state.status = elements.statusFilter.value;
    loadStories();
  });

  elements.refreshButton.addEventListener('click', () => loadStories());
  elements.disconnectButton.addEventListener('click', disconnect);

  elements.storiesList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action][data-story-id]');
    if (!button || state.loading) return;
    const story = state.stories.find((item) => item.id === button.dataset.storyId);
    if (!story || !Object.hasOwn(STATUS_LABELS, button.dataset.action)) return;
    openConfirmation(story, button.dataset.action);
  });

  elements.confirmForm.addEventListener('submit', (event) => {
    const intent = event.submitter?.value;
    if (intent !== 'confirm' || !state.pendingAction) {
      state.pendingAction = null;
      return;
    }
    event.preventDefault();
    const action = state.pendingAction;
    state.pendingAction = null;
    elements.confirmDialog.close();
    updateStoryStatus(action);
  });

  // A token lives only in this JavaScript variable. Clear it when the page is
  // discarded as an extra guard; it is never written to any browser storage.
  window.addEventListener('pagehide', () => {
    state.token = '';
    elements.adminToken.value = '';
  });
})();
