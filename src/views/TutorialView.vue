<script setup lang="ts">
import TextToSpeech from '@/components/TextToSpeech.vue';
import VoiceRecorder from '@/components/VoiceRecorder.vue';
import { nextTick, ref } from 'vue';

import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

const cardRef = ref<HTMLDivElement | null>(null);
const countdown = ref<'start' | 'stop'>('stop');
const textToSpeech = ref<InstanceType<typeof TextToSpeech> | null>(null);
function onAudioEnd() {
  countdown.value = 'start';
}

function onDisplayContinue() {
  const state = Flip.getState(cardRef.value);

  nextTick(() => {
    Flip.from(state, {
      duration: 0.5,
      ease: 'power1.inOut',
    });
  });
}
</script>

<template>
  <main class="min-h-dvh flex flex-col items-center justify-center gap-y-4 py-12">
    <button @click="textToSpeech?.onPlay" class="bg-pink-500 rounded-full py-2 px-4">
      <span class="text-white text-sm">Start demo</span>
    </button>

    <div
      ref="cardRef"
      class="w-[min(100%,500px)] mx-auto py-8 px-6 border border-gray-300 rounded-lg grid gap-8 shadow-md overflow-hidden"
    >
      <header class="text-center text-gray-600 grid gap-4">
        <h1 class="text-2xl font-bold">Microphone check<span class="text-pink-500">.</span></h1>
        <p>Listen the question and record your answer!</p>
      </header>

      <TextToSpeech
        ref="textToSpeech"
        text="Could you introduce yourself by sharing anything you'd like about your background and interests?"
        @onAudioEnd="onAudioEnd"
      />

      <VoiceRecorder :countdown="countdown" @on-display-continue="onDisplayContinue" />
    </div>
  </main>
</template>
