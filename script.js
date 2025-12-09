
    // --- 3D Background Animation Script ---
    function init3DBackground() {
        const canvas = document.querySelector('#bg-canvas');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true, // Transparent background so CSS gradient shows
            antialias: true
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create Group to hold shapes
        const shapesGroup = new THREE.Group();
        scene.add(shapesGroup);

        // Geometries
        const geometries = [
            new THREE.IcosahedronGeometry(0.8, 0),
            new THREE.OctahedronGeometry(0.7, 0),
            new THREE.TetrahedronGeometry(0.8, 0),
            new THREE.SphereGeometry(0.5, 16, 16)
        ];

        // Material - Shiny, glass-like
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 90,
            opacity: 0.4,
            transparent: true,
            side: THREE.DoubleSide,
            flatShading: true
        });

        // Add random shapes
        const shapes = [];
        const shapeCount = 30; // Number of floating objects

        for(let i = 0; i < shapeCount; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const mesh = new THREE.Mesh(geometry, material);
            
            // Random position spread
            mesh.position.set(
                (Math.random() - 0.5) * 35,
                (Math.random() - 0.5) * 35,
                (Math.random() - 0.5) * 20 - 5
            );
            
            // Random rotation
            mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                0
            );

            // Random scale
            const scale = Math.random() * 0.8 + 0.4;
            mesh.scale.set(scale, scale, scale);
            
            shapesGroup.add(mesh);
            
            // Store animation data
            shapes.push({
                mesh: mesh,
                rotSpeedX: Math.random() * 0.02 - 0.01,
                rotSpeedY: Math.random() * 0.02 - 0.01,
                floatSpeed: Math.random() * 0.01 + 0.005,
                yOffset: Math.random() * Math.PI * 2,
                baseY: mesh.position.y
            });
        }

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x667eea, 1);
        pointLight1.position.set(10, 10, 10);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x764ba2, 1);
        pointLight2.position.set(-10, -10, 10);
        scene.add(pointLight2);

        camera.position.z = 12;

        // Mouse interaction
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - window.innerWidth / 2) * 0.001;
            mouseY = (event.clientY - window.innerHeight / 2) * 0.001;
        });

        // Animation Loop
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            
            const time = clock.getElapsedTime();

            targetX = mouseX * 2;
            targetY = mouseY * 2;

            // Gentle group rotation based on mouse
            shapesGroup.rotation.y += 0.05 * (targetX - shapesGroup.rotation.y);
            shapesGroup.rotation.x += 0.05 * (targetY - shapesGroup.rotation.x);

            // Animate individual shapes
            shapes.forEach(item => {
                // Rotation
                item.mesh.rotation.x += item.rotSpeedX;
                item.mesh.rotation.y += item.rotSpeedY;
                
                // Floating motion (Sine wave)
                item.mesh.position.y = item.baseY + Math.sin(time + item.yOffset) * 1.5;
            });

            renderer.render(scene, camera);
        }

        animate();

        // Handle Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // Initialize 3D Background when DOM is ready
    document.addEventListener('DOMContentLoaded', init3DBackground);


    // --- Existing Calculator Logic ---
    const weightInput = document.getElementById('weight');
    const heightCmInput = document.getElementById('heightCm');
    const heightFtInput = document.getElementById('heightFt');
    const heightInInput = document.getElementById('heightIn');
    const weightUnitLabel = document.getElementById('weightUnit');
    const metricGroup = document.getElementById('heightMetricGroup');
    const imperialGroup = document.getElementById('heightImperialGroup');
    
    let isMetric = true;

    function toggleUnits() {
        isMetric = document.getElementById('metric').checked;
        resetForm();

        if (isMetric) {
            weightInput.placeholder = "e.g. 70";
            weightUnitLabel.innerText = "kg";
            metricGroup.classList.remove('d-none');
            imperialGroup.classList.add('d-none');
            heightCmInput.required = true;
            heightFtInput.required = false;
            heightInInput.required = false;
        } else {
            weightInput.placeholder = "e.g. 150";
            weightUnitLabel.innerText = "lbs";
            metricGroup.classList.add('d-none');
            imperialGroup.classList.remove('d-none');
            heightCmInput.required = false;
            heightFtInput.required = true;
            heightInInput.required = true;
        }
    }

    function calculateBMI(event) {
        event.preventDefault();
        let weight = parseFloat(weightInput.value);
        let bmi = 0;

        if (isMetric) {
            const heightCm = parseFloat(heightCmInput.value);
            if (heightCm > 0) bmi = weight / Math.pow(heightCm / 100, 2);
        } else {
            const ft = parseFloat(heightFtInput.value) || 0;
            const inch = parseFloat(heightInInput.value) || 0;
            const totalInches = (ft * 12) + inch;
            if (totalInches > 0) bmi = 703 * (weight / Math.pow(totalInches, 2));
        }

        if (isFinite(bmi) && bmi > 0) {
            document.getElementById('resultSection').style.display = 'none';
            setTimeout(() => displayResult(bmi), 10);
        }
    }

    function displayResult(bmi) {
        const resultSection = document.getElementById('resultSection');
        const bmiValueEl = document.getElementById('bmiValue');
        const bmiCategoryEl = document.getElementById('bmiCategory');
        const gaugeFill = document.getElementById('gaugeFill');
        const bmiMessage = document.getElementById('bmiMessage');

        const roundedBMI = bmi.toFixed(1);
        bmiValueEl.textContent = roundedBMI;
        
        bmiValueEl.className = 'bmi-value';
        bmiCategoryEl.className = 'bmi-category';
        gaugeFill.className = 'bmi-gauge-fill';
        bmiMessage.className = 'alert mt-4 mb-0 py-2 small shadow-sm border-0';

        let category = '', colorClass = '', widthPercent = 0, message = '';

        if (bmi < 18.5) {
            category = 'Underweight'; colorClass = 'underweight'; widthPercent = 25;
            message = "You may need to gain some weight. Consult a nutritionist.";
            bmiMessage.classList.add('alert-primary');
        } else if (bmi >= 18.5 && bmi <= 24.9) {
            category = 'Healthy Weight'; colorClass = 'healthy'; widthPercent = 50;
            message = "Great job! You have a healthy body weight.";
            bmiMessage.classList.add('alert-success');
        } else if (bmi >= 25 && bmi <= 29.9) {
            category = 'Overweight'; colorClass = 'overweight'; widthPercent = 75;
            message = "You are slightly above ideal weight. Exercise recommended.";
            bmiMessage.classList.add('alert-warning');
        } else {
            category = 'Obese'; colorClass = 'obese'; widthPercent = 100;
            message = "Health risk indicated. Please consult a doctor.";
            bmiMessage.classList.add('alert-danger');
        }

        bmiValueEl.classList.add(`text-${colorClass}`);
        bmiCategoryEl.textContent = category;
        bmiCategoryEl.classList.add(`text-${colorClass}`);
        gaugeFill.classList.add(`bg-${colorClass}`);
        
        gaugeFill.style.width = '0%';
        setTimeout(() => { gaugeFill.style.width = `${widthPercent}%`; }, 100);
        
        bmiMessage.textContent = message;
        resultSection.style.display = 'block';
        if(window.innerWidth < 768) resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function resetForm() {
        document.getElementById('bmiForm').reset();
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('gaugeFill').style.width = '0%';
    }
