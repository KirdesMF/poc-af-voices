<script setup lang="ts"></script>

<template>
  <nav class="flex gap-4 border-b border-gray-300 items-center px-6 py-4">
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/authorisation">Authorisation</RouterLink>
  </nav>
  <RouterView />
</template>
