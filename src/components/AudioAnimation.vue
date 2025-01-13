<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import gsap from 'gsap';

let tl: GSAPTimeline | null = null;

function createAnimation() {
  const ellipses = [...document.querySelectorAll('[data-animation="ellipse"]')];

  if (tl) tl.kill();

  tl = gsap.timeline({ paused: true });

  ellipses.forEach((ellipse, index) => {
    tl?.to(ellipse, {
      rotation: 360,
      transformOrigin: '50% 50%',
      duration: 4 + index * 2,
      ease: 'none',
      repeat: -1,
    });
  });

  return tl;
}

defineExpose({
  start: () => tl?.play(),
  stop: () => tl?.pause(),
});

onMounted(() => createAnimation());
onUnmounted(() => tl?.kill());
</script>

<template>
  <svg viewBox="0 0 100 100" class="overflow-visible">
    <ellipse
      data-animation="ellipse"
      class="stroke-pink-500 stroke-2 fill-none"
      rx="45"
      ry="40"
      cx="50"
      cy="50"
      stroke-opacity="1"
    />
    <ellipse
      data-animation="ellipse"
      class="stroke-pink-500 stroke-2 fill-none"
      rx="43"
      ry="40"
      stroke-opacity="0.7"
      cx="50"
      cy="50"
    />
    <ellipse
      data-animation="ellipse"
      class="stroke-pink-500 stroke-2 fill-none"
      rx="44"
      ry="40"
      stroke-opacity="0.4"
      cx="50"
      cy="50"
    />
  </svg>
</template>
