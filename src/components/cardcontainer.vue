<script setup lang="ts">
import Card from './card.vue';
import { ref } from 'vue';
const mouseX = ref(0);
const mouseY = ref(0);

const handleMouseMove = (event: MouseEvent) => {
    mouseX.value = event.clientX
    mouseY.value = event.clientY
};
</script>
<template>
    <div @mousemove="handleMouseMove" class="flex gap-2 h-screen w-screen justify-center items-center">
        <Card :x="mouseX" :y="mouseY"></Card>
        <Card :x="mouseX" :y="mouseY"></Card>
        <Card :x="mouseX" :y="mouseY"></Card>
    </div>
</template>
