<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  apiAddAccount,
  apiDeleteAccount,
  apiListAccounts,
  apiToggleAccount,
  type AccountDTO,
} from '../lib/api';

const loading = ref(false);
const error = ref<string | null>(null);
const accounts = ref<AccountDTO[]>([]);

const addInput = ref('');
const adding = ref(false);

const sortedAccounts = computed(() => {
  return [...accounts.value].sort((a, b) => a.xUsername.localeCompare(b.xUsername));
});

async function refresh() {
  loading.value = true;
  error.value = null;
  try {
    const r = await apiListAccounts();
    accounts.value = r.accounts;
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value = false;
  }
}

function normalizeUsername(raw: string): string {
  const s = raw.trim();
  if (!s) return '';

  try {
    if (/^https?:\/\//i.test(s)) {
      const u = new URL(s);
      const host = u.hostname.replace(/^www\./, '').toLowerCase();
      if (host === 'x.com' || host === 'twitter.com') {
        const parts = u.pathname.split('/').filter(Boolean);
        const first = parts[0] ?? '';
        if (first && !['home', 'i', 'intent', 'search', 'hashtag', 'share'].includes(first.toLowerCase())) {
          return first.replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, '');
        }
      }
    }
  } catch {
    // ignore
  }

  return s.replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, '');
}

async function onAdd() {
  const one = normalizeUsername(addInput.value);
  if (!one) return;

  adding.value = true;
  error.value = null;
  try {
    await apiAddAccount(one);
    addInput.value = '';
    await refresh();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    adding.value = false;
  }
}

async function onToggle(a: AccountDTO) {
  error.value = null;
  try {
    await apiToggleAccount(a.id, !a.enabled);
    await refresh();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

async function onDelete(a: AccountDTO) {
  const ok = window.confirm(`Удалить @${a.xUsername}?`);
  if (!ok) return;

  error.value = null;
  try {
    await apiDeleteAccount(a.id);
    await refresh();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

onMounted(() => {
  void refresh();
});
</script>

<template>
  <section class="panel">
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="btn" type="button" :disabled="loading" @click="refresh">🔄 Обновить</button>
      </div>

      <form class="add" @submit.prevent="onAdd">
        <input
          v-model="addInput"
          class="input"
          placeholder="Добавить: юзернейм или ссылка (например kkulebaev / https://x.com/kkulebaev)"
          :disabled="adding"
        />
        <button class="btn primary" type="submit" :disabled="adding || !normalizeUsername(addInput)">
          ➕ Добавить
        </button>
      </form>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div v-if="loading" class="muted">Загрузка…</div>

    <table v-else class="table">
      <thead>
        <tr>
          <th>Аккаунт</th>
          <th>Статус</th>
          <th>since_id</th>
          <th style="width: 1%"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in sortedAccounts" :key="a.id">
          <td>
            <a :href="`https://x.com/${a.xUsername}`" target="_blank" rel="noreferrer">@{{ a.xUsername }}</a>
          </td>
          <td>
            <button class="pill" type="button" :class="a.enabled ? 'on' : 'off'" @click="onToggle(a)">
              {{ a.enabled ? '✅ включён' : '⛔ выключен' }}
            </button>
          </td>
          <td>
            <code>{{ a.sinceId ?? '—' }}</code>
          </td>
          <td>
            <button class="btn danger" type="button" @click="onDelete(a)">🗑 Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!loading && accounts.length === 0" class="muted">Список пуст — добавь аккаунт выше</div>
  </section>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.toolbar-left {
  display: flex;
  gap: 8px;
}

.add {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: flex-end;
  min-width: 320px;
}

.input {
  flex: 1;
  min-width: 280px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
}

.btn {
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.btn.primary {
  background: #0ea5e9;
  border-color: #0284c7;
  color: white;
}

.btn.danger {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pill {
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  padding: 6px 10px;
  background: white;
  cursor: pointer;
  font-size: 13px;
}

.pill.on {
  border-color: #86efac;
  background: #dcfce7;
}

.pill.off {
  border-color: #fecaca;
  background: #fee2e2;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  padding: 10px 6px;
  vertical-align: middle;
}

.error {
  background: #fee2e2;
  border: 1px solid #fecaca;
  padding: 10px 12px;
  border-radius: 10px;
  color: #991b1b;
  white-space: pre-wrap;
}

.muted {
  color: #475569;
  font-size: 14px;
}
</style>
