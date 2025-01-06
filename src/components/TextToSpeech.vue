<script lang="ts" setup>
import gsap from 'gsap';
import { computed, ref } from 'vue';

type Props = {
  text: string;
};

type Emits = {
  onAudioEnd: [value: boolean];
};

const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const audio = ref<HTMLAudioElement | null>(null);

const splitText = props.text.split(' ');
const wordDuration = computed(() => {
  if (!audio.value) return 0;
  return audio.value.duration / splitText.length;
});

function animateCircles() {}

function onPlay() {
  audio.value?.play();
  animateCircles();

  splitText.forEach((_, index) => {
    gsap.to(`[data-word="${splitText[index]}"]`, {
      ease: 'none',
      duration: wordDuration.value,
      delay: index * wordDuration.value,
      '--clip-path': 'inset(0 0% 0 0)',
    });
  });
}

function onAudioEnded() {
  emits('onAudioEnd', true);
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-y-3">
    <div>
      <audio ref="audio" src="/speech/introduce.mp3" @ended="onAudioEnded"></audio>

      <button @click="onPlay" class="bg-pink-500 rounded-full py-2 px-4">
        <span class="text-white text-sm">Start demo</span>
      </button>
    </div>

    <div class="w-32 h-32">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 191.84 192.82" class="w-full h-full">
        <g class="fill-none" stroke-width="5px">
          <path
            data-circle="1"
            class="stroke-pink-500"
            d="m121.61,4.52c45.75,12.02,66.51,74.08,51.05,119.71-13.25,39.14-55.61,73.48-95.51,64.7C30.37,178.63,5.27,113.04,23.46,64.82,37.78,26.86,81.11-6.12,121.61,4.52Z"
          />
          <path
            data-circle="2"
            class="stroke-pink-500/80"
            d="m2.51,95.19C3.26,48.75,61.31,9.87,112.37,19.49c44.93,8.46,85.95,54.75,75.26,99.03-10.61,43.96-66.76,63.38-108.71,55.02C41.74,166.12,1.88,134.13,2.51,95.19Z"
          />
          <path
            data-circle="3"
            class="stroke-pink-500/60"
            d="m113.48,10.54c48.74,10.04,78.54,62.34,65.14,109.59-12.41,43.76-59.07,73.35-105.19,61.18C28.09,169.35,1.73,121.9,11.81,77.44,22.13,31.96,67.97,1.16,113.48,10.54Z"
          />
        </g>
      </svg>
    </div>

    <p class="text-2xl flex gap-x-2 flex-wrap justify-center">
      <span
        v-for="(word, index) in splitText"
        :data-word="word"
        :key="index"
        :class="[
          'relative inline-block text-black/35 font-bold',
          'after:content-[attr(data-word)] after:absolute after:inset-0 after:w-full after:h-full after:text-gray-600 after:[clip-path:var(--clip-path)]',
        ]"
        :style="{
          '--clip-path': 'inset(0 100% 0 0)',
        }"
      >
        {{ word }}
      </span>
    </p>
  </div>
</template>
