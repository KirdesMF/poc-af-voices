<script lang="ts" setup>
import AudioAnimation from '@/components/AudioAnimation.vue';
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
const audioAnimation = ref<InstanceType<typeof AudioAnimation> | null>(null);
const splitText = props.text.split(' ');
const wordDuration = computed(() => {
  if (!audio.value) return 0;
  return audio.value.duration / splitText.length;
});

function onPlay() {
  audio.value?.play();
  audioAnimation.value?.start();

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
  audioAnimation.value?.stop();
}

defineExpose({
  onPlay,
});
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-y-3">
    <audio ref="audio" src="/speech/introduce.mp3" @ended="onAudioEnded"></audio>

    <AudioAnimation ref="audioAnimation" class="w-32 h-32" />

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
