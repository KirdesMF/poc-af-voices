<script setup lang="ts">
import { computed } from 'vue';

type Props = {
  timeLeft: number;
  numberOfBars?: number;
};

const props = withDefaults(defineProps<Props>(), {
  numberOfBars: 20,
});

const waveformBars = computed(() => {
  // Generate random heights between 10 and 100
  return Array.from({ length: props.numberOfBars }, () => Math.floor(Math.random() * 90 + 10));
});

const progressWidth = computed(() => {
  // Calculate progress percentage based on timeLeft
  const progress = (150 - props.timeLeft) / 150; // 150 is total time
  return progress * 200; // 200 is SVG viewBox width
});
</script>

<template>
  <svg class="h-11 w-full" viewBox="0 0 200 100" preserveAspectRatio="none">
    <!-- Define the mask -->
    <defs>
      <mask id="waveform-mask">
        <rect
          v-for="(height, index) in waveformBars"
          :key="index"
          :x="index * (200 / numberOfBars)"
          :y="50 - height / 2"
          :height="height"
          :width="(200 / numberOfBars) * 0.6"
          :rx="(200 / numberOfBars) * 0.3"
          fill="white"
        />
      </mask>
    </defs>

    <!-- Background bars (gray) -->
    <rect
      v-for="(height, index) in waveformBars"
      :key="index"
      :x="index * (200 / numberOfBars)"
      :y="50 - height / 2"
      :height="height"
      :width="(200 / numberOfBars) * 0.6"
      :rx="(200 / numberOfBars) * 0.3"
      class="fill-gray-200"
    />

    <!-- Animated fill using mask -->
    <rect
      x="0"
      y="0"
      height="100"
      class="fill-pink-500 transition-all"
      :mask="'url(#waveform-mask)'"
      :width="progressWidth"
    />
  </svg>
</template>
