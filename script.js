const MODEL_PARAMS = {
    "weights": [
        -0.021867626048333377, 0.07529765902902277, 0.10486935820809251, 1.7247551803502603,
        0.520350377569758, 0.5323454809628684, 0.5323454809628684, 0.48626585347667944,
        0.0660957695177405, 0.021547474940641576, 0.03724807536709035, -0.008313555226041342,
        2.336550642042252, 0.07728179531574467, 0.32199983134446913, -1.1623849239725483,
        -0.12878579329428408, 1.0595481965113858e-05, -0.8083849108779856, 1.0431118087877387,
        1.1350422769831547, 0.04861856268465991, 0.7040530698442713, 0.7490449160810095
    ],
    "intercept": 0.20744328591348224,
    "feature_names": [
        "age", "bp", "sg", "al", "su", "rbc", "pc", "pcc", "ba", "bgr", "bu", "sc", "sod", "pot", "hemo", "pcv", "wc", "rc", "htn", "dm", "cad", "appet", "pe", "ane"
    ]
};

console.log("script.js loaded and MODEL_PARAMS initialized.");

function analyzeData() {
    const inputs = {
        age: parseFloat(document.getElementById('age').value) || 48,
        bp: parseFloat(document.getElementById('bp').value) || 80,
        sg: parseFloat(document.getElementById('sg').value),
        al: parseFloat(document.getElementById('al').value),
        su: parseFloat(document.getElementById('su').value),
        rbc: document.getElementById('rbc').value === 'abnormal' ? 1 : 0,
        pc: document.getElementById('pc').value === 'abnormal' ? 1 : 0,
        pcc: document.getElementById('pcc').value === 'present' ? 1 : 0,
        ba: document.getElementById('ba').value === 'present' ? 1 : 0,
        bgr: parseFloat(document.getElementById('bgr').value) || 120,
        bu: parseFloat(document.getElementById('bu').value) || 36,
        sc: parseFloat(document.getElementById('sc').value) || 1.2,
        sod: parseFloat(document.getElementById('sod').value) || 138,
        pot: parseFloat(document.getElementById('pot').value) || 4.4,
        hemo: parseFloat(document.getElementById('hemo').value) || 13,
        pcv: parseFloat(document.getElementById('pcv').value) || 40,
        wc: parseFloat(document.getElementById('wc').value) || 7500,
        rc: parseFloat(document.getElementById('rc').value) || 4.8,
        htn: document.getElementById('htn').value === 'yes' ? 1 : 0,
        dm: document.getElementById('dm').value === 'yes' ? 1 : 0,
        cad: document.getElementById('cad').value === 'yes' ? 1 : 0,
        appet: document.getElementById('appet').value === 'poor' ? 1 : 0,
        pe: document.getElementById('pe').value === 'yes' ? 1 : 0,
        ane: document.getElementById('ane').value === 'yes' ? 1 : 0
    };

    // Logistic Regression prediction
    let z = MODEL_PARAMS.intercept;
    MODEL_PARAMS.feature_names.forEach((name, index) => {
        z += inputs[name] * MODEL_PARAMS.weights[index];
    });

    // Sigmoid function
    const probability = 1 / (1 + Math.exp(-z));

    let riskLevel, riskClass;
    if (probability > 0.7) {
        riskLevel = "High";
        riskClass = "high";
    } else if (probability > 0.3) {
        riskLevel = "Moderate";
        riskClass = "moderate";
    } else {
        riskLevel = "Low";
        riskClass = "low";
    }

    // Dynamic recommendations & XAI
    const systemImpacts = calculateSystemImpacts(inputs, probability);
    const narrative = generateNarrative(riskLevel, inputs, systemImpacts);
    const remedies = generateRemedies(inputs);
    const recommendations = generateRecommendations(inputs);

    displayResult(riskLevel, riskClass, recommendations, systemImpacts, narrative, remedies);
}

function calculateSystemImpacts(inputs, prob) {
    // Heuristic breakdown for UI visualization based on known clinical importance
    return {
        filtration: Math.min(100, (inputs.sc / 1.2) * 40 + (inputs.bu / 40) * 30 + (prob * 30)),
        metabolism: Math.min(100, (inputs.bgr / 140) * 50 + (inputs.dm * 30) + (prob * 20)),
        fluidElectrolytes: Math.min(100, (inputs.pe * 40) + ((Math.abs(140 - inputs.sod) / 5) * 20) + (prob * 20)),
        oxygenation: Math.min(100, ((15 - inputs.hemo) / 5) * 60 + (inputs.ane * 30) + (prob * 10))
    };
}

function generateNarrative(level, inputs, impacts) {
    let text = `The ML model predicts a **${level}** probability of Chronic Kidney Disease based on 24 clinical markers. `;

    if (impacts.filtration > 60) text += "The analysis shows significant markers of **Filtration Distress**, particularly in creatinine and urea levels. ";
    if (inputs.dm || inputs.bgr > 140) text += "The model heavily weighted your **Metabolic Indicators** (glucose/diabetes) as key risk drivers. ";
    if (inputs.hemo < 12) text += "Reduced **Hemoglobin** levels suggest the kidneys' endocrine role (EPO production) might be affected. ";

    text += level === "High" ? "Urgent nephrology consultation is advised." : (level === "Moderate" ? "Lifestyle adjustments and periodic screening are recommended." : "Continue regular checkups to maintain renal health.");
    return text;
}

function generateRemedies(inputs) {
    const list = [];
    if (inputs.dm || inputs.bgr > 140) list.push("<strong>Glucose Control:</strong> Maintain target blood sugar levels.");
    if (inputs.htn || inputs.bp > 130) list.push("<strong>Blood Pressure:</strong> Aim for < 130/80 mmHg.");
    if (inputs.pe) list.push("<strong>Salt Restriction:</strong> Limit sodium to reduce fluid retention.");
    if (inputs.ane || inputs.hemo < 12) list.push("<strong>Iron/Erythropoietin:</strong> Discuss anemia management with a specialist.");
    list.push("<strong>Hydration:</strong> Ensure adequate water intake unless restricted.");
    return list;
}

function generateRecommendations(inputs) {
    const recs = [];
    if (inputs.sc > 1.2) recs.push("Serum creatinine is above normal range.");
    if (inputs.hemo < 12) recs.push("Low hemoglobin indicates possible renal anemia.");
    if (inputs.pe) recs.push("Pedal edema detected, suggesting fluid management issues.");
    if (inputs.dm) recs.push("Diabetes is a primary cause of kidney vessel damage.");
    return recs;
}

function displayResult(level, className, recs, impacts, narrative, remedies) {
    const badge = document.getElementById('risk-badge');
    badge.textContent = `${level} Risk`;
    badge.className = `badge ${className}`;

    const recContainer = document.getElementById('recommendations');
    recContainer.innerHTML = recs.length > 0 ? recs.map(r => `<div class="recommendation-item">${r}</div>`).join('') : '<div class="recommendation-item">No critical markers detected.</div>';

    document.getElementById('ai-narrative').innerHTML = narrative;

    const systemsImpactContainer = document.getElementById('systems-impact');
    const systemLabels = {
        filtration: "Waste Filtration",
        metabolism: "Metabolic Stability",
        fluidElectrolytes: "Fluid & Electrolytes",
        oxygenation: "Blood Oxygenation"
    };

    systemsImpactContainer.innerHTML = Object.keys(impacts).map(key => {
        const value = Math.round(Math.min(impacts[key], 100));
        const colorClass = value > 60 ? 'high' : (value > 30 ? 'moderate' : 'low');
        return `
            <div class="system-item">
                <div class="system-label">
                    <span>${systemLabels[key]}</span>
                    <span>${value}% Impact</span>
                </div>
                <div class="impact-bar">
                    <div class="impact-fill ${colorClass}" style="width: ${value}%"></div>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('dynamic-remedies').innerHTML = `<ul>${remedies.map(rem => `<li>${rem}</li>`).join('')}</ul>`;

    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById('result-step').classList.add('active');
    window.scrollTo(0, 0);
}

function resetForm() {
    document.querySelectorAll('input').forEach(i => i.value = '');
    document.querySelectorAll('select').forEach(s => {
        if (s.id === 'sg') s.value = '1.025';
        else if (s.id === 'appet') s.value = 'good';
        else if (s.id === 'rbc' || s.id === 'pc') s.value = 'normal';
        else if (s.id === 'pcc' || s.id === 'ba') s.value = 'notpresent';
        else s.value = 'no';
    });
    nextStep(1);
}

function nextStep(step) {
    try {
        console.log("Navigating to step:", step);
        const steps = document.querySelectorAll('.step');
        steps.forEach(s => s.classList.remove('active'));

        const target = document.getElementById(`step-${step}`) || document.getElementById('result-step');
        if (target) {
            target.classList.add('active');
        }

        // Update navbar active state
        const navLinks = document.querySelectorAll('.nav-links a');
        if (navLinks && navLinks.length > 0) {
            navLinks.forEach((a, index) => {
                a.classList.remove('active');
                if (index === step || (step === 3 && index === 4)) {
                    a.classList.add('active');
                }
            });
        }

        window.scrollTo(0, 0);
    } catch (err) {
        console.error("Error in nextStep:", err);
    }
}

function showTab(event, tabId) {
    if (event) event.preventDefault();
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else if (event && event.target) {
        event.target.classList.add('active');
    }

    const tab = document.getElementById(`${tabId}-tab`);
    if (tab) tab.classList.add('active');
}
