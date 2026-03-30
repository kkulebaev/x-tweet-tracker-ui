<script setup lang="ts">
import AccountsPage from './pages/AccountsPage.vue';
</script>

<template>
  <main class="app">
    <header class="header">
      <div>
        <div class="title">x-tweet-tracker</div>
        <div class="subtitle">Admin UI</div>
      </div>
    </header>

    <section class="content">
      <AccountsPage />
    </section>
  </main>
</template>

<style scoped>
.app {
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji",
    "Segoe UI Emoji";
  color: #0f172a;
  padding: 24px;
  max-width: 960px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 16px;
}

.title {
  font-size: 22px;
  font-weight: 700;
}

.subtitle {
  font-size: 13px;
  color: #475569;
}

.content {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
}
</style>
