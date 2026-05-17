<script lang="ts">
    import { onDestroy } from 'svelte'
    import { SvelteSet } from 'svelte/reactivity'

    let containerRef: HTMLElement

    interface Particle {
        id: number
        emoji: string
        startAngle: string
        radius: string
        duration: string
        leaving: boolean
    }

    let particles: Particle[] = $state([])

    let uidCounter = 0
    const nextId = () => ++uidCounter

    const leaveTimers = new SvelteSet<ReturnType<typeof setTimeout>>()

    const emojiBase = [
        '🎵', '🎶', '🎼', '🎙', '🎤', '🎧', '📻', '🔊', '🔉', '🔈',
        '🎸', '🎹', '🎺', '🎻', '🥁', '🎷', '🪗', '🪘', '🪕', '🪈',
        '🎚', '🎛', '📯', '🔔', '✨', '💫', '🌟', '⭐', '🌠', '🔥',
        '💥', '🌈', '🌊', '🌙', '❤️', '🧡', '💛', '💚', '💙', '💜',
        '🖤', '🤍', '🤎', '💗', '🕺', '💃', '🎉', '🎊', '🥳', '🪩',
        '🌸', '🌺', '🌻', '🍀', '🌿', '🫧', '🌴', '🍄', '☀️'
    ]

    const shuffle = (array: string[]) => {
        const newArr = [...array]
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
        }
        return newArr
    }

    const layers = [
        { count: 4, radius: 40 },
        { count: 8, radius: 70 },
        { count: 12, radius: 100 },
    ]

    const spawnParticles = () => {
        if (particles.length > 0) return

        leaveTimers.forEach((t) => clearTimeout(t))
        leaveTimers.clear()

        const shuffledPool = shuffle(emojiBase)
        let poolIndex = 0
        const newParticles: Particle[] = []

        layers.forEach((layer) => {
            for (let i = 0; i < layer.count; i++) {
                const startAngle = (360 / layer.count) * i
                const emoji = shuffledPool[poolIndex % shuffledPool.length] || ''
                poolIndex++

                newParticles.push({
                    id: nextId(),
                    emoji,
                    startAngle: `${startAngle}deg`,
                    radius: `${layer.radius}px`,
                    duration: '6s',
                    leaving: false,
                })
            }
        })

        particles = newParticles
    }

    const handleMouseLeave = () => {
        particles.forEach((p) => (p.leaving = true))

        const t = setTimeout(() => {
            particles = []
            leaveTimers.delete(t)
        }, 400)

        leaveTimers.add(t)
    }

    onDestroy(() => {
        leaveTimers.forEach((t) => clearTimeout(t))
        leaveTimers.clear()
        particles = []
    })
</script>

<div
        class="particle-wrapper"
        role="presentation"
        onmouseenter={spawnParticles}
        onmouseleave={handleMouseLeave}
        bind:this={containerRef}
>
    <slot></slot>

    {#each particles as p (p.id)}
        <div
                class="orbit-item"
                class:is-leaving={p.leaving}
                style="--start-angle: {p.startAngle}; --radius: {p.radius}; --duration: {p.duration};"
        >
            <span class="p-emoji">{p.emoji}</span>
        </div>
    {/each}
</div>

<style>
    .particle-wrapper {
        position: relative;
        display: inline-block;
        overflow: visible !important;
    }

    .orbit-item {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        will-change: transform, opacity;
        animation: burst 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards,
        loop var(--duration) linear infinite 0.4s,
        fade-in 0.4s ease forwards;
        transition: opacity 0.4s ease;
    }

    .orbit-item.is-leaving {
        opacity: 0;
    }

    .p-emoji {
        font-size: 16px;
        user-select: none;
    }

    @keyframes burst {
        0% {
            transform: rotate(var(--start-angle)) translateY(0) scale(0);
        }
        100% {
            transform: rotate(var(--start-angle)) translateY(calc(-1 * var(--radius))) scale(1);
        }
    }

    @keyframes loop {
        from {
            transform: rotate(var(--start-angle)) translateY(calc(-1 * var(--radius)));
        }
        to {
            transform: rotate(calc(var(--start-angle) + 360deg)) translateY(calc(-1 * var(--radius)));
        }
    }

    @keyframes fade-in {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style>