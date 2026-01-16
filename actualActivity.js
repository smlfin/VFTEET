/* ============================================================
   ACTUAL ACTIVITY DASHBOARD - SML GROUP
   45-year-old Conglomerate: Finance | EV | Solar | Health Care
   ============================================================ */

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTOdQ33IqaCOXKXhjzPMB9e35fajKZfN7n6AOn5Citte64Fu9KXz4hWh1GK52848y-1YIm7vnp9tArr/pub?gid=1745453083&single=true&output=csv";

/* ---------- ROBUST CSV FETCH (Fixes Name Truncation & Counting) ---------- */
async function fetchActivityData() {
    const res = await fetch(CSV_URL);
    const text = await res.text();

    const rows = text.trim().split("\n").map(row => {
        return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
                  .map(cell => cell.replace(/^"|"$/g, '').trim());
    });

    rows.shift(); // remove header

    return rows.map(r => ({
        date: r[1],
        branch: r[2] || "Unknown", 
        empName: r[3] || "N/A",   
        empCode: r[4] || "N/A",   
        type: r[6]
    }));
}

/* ---------- DASHBOARD WINDOW ---------- */
window.openActualActivityWindow = async function () {
    const win = window.open("", "ActualActivityReport", "width=1000,height=800");
    if (!win) {
        alert("Popup blocked. Please allow popups.");
        return;
    }

    const data = await fetchActivityData();

    win.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>SML Group Activity Dashboard</title>
    <style>
        :root {
            --sml-blue: #007bbd;
            --sml-light: #f0f7ff;
            --text-main: #2c3e50;
            --bg-body: #f4f7f9;
            --success-green: #28a745;
        }
        body { 
            font-family: 'Segoe UI', Tahoma, sans-serif; 
            background: var(--bg-body); 
            color: var(--text-main); 
            margin: 0; 
            padding: 20px;
            font-size: 13px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid var(--sml-blue);
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        h2 { margin: 0; color: var(--sml-blue); font-size: 1.4rem; }
        .controls { 
            background: white; 
            padding: 12px 20px; 
            border-radius: 6px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        select { 
            padding: 6px 12px; 
            border-radius: 4px; 
            border: 1px solid #ccc; 
            font-size: 13px;
            outline: none;
        }
        .branch-card {
            background: white;
            margin-bottom: 15px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .branch-header {
            background: var(--sml-blue);
            color: white;
            padding: 8px 15px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 12px;
        }
        ul { list-style: none; padding: 0; margin: 0; }
        li { 
            padding: 10px 15px; 
            border-bottom: 1px solid #f0f0f0; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
        }
        li:last-child { border-bottom: none; }
        li:hover { background: var(--sml-light); }
        .emp-name { font-weight: 600; color: #333; }
        .emp-code { color: #888; font-weight: normal; font-size: 11px; margin-left: 5px; }
        .badge-box { display: flex; gap: 8px; }
        .badge {
            padding: 3px 10px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 11px;
            min-width: 90px;
            text-align: center;
        }
        .badge-visit { background: #e6f4ea; color: #1e7e34; border: 1px solid #c3e6cb; }
        .badge-call { background: #e7f3ff; color: #0056b3; border: 1px solid #b8daff; }
        /* Style for reaching target */
        .achieved { background: var(--success-green) !important; color: white !important; border: none; }
    </style>
</head>
<body>

<div class="header">
    <h2>SML Group | Actual Activity Summary</h2>
    <div style="font-size: 11px; color: #666;">Conglomerate: Finance • EV • Solar • Health Care</div>
</div>

<div class="controls">
    <strong>Filter Month:</strong>
    <select id="month">
        <option value="">-- Choose Month --</option>
        ${["January","February","March","April","May","June","July","August","September","October","November","December"]
            .map((m,i)=>`<option value="${i}">${m}</option>`).join("")}
    </select>
    <button id="downloadCsvBtn">Download CSV</button>
</div>

<div id="result"></div>

<script>
const rawData = ${JSON.stringify(data)};
const VISIT_TARGET = 2;
const CALL_TARGET = 50;
let __lastGroupedForDownload = null;

function renderSummary() {
    const month = document.getElementById("month").value;
    const container = document.getElementById("result");
    container.innerHTML = "";

    if (month === "") return;

    const grouped = {};
    __lastGroupedForDownload = grouped;

    rawData.forEach(r => {
        if (!r.date || r.empCode === "N/A") return;
        const parts = r.date.split("/");
        if (parts.length !== 3) return;
        if (Number(parts[1]) - 1 != month) return;

        if (!grouped[r.branch]) grouped[r.branch] = {};
        if (!grouped[r.branch][r.empCode]) {
            grouped[r.branch][r.empCode] = { name: r.empName, visits: 0, calls: 0 };
        }

        const typeStr = (r.type || "").toLowerCase().trim();
        if (typeStr.includes("visit")) grouped[r.branch][r.empCode].visits++;
        if (typeStr.includes("call")) grouped[r.branch][r.empCode].calls++;
    });

    Object.keys(grouped).sort().forEach(branch => {
        const card = document.createElement("div");
        card.className = "branch-card";

        const head = document.createElement("div");
        head.className = "branch-header";
        head.textContent = branch;
        card.appendChild(head);

        const ul = document.createElement("ul");
        Object.entries(grouped[branch])
            .sort((a,b) => a[1].name.localeCompare(b[1].name))
            .forEach(([code, emp]) => {
                const li = document.createElement("li");
                
                // Determine if target reached for styling
                const visitClass = emp.visits >= VISIT_TARGET ? "badge badge-visit achieved" : "badge badge-visit";
                const callClass = emp.calls >= CALL_TARGET ? "badge badge-call achieved" : "badge badge-call";

                li.innerHTML = \`
                    <div class="emp-name">\${emp.name}<span class="emp-code">(\${code})</span></div>
                    <div class="badge-box">
                        <span class="\${visitClass}">Visits: \${emp.visits} / \${VISIT_TARGET}</span>
                        <span class="\${callClass}">Calls: \${emp.calls} / \${CALL_TARGET}</span>
                    </div>
                \`;
                ul.appendChild(li);
            });

        card.appendChild(ul);
        container.appendChild(card);
    });
}

function downloadActualActivityCSV() {
    if (!__lastGroupedForDownload) {
        alert("Please select a month first.");
        return;
    }

    let csv = "Branch,Employee Code,Employee Name,Visits Actual,Visits Target,Calls Actual,Calls Target\\n";

    Object.entries(__lastGroupedForDownload).forEach(([branch, emps]) => {
        Object.entries(emps).forEach(([code, emp]) => {
            csv += \`"\${branch}","\${code}","\${emp.name}",\${emp.visits},\${VISIT_TARGET},\${emp.calls},\${CALL_TARGET}\\n\`;
        });
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    const monthName = document.getElementById("month").selectedOptions[0].text;

    a.href = URL.createObjectURL(blob);
    a.download = \`Actual_Activity_\${monthName}.csv\`;
    a.click();
}

document.getElementById("month").onchange = renderSummary;
document.getElementById("downloadCsvBtn").onclick = downloadActualActivityCSV;
<\/script>
</body>
</html>
    `);

    win.document.close();
};

// Main page listener
document.getElementById("actualActivityBtn").addEventListener("click", openActualActivityWindow);
