<script setup lang="ts">
import { ref } from 'vue';

const audioContext = ref<AudioContext | null>(null);
const audioElement = ref<HTMLAudioElement | null>(null);
const audioAnalyser = ref<AnalyserNode | null>(null);
const audioSource = ref<MediaElementAudioSourceNode | null>(null);
const isPlaying = ref(false);

function onAudioPlay(audioElement: HTMLAudioElement) {
  isPlaying.value = true;

  if (!audioContext.value) {
    audioContext.value = new AudioContext();
    audioAnalyser.value = audioContext.value.createAnalyser();
    audioSource.value = audioContext.value.createMediaElementSource(audioElement);
    audioSource.value.connect(audioAnalyser.value);
    audioAnalyser.value.connect(audioContext.value.destination);
    audioAnalyser.value.fftSize = 2048;
  }

  function updateAudio() {
    if (!audioAnalyser.value || !isPlaying.value) return;

    const frequencyData = new Uint8Array(audioAnalyser.value.frequencyBinCount);
    audioAnalyser.value.getByteFrequencyData(frequencyData);

    const average = frequencyData.reduce((acc, curr) => acc + curr, 0) / frequencyData.length;
    const scale = 1 + (average / 255) * 0.5;

    const circles = document.querySelectorAll('.circle') as NodeListOf<HTMLDivElement>;
    circles.forEach((circle) => {
      circle.style.setProperty('--scale', String(scale));
      circle.style.animationPlayState = 'running';
      circle.style.animationDuration = `${scale * 2}s`;
    });

    requestAnimationFrame(updateAudio);
  }

  updateAudio();
}

function onAudioPause() {
  isPlaying.value = false;
  const circles = document.querySelectorAll('.circle') as NodeListOf<HTMLDivElement>;
  circles.forEach((circle) => {
    circle.style.animationPlayState = 'paused';
  });
}

function onAudioEnded() {
  isPlaying.value = false;
  const circles = document.querySelectorAll('.circle') as NodeListOf<HTMLDivElement>;
  circles.forEach((circle) => {
    circle.style.animationPlayState = 'running';
    circle.style.animationDuration = '6s';
  });
}

defineExpose({
  onAudioPlay,
  onAudioPause,
  onAudioEnded,
});
</script>

<template>
  <div class="w-32 h-32 relative">
    <div class="circle"></div>
    <div class="circle"></div>
    <div class="circle"></div>
    <div class="circle"></div>
  </div>
</template>

<style scoped>
.circle {
  --spin-duration: 6s;
  --border-size: 0.5vmin;
  --scale: 1;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 115% 140% 145% 110%/125% 140% 110% 125%;
  border: var(--border-size) solid transparent;
  mix-blend-mode: screen;

  &:nth-child(1) {
    border-color: color-mix(in hsl, #ff2f92, white 20%);
    animation: spin1 var(--spin-duration) linear infinite;
    transform-origin: 50% 50%;
  }
  &:nth-child(2) {
    border-color: color-mix(in hsl, #ff2f92, white 15%);
    animation: spin2 var(--spin-duration) linear infinite;
  }
  &:nth-child(3) {
    border-color: color-mix(in hsl, #ff2f92, white 15%);
    animation: spin3 var(--spin-duration) linear infinite;
  }
  &:nth-child(4) {
    border-color: color-mix(in hsl, #ff2f92, white 10%);
    animation: spin4 var(--spin-duration) linear infinite;
  }
}

@keyframes spin1 {
  0% {
    transform: rotate(0) scale(var(--scale));
  }
  100% {
    transform: rotate(360deg) scale(var(--scale));
  }
}

@keyframes spin2 {
  0% {
    transform: rotate(72deg) scale(var(--scale));
  }
  100% {
    transform: rotate(-288deg) scale(var(--scale));
  }
}

@keyframes spin3 {
  0% {
    transform: rotate(-144deg) scale(var(--scale));
  }
  100% {
    transform: rotate(216deg) scale(var(--scale));
  }
}

@keyframes spin4 {
  0% {
    transform: rotate(216deg) scale(var(--scale));
  }
  100% {
    transform: rotate(-144deg) scale(var(--scale));
  }
}
</style>
