<script setup lang="ts">
import { useDevicesList } from '@vueuse/core';

const { permissionGranted } = useDevicesList({
  requestPermissions: true,
});
</script>

<template>
  <main class="min-h-dvh flex flex-col items-center justify-center gap-y-4">
    <div
      class="w-[min(100%,500px)] mx-auto py-8 px-6 border border-gray-300 rounded-lg grid gap-8 shadow-md"
    >
      <h1 class="text-center text-gray-600 text-2xl font-bold">
        Authorisation<span class="text-pink-500">.</span>
      </h1>

      <p v-if="!permissionGranted" class="text-center text-gray-600 text-lg">
        To continue with the tutorial, please allow microphone access when prompted by your browser.
        This permission is needed to detect your voice commands.
      </p>

      <Component
        :class="[
          'bg-pink-500 text-white py-2 px-4 rounded-full grid place-items-center w-max mx-auto',
          permissionGranted ? 'bg-pink-500' : 'bg-pink-500/25',
        ]"
        :is="permissionGranted ? 'router-link' : 'span'"
        to="/tutorial"
      >
        Start Tutorial
      </Component>
    </div>
  </main>
</template>
