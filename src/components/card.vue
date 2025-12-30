<template>
    <div 
        ref="mycard" 
        class="card bg-zinc-900" 
        :style="{'--mouse-x': localX + 'px', '--mouse-y': localY + 'px'}"
    >
        <slot />
    </div>
</template>

<style lang="scss" scoped>
.card {
    width: 400px;
    height: 200px;
    border-radius: 15px;
    overflow: hidden;
    position: relative;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    .card-header {
        padding: 20px;
        color: white;
    }
}

.card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    border: 2px solid transparent;
    background: 
        linear-gradient(#1c1b1b, #1c1b1b) padding-box,
        radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(204, 65, 65, 1), transparent 150px) border-box;
    pointer-events: none;
    transition: background 0.2s ease;
}
</style>

<script setup lang="ts">
const props = defineProps<{
    x: number;
    y: number;
}>();

import { ref, computed } from 'vue';
const mouseX = ref(0);
const mouseY = ref(0);
const mycard = ref<HTMLDivElement | null>(null);

const localX = computed(() => {
    if (!mycard.value) return 0;
    const rect = mycard.value.getBoundingClientRect();
    return props.x - rect.left;
});

const localY = computed(() => {
    if (!mycard.value) return 0;
    const rect = mycard.value.getBoundingClientRect();
    return props.y - rect.top;
});


</script>