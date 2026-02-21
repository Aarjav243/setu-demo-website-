// Initialize GSAP Plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/* 
 * 0. Initialize Lenis Smooth Scroll
 */
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Integrate Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
});
gsap.ticker.lagSmoothing(0, 0);

/* 
 * 1. Hero Zoom-Through Canvas Animation
 */
const canvas = document.getElementById("hero-canvas");
const context = canvas.getContext("2d");

canvas.width = 1920;
canvas.height = 1080;

const frameCount = 144;
const currentFrame = index => (
    `hero_frames/frame_${(index).toString().padStart(4, '0')}.jpg`
);

const images = [];
const frameData = {
    frame: 0
};

// Preload first frame immediately
const img0 = new Image();
img0.src = currentFrame(0);
img0.onload = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img0, 0, 0, canvas.width, canvas.height);
};

// Preload the rest
for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
}

// Master timeline for the Hero Section
const heroTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: ".hero-container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
    }
});

heroTimeline.to(frameData, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    duration: 4,
    onUpdate: () => {
        if (images[frameData.frame]) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(images[frameData.frame], 0, 0, canvas.width, canvas.height);
        }
    }
});

heroTimeline.to("#hero-canvas", {
    scale: 25,
    filter: "blur(15px)",
    opacity: 0,
    ease: "power2.in",
    duration: 1.5
}, ">");

heroTimeline.to(".hero-overlay", {
    opacity: 1,
    ease: "power2.out",
    duration: 1
}, "<");


/* 
 * 2. Auto-Scroll Logic
 */
function initAutoScroll() {
    const autoScroll = gsap.to(window, {
        duration: 8,
        scrollTo: ".about-section",
        ease: "power1.inOut",
        onComplete: () => removeListeners()
    });

    function killAutoScroll() {
        if (autoScroll) {
            autoScroll.kill();
            removeListeners();
        }
    }

    function removeListeners() {
        window.removeEventListener('wheel', killAutoScroll);
        window.removeEventListener('touchmove', killAutoScroll);
        window.removeEventListener('keydown', killAutoScroll);
        window.removeEventListener('mousedown', killAutoScroll);
    }

    window.addEventListener('wheel', killAutoScroll);
    window.addEventListener('touchmove', killAutoScroll);
    window.addEventListener('keydown', killAutoScroll);
    window.addEventListener('mousedown', killAutoScroll);
}

/* 
 * 3. About Section: Ember Rise Reveal
 */
function initAboutEmberAnimation() {
    const section = document.querySelector(".about-section");
    const aboutList = document.querySelector(".about-list");
    const canvas = document.getElementById("about-ember-canvas");
    if (!aboutList || !canvas) return;

    const ctx = canvas.getContext("2d");

    // Split each list item into words, preserving strong tags
    const items = aboutList.querySelectorAll(".about-list-item");
    items.forEach(item => {
        const strong = item.querySelector("strong");
        const strongText = strong ? strong.innerText : "";
        const fullText = item.innerText;
        // Split by words but avoid splitting the strong text internally if possible
        // Actually simpler: just wrap everything in spans word by word
        const words = fullText.split(/\s+/);
        item.innerHTML = words.map(word => {
            if (strongText && word.includes(strongText.split(/\s+/)[0])) {
                return `<span class="about-strong">${word}</span>`;
            }
            return `<span>${word}</span>`;
        }).join(" ");
    });

    const spans = aboutList.querySelectorAll("span");

    // Particle Configuration
    let particles = [];
    function resize() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: canvas.height + 20,
            size: Math.random() * 3 + 1,
            speedY: Math.random() * 1.5 + 0.5,
            speedX: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.5 + 0.2,
            life: 1
        };
    }

    // Animation Loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const progress = ScrollTrigger.getById("about-trigger")?.progress || 0;
        if (progress > 0.01 && progress < 0.99 && particles.length < 60) {
            particles.push(createParticle());
        }

        particles = particles.filter(p => p.y > -20 && p.opacity > 0);

        particles.forEach(p => {
            ctx.globalAlpha = p.opacity * (progress * 1.8);
            ctx.fillStyle = "#ff7b00";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            p.y -= p.speedY;
            p.x += p.speedX;
            p.opacity -= 0.002;
        });

        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // Word Reveal Timeline
    gsap.to(spans, {
        scrollTrigger: {
            id: "about-trigger",
            trigger: ".about-section",
            start: "top 75%",
            end: "bottom 25%",
            scrub: 1,
            onUpdate: (self) => {
                // Dimly light up bullets as we scroll
                const items = aboutList.querySelectorAll(".about-list-item");
                const index = Math.floor(self.progress * items.length);
                items.forEach((item, i) => {
                    if (i <= index) item.classList.add('active');
                    else item.classList.remove('active');
                });
            }
        },
        opacity: 1,
        color: "#ffffff",
        textShadow: "0 0 15px rgba(255, 123, 0, 0.6)",
        stagger: 0.05,
        ease: "none"
    });
}
initAboutEmberAnimation();

/* 
 * 4. Teams Section Animations
 */
gsap.utils.toArray('.team-category').forEach((category, i) => {
    // 4a. Header Entrance
    gsap.from(category.querySelector('.category-heading'), {
        scrollTrigger: {
            trigger: category,
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        opacity: 0,
        x: -20,
        duration: 0.8,
        ease: "power2.out"
    });

    // 4b. 180-Degree 3D Flip Reveal + Border Glow (Scroll Entry)
    const cards = category.querySelectorAll('.team-card');
    cards.forEach(card => {
        const inner = card.querySelector('.team-card-inner');

        gsap.fromTo(inner,
            { rotateY: 180 },
            {
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                    onEnter: () => card.classList.add('glow-active'),
                    onLeaveBack: () => card.classList.remove('glow-active')
                },
                rotateY: 0,
                duration: 1.2,
                ease: "back.out(1.7)"
            }
        );
    });

    // 4c. 3D MAGNET EFFECT (Mouse Follow)
    const cardsForMagnet = category.querySelectorAll('.team-card'); // Renamed to avoid conflict
    cardsForMagnet.forEach(card => {
        const inner = card.querySelector('.team-card-inner');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within element
            const y = e.clientY - rect.top;  // y position within element

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate tilt (max 15 degrees)
            const rotateX = (centerY - y) / 10;
            const rotateY = (x - centerX) / 10;

            gsap.to(inner, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.5,
                ease: "power2.out",
                overwrite: true
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(inner, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.8,
                ease: "elastic.out(1, 0.5)",
                overwrite: true
            });
        });
    });
});

/* 
 * 5. Custom Cursor Logic
 */
const cursor = document.getElementById("custom-cursor");

window.addEventListener("mousemove", (e) => {
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out"
    });
});

const interactiveElements = document.querySelectorAll("span, .team-card, .section-title, .category-heading");
interactiveElements.forEach(el => {
    el.addEventListener("mouseenter", () => cursor.classList.add("active"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("active"));
});

/* 
 * 6. Impact Section Scrollytelling (Pure Canvas Scrubbing)
 */
function initImpactAnimation() {
    const impactSection = document.getElementById("impact-section");
    const canvas = document.getElementById("impact-canvas");
    const ctx = canvas.getContext("2d");
    const washOverlay = document.getElementById("impact-wash");
    const particleCanvas = document.getElementById("particle-canvas");
    const ambientGlow = document.querySelector(".impact-ambient-glow");

    if (!impactSection || !canvas || !particleCanvas) return;

    // Canvas Setup
    canvas.width = 1920;  // Match your WebP resolution aspect ratio
    canvas.height = 1080;

    const problemFrameCount = 144;
    const solutionFrameCount = 192; // Restored to full sequence as requested.

    const problemFrames = [];
    const solutionFrames = [];

    const animData = {
        problemFrame: 0,
        solutionFrame: 0
    };

    // Preload Logic
    function preloadFrames(count, dir, array) {
        for (let i = 0; i < count; i++) {
            const img = new Image();
            img.src = `${dir}/frame_${i.toString().padStart(4, '0')}.jpg`;
            array.push(img);
        }
    }

    preloadFrames(problemFrameCount, "problem_frames", problemFrames);
    preloadFrames(solutionFrameCount, "solution_frames", solutionFrames);

    // Initial Draw (Problem Frame 0)
    problemFrames[0].onload = () => {
        ctx.drawImage(problemFrames[0], 0, 0, canvas.width, canvas.height);
    };

    // --- Particle System (Unchanged) ---
    let particles = [];
    const pCtx = particleCanvas.getContext('2d');
    function initParticles() {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * particleCanvas.width,
                y: Math.random() * particleCanvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: Math.random() * 0.4 - 0.2,
                speedY: Math.random() * 0.3 + 0.15,
                opacity: Math.random() * 0.35 + 0.1
            });
        }
    }
    function drawParticles() {
        pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        pCtx.fillStyle = "#ff7b00";
        particles.forEach(p => {
            pCtx.globalAlpha = p.opacity;
            pCtx.beginPath();
            pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            pCtx.fill();
            p.y += p.speedY;
            if (p.y > particleCanvas.height + 10) p.y = -10;
        });
        requestAnimationFrame(drawParticles);
    }
    initParticles();
    drawParticles();

    // --- Master GSAP Timeline ---
    const impactTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".impact-section",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            pin: true,
            anticipatePin: 1
        }
    });

    // Sequence 1: Scrub Problem Animation
    impactTl.to(animData, {
        problemFrame: problemFrameCount - 1,
        snap: "problemFrame",
        duration: 3,
        ease: "none",
        onUpdate: () => {
            if (problemFrames[animData.problemFrame]) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(problemFrames[animData.problemFrame], 0, 0, canvas.width, canvas.height);
            }
        }
    });

    impactTl.to(ambientGlow, { opacity: 0.6, duration: 1 }, "<");

    // Sequence 2: Orange Wash Crossfade
    impactTl.to(washOverlay, { opacity: 1, duration: 1.5, ease: "power2.in" }, ">");

    // Switch to Solution Frame 0 under the wash
    impactTl.add(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(solutionFrames[0], 0, 0, canvas.width, canvas.height);
    }, ">");

    impactTl.to(washOverlay, { opacity: 0, duration: 1.5, ease: "power2.out" }, ">");

    // Sequence 3: Scrub Solution Animation
    impactTl.to(animData, {
        solutionFrame: solutionFrameCount - 1,
        snap: "solutionFrame",
        duration: 4,
        ease: "none",
        onUpdate: () => {
            // Only update if we are past the wash sequence
            if (solutionFrames[animData.solutionFrame]) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(solutionFrames[animData.solutionFrame], 0, 0, canvas.width, canvas.height);
            }
        }
    }, "<"); // Overlap with wash clearing for smoothness

    // Ambient glow pulse
    impactTl.to(ambientGlow, {
        opacity: 0.9, scale: 1.3, duration: 1, yoyo: true, repeat: 1, ease: "sine.inOut"
    }, "<-1");

    impactTl.to({}, { duration: 2 }); // End buffer
}


/* 
 * 7. Services Section "Fire Border" Animation
 */
gsap.utils.toArray(".service-item").forEach(item => {
    ScrollTrigger.create({
        trigger: item,
        start: "top 85%",
        onEnter: () => item.classList.add('fire-active'),
        onLeaveBack: () => item.classList.remove('fire-active')
    });
});

/* 
 * 8. Building the Future "Background Glow" & Reveal
 */
gsap.utils.toArray(".future-item").forEach(item => {
    gsap.from(item, {
        scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
            onEnter: () => {
                item.classList.add('animating');
                item.classList.add('glow-active');
            },
            onLeaveBack: () => {
                item.classList.remove('animating');
                item.classList.remove('glow-active');
            }
        },
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });
});


// INITIALIZE
document.documentElement.style.scrollBehavior = 'auto';
initImpactAnimation();
ScrollTrigger.refresh();
initAutoScroll();
window.addEventListener('load', () => ScrollTrigger.refresh());
window.addEventListener('resize', () => ScrollTrigger.refresh());
