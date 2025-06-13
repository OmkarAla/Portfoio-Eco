// Load component HTML files into index.html
function loadComponents() {
    const components = [
        { id: 'hero-section', url: 'components/hero.html' },
        { id: 'about-section', url: 'components/about.html' },
        { id: 'projects-section', url: 'components/projects.html' },
        { id: 'contact-section', url: 'components/contact.html' }
    ];

    components.forEach(comp => {
        fetch(comp.url)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load ${comp.url}: ${response.status}`);
                return response.text();
            })
            .then(data => {
                const container = document.getElementById(comp.id);
                if (container) {
                    container.innerHTML = data;
                } else {
                    console.error(`Container #${comp.id} not found`);
                }
            })
            .catch(error => console.error(`Error loading ${comp.url}:`, error));
    });
}

// Initialize Three.js scene with a glowing cube
function initThreeJS() {
    const canvasContainer = document.getElementById('three-canvas');
    if (!canvasContainer) {
        console.error('Three.js canvas container not found');
        return;
    }

    // Create scene
    const scene = new THREE.Scene();

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasContainer.appendChild(renderer.domElement);

    // Create glowing cube
    const geometry = new THREE.BoxGeometry(2, 2, 2); // Larger cube for visibility
    const material = new THREE.MeshStandardMaterial({
        color: 0x00ffff, // Cyan color
        emissive: 0x00ffff, // Glowing effect
        emissiveIntensity: 0.3,
        opacity: 0.8,
        transparent: true
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Add lighting for better visibility
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft ambient light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Directional light for highlights
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add OrbitControls for interaction
    let controls;
    try {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.update();
    } catch (error) {
        console.error('Failed to initialize OrbitControls:', error);
    }

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.005; // Slower rotation
        cube.rotation.y += 0.005;
        if (controls) controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Contact form validation
function initFormValidation() {
    const form = document.getElementById('contact-form');
    if (!form) {
        console.error('Contact form not found');
        return;
    }
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        const formMessage = document.getElementById('form-message');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        formMessage.classList.add('hidden');
        if (!name || !email || !message) {
            formMessage.textContent = 'Please fill in all fields.';
            formMessage.classList.remove('hidden');
            return;
        }
        if (!emailRegex.test(email)) {
            formMessage.textContent = 'Please enter a valid email address.';
            formMessage.classList.remove('hidden');
            return;
        }

        formMessage.textContent = 'Message sent successfully!';
        formMessage.classList.remove('text-red-600', 'hidden');
        formMessage.classList.add('text-green-600');
        form.reset();
    });
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    loadComponents();

    // Poll for Three.js canvas and form due to asynchronous loading
    const maxAttempts = 50;
    let attempts = 0;
    const checkElements = setInterval(() => {
        attempts++;
        const canvas = document.getElementById('three-canvas');
        const form = document.getElementById('contact-form');
        if (canvas) initThreeJS();
        if (form) initFormValidation();
        if ((canvas && form) || attempts >= maxAttempts) {
            clearInterval(checkElements);
            if (!canvas) console.error('Three.js canvas not loaded after 5 seconds');
            if (!form) console.error('Contact form not loaded after 5 seconds');
        }
    }, 100);
});