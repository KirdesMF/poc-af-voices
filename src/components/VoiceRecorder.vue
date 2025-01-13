<script setup lang="ts">
import WaveBars from '@/components/WaveBars.vue';
import { useUserMedia } from '@vueuse/core';
import { Mic, Pause, Play, Square } from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import gsap from 'gsap';

type Props = {
  countdown: 'start' | 'stop';
};

type Emits = {
  'on-display-continue': [void];
};

type RecorderState = 'recording' | 'playing' | 'paused' | 'waiting' | 'stopped';

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

let countInterval: ReturnType<typeof setInterval> | null = null;
let recordingInterval: ReturnType<typeof setInterval> | null = null;

const countBeforeRecording = ref(5); // seconds
const timeLeftRecording = ref(150); // 2:30 minutes in seconds
const recorderState = ref<RecorderState>('waiting');
const mediaRecorder = ref<MediaRecorder | null>(null);
const audioChunks = ref<BlobPart[]>([]);
const audioBlob = ref<Blob | null>(null);
const audioUrl = ref('');
const audioRef = ref<HTMLAudioElement | null>(null);
const textRef = ref<HTMLElement | null>(null);
const countdownRef = ref<HTMLElement | null>(null);
const recorderRef = ref<HTMLElement | null>(null);
const micRef = ref<HTMLElement | null>(null);
const countTextRef = ref<HTMLElement | null>(null);

const { stream, enabled } = useUserMedia({ constraints: { audio: true } });

const formattedTimeLeft = computed(() => {
  const minutes = Math.floor(timeLeftRecording.value / 60);
  const seconds = timeLeftRecording.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const isButtonDisabled = computed(() => {
  return (
    recorderState.value === 'paused' ||
    recorderState.value === 'stopped' ||
    recorderState.value === 'playing'
  );
});

const timeline = gsap.timeline({ paused: true });

function startRecording() {
  if (!stream.value) return;

  // Create a new MediaRecorder from the stream
  mediaRecorder.value = new MediaRecorder(stream.value);

  // Clear out any previous leftover chunks
  audioChunks.value = [];

  // As the MediaRecorder records, it will emit data in "chunks"
  mediaRecorder.value.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.value.push(event.data);
    }
  };

  // When the recording stops, create a Blob from the collected chunks
  mediaRecorder.value.onstop = () => {
    audioBlob.value = new Blob(audioChunks.value, { type: 'audio/webm' });
    audioUrl.value = URL.createObjectURL(audioBlob.value);
  };

  // Start recording
  mediaRecorder.value.start();
  recorderState.value = 'recording';

  // Animate recorder appearance
  gsap.to(countdownRef.value, {
    opacity: 0,
    duration: 0.5,
  });
  gsap.to(recorderRef.value, {
    opacity: 1,
    duration: 0.5,
  });

  // Countdown the time left recording
  if (recordingInterval) {
    clearInterval(recordingInterval);
  }

  recordingInterval = setInterval(() => {
    timeLeftRecording.value--;

    if (timeLeftRecording.value === 0) {
      clearInterval(recordingInterval!);
      recordingInterval = null;
    }
  }, 1000);
}

function stopRecording() {
  clearInterval(recordingInterval!);
  recordingInterval = null;

  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop();
    recorderState.value = 'stopped';
    emit('on-display-continue');
  }
}

function playRecording() {
  if (audioRef.value) {
    audioRef.value.play();
    recorderState.value = 'playing';

    audioRef.value.onended = () => {
      recorderState.value = 'stopped';
    };
  }
}

function pauseRecording() {
  if (audioRef.value) {
    audioRef.value.pause();
    recorderState.value = 'paused';
  }
}

const RECORDER_MAP = {
  recording: {
    action: stopRecording,
    content: 'Recording...',
    icon: Square,
  },
  stopped: {
    action: playRecording,
    content: 'Recording stopped',
    icon: Play,
  },
  playing: {
    action: pauseRecording,
    content: 'Playing...',
    icon: Pause,
  },
  paused: {
    action: playRecording,
    content: 'Paused',
    icon: Play,
  },
  waiting: {
    action: () => null,
    content: 'The record will start in...',
    icon: null,
  },
};

function setRecorderButton(state: RecorderState) {
  RECORDER_MAP[state].action();
}

watch(
  () => props.countdown,
  (value) => {
    if (value === 'start') {
      enabled.value = true;
      timeline.play();

      if (countInterval) {
        clearInterval(countInterval);
      }

      countInterval = setInterval(() => {
        countBeforeRecording.value--;
        if (countBeforeRecording.value === 0) {
          clearInterval(countInterval!);
          countInterval = null;

          // Start recording
          startRecording();
        }
      }, 1000);
    }
  },
);

// Initial gsap setup
onMounted(() => {
  // Initial setup
  gsap.set(textRef.value, { yPercent: 100 });
  gsap.set(recorderRef.value, { opacity: 0 });
  gsap.set(countTextRef.value, { opacity: 0 });

  // Create animation timeline
  timeline
    .to(textRef.value, {
      yPercent: 0,
      duration: 0.9,
      ease: 'power2.out',
    })
    .to(
      countdownRef.value,
      {
        opacity: 1,
        duration: 0.5,
      },
      '<',
    )
    .to(micRef.value, {
      opacity: 0,
      duration: 0.9,
    })
    .to(
      countTextRef.value,
      {
        opacity: 1,
        duration: 1,
      },
      '<',
    );
});

// Cleanup intervals on unmount
onUnmounted(() => {
  if (countInterval) {
    clearInterval(countInterval);
  }

  if (recordingInterval) {
    clearInterval(recordingInterval);
  }
});
</script>

<template>
  <div class="grid gap-4">
    <div class="grid gap-1 grid-rows-[min-content_1fr]">
      <!-- text -->
      <p class="overflow-hidden place-self-center row-end-1">
        <span ref="textRef" class="text-teal-600 block">
          {{ RECORDER_MAP[recorderState].content }}
        </span>
      </p>

      <!-- countdown before recording -->
      <div ref="countdownRef" class="col-span-full row-start-2 grid gap-1 px-2 place-items-center">
        <div class="bg-pink-500 rounded-full grid place-items-center h-12 w-12">
          <Mic ref="micRef" class="text-white col-span-full row-span-full h-7 w-auto" />
          <span
            ref="countTextRef"
            class="text-white font-bold text-2xl col-span-full row-span-full tabular-nums"
          >
            {{ countBeforeRecording }}
          </span>
        </div>
      </div>

      <!-- recorder -->
      <div
        ref="recorderRef"
        class="col-span-full row-start-2 grid grid-cols-[48px_1fr_auto] items-center gap-3 border border-gray-300 rounded-full p-2 w-[min(100%,265px)] place-self-center z-10"
      >
        <audio ref="audioRef" :src="audioUrl" />

        <!-- button recording -->
        <button
          class="bg-pink-500 rounded-full h-12 w-12 grid place-items-center text-white"
          @click="setRecorderButton(recorderState)"
        >
          <component :is="RECORDER_MAP[recorderState].icon" />
        </button>

        <!-- waveform -->
        <WaveBars :time-left="timeLeftRecording" />

        <!-- time left recording -->
        <time class="tabular-nums" :datetime="`PT${timeLeftRecording}S`">
          {{ formattedTimeLeft }}
        </time>
      </div>
    </div>

    <!-- continue button -->
    <Transition
      enter-active-class=" duration-600 ease-in-out"
      leave-active-class=" duration-600 ease-in-out"
      enter-from-class="transform opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="transform opacity-0"
    >
      <button
        v-if="isButtonDisabled"
        class="bg-pink-500 rounded-full flex gap-2 items-center justify-center px-4 py-2 text-white w-max disabled:opacity-50 disabled:cursor-not-allowed place-self-center"
      >
        Continue
      </button>
    </Transition>
  </div>
</template>
