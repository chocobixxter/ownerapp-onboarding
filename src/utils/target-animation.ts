const init = (): void => {
    // Wait for DOM to be fully loaded
    setTimeout(() => {
        const canvas = document.getElementById("overlay") as HTMLCanvasElement;
        if (!canvas) {
            console.warn("Canvas element #overlay not found");
            return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            console.warn("Canvas context not available");
            return;
        }

        const target = document.querySelector(".target") as HTMLElement;
        if (!target) {
            console.warn("Target element with class .target not found");
            return;
        }

        console.log("CTA Animation initialized successfully");

        const updateCanvasSize = (): void => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        // Handle window resize
        window.addEventListener("resize", updateCanvasSize);
        updateCanvasSize();

        // Mouse position
        let mouse: { x: number | null; y: number | null } = { x: null, y: null };
        window.addEventListener("mousemove", (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        // Draw arrow function
        const drawArrow = (): void => {
            const x0 = mouse.x;
            const y0 = mouse.y;

            if (!x0 || !y0) return;

            // Get target center
            const rect = target.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            // Calculate distance to determine if we should show the arrow
            const distance = Math.sqrt((x0 - cx) ** 2 + (y0 - cy) ** 2);

            // Only show arrow if mouse is far enough from target
            if (distance < 100) return;

            // Add target size
            const a = Math.atan2(cy - y0, cx - x0);
            const x1 = cx - Math.cos(a) * (rect.width / 2 + 20);
            const y1 = cy - Math.sin(a) * (rect.height / 2 + 20);

            const midX = (x0 + x1) / 2;
            const midY = (y0 + y1) / 2;
            const offset = Math.min(150, Math.hypot(x1 - x0, y1 - y0) * 0.4);
            const t = Math.max(-1, Math.min(1, (y0 - y1) / 200));
            const controlX = midX;
            const controlY = midY + offset * t;

            const r = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
            const baseOpacity = Math.min(0.8, Math.max(0.2, (r - 100) / 500));

            // Use more visible colors with gradient
            const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
            gradient.addColorStop(0, `rgba(59, 130, 246, ${baseOpacity * 0.8})`); // Blue start
            gradient.addColorStop(1, `rgba(147, 51, 234, ${baseOpacity})`); // Purple end

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
            ctx.shadowBlur = 4;

            // Draw curve
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.quadraticCurveTo(controlX, controlY, x1, y1);
            ctx.setLineDash([8, 4]);
            ctx.lineDashOffset = Date.now() * 0.01; // Animated dash
            ctx.stroke();
            ctx.restore();

            // Draw arrowhead
            const angle = Math.atan2(y1 - controlY, x1 - controlX);
            const headLength = 12;

            ctx.fillStyle = `rgba(147, 51, 234, ${baseOpacity})`;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(
                x1 - headLength * Math.cos(angle - Math.PI / 6),
                y1 - headLength * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                x1 - headLength * Math.cos(angle + Math.PI / 6),
                y1 - headLength * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        };

        // Animation loop
        const animate = (): void => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawArrow();
            requestAnimationFrame(animate);
        };

        animate();
    }, 100); // Small delay to ensure DOM is ready
};

export default init; 