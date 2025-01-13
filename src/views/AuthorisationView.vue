<script setup lang="ts">
import CircleLoader from '@/components/CircleLoader.vue';
import { useDevicesList, usePermission } from '@vueuse/core';
import { computed, ref } from 'vue';

const isRequesting = ref(false);

// Check if microphone permission is already granted
const { ensurePermissions } = useDevicesList({
  requestPermissions: false,
  constraints: { audio: true },
});

const microphoneAccess = usePermission('microphone');
const hasMicrophoneAccess = computed(() => microphoneAccess.value === 'granted');

async function requestPermission() {
  isRequesting.value = true;
  await ensurePermissions();
  isRequesting.value = false;
}
</script>

<template>
  <main class="min-h-dvh flex flex-col items-center justify-center gap-y-4">
    <div
      class="w-[min(100%,500px)] mx-auto py-8 px-6 border border-gray-300 rounded-lg grid gap-8 shadow-md"
    >
      <h1 class="text-center text-gray-600 text-2xl font-bold">
        Authorisation<span class="text-pink-500">.</span>
      </h1>

      <p class="text-center text-gray-600 text-lg">
        <template v-if="!hasMicrophoneAccess">
          To continue with the tutorial, please allow microphone access when prompted by your
          browser. This permission is needed to detect your voice commands.
        </template>

        <template v-else> Everything is good your can start the tutorial. </template>
      </p>

      <Component
        :class="[
          'bg-pink-500 text-white py-2 px-4 rounded-full grid place-items-center w-max mx-auto min-w-40',
          isRequesting ? 'bg-pink-500/25' : 'bg-pink-500',
        ]"
        :is="hasMicrophoneAccess ? 'router-link' : 'button'"
        :to="hasMicrophoneAccess ? '/tutorial' : undefined"
        :disabled="isRequesting"
        @click="!hasMicrophoneAccess && requestPermission()"
      >
        <template v-if="isRequesting">
          <CircleLoader class="w-6 h-6 animate-spin" />
        </template>
        <template v-else-if="!hasMicrophoneAccess"> Authorise microphone </template>
        <template v-else>
          <span>Start Tutorial</span>
        </template>
      </Component>
    </div>
  </main>
</template>
