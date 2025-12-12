
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

    document.addEventListener('DOMContentLoaded', init3DBackground);


    // --- Calculator Logic ---
    const weightInput = document.getElementById('weight');
    const weightUnitText = document.getElementById('weightUnitText');
    
    const heightCmInput = document.getElementById('heightCm');
    const heightFtInput = document.getElementById('heightFt');
    const heightInInput = document.getElementById('heightIn');
    
    const metricGroup = document.getElementById('heightMetricGroup');
    const imperialGroup = document.getElementById('heightImperialGroup');
    const heightHelp = document.getElementById('heightHelp');
    
    const dobInput = document.getElementById('dob');
    const ageInput = document.getElementById('age');
    
    // State to track current units
    let currentWeightUnit = 'kg'; // 'kg' or 'lbs'
    let currentHeightUnit = 'cm'; // 'cm' or 'ft'

    function setWeightUnit(unit) {
        currentWeightUnit = unit;
        weightUnitText.textContent = unit;
        // Optional: Update placeholder or convert value if desired
        if (unit === 'kg') {
            weightInput.placeholder = "e.g. 70";
        } else {
            weightInput.placeholder = "e.g. 150";
        }
    }

    function setHeightUnit(unit) {
        currentHeightUnit = unit;
        // Clear inputs to avoid confusion
        heightCmInput.value = '';
        heightFtInput.value = '';
        heightInInput.value = '';
        heightHelp.textContent = '';

        if (unit === 'cm') {
            metricGroup.classList.remove('d-none');
            imperialGroup.classList.add('d-none');
            heightCmInput.required = true;
            heightFtInput.required = false;
        } else {
            metricGroup.classList.add('d-none');
            imperialGroup.classList.remove('d-none');
            heightCmInput.required = false;
            heightFtInput.required = true;
        }
    }

    function calculateAge() {
        const dob = new Date(dobInput.value);
        const today = new Date();
        if (dobInput.value) {
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            ageInput.value = age >= 0 ? age : 0;
        } else {
            ageInput.value = "";
        }
    }

    function updateHeightConversion() {
        let text = "";
        
        if (currentHeightUnit === 'cm') {
            // Convert CM to Ft/In
            const cm = parseFloat(heightCmInput.value);
            if (cm > 0) {
                const totalInches = cm / 2.54;
                const ft = Math.floor(totalInches / 12);
                const inches = Math.round(totalInches % 12);
                text = `Equals approx: ${ft}ft ${inches}in`;
            }
        } else {
            // Convert Ft/In to CM
            const ft = parseFloat(heightFtInput.value) || 0;
            const inch = parseFloat(heightInInput.value) || 0;
            if (ft > 0 || inch > 0) {
                const totalInches = (ft * 12) + inch;
                const cm = Math.round(totalInches * 2.54);
                text = `Equals approx: ${cm}cm`;
            }
        }
        heightHelp.textContent = text;
    }

    function calculateBMI(event) {
        event.preventDefault();
        
        // 1. Get Weight in KG
        let weightKg = parseFloat(weightInput.value);
        if (currentWeightUnit === 'lbs') {
            weightKg = weightKg * 0.453592; // Convert lbs to kg
        }

        // 2. Get Height in Meters
        let heightM = 0;
        if (currentHeightUnit === 'cm') {
            const cm = parseFloat(heightCmInput.value);
            if (cm > 0) heightM = cm / 100;
        } else {
            const ft = parseFloat(heightFtInput.value) || 0;
            const inch = parseFloat(heightInInput.value) || 0;
            const totalInches = (ft * 12) + inch;
            if (totalInches > 0) {
                heightM = (totalInches * 0.0254); // Convert inches to meters
            }
        }

        // 3. Calculate
        let bmi = 0;
        if (weightKg > 0 && heightM > 0) {
            bmi = weightKg / (heightM * heightM);
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
        const tipsList = document.getElementById('tipsList');

        const roundedBMI = bmi.toFixed(1);
        bmiValueEl.textContent = roundedBMI;
        
        // Reset styles
        bmiValueEl.className = 'bmi-value';
        bmiCategoryEl.className = 'bmi-category';
        gaugeFill.className = 'bmi-gauge-fill';
        bmiMessage.className = 'alert mt-4 mb-0 py-2 small shadow-sm border-0';

        let category = '', colorClass = '', widthPercent = 0, message = '';
        let tips = [];

        if (bmi < 18.5) {
            category = 'Underweight'; colorClass = 'underweight'; widthPercent = 25;
            message = "You may need to gain some weight. Consult a nutritionist.";
            bmiMessage.classList.add('alert-primary');
            tips = [
                "Eat more frequently. Slowly work up to 5 to 6 smaller meals during the day.",
                "Choose nutrient-rich foods like whole grain breads, pastas, fruits, nuts, and dairy.",
                "Try smoothies and shakes made with milk and fresh or frozen fruit.",
                "Add healthy calories like cheese, nuts, and seeds to your dishes."
            ];
        } else if (bmi >= 18.5 && bmi <= 24.9) {
            category = 'Healthy Weight'; colorClass = 'healthy'; widthPercent = 50;
            message = "Great job! You have a healthy body weight.";
            bmiMessage.classList.add('alert-success');
            tips = [
                "Maintain your balance of healthy eating and regular physical activity.",
                "Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity a week.",
                "Stay hydrated and prioritize sleep for overall well-being.",
                "Continue monitoring your weight periodically."
            ];
        } else if (bmi >= 25 && bmi <= 29.9) {
            category = 'Overweight'; colorClass = 'overweight'; widthPercent = 75;
            message = "You are slightly above ideal weight. Exercise recommended.";
            bmiMessage.classList.add('alert-warning');
            tips = [
                "Watch your portion sizes and try to avoid second helpings.",
                "Increase your daily physical activity. Walking is a great start!",
                "Choose water over sugary drinks.",
                "Fill half your plate with vegetables and fruits."
            ];
        } else {
            category = 'Obese'; colorClass = 'obese'; widthPercent = 100;
            message = "Health risk indicated. Please consult a doctor.";
            bmiMessage.classList.add('alert-danger');
            tips = [
                "Consult a healthcare professional for a personalized weight loss plan.",
                "Start with low-impact exercises like swimming or walking to protect your joints.",
                "Keep a food diary to become more aware of your eating habits.",
                "Focus on small, sustainable changes rather than drastic diets."
            ];
        }

        // Populate Tips
        tipsList.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');

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
        document.getElementById('heightHelp').textContent = '';
        document.getElementById('age').value = '';
        // Reset to default units
        document.getElementById('weightKg').click();
        document.getElementById('heightCmOption').click();
    }
