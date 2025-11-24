// --- Configuration ---
const GOOGLE_CLIENT_ID = '216951451858-682l3j2lmstp2gpar8uihtf2pnak7ecc.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/generative-language.retriever';

// --- Application State ---
const state = {
    step: 'HOME',
    image: { original: null, mimeType: '' },
    selectedSuggestion: null,
    results: [],
    selectedImage: null,
    isRefining: false,
    maskData: null,
    brushSize: 30,
    customReplacePrompt: "",
    user: null,
    accessToken: localStorage.getItem('google_access_token'),
    tokenClient: null,
    usageCount: parseInt(localStorage.getItem('eran_studio_usage_count') || '0'),
    dailyLimit: 50
};

const MODES = [
    { title: "Clean Studio Backdrop", description: "Isolate your subject on a clean, professional background. Removes distractions while enhancing studio lighting." },
    { title: "Replace Object", description: "Select specific objects in your photo to replace with new props, furniture, or elements using AI inpainting." }
];

// --- DOM Elements ---
const views = {
    home: document.getElementById('view-home'),
    workflow: document.getElementById('view-workflow'),
    upload: document.getElementById('view-upload'),
    generating: document.getElementById('view-generating'),
    results: document.getElementById('view-results'),
    detail: document.getElementById('view-detail'),
    masking: document.getElementById('view-masking'),
    replace: document.getElementById('view-replace'),
    dashboard: document.getElementById('view-dashboard')
};

// --- Navigation ---
function showView(viewName) {
    // Hide all views
    Object.values(views).forEach(el => {
        if (el) el.classList.add('hidden');
    });

    // Show target view
    const target = views[viewName];
    if (target) {
        target.classList.remove('hidden');
        // Trigger animations if any
        const animated = target.querySelectorAll('.animate-fade-in');
        animated.forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight; /* trigger reflow */
            el.style.animation = null;
        });
    }

    state.step = viewName.toUpperCase();
    updateHeader();

    if (viewName === 'dashboard') {
        renderDashboard();
    }
}

function updateHeader() {
    const restartBtn = document.getElementById('btn-restart');
    if (state.step === 'HOME') {
        restartBtn.classList.add('hidden');
    } else {
        restartBtn.classList.remove('hidden');
    }
}

function updateAuthUI() {
    const btnLogin = document.getElementById('btn-login');
    const userProfile = document.getElementById('user-profile');
    const enterBtn = document.getElementById('btn-enter-studio');
    const loginMsg = document.getElementById('login-msg');

    if (state.user && state.accessToken) {
        btnLogin.classList.add('hidden');
        userProfile.classList.remove('hidden');
        enterBtn.disabled = false;
        loginMsg.classList.add('hidden');

        document.getElementById('user-name').textContent = state.user.name;
        document.getElementById('user-avatar').src = state.user.picture;
    } else {
        btnLogin.classList.remove('hidden');
        userProfile.classList.add('hidden');
        enterBtn.disabled = true;
        loginMsg.classList.remove('hidden');
    }
}

// --- Auth Logic (Google OAuth 2.0) ---
function initGoogleAuth() {
    state.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (tokenResponse) => {
            if (tokenResponse.access_token) {
                state.accessToken = tokenResponse.access_token;
                localStorage.setItem('google_access_token', state.accessToken);

                // Fetch user profile
                await fetchUserProfile();
                updateAuthUI();
            }
        },
    });

    // If we have a stored token, validate it
    if (state.accessToken) {
        fetchUserProfile();
    }
}

function handleLogin() {
    if (state.tokenClient) {
        state.tokenClient.requestAccessToken();
    }
}

async function fetchUserProfile() {
    if (!state.accessToken) return;

    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
            headers: { 'Authorization': `Bearer ${state.accessToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            state.user = {
                name: data.name,
                email: data.email,
                picture: data.picture
            };
            updateAuthUI();
        } else {
            // Token expired or invalid
            handleLogout();
        }
    } catch (e) {
        console.error("Failed to fetch user profile", e);
        handleLogout();
    }
}

function handleLogout() {
    state.user = null;
    state.accessToken = null;
    localStorage.removeItem('google_access_token');
    updateAuthUI();
    showView('home');
}

// --- Dashboard Logic ---
function renderDashboard() {
    if (!state.user) return;

    document.getElementById('dashboard-name').textContent = state.user.name;
    document.getElementById('dashboard-email').textContent = state.user.email;
    document.getElementById('dashboard-avatar').src = state.user.picture;

    const usageText = document.getElementById('usage-text');
    const usageBar = document.getElementById('usage-bar');
    const totalImages = document.getElementById('total-images');

    usageText.textContent = `${state.usageCount} / ${state.dailyLimit}`;
    const percentage = Math.min((state.usageCount / state.dailyLimit) * 100, 100);
    usageBar.style.width = `${percentage}%`;

    if (percentage >= 100) {
        usageBar.classList.remove('bg-blue-500');
        usageBar.classList.add('bg-red-500');
    } else {
        usageBar.classList.add('bg-blue-500');
        usageBar.classList.remove('bg-red-500');
    }

    totalImages.textContent = state.usageCount;
}

function incrementUsage() {
    state.usageCount++;
    localStorage.setItem('eran_studio_usage_count', state.usageCount.toString());
}

// --- Logic ---

function handleModeSelect(index) {
    state.selectedSuggestion = MODES[index];
    document.getElementById('mode-display').textContent = `Current Mode: ${state.selectedSuggestion.title}`;
    showView('upload');
}

function handleFileUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = reader.result;
        const matches = base64String.match(/^data:(.+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            state.image.mimeType = matches[1];
            state.image.original = matches[2];

            if (state.selectedSuggestion?.title === "Replace Object") {
                initMasking();
                showView('masking');
            } else if (state.selectedSuggestion) {
                triggerGeneration(state.image.original, state.image.mimeType, state.selectedSuggestion);
            }
        }
    };
    reader.readAsDataURL(file);
}

// --- Gemini API (OAuth 2.0 Access Token) ---
async function generateEditedImage(base64Data, mimeType, style) {
    if (!state.user || !state.accessToken) {
        alert("Please sign in first.");
        return;
    }
    if (state.usageCount >= state.dailyLimit) {
        alert("You have reached your daily generation limit.");
        return;
    }

    const prompt = `Edit this image to apply the following style: "${style.title}". Detailed instructions: ${style.description}. Ensure the output is a high-quality photograph preserving the main subject composition.`;

    const requestBody = {
        contents: [
            {
                parts: [
                    { inlineData: { mimeType: mimeType, data: base64Data } },
                    { text: prompt }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "image/jpeg"
        }
    };

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "API request failed");
        }

        const data = await response.json();
        const part = data.candidates?.[0]?.content?.parts?.[0];
        if (part && part.inlineData && part.inlineData.data) {
            incrementUsage();
            return part.inlineData.data;
        }
        throw new Error("No image generated.");
    } catch (error) {
        console.error("Error generating edit:", error);
        throw error;
    }
}

async function replaceObject(originalBase64, maskBase64, promptText) {
    if (!state.user || !state.accessToken) {
        alert("Please sign in first.");
        return;
    }
    if (state.usageCount >= state.dailyLimit) {
        alert("You have reached your daily generation limit.");
        return;
    }

    const prompt = `Use the provided black and white mask image to identify the area to edit in the original image. Replace the masked area (white area in the mask) with: "${promptText}". Blend the new object seamlessly into the original environment, matching lighting, shadows, and perspective.`;

    const requestBody = {
        contents: [
            {
                parts: [
                    { inlineData: { mimeType: "image/png", data: originalBase64 } },
                    { inlineData: { mimeType: "image/png", data: maskBase64 } },
                    { text: prompt }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "image/jpeg"
        }
    };

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || "API request failed");
        }

        const data = await response.json();
        const part = data.candidates?.[0]?.content?.parts?.[0];
        if (part && part.inlineData && part.inlineData.data) {
            incrementUsage();
            return part.inlineData.data;
        }
        throw new Error("No image generated.");
    } catch (error) {
        console.error("Error replacing object:", error);
        throw error;
    }
}

async function triggerGeneration(base64, mimeType, style) {
    showView('generating');
    document.getElementById('generating-text').innerHTML = `Applying <span class="text-white font-medium">${style.title}</span>.<br>Creating 4 distinct variations...`;

    state.results = [];
    const resultsContainer = document.getElementById('results-grid');
    resultsContainer.innerHTML = ''; // Clear previous

    try {
        const promises = Array(4).fill(null).map((_, index) =>
            generateEditedImage(base64, mimeType, style).then(data => ({ id: `gen-${Date.now()}-${index}`, data }))
        );

        const images = await Promise.all(promises);
        state.results = images;
        renderResults();
        showView('results');
    } catch (e) {
        console.error(e);
        alert(`Failed to generate edits: ${e.message}`);
        showView('upload');
    }
}

function renderResults() {
    const container = document.getElementById('results-grid');
    container.innerHTML = '';

    state.results.forEach((img, idx) => {
        const div = document.createElement('div');
        div.className = "group relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-lg cursor-pointer hover:border-zinc-500 transition-all duration-300";
        div.onclick = () => handleImageSelect(img);
        div.innerHTML = `
            <div class="h-96 w-full bg-zinc-950 relative flex items-center justify-center p-4">
                <div class="absolute inset-0 pattern-grid opacity-5"></div>
                <img src="data:image/png;base64,${img.data}" alt="Result ${idx}" class="max-w-full max-h-full object-contain shadow-xl">
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div class="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-2xl">
                        Select Variation <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </div>
                </div>
            </div>
            <div class="p-4 flex items-center justify-between border-t border-zinc-800 bg-zinc-900">
                <span class="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <i data-lucide="aperture" class="w-4 h-4"></i> Variation #${idx + 1}
                </span>
            </div>
        `;
        container.appendChild(div);
    });
    lucide.createIcons();
}

function handleImageSelect(img) {
    state.selectedImage = img;
    const imgEl = document.getElementById('detail-image');
    imgEl.src = `data:image/png;base64,${img.data}`;
    imgEl.classList.remove('opacity-50', 'blur-sm');
    document.getElementById('processing-overlay').classList.add('hidden');
    showView('detail');
}

// --- Masking ---
let isDrawing = false;
const bgCanvas = document.getElementById('canvas-bg');
const drawCanvas = document.getElementById('canvas-draw');

function initMasking() {
    if (!state.image.original) return;

    const bgCtx = bgCanvas.getContext('2d');
    const drawCtx = drawCanvas.getContext('2d');

    const img = new Image();
    img.src = `data:${state.image.mimeType};base64,${state.image.original}`;
    img.onload = () => {
        // Fit image to screen height (max 75vh) while maintaining aspect ratio
        const maxHeight = window.innerHeight * 0.75;
        let width = img.width;
        let height = img.height;

        if (height > maxHeight) {
            const ratio = maxHeight / height;
            height = maxHeight;
            width = width * ratio;
        }

        bgCanvas.width = width;
        bgCanvas.height = height;
        drawCanvas.width = width;
        drawCanvas.height = height;

        bgCtx.drawImage(img, 0, 0, width, height);

        drawCtx.clearRect(0, 0, width, height);
        drawCtx.lineCap = 'round';
        drawCtx.lineJoin = 'round';
        drawCtx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        drawCtx.lineWidth = state.brushSize;
    };
}

function getCoordinates(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    const ctx = drawCanvas.getContext('2d');
    const { x, y } = getCoordinates(e, drawCanvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(e) {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = drawCanvas.getContext('2d');
    const { x, y } = getCoordinates(e, drawCanvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function stopDrawing() {
    isDrawing = false;
    drawCanvas.getContext('2d').beginPath();
}

function generateMaskAndProceed() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = drawCanvas.width;
    tempCanvas.height = drawCanvas.height;
    const ctx = tempCanvas.getContext('2d');

    // Black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the red strokes
    ctx.drawImage(drawCanvas, 0, 0);

    // Convert red to white
    const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        // If pixel has any color/alpha (it was drawn on), make it white
        if (data[i] > 0 || data[i + 1] > 0 || data[i + 2] > 0) {
            data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; data[i + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);

    state.maskData = tempCanvas.toDataURL('image/png').split(',')[1];
    showView('replace');
}

async function executeReplacement(promptText) {
    if (!state.image.original || !state.maskData) return;

    showView('generating');
    document.getElementById('generating-text').innerHTML = `Replacing object with <span class="text-white font-medium">${promptText}</span>...`;

    state.results = [];
    const resultsContainer = document.getElementById('results-grid');
    resultsContainer.innerHTML = '';

    try {
        const promises = Array(4).fill(null).map((_, index) =>
            replaceObject(state.image.original, state.maskData, promptText).then(data => ({ id: `rep-${Date.now()}-${index}`, data }))
        );
        const images = await Promise.all(promises);
        state.results = images;
        renderResults();
        showView('results');
    } catch (e) {
        console.error(e);
        alert(`Failed to replace object: ${e.message}`);
        showView('replace');
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Cache DOM elements
    views.home = document.getElementById('view-home');
    views.workflow = document.getElementById('view-workflow');
    views.upload = document.getElementById('view-upload');
    views.generating = document.getElementById('view-generating');
    views.results = document.getElementById('view-results');
    views.detail = document.getElementById('view-detail');
    views.masking = document.getElementById('view-masking');
    views.replace = document.getElementById('view-replace');
    views.dashboard = document.getElementById('view-dashboard');

    // Auth
    document.getElementById('btn-login').onclick = handleLogin;
    document.getElementById('user-profile').onclick = () => showView('dashboard');
    document.getElementById('btn-logout').onclick = handleLogout;
    document.getElementById('btn-dashboard-back').onclick = () => showView('home');

    // Navigation Buttons
    document.getElementById('btn-enter-studio').onclick = () => showView('workflow');
    document.getElementById('btn-home-logo').onclick = () => showView('home');
    document.getElementById('btn-restart').onclick = () => {
        state.image = { original: null, mimeType: '' };
        state.results = [];
        state.selectedSuggestion = null;
        state.maskData = null;
        showView('home');
    };

    // Workflow Selection
    document.getElementById('btn-mode-clean').onclick = () => handleModeSelect(0);
    document.getElementById('btn-mode-replace').onclick = () => handleModeSelect(1);
    document.getElementById('btn-back-home').onclick = () => showView('home');

    // Upload
    document.getElementById('btn-change-workflow').onclick = () => showView('workflow');
    document.getElementById('upload-area').onclick = () => document.getElementById('file-input').click();
    document.getElementById('file-input').onchange = (e) => handleFileUpload(e.target.files[0]);

    // Masking
    document.getElementById('btn-mask-back').onclick = () => showView('upload');
    document.getElementById('btn-mask-next').onclick = generateMaskAndProceed;
    document.getElementById('btn-mask-clear').onclick = initMasking;
    document.getElementById('brush-size').oninput = (e) => {
        state.brushSize = Number(e.target.value);
        const ctx = drawCanvas.getContext('2d');
        ctx.lineWidth = state.brushSize;
    };

    // Canvas Events
    drawCanvas.addEventListener('mousedown', startDrawing);
    drawCanvas.addEventListener('mousemove', draw);
    drawCanvas.addEventListener('mouseup', stopDrawing);
    drawCanvas.addEventListener('mouseleave', stopDrawing);
    drawCanvas.addEventListener('touchstart', startDrawing);
    drawCanvas.addEventListener('touchmove', draw);
    drawCanvas.addEventListener('touchend', stopDrawing);

    // Replace Options
    const studioOptions = ["Vintage Film Camera", "Glass Vase with Lilies", "Antique Wooden Stool", "Professional Studio Softbox", "Abstract Marble Sculpture", "Pile of Old Books"];
    const optionsGrid = document.getElementById('replace-options-grid');
    studioOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = "p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-zinc-800 transition-all text-sm font-medium";
        btn.textContent = opt;
        btn.onclick = () => executeReplacement(opt);
        optionsGrid.appendChild(btn);
    });

    document.getElementById('btn-custom-replace').onclick = () => {
        const val = document.getElementById('input-custom-replace').value;
        if (val) executeReplacement(val);
    };
    document.getElementById('btn-cancel-replace').onclick = () => showView('masking');

    // Results
    document.getElementById('btn-results-start-over').onclick = () => {
        state.results = [];
        showView('home');
    };

    // Detail View
    document.getElementById('btn-detail-back').onclick = () => showView('results');
    document.getElementById('btn-save').onclick = () => {
        if (state.selectedImage) {
            const link = document.createElement('a');
            link.href = `data:image/png;base64,${state.selectedImage.data}`;
            link.download = `eran-studio-edit-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    document.getElementById('btn-remove-subject').onclick = async () => {
        if (!state.selectedImage) return;
        state.isRefining = true;
        document.getElementById('detail-image').classList.add('opacity-50', 'blur-sm');
        document.getElementById('processing-overlay').classList.remove('hidden');

        try {
            const style = { title: "Remove Subject", description: "Remove the main person or subject from the image completely. Keep the background exactly as is, filling in the empty space naturally using inpainting." };
            const newData = await generateEditedImage(state.selectedImage.data, "image/png", style);
            state.selectedImage = { id: `refined-${Date.now()}`, data: newData };
            handleImageSelect(state.selectedImage);
        } catch (e) {
            console.error(e);
            alert(`Failed to remove subject: ${e.message}`);
        } finally {
            state.isRefining = false;
            document.getElementById('detail-image').classList.remove('opacity-50', 'blur-sm');
            document.getElementById('processing-overlay').classList.add('hidden');
        }
    };

    // Init Google Auth
    // Wait for script to load
    const checkGoogle = setInterval(() => {
        if (window.google && window.google.accounts) {
            clearInterval(checkGoogle);
            initGoogleAuth();
        }
    }, 100);
});
