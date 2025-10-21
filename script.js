// =======================================================================
// script.js - Lógica Principal para Empoderamiento Financiero
// Contiene la inicialización de Chart.js y las funciones interactivas.
// =======================================================================

// --- Configuración e Inicialización de Firebase (Adaptado de index.html) ---

// Se han actualizado las URLs de Firebase a una versión más reciente (10.0.0) para resolver el error 404.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, setLogLevel } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// ! IMPORTANTE: Estas variables deben ser configuradas en tu entorno real (GitHub Actions, etc.)
// En un entorno de prueba estático, mantendremos las variables vacías, pero se ejecutan por si acaso.
const apiKey = ""; 
const llmApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

let db;
let auth;
let userId = null;
let isAuthReady = false;

// Variables globales simuladas (se recomienda inyectar desde el entorno en un proyecto real)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

if (firebaseConfig) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    setLogLevel('Debug');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userId = user.uid;
        } else {
            if (initialAuthToken) {
                try {
                    await signInWithCustomToken(auth, initialAuthToken);
                } catch (error) {
                    console.error("Error signing in with custom token:", error);
                    await signInAnonymously(auth);
                }
            } else {
                await signInAnonymously(auth);
            }
            userId = auth.currentUser?.uid || crypto.randomUUID();
        }
        isAuthReady = true;
    });
}

// --- Funciones Auxiliares de Chart.js ---

const tooltipTitleCallback = {
    plugins: {
        tooltip: {
            callbacks: {
                title: function(tooltipItems) {
                    const item = tooltipItems[0];
                    let label = item.chart.data.labels[item.dataIndex];
                    if (Array.isArray(label)) {
                        return label.join(' ');
                    } else {
                        return label;
                    }
                }
            }
        }
    }
};

const wrapLabel = (label) => {
    const maxLength = 16;
    if (typeof label === 'string' && label.length > maxLength) {
        const words = label.split(' ');
        const lines = [];
        let currentLine = '';
        words.forEach(word => {
            if ((currentLine + word).length > maxLength) {
                lines.push(currentLine.trim());
                currentLine = '';
            }
            currentLine += word + ' ';
        });
        lines.push(currentLine.trim());
        return lines;
    }
    return label;
};

const processLabels = (labels) => labels.map(wrapLabel);

// --- Inicialización de Gráficos Chart.js ---

const initCharts = () => {
    // Gráfico de la Infancia (Dona)
    const childhoodCtx = document.getElementById('childhoodChart')?.getContext('2d');
    if (childhoodCtx) {
        new Chart(childhoodCtx, {
            type: 'doughnut',
            data: {
                labels: ['Paga Semanal', 'Regalos', 'Pequeños Trabajos'],
                datasets: [{
                    label: 'Fuentes de Ingreso',
                    data: [60, 25, 15],
                    backgroundColor: ['#00A6FB', '#F5B700', '#00E08C'],
                    borderColor: '#fff',
                    borderWidth: 4,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...tooltipTitleCallback.plugins,
                    legend: { position: 'bottom' }
                },
                cutout: '60%'
            }
        });
    }

    // Gráfico de la Adolescencia (Línea)
    const adolescenceCtx = document.getElementById('adolescenceChart')?.getContext('2d');
    if (adolescenceCtx) {
        new Chart(adolescenceCtx, {
            type: 'line',
            data: {
                labels: ['Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5'],
                datasets: [{
                    label: 'Ahorro con Interés Compuesto',
                    data: [100, 210, 331, 464, 610],
                    backgroundColor: 'rgba(245, 183, 0, 0.2)',
                    borderColor: '#F5B700',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { ...tooltipTitleCallback.plugins },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) { return '$' + value; }
                        }
                    }
                }
            }
        });
    }

    // Gráfico de Joven Adulto (Radar)
    const youngAdultCtx = document.getElementById('youngAdultChart')?.getContext('2d');
    if (youngAdultCtx) {
        new Chart(youngAdultCtx, {
            type: 'radar',
            data: {
                labels: processLabels(['Bajo Riesgo (CETES)', 'Riesgo Moderado (ETFs)', 'Alto Riesgo (Acciones)']),
                datasets: [{
                    label: 'Potencial de Retorno',
                    data: [3, 6, 9],
                    backgroundColor: 'rgba(220, 0, 115, 0.2)',
                    borderColor: '#DC0073',
                    borderWidth: 2,
                    pointBackgroundColor: '#DC0073'
                }, {
                    label: 'Nivel de Riesgo',
                    data: [2, 5, 8],
                    backgroundColor: 'rgba(0, 166, 251, 0.2)',
                    borderColor: '#00A6FB',
                    borderWidth: 2,
                    pointBackgroundColor: '#00A6FB'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { ...tooltipTitleCallback.plugins },
                scales: {
                    r: {
                        angleLines: { display: false },
                        suggestedMin: 0,
                        suggestedMax: 10
                    }
                }
            }
        });
    }

    // Gráfico de la Adultez (Pastel)
    const adulthoodCtx = document.getElementById('adulthoodChart')?.getContext('2d');
    if (adulthoodCtx) {
        new Chart(adulthoodCtx, {
            type: 'pie',
            data: {
                labels: processLabels(['Acciones Nacionales', 'Acciones Internacionales', 'Bienes Raíces', 'Bonos', 'Alternativos']),
                datasets: [{
                    label: 'Distribución de Activos',
                    data: [30, 25, 20, 15, 10],
                    backgroundColor: ['#00E08C', '#00A6FB', '#F5B700', '#DC0073', '#4b5563'],
                    borderColor: '#fff',
                    borderWidth: 4,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...tooltipTitleCallback.plugins,
                    legend: { position: 'bottom' }
                }
            }
        });
    }
};


// --- Funciones para Interacción con API (Simulada) ---

// Función de reintento exponencial (Backoff) para manejar errores de tasa de la API
const exponentialBackoffFetch = async (url, options, maxRetries = 5) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.status !== 429) { // 429: Too Many Requests
                return response;
            }
        } catch (error) {
            // Ignorar errores de conexión en reintentos
        }
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    throw new Error("API request failed after multiple retries.");
};

// Función principal para llamar al modelo Gemini
async function callGemini(systemPrompt, userQuery, useGrounding = false, responseSchema = null) {
    if (!apiKey) {
        // Simulación si la API Key no está configurada (comportamiento seguro para GitHub Pages)
        console.warn("API Key no configurada. Usando respuesta simulada.");
        return { 
            text: "Este es un plan generado mediante una simulación debido a que la API Key no está configurada. El plan incluye un Costo Estimado de $150, Ahorro Semanal Sugerido de $15, y Duración Estimada de 10 Semanas. Pasos: 1. Investigar modelos, 2. Crear un presupuesto estricto, 3. Ahorrar el monto semanal.", 
            sources: [] 
        };
    }
    
    // Si la API Key está configurada, se intenta la llamada real
    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
    };

    if (useGrounding) {
        payload.tools = [{ "google_search": {} }];
    }

    if (systemPrompt) {
        payload.config = { systemInstruction: systemPrompt };
    }

    let headers = { 'Content-Type': 'application/json' };
    let url = llmApiUrl;

    if (responseSchema) {
        payload.config = {
            ...payload.config,
            responseMimeType: "application/json",
            responseSchema: responseSchema
        };
    }

    try {
        const response = await exponentialBackoffFetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            const text = candidate.content.parts[0].text;
            let sources = [];
            const groundingMetadata = candidate.groundingMetadata;
            if (groundingMetadata && groundingMetadata.groundingAttributions) {
                sources = groundingMetadata.groundingAttributions
                    .map(attribution => ({
                        uri: attribution.web?.uri,
                        title: attribution.web?.title,
                    }))
                    .filter(source => source.uri && source.title);
            }
            return { text, sources };
        } else {
            console.error("Gemini response error:", result);
            return { text: "Error: No se pudo generar la respuesta. Revisa la consola para más detalles.", sources: [] };
        }
    } catch (error) {
        console.error("API Call Error:", error);
        return { text: "Error de conexión con la API o error de red. Intenta más tarde.", sources: [] };
    }
}


// --- Lógica Específica de Interfaz ---

async function generateGoalPlan() {
    const goalInput = document.getElementById('goalInput');
    const goalOutput = document.getElementById('goalOutput');
    const goal = goalInput.value.trim();

    if (!goal) {
        goalOutput.innerHTML = '<p class="text-red-500">Por favor, ingresa una meta de ahorro.</p>';
        goalOutput.classList.remove('hidden');
        return;
    }

    goalOutput.classList.remove('hidden');
    goalOutput.innerHTML = '<p class="text-center text-[#00A6FB] font-semibold">Generando plan... 🔄</p>';

    const systemPrompt = "Eres un planificador financiero amigable para adolescentes. Debes tomar una meta de ahorro simple y desglosarla en un plan estructurado en formato JSON. Calcula tiempos realistas basándote en un ahorro semanal moderado (máximo $20 USD o equivalente en la moneda local). La respuesta debe ser solo el JSON. No uses divisas en los campos de coste/ahorro, solo el monto numérico.";

    const userQuery = `Mi meta de ahorro es: ${goal}. Desglosa los pasos, el tiempo estimado y el ahorro semanal necesario.`;

    const responseSchema = {
        type: "OBJECT",
        properties: {
            "meta": { "type": "STRING", "description": "La meta de ahorro ingresada." },
            "costoEstimado": { "type": "STRING", "description": "Estimación de costo del artículo." },
            "ahorroSemanal": { "type": "STRING", "description": "Monto de ahorro sugerido por semana." },
            "duracionEstimada": { "type": "STRING", "description": "Duración total para alcanzar la meta (ej. 10 semanas)." },
            "pasos": {
                "type": "ARRAY",
                "items": { "type": "STRING" }
            }
        },
        "propertyOrdering": ["meta", "costoEstimado", "ahorroSemanal", "duracionEstimada", "pasos"]
    };

    const result = await callGemini(systemPrompt, userQuery, false, responseSchema);

    try {
        const plan = JSON.parse(result.text);
        let html = `<h4 class="font-bold text-[#00A6FB] mb-2">Plan para: ${plan.meta}</h4>`;
        html += `<p><strong>Costo Estimado:</strong> $${plan.costoEstimado}</p>`;
        html += `<p><strong>Ahorro Semanal Necesario:</strong> $${plan.ahorroSemanal}</p>`;
        html += `<p><strong>Duración Estimada:</strong> ${plan.duracionEstimada}</p>`;
        html += `<h5 class="font-semibold mt-3 mb-1">Pasos Clave:</h5>`;
        html += `<ol class="list-decimal list-inside ml-4 space-y-1">`;
        plan.pasos.forEach(paso => {
            html += `<li>${paso}</li>`;
        });
        html += `</ol>`;
        goalOutput.innerHTML = html;

    } catch (e) {
        // En caso de que la respuesta de la API no sea un JSON válido o la simulación falle
        console.error("JSON parsing error:", e, result.text);
        goalOutput.innerHTML = `<p class="text-red-500">Error: El planificador no pudo generar un formato válido. Mensaje de la API: ${result.text}</p>`;
    }
}

async function explainConcept() {
    const conceptSelect = document.getElementById('conceptSelect');
    const conceptOutput = document.getElementById('conceptOutput');
    const concept = conceptSelect.value;

    if (!concept) {
        conceptOutput.innerHTML = '<p class="text-red-500">Por favor, selecciona un concepto.</p>';
        conceptOutput.classList.remove('hidden');
        return;
    }

    conceptOutput.classList.remove('hidden');
    conceptOutput.innerHTML = '<p class="text-center text-[#00E08C] font-semibold">Buscando y explicando... 🧠</p>';

    const systemPrompt = "Eres un analista financiero experto. Explica el concepto solicitado de manera clara y concisa para un adulto joven. La explicación debe ser de un solo párrafo (máximo 5 oraciones). Usa la información de Google Search para asegurar que la explicación esté actualizada y tenga contexto relevante al mercado actual.";

    const userQuery = `Explícame el concepto financiero: ${concept}.`;

    const result = await callGemini(systemPrompt, userQuery, true);

    let html = `<h4 class="font-bold text-[#00E08C] mb-2">${concept}:</h4>`;
    html += `<p class="mb-3">${result.text}</p>`;

    if (result.sources && result.sources.length > 0) {
        html += `<h5 class="font-semibold mt-2 text-sm">Fuentes:</h5>`;
        html += `<ul class="list-disc list-inside ml-4 text-xs text-gray-600 space-y-1">`;
        result.sources.forEach(source => {
            if (source.uri && source.title) {
                html += `<li><a href="${source.uri}" target="_blank" class="text-[#00A6FB] hover:underline">${source.title}</a></li>`;
            }
        });
        html += `</ul>`;
    }

    conceptOutput.innerHTML = html;
}

// --- Event Listeners y Lógica de Inicio ---

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar todos los gráficos una vez que el DOM esté listo
    initCharts();

    const generateGoalBtn = document.getElementById('generateGoalBtn');
    const explainConceptBtn = document.getElementById('explainConceptBtn');

    if (generateGoalBtn) {
        generateGoalBtn.addEventListener('click', generateGoalPlan);
    }
    if (explainConceptBtn) {
        explainConceptBtn.addEventListener('click', explainConcept);
    }
});
