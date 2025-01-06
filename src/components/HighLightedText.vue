<script lang="ts" setup>
import gsap from 'gsap';
import { watch } from 'vue';

type Props = {
  text: string;
  duration: number;
  triggerAnimation: boolean;
};

const props = defineProps<Props>();
const splitText = props.text.split(' ');
const wordDuration = props.duration / splitText.length;

watch(
  () => props.triggerAnimation,
  (isTriggered) => {
    if (isTriggered) {
      splitText.forEach((_, index) => {
        gsap.to(`[data-word="${splitText[index]}"]`, {
          ease: 'none',
          duration: wordDuration,
          delay: index * wordDuration,
          '--clip-path': 'inset(0 0% 0 0)',
        });
      });
    }
  },
);
</script>

<template>
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
</template>
