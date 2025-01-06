<script setup lang="ts">
import WaveBars from '@/components/WaveBars.vue';
import { useUserMedia } from '@vueuse/core';
import { Mic, Pause, Play, Square } from 'lucide-vue-next';
import { computed, onUnmounted, ref, watch } from 'vue';

type Props = {
  countdown: 'start' | 'stop';
};

const props = defineProps<Props>();

let countInterval: ReturnType<typeof setInterval> | null = null;
let recordingInterval: ReturnType<typeof setInterval> | null = null;

const countBeforeRecording = ref(5); // seconds
const timeLeftRecording = ref(150); // 2:30 minutes in seconds
const recorderState = ref<'recording' | 'playing' | 'paused' | 'waiting' | 'stopped'>('waiting');
const mediaRecorder = ref<MediaRecorder | null>(null);
const audioChunks = ref<BlobPart[]>([]);
const audioBlob = ref<Blob | null>(null);
const audioUrl = ref('');
const audioRef = ref<HTMLAudioElement | null>(null);

const { stream, enabled } = useUserMedia({ constraints: { audio: true } });

const isCountdownStarted = computed(() => props.countdown === 'start');
const formattedTimeLeft = computed(() => {
  const minutes = Math.floor(timeLeftRecording.value / 60);
  const seconds = timeLeftRecording.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

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

function setRecorderButton() {
  if (recorderState.value === 'recording') {
    return stopRecording();
  }

  if (recorderState.value === 'stopped') {
    return playRecording();
  }
}

watch(
  () => props.countdown,
  (value) => {
    if (value === 'start') {
      enabled.value = true;

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
  <div class="grid place-items-center gap-4">
    <!-- countdown before recording -->
    <div class="grid gap-1 place-items-center">
      <p class="overflow-hidden">
        <span
          :class="[
            isCountdownStarted ? 'translate-y-0' : 'translate-y-full',
            'transition-transform duration-500 text-teal-600 block',
          ]"
        >
          The record will start in...
        </span>
      </p>

      <div class="bg-pink-500 rounded-full grid place-items-center h-12 w-12">
        <Mic
          :class="[
            'text-white col-span-full row-span-full transition-opacity duration-900 h-7 w-auto',
            isCountdownStarted ? 'opacity-0' : 'opacity-100',
          ]"
        />
        <span
          :class="[
            'text-white font-bold text-2xl col-span-full row-span-full transition-opacity duration-1000 tabular-nums',
            isCountdownStarted ? 'opacity-100' : 'opacity-0',
          ]"
        >
          {{ countBeforeRecording }}
        </span>
      </div>
    </div>

    <!-- recorder -->
    <div
      class="grid grid-cols-[48px_1fr_auto] items-center gap-3 border border-gray-300 rounded-full p-2 w-[min(100%,265px)]"
    >
      <audio ref="audioRef" :src="audioUrl" />

      <!-- button recording -->
      <button
        :class="[
          'bg-pink-500 rounded-full h-12 w-12 grid place-items-center transition-opacity duration-500 text-white',
          recorderState === 'waiting' ? 'opacity-50' : 'opacity-100',
        ]"
        @click="setRecorderButton"
        :disabled="recorderState === 'waiting'"
      >
        <Square v-if="recorderState === 'recording' || recorderState === 'waiting'" />
        <Pause v-if="recorderState === 'playing'" />
        <Play v-if="recorderState === 'stopped'" />
      </button>

      <!-- waveform -->
      <WaveBars :time-left="timeLeftRecording" />

      <time class="tabular-nums" :datetime="`PT${timeLeftRecording}S`">
        {{ formattedTimeLeft }}
      </time>
    </div>
  </div>
</template>
