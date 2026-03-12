let currentRole = localStorage.getItem("currentRole");
let currentUser = localStorage.getItem("currentUser");

// If not logged in → allow only login page
if (!currentUser) {
    if (
        !window.location.pathname.includes("login.html") &&
        !window.location.pathname.includes("pending.html")
    ) {
        window.location.href = "login.html";
    }
}

// If pending → redirect to pending page
if (currentRole === "Pending") {
    if (!window.location.pathname.includes("pending.html")) {
        window.location.href = "pending.html";
    }
}
document.addEventListener("DOMContentLoaded", function() {

    const mainBtn = document.getElementById("mainBtn");

    if (mainBtn) {
        mainBtn.addEventListener("click", function() {
            if (isLoginMode) {
                login();
            } else {
                register();
            }
        });
    }

});
document.addEventListener("DOMContentLoaded", function() {

    if (currentUser) {

        let welcomeEl = document.getElementById("welcomeUser");
        if (welcomeEl) {
            welcomeEl.textContent = "Welcome, " + currentUser;
        }
        let roleEl = document.getElementById("userRole");
if (roleEl) {
    roleEl.textContent = "Role: " + currentRole;
}

suppliers = JSON.parse(localStorage.getItem("suppliers")) || [];
        updateDropdown();
        renderTable();
        updateDashboard();
        applyRolePermissions();
        renderUsers();

        // 🔥 AUTO SELECT FIRST SUPPLIER IF MERON
        if (suppliers.length > 0) {
            document.getElementById("historySelect").value = suppliers[0].name;
            viewHistory();   // ← THIS IS THE KEY FIX
        }

        showSection("dashboardSection");
    }
});       

let suppliers = [];

if (currentUser) {
suppliers = JSON.parse(localStorage.getItem("suppliers")) || [];}

function applyRolePermissions() {

    const evaluationCard = document.getElementById("evaluationCard");

if (currentRole !== "Evaluator") {
    if (evaluationCard) evaluationCard.style.display = "none";
}

    // Sidebar buttons
    const manageBtn = document.querySelector("button[onclick*='manageSection']");
    const historyBtn = document.querySelector("button[onclick*='historySection']");

    if (currentRole === "Viewer") {

        // Hide manage section completely
        if (manageBtn) manageBtn.style.display = "none";
        // 🔒 ADMIN-ONLY EXPORT
const exportPDFBtn = document.querySelector("button[onclick='exportSelectedSupplierPDF()']");
const exportCSVBtn = document.querySelector("button[onclick='exportHistory()']");
const exportFullBtn = document.querySelector("button[onclick='exportFullReport()']");

if (currentRole !== "Admin") {
    if (exportPDFBtn) exportPDFBtn.style.display = "none";
    if (exportCSVBtn) exportCSVBtn.style.display = "none";
    if (exportFullBtn) exportFullBtn.style.display = "none";
}

    }

    if (currentRole === "Evaluator") {

    const addSupplierCard = document.getElementById("addSupplierCard");
    if (addSupplierCard) addSupplierCard.style.display = "none";

    // Hide User Management button if not Admin
const userMgmtBtn = document.querySelector("button[onclick*='usersSection']");
if (currentRole !== "Admin") {
    if (userMgmtBtn) userMgmtBtn.style.display = "none";

    // Hide evaluation form if Admin
if (currentRole === "Admin") {
    const evaluationCard = document.querySelector(".form-card:nth-child(2)");
    if (evaluationCard) evaluationCard.style.display = "none";
}
}
}

}




let selectedRatings = {
    delivery: 0,
    quality: 0,
    price: 0,
    reliability: 0
};




function setRating(category, value) {
    selectedRatings[category] = value;




    let ratingDiv = document.getElementById(category);
    let spans = ratingDiv.querySelectorAll("span");




    spans.forEach(span => {
        span.classList.remove("active");
    });




    spans[value - 1].classList.add("active");
}




function addSupplier() {

if (currentRole !== "Admin") {
    alert("Access Denied: Admin only");
    return;
}
    let name = document.getElementById("supplierName").value;
    let product = document.getElementById("productSupplied").value;
    let contact = document.getElementById("contactInfo").value;

     let exists = suppliers.find(s => s.name === name);
    if (exists) {
        alert("Supplier already exists!");
        return;
    }




    if (name === "") return;




    suppliers.push({
        name: name,
        product: product,
        contact: contact,
        delivery: 0,
        quality: 0,
        price: 0,
        reliability: 0,
        score: 0,
        analysis: "",
        risk: "",
        trend: "-",
        history: [],
        preferred: false,


    });



updateDropdown();
updateDashboard();
renderTable();
document.getElementById("supplierSelect").selectedIndex = 0;

// CLEAR INPUT FIELDS
document.getElementById("supplierName").value = "";
document.getElementById("productSupplied").value = "";
document.getElementById("contactInfo").value = "";



// RESET RATINGS
selectedRatings = {
    delivery: 0,
    quality: 0,
    price: 0,
    reliability: 0
};


// REMOVE ACTIVE HIGHLIGHT
["delivery","quality","price","reliability"].forEach(id => {
    let spans = document.getElementById(id).querySelectorAll("span");
    spans.forEach(span => span.classList.remove("active"));
    
});

localStorage.setItem("suppliers", JSON.stringify(suppliers));

}




function updateDropdown() {
    let select = document.getElementById("supplierSelect");
    select.innerHTML = "";


    // DEFAULT OPTION
    let defaultOption = document.createElement("option");
    defaultOption.textContent = "Select Supplier";
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);


    suppliers.forEach((supplier, index) => {
        let option = document.createElement("option");
        option.value = supplier.name;
        option.textContent = supplier.name;
        select.appendChild(option);
    });
// ✅ HISTORY DROPDOWN
let historySelect = document.getElementById("historySelect");

if (historySelect) {

    historySelect.innerHTML = "";

    suppliers.forEach(supplier => {
        let option = document.createElement("option");
        option.value = supplier.name;
        option.textContent = supplier.name;
        historySelect.appendChild(option);
    });
}

// ✅ COMPARE DROPDOWN (SEPARATE)
let compareA = document.getElementById("compareA");
let compareB = document.getElementById("compareB");

if (compareA && compareB) {

    compareA.innerHTML = "";
    compareB.innerHTML = "";

    suppliers.forEach(supplier => {

        let opt1 = document.createElement("option");
        opt1.value = supplier.name;
        opt1.textContent = supplier.name;
        compareA.appendChild(opt1);

        let opt2 = document.createElement("option");
        opt2.value = supplier.name;
        opt2.textContent = supplier.name;
        compareB.appendChild(opt2);
    });
}
}


function evaluateSupplier() {
 if (currentRole !== "Evaluator") {
    alert("Access Denied: Evaluator only.");
    return;
}




    let select = document.getElementById("supplierSelect");
    let supplierName = select.value;


    let supplier = suppliers.find(s => s.name === supplierName);

    // ===== SIMPLE FORECAST =====
if (supplier && supplier.history.length >= 2) {

    let last = supplier.history[supplier.history.length - 1].score;
    let beforeLast = supplier.history[supplier.history.length - 2].score;

    let difference = last - beforeLast;

    supplier.forecast = (last + difference).toFixed(2);

} else {
    supplier.forecast = "Not enough data";
}


    if (!supplier) {
        alert("Please select a supplier.");
        return;
    }


    let delivery = selectedRatings.delivery;
    let quality = selectedRatings.quality;
    let price = selectedRatings.price;
    let reliability = selectedRatings.reliability;


    if (!delivery || !quality || !price || !reliability) {
        alert("Please select all ratings.");
        return;
    }


    let oldScore = supplier.score;


   let score =
    (delivery * 0.4) +
    (quality * 0.3) +
    (price * 0.2) +
    (reliability * 0.1);

let newScore = parseFloat(score.toFixed(2));


    // CHECK DECLINING TREND
let declining = false;

if (supplier.history.length >= 2) {
    let last = supplier.history[supplier.history.length - 1].score;
    let beforeLast = supplier.history[supplier.history.length - 2].score;

    if (last < beforeLast && newScore < last) {
        declining = true;
    }
}

    // UPDATE CURRENT
    supplier.delivery = delivery;
    supplier.quality = quality;
    supplier.price = price;
    supplier.reliability = reliability;
    supplier.score = newScore;


   if (newScore < 2.5) {
    supplier.risk = "High Risk";
} else if (newScore < 3.5) {
    supplier.risk = "Moderate Risk";
} else {
    supplier.risk = "Low Risk";
}

let remarks = [];

if (delivery < 3) {
    remarks.push("Delivery performance needs improvement.");
}

if (quality < 3) {
    remarks.push("Quality consistency should be reviewed.");
}

if (price < 3) {
    remarks.push("Pricing competitiveness is below expectation.");
}

if (reliability < 3) {
    remarks.push("Reliability issues detected.");
}

if (remarks.length === 0) {
    supplier.analysis = "Supplier performing well across all criteria.";
} else {
    supplier.analysis = remarks.join(" ");

}
// AUTO RECOMMENDATION WITH TREND CHECK
if (declining) {
    supplier.recommendation = "⚠ Performance declining. Immediate review required.";
}
else if (newScore >= 4) {
    supplier.recommendation = "✅ Maintain Partnership";
}
else if (newScore >= 3) {
    supplier.recommendation = "⚠ Monitor Supplier";
}
else {
    supplier.recommendation = "❌ Consider Replacement";
}

// ✅ SAVE CURRENT EVALUATION TO HISTORY
supplier.history.push({
    score: newScore,
    analysis: supplier.analysis,
    risk: supplier.risk,
    date: new Date().toLocaleString()
});


    // TREND
    if (oldScore === 0) {
        supplier.trend = "➖ First Evaluation";
    } else if (newScore > oldScore) {
        supplier.trend = "⬆ Improving";
    } else if (newScore < oldScore) {
        supplier.trend = "⬇ Declining";
    } else {
        supplier.trend = "➖ Stable";
    }


    let currentHistory = document.getElementById("historySelect").value;

suppliers.sort((a, b) => b.score - a.score);
updateDropdown();

document.getElementById("historySelect").value = currentHistory;


    // RESET RATINGS
    selectedRatings = {
        delivery: 0,
        quality: 0,
        price: 0,
        reliability: 0
    };


    ["delivery","quality","price","reliability"].forEach(id => {
        let spans = document.getElementById(id).querySelectorAll("span");
        spans.forEach(span => span.classList.remove("active"));
    });

renderTable();
updateDashboard();
document.getElementById("supplierSelect").selectedIndex = 0;
viewHistory();


localStorage.setItem("suppliers", JSON.stringify(suppliers));



}




function renderTable() {


    let table = document.getElementById("supplierTable");
    table.innerHTML = "";


    suppliers.forEach((supplier, index) => {


        let previousScore = supplier.history.length > 0
            ? supplier.history[supplier.history.length - 1].score
            : "-";


        let previousAnalysis = supplier.history.length > 0
            ? supplier.history[supplier.history.length - 1].analysis
            : "-";


let riskClass = "";

if (supplier.risk.includes("Low")) {
    riskClass = "low-risk";
}
else if (supplier.risk.includes("Moderate")) {
    riskClass = "moderate-risk";
}
else {
    riskClass = "high-risk";
}

let trendClass = "";

if (supplier.trend.includes("Improving"))
    trendClass = "trend-up";
else if (supplier.trend.includes("Declining"))
    trendClass = "trend-down";
else
    trendClass = "trend-stable";

let topClass = index === 0 ? "top-supplier" : "";
let scoreColor = "";

if (supplier.score >= 4)
    scoreColor = "#10B981"; // GREEN
else if (supplier.score >= 3)
    scoreColor = "#F59E0B"; // YELLOW
else
    scoreColor = "#EF4444"; // RED


let row = `
<tr class="${topClass}">
<td>${index + 1}</td>
<td>${supplier.name}</td>
<td>${supplier.product}</td>
<td>${supplier.delivery}</td>
<td>${supplier.quality}</td>
<td>${supplier.price}</td>
<td>${supplier.reliability}</td>
<td>${previousScore}</td>

<td>
${supplier.score}
<div class="score-bar">
<div class="score-fill" style="width:${supplier.score * 20}%; background:${scoreColor}"></div>
</div>
</td>

<td><span class="${riskClass}">${supplier.risk}</span></td>

<td class="${trendClass}">
${supplier.trend}
</td>

<td>${previousAnalysis}</td>
<td>${supplier.recommendation}</td>

<td>
    ${currentRole === "Admin" ? `
      <button class="remove-btn"
        onclick="deleteSupplier('${supplier.name}')">
    Remove
</button>
    ` : "-"}
</td>
</td>
</tr>
`;



        table.innerHTML += row;
    });
}

    function deleteSupplier(name) {

    if (currentRole !== "Admin") {
        alert("Admin only.");
        return;
    }

    let confirmDelete = confirm("Are you sure you want to delete this supplier?");
    if (!confirmDelete) return;

    suppliers = suppliers.filter(s => s.name !== name);

localStorage.setItem("suppliers", JSON.stringify(suppliers));
    updateDropdown();
    renderTable();
    updateDashboard();

    }




function updateDashboard() {

    document.getElementById("totalSuppliers").textContent = suppliers.length;

    // TOP SUPPLIER
    if (suppliers.length > 0) {
        document.getElementById("topSupplier").textContent = suppliers[0].name;

        let avg = suppliers.reduce((sum, s) => sum + parseFloat(s.score || 0), 0) / suppliers.length;
        document.getElementById("averageScore").textContent = avg.toFixed(2);

        let highestDelivery = Math.max(...suppliers.map(s => s.delivery));
        document.getElementById("highestDelivery").textContent = highestDelivery;

        renderChart();
        generateSystemInsight();
        
    }
    function setPreferred(name) {

    // remove previous preferred
    suppliers.forEach(s => s.preferred = false);

    let supplier = suppliers.find(s => s.name === name);

    if (supplier) {
        supplier.preferred = true;
    }

    localStorage.setItem(currentUser + "suppliers", JSON.stringify(suppliers));

    renderTable();
    updateDashboard();
}

    
}


function generateSystemInsight() {

    let insightBox = document.getElementById("systemInsight");
    if (!insightBox) return;

    if (suppliers.length === 0) {
        insightBox.textContent = "No supplier data available for analysis.";
        return;
    }

    let highRisk = suppliers.filter(s => s.risk.includes("High")).length;
    let moderateRisk = suppliers.filter(s => s.risk.includes("Moderate")).length;
    let lowRisk = suppliers.filter(s => s.risk.includes("Low")).length;

    let avg = suppliers.reduce((sum, s) => sum + parseFloat(s.score || 0), 0) / suppliers.length;
    avg = avg.toFixed(2);

    let declining = suppliers.filter(s => s.trend.includes("Declining")).length;

    let insightText = 
        `Out of ${suppliers.length} registered suppliers, ` +
        `${highRisk} are classified as High Risk, ` +
        `${moderateRisk} as Moderate Risk, and ` +
        `${lowRisk} as Low Risk. ` +
        `The overall average performance score is ${avg}. ` +
        (declining > 0 
            ? `${declining} supplier(s) show declining performance trends requiring immediate monitoring.` 
            : `No declining performance trends detected at this time.`);

    insightBox.textContent = insightText;
}
function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentRole");
    window.location.href = "login.html";
}function viewHistory() {

    let supplierName = document.getElementById("historySelect").value;
    let supplier = suppliers.find(s => s.name === supplierName);
    let table = document.getElementById("historyTable");

    table.innerHTML = "";

    if (!supplier) return;

    if (supplier.history.length === 0) {
        table.innerHTML = "<tr><td colspan='4'>No History Available</td></tr>";
    } else {
        supplier.history.forEach(record => {
            let row = `
            <tr>
                <td>${record.score}</td>
                <td>${record.risk}</td>
                <td>${record.analysis}</td>
                <td>${record.date}</td>
            </tr>
            `;
            table.innerHTML += row;
        });
    }

    // 🔥 ALWAYS render chart even if empty
    renderTrendChart();
}

let scoreChart;

function renderChart() {

    let ctx = document.getElementById("scoreChart");

    if (!ctx) return;

    let labels = suppliers.map(s => s.name);
    let data = suppliers.map(s => s.score);

    if (scoreChart) {
        scoreChart.destroy();
    }

    scoreChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Supplier Score',
                data: data,
                backgroundColor: function(context) {

                    const chart = context.chart;
                    const {ctx, chartArea} = chart;

                    if (!chartArea) return '#16a34a9c';

                    const gradient = ctx.createLinearGradient(
                        0, chartArea.bottom,
                        0, chartArea.top
                    );

                    gradient.addColorStop(0, '#14532D');
                    gradient.addColorStop(1, '#22c55e7c');

                    return gradient;
                },
                borderRadius: 10
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#E5E7EB'
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#E5E7EB' },
                    grid: { color: '#1F2937' }
                },
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: { color: '#E5E7EB' },
                    grid: { color: '#1F2937' }
                }
            }
        }
    });
}
let trendChart;

function renderTrendChart() {

    let supplierName = document.getElementById("historySelect").value;
    let supplier = suppliers.find(s => s.name === supplierName);

    if (!supplier || supplier.history.length === 0) return;

    let ctx = document.getElementById("trendChart");

    let labels = supplier.history.map(h => h.date);
    let data = supplier.history.map(h => h.score);

    if (trendChart) {
        trendChart.destroy();
    }

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Performance Score',
                data: data,
                borderColor: '#22C55E',
                backgroundColor: 'rgba(34,197,94,0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#22C55E',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#E5E7EB' }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#E5E7EB' },
                    grid: { color: '#1F2937' }
                },
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: { color: '#E5E7EB' },
                    grid: { color: '#1F2937' }
                }
            }
        }
    });
}
function showSection(sectionId) {

    let sections = document.querySelectorAll('.content-section');

    sections.forEach(section => {
        section.style.display = "none";
    });

    document.getElementById(sectionId).style.display = "block";


}
function login() {

    let loginBtn = document.getElementById("mainBtn");

    loginBtn.innerText = "Signing in...";
    loginBtn.disabled = true;

    setTimeout(() => {

        let email = document.getElementById("email").value.trim().toLowerCase();
        let password = document.getElementById("password").value.trim();
            // 🔒 FIXED SUPER ADMIN LOGIN (ILAGAY DITO)
    if (
        email.toLowerCase() === "superadmin@system.com" &&
        password === "Super123!"
    ) {
        localStorage.setItem("currentUser", "Super Admin");
        localStorage.setItem("currentRole", "Admin");
        window.location.href = "index.html";
        return;
    }


        let users = JSON.parse(localStorage.getItem("users")) || [];

        let user = users.find(u =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.password === password
        );

if (!user) {
    alert("Invalid email or password.");
    loginBtn.innerText = "LOGIN";
    loginBtn.disabled = false;
    return;
}

if (user.role === "Pending") {
    alert("Your account is still waiting for admin approval.");
    loginBtn.innerText = "LOGIN";
    loginBtn.disabled = false;
    return;
}

if (user.role === "Rejected") {
    alert("Your account was rejected by admin.");
    loginBtn.innerText = "LOGIN";
    loginBtn.disabled = false;
    return;
}

localStorage.setItem("currentUser", user.fullName);
localStorage.setItem("currentRole", user.role);
window.location.href = "index.html";

    }, 500);
}
function register() {

    let fullName = document.getElementById("fullName").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let confirmPassword = document.getElementById("confirmPassword").value.trim();

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (!fullName || !email || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailPattern.test(email)) {
    alert("Please enter a valid email address.");
    return;
}
    

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

   email = email.trim().toLowerCase();

let exists = users.find(u =>
    u.email.toLowerCase() === email
);
    if (exists) {
        alert("Email already exists.");
        return;
    }

    let role = "Pending";

    users.push({ fullName, email, password, role });

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", fullName);
    localStorage.setItem("currentRole", role);

    window.location.href = "pending.html";
}

document.addEventListener("DOMContentLoaded", function() {
    const mainBtn = document.getElementById("mainBtn");

    mainBtn.addEventListener("click", function() {
        if (isLoginMode) {
            login();
        } else {
            register();
        }
    });
});

let isLoginMode = true;

function toggleMode() {

    const title = document.getElementById("formTitle");
    const subtitle = document.getElementById("formSubtitle");
    const fullName = document.getElementById("fullName");
   
    const confirmPassword = document.getElementById("confirmPassword");
    const mainBtn = document.getElementById("mainBtn");
    const switchText = document.getElementById("switchText");

    if (isLoginMode) {

        title.innerText = "Create Account";
        subtitle.innerText = "Create your system access";

        fullName.style.display = "block";
        email.style.display = "block";
        confirmPassword.style.display = "block";

        mainBtn.innerText = "CREATE ACCOUNT";
        switchText.innerText = "Already have an account? Login";

        isLoginMode = false;

    } else {

        title.innerText = "Welcome Back";
        subtitle.innerText = "Please login to your dashboard";

        fullName.style.display = "none";
        email.style.display = "block ";
        confirmPassword.style.display = "none";

        mainBtn.innerText = "LOGIN";
        switchText.innerText = "Don’t have an account? Create one";

        isLoginMode = true;
    }

    // 🔥 CLEAR ALL INPUTS WHEN SWITCHING
    document.getElementById("fullName").value = "";
    document.getElementById("email").value = "";
    
    document.getElementById("password").value = "";
    document.getElementById("confirmPassword").value = "";
};
function showSuccess(message) {

    let box = document.createElement("div");
    box.className = "success-popup";
    box.innerHTML = `
        <div class="success-content">
            <div class="success-icon">✔</div>
            <p>${message}</p>
        </div>
    `;

    document.body.appendChild(box);

    setTimeout(() => {
        box.classList.add("show");
    }, 50);

    setTimeout(() => {
        box.classList.remove("show");
        setTimeout(() => {
            box.remove();
            window.location.href = "index.html";
        }, 300);
    }, 2000);
}

function promoteUser(email) {

    if (currentRole !== "Admin") {
        alert("Admin only.");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let user = users.find(u => u.email === email);

    if (!user) return;

    user.role = "Evaluator";

    localStorage.setItem("users", JSON.stringify(users));

    alert("User promoted to Evaluator.");
    renderUsers();
}

let approveSent = false;

function approveUser(email) {

    if (approveSent) return;
    approveSent = true;

    if (currentRole !== "Admin") {
        alert("Admin only.");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let user = users.find(u => u.email === email);

    if (!user) return;

    user.role = "Evaluator";
    localStorage.setItem("users", JSON.stringify(users));

    emailjs.send("service_u0619h4", "template_bpvi4yc", {
        user_email: email,
        user_name: user.fullName
    });

    alert("User approved and email sent.");

    renderUsers();
}

    // SEND EMAIL NOTIFICATION
    let emailSent = false;

function rejectUser(email) {

    if (currentRole !== "Admin") {
        alert("Admin only.");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let user = users.find(u => u.email === email);

    if (!user) return;

    user.role = "Rejected";
    localStorage.setItem("users", JSON.stringify(users));

    emailjs.send("service_ywat76j", "template_4ytwdwu", {
        user_email: email,
        user_name: user.fullName
    });

    alert("User rejected and email sent.");

    renderUsers();
}
function renderUsers() {

    if (currentRole !== "Admin") return;

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let table = document.getElementById("usersTable");

    if (!table) return;

    table.innerHTML = "";

    if (users.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="4">No registered users found.</td>
            </tr>
        `;
        return;
    }
users.forEach(user => {

    let actionContent = "";

    if (user.role === "Pending") {

        actionContent = `
<button onclick="this.disabled=true; approveUser('${user.email}')">
Approve
</button>

<button 
style="background:#EF4444;margin-top:5px;"
onclick="this.disabled=true; rejectUser('${user.email}')">
Reject
</button>
`;

    } else if (user.role === "Evaluator") {

        actionContent = `<span class="approved-badge">Approved</span>`;

    } else if (user.role === "Rejected") {

        actionContent = `<span class="rejected-badge">Rejected</span>`;
    }

    let row = `
    <tr>
        <td>${user.fullName}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${actionContent}</td>
    </tr>
    `;

    table.innerHTML += row;
});
}
function exportHistory() {
    if (currentRole !== "Admin") {
    alert("Access Denied: Admin only export feature.");
    return;
}

    let supplierName = document.getElementById("historySelect").value;
    let supplier = suppliers.find(s => s.name === supplierName);

    if (!supplier || supplier.history.length === 0) {
        alert("No history data to export.");
        return;
    }

    let csv = "Score,Risk,Analysis,Date\n";

    supplier.history.forEach(record => {
        csv += `${record.score},${record.risk},"${record.analysis}",${record.date}\n`;
    });

    let blob = new Blob([csv], { type: "text/csv" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = supplier.name + "_History_Report.csv";
    a.click();

    URL.revokeObjectURL(url);
}
async function exportSelectedSupplierPDF() {

    if (currentRole !== "Admin") {
    alert("Access Denied: Admin only export feature.");
    return;
}

    const supplierName = document.getElementById("historySelect").value;

    if (!supplierName) {
        alert("Please select a supplier first.");
        return;
    }

    const supplier = suppliers.find(s => s.name === supplierName);

    if (!supplier) {
        alert("Supplier not found.");
        return;
    }

    // 🔥 Force render latest trend before export
    renderTrendChart();

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    const logo = new Image();
    logo.src = "logo.png";
    await new Promise(resolve => logo.onload = resolve);

    pdf.addImage(logo, "PNG", 15, 10, 40, 20);

    pdf.setFontSize(16);
    pdf.text("Supplier Performance Report", 60, 20);

    pdf.setFontSize(10);
    pdf.text("Generated: " + new Date().toLocaleString(), 60, 26);

    pdf.setFontSize(12);
    pdf.text("Supplier Information", 15, 45);

    pdf.setFontSize(10);
    pdf.text("Name: " + supplier.name, 15, 52);
    pdf.text("Product: " + supplier.product, 15, 58);
    pdf.text("Contact: " + supplier.contact, 15, 64);
    pdf.text("Score: " + supplier.score, 15, 70);
    pdf.text("Risk: " + supplier.risk, 15, 76);
    pdf.text("Trend: " + cleanText(supplier.trend), 15, 82);
    pdf.text("Recommendation: " + cleanText(supplier.recommendation), 15, 88);
    pdf.text("Analysis:", 15, 98);
    pdf.setFontSize(9);
    pdf.text(
        pdf.splitTextToSize(supplier.analysis || "No analysis available.", 180),
        15,
        104
    );

    // ===== TREND CHART =====
    if (supplier.history.length > 0) {

        await new Promise(resolve => setTimeout(resolve, 500));

        const trendCanvas = document.getElementById("trendChart");

        if (trendCanvas) {
            const imgData = trendCanvas.toDataURL("image/png");
            pdf.addPage();
            pdf.text("Supplier Performance Trend", 15, 20);
            pdf.addImage(imgData, "PNG", 15, 30, 180, 80);
        }
    }

    pdf.save(supplier.name + "_Performance_Report.pdf");
}
function cleanText(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "and")
        .replace(/[^\x00-\x7F]/g, "")  // remove non-ASCII chars
        .trim();
}
