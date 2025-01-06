<script setup lang="ts">
import TextToSpeech from '@/components/TextToSpeech.vue';
import VoiceRecorder from '@/components/VoiceRecorder.vue';
import { ref } from 'vue';

const countdown = ref<'start' | 'stop'>('stop');

function onAudioEnd() {
  countdown.value = 'start';
}
</script>

<template>
  <main class="min-h-dvh flex flex-col items-center justify-center gap-y-4 py-12">
    <div
      class="w-[min(100%,500px)] mx-auto py-8 px-6 border border-gray-300 rounded-lg grid gap-8 shadow-md"
    >
      <header class="text-center text-gray-600 grid gap-4">
        <h1 class="text-2xl font-bold">Microphone check<span class="text-pink-500">.</span></h1>
        <p>Listen the question and record your answer!</p>
      </header>

      <TextToSpeech
        text="Could you introduce yourself by sharing anything you'd like about your background and interests?"
        @onAudioEnd="onAudioEnd"
      />

      <VoiceRecorder :countdown="countdown" />
    </div>
  </main>
</template>
