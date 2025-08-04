window.onload = () => {
    const pathEl = document.getElementById("motionPath");
    const pathLength = pathEl.getTotalLength();
    const svgWidth = 400;
    const svgHeight = 600;

    const canvas = document.getElementById("trackCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.85;

    const wormContainer = document.getElementById("wormContainer");
    const worms = [];
    const scaleFactor = 0.64;

    const wormConfigs = [
        { speed: 0.0004, start: 0.05, phase: 0, amplitude: 20, headScale: 0.28, bodyScale: 0.56, tailScale: 0.21, color: "radial-gradient(circle at 40% 60%, rgba(47, 248, 255, 0.2), rgba(255,20,147,0.15))" },
        { speed: 0.00056, start: 0.125, phase: Math.PI / 2, amplitude: 35, headScale: 0.42, bodyScale: 0.56, tailScale: 0.28, color: "radial-gradient(circle at 40% 60%, rgba(0,255,255,0.2), rgba(255,182,193,0.25))" },
        { speed: 0.00064, start: 0.2, phase: Math.PI, amplitude: 25, headScale: 0.28, bodyScale: 0.7, tailScale: 0.42, color: "radial-gradient(circle at 40% 60%, rgba(255,255,0,0.2), rgba(255,105,180,0.15))" },
        { speed: 0.00052, start: 0.275, phase: Math.PI / 3, amplitude: 20, headScale: 0.28, bodyScale: 0.56, tailScale: 0.42, color: "radial-gradient(circle at 40% 60%, rgba(255, 47, 151, 0.2), rgba(0,255,255,0.2))" },
        { speed: 0.0007, start: 0.35, phase: Math.PI * 1.5, amplitude: 35, headScale: 0.35, bodyScale: 0.77, tailScale: 0.49, color: "radial-gradient(circle at 40% 60%, rgba(255,20,147,0.1), rgba(0,255,255,0.2))" },
        { speed: 0.0005, start: 0.425, phase: Math.PI / 6, amplitude: 18, headScale: 0.56, bodyScale: 0.77, tailScale: 0.42, color: "radial-gradient(circle at 40% 60%, rgba(245, 229, 200, 0.15), rgba(255,105,180,0.3))" },
        { speed: 0.0006, start: 0.5, phase: Math.PI * 1.2, amplitude: 28, headScale: 0.49, bodyScale: 0.7, tailScale: 0.35, color: "radial-gradient(circle at 40% 60%, rgba(255,105,180,0.3), rgba(210,240,240,0.2))" },
        { speed: 0.00044, start: 0.595, phase: Math.PI / 4, amplitude: 22, headScale: 0.14, bodyScale: 0.42, tailScale: 0.28, color: "radial-gradient(circle at 40% 60%, rgba(235,255,255,0.15), rgba(200,255,200,0.15))" },
        { speed: 0.00076, start: 0.68, phase: Math.PI * 0.75, amplitude: 20, headScale: 0.63, bodyScale: 0.42, tailScale: 0.42, color: "radial-gradient(circle at 40% 60%, rgba(255,255,255,0.1), rgba(0,255,255,0.2))" },
        { speed: 0.00042, start: 0.785, phase: Math.PI / 8, amplitude: 16, headScale: 0.448, bodyScale: 0.672, tailScale: 0.308, color: "radial-gradient(circle at 40% 60%, rgba(235,235,255,0.22), rgba(180,230,255,0.15))" },
        { speed: 0.0008, start: 0.85, phase: Math.PI / 1.7, amplitude: 17, headScale: 0.532, bodyScale: 0.7, tailScale: 0.392, color: "radial-gradient(circle at 40% 60%, rgba(173,255,47,0.2), rgba(255, 200, 223, 0.15))" },
        { speed: 0.001, start: 0.975, phase: Math.PI * 1.8, amplitude: 12, headScale: 0.364, bodyScale: 0.728, tailScale: 0.336, color: "radial-gradient(circle at 40% 60%, rgba(245,255,245,0.12), rgba(255,105,180,0.3))" }
    ].map(config => ({
        ...config,
        headScale: config.headScale * scaleFactor,
        bodyScale: config.bodyScale * scaleFactor,
        tailScale: config.tailScale * scaleFactor
    }));




    function createWorm(cfg, index) {
        const tail = document.createElement("div");
        tail.className = "tail";
        tail.style.background = cfg.color;
        wormContainer.appendChild(tail);

        const segments = [];
        for (let i = 0; i < 4; i++) {
            const seg = document.createElement("div");
            seg.className = "cryptobiote";
            seg.style.background = cfg.color;
            wormContainer.appendChild(seg);
            segments.push(seg);
        }

        const head = document.createElement("div");
        head.className = "head";
        head.style.background = cfg.color;
        head.innerHTML = `<div class="eye"><div class="highlight"></div></div>
                      <div class="eye"><div class="highlight"></div></div>
                      <div class="mouth-char">人</div>`;
        wormContainer.appendChild(head);

        const parts = [head, ...segments, tail];
        const worm = {
            t: cfg.start || 0,
            point: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
            speed: cfg.speed,
            phase: cfg.phase,
            amplitude: cfg.amplitude,
            color: cfg.color,
            parts,
            segmentPos: []
        };

        parts.forEach((part, i) => {
            const t = i / (parts.length - 1);
            const scale = t <= 0.5
                ? cfg.headScale + (t / 0.5) * (cfg.bodyScale - cfg.headScale)
                : cfg.bodyScale + ((t - 0.5) / 0.5) * (cfg.tailScale - cfg.bodyScale);
            part.style.transform = `translate(-50%, -50%) scale(${scale})`;
            followTarget(part, 0.06, i, worm.point, worm.segmentPos);
        });

        worms.push(worm);
    }

    wormConfigs.forEach((cfg, index) => {
        setTimeout(() => createWorm(cfg, index), index * 500); // 每个虫子延迟 800ms 依次出现
    });

    function fadeCanvas() {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0,0,0,0.01)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-over"; // 或 "source-over lighter "
    }

    function updateWorm(worm, index) {
        worm.t += worm.speed;
        const progress = worm.t % 1;
        const pos = pathEl.getPointAtLength(progress * pathLength);
        const mirroredY = svgHeight - pos.y;

        const offsetX = (window.innerWidth - svgWidth) / 2;
        const offsetY = (window.innerHeight - svgHeight) / 2;

        const time = performance.now() / 1000;
        const dx = worm.amplitude * Math.cos(3 * time + worm.phase);
        const dy = worm.amplitude * Math.sin(2 * time + worm.phase);

        worm.point.x = pos.x + offsetX + dx;
        worm.point.y = mirroredY + offsetY + dy;

        const hue = (Math.sin(time * 1.5 + worm.phase + worm.t * 10) * 180 + 180 + index * 30) % 360;
        ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.25)`; // 最后一项是轨迹点透明度

        ctx.beginPath();
        ctx.arc(worm.point.x, worm.point.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    function animateWorms() {
        fadeCanvas(); // 每帧添加残影遮罩
        worms.forEach((worm, index) => updateWorm(worm, index));
        requestAnimationFrame(animateWorms);
    }

    animateWorms();

    function followTarget(el, delay = 0.06, index = 0, targetPoint, segmentStore) {
        let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        function step() {
            let target = targetPoint;
            if (index > 0 && segmentStore[index - 1]) {
                target = segmentStore[index - 1];
            }
            const dx = target.x - pos.x;
            const dy = target.y - pos.y;
            pos.x += dx * delay;
            pos.y += dy * delay;

            el.style.left = pos.x + "px";
            el.style.top = pos.y + "px";
            segmentStore[index] = { ...pos };

            requestAnimationFrame(step);
        }
        step();
    }

    function scheduleRefresh() {
        const now = new Date();
        const seconds = now.getSeconds();
        const delay = (60 - seconds) * 1000;

        setTimeout(() => {
            location.reload();
            setInterval(() => {
                location.reload();
            }, 60000);
        }, delay);
    }

    scheduleRefresh();
};
