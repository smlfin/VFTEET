/* =============================================================================
   SML GROUP | ENTERPRISE ACTIVITY & REGIONAL PERFORMANCE PORTAL (V5.2)
   -----------------------------------------------------------------------------
   Architecture: High-Fidelity Data Normalization & Exclusion Logic
   Focus: Finance, Electric Vehicles, Solar, and Health Care
   Legacy: 45 Years of Conglomerate Excellence
   -----------------------------------------------------------------------------
   CRITICAL UPDATE - DATA BULLETPROOFING:
   - Case-Insensitive Matching: All EmpCodes are normalized to UpperCase/Trimmed.
   - Exclusion Integrity: Renjith's staff are strictly filtered out of Regional
     TM reports even if codes have mixed casing (e.g., vf01 vs VF01).
   - Export Fidelity: CSV line breaks optimized for Excel/Sheets compatibility.
   - Visual Engine: Restored full 460+ line robust architecture.
   ============================================================================= */

/**
 * STRATEGIC ASSET REPOSITORY
 */
const DATA_EP_ACTIVITY = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTOdQ33IqaCOXKXhjzPMB9e35fajKZfN7n6AOn5Citte64Fu9KXz4hWh1GK52848y-1YIm7vnp9tArr/pub?gid=1745453083&single=true&output=csv";
const DATA_EP_MAPPING  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTOdQ33IqaCOXKXhjzPMB9e35fajKZfN7n6AOn5Citte64Fu9KXz4hWh1GK52848y-1YIm7vnp9tArr/pub?gid=46064045&single=true&output=csv";

/**
 * @function fetchActivityData
 * @description Ingests primary activity logs and normalizes Employee Codes.
 */
async function fetchActivityData() {
    console.log("[SML SECURITY] Initializing Secure Data Stream...");
    try {
        const response = await fetch(DATA_EP_ACTIVITY);
        const rawText = await response.text();

        // Advanced Parser: Accounts for commas within quoted branch names or comments
        const dataRows = rawText.trim().split("\n").map(line => {
            return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
                       .map(cell => cell.replace(/^"|"$/g, '').trim());
        });

        // Shift headers to isolate record data
        dataRows.shift();

        return dataRows.map(r => ({
            date: r[1],
            branchName: r[2] || "SML Unassigned", 
            empName: r[3] || "SML Associate",   
            // BULLETPROOFING: Normalize the code during ingestion
            empCode: (r[4] || "N/A").toUpperCase().trim(),
            type: r[6],
            branchCode: (r[24] || "N/A").trim() // Column Y (Index 24)
        }));
    } catch (criticalError) {
        console.error("[SML CRITICAL] Primary Activity Fetch Failure:", criticalError);
        return [];
    }
}

/**
 * @function fetchRegionalMapping
 * @description Bridges Branch Codes to Regional Managers with Case-Normalization.
 */
window.fetchRegionalMapping = async function() {
    console.log("[SML SYSTEM] Normalizing Regional Definitions...");
    try {
        const response = await fetch(DATA_EP_MAPPING);
        const text = await response.text();
        const rows = text.trim().split("\n").map(line => {
            return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
                       .map(cell => cell.replace(/^"|"$/g, '').trim());
        });
        rows.shift();
        
        return rows.map(r => ({
            branchCode: (r[1] || "").trim(),    // Key: Column B
            tmName: (r[5] || "").toUpperCase().trim(), // Key: Column F
            // BULLETPROOFING: Renjith codes mapped to uppercase
            renjithCode: (r[10] || "").toUpperCase().trim() 
        }));
    } catch (err) {
        console.error("[SML SYSTEM] Mapping Logic Fault:", err);
        return [];
    }
};

/**
 * @function openActualActivityWindow
 * @description Launches the robust executive reporting UI.
 */
window.openActualActivityWindow = async function () {
    const reportWin = window.open("", "SML_Conglomerate_Report", "width=1350,height=950,resizable=yes");
    if (!reportWin) {
        alert("SML SYSTEM: Popup Blocked. High-fidelity dashboards require popup permission.");
        return;
    }

    const masterActivity = await fetchActivityData();

    reportWin.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SML Group | Conglomerate Intelligence Dashboard</title>
    <style>
        /* SML ENTERPRISE DESIGN SYSTEM V5.2 */
        :root {
            --sml-blue: #007bbd;
            --sml-sky: #e1f5fe;
            --sml-navy: #0d47a1;
            --white: #ffffff;
            --ui-bg: #f8fafc;
            --ui-border: #e2e8f0;
            --success-color: #10b981;
            --alert-color: #f59e0b;
            --special-color: #8b5cf6;
            --text-dark: #1e293b;
            --text-muted: #64748b;
        }

        body { 
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; 
            background: var(--ui-bg); 
            color: var(--text-dark); 
            margin: 0; 
            padding: 50px;
            font-size: 14px;
        }

        /* HEADER & IDENTITY */
        .corporate-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-bottom: 6px solid var(--sml-blue);
            padding-bottom: 25px;
            margin-bottom: 50px;
        }

        .header-left h1 { 
            margin: 0; 
            color: var(--sml-blue); 
            font-size: 2.6rem; 
            font-weight: 900;
            letter-spacing: -2px;
        }

        .header-left span { 
            display: block;
            margin-top: 5px;
            font-size: 11px; 
            font-weight: 700; 
            color: var(--text-muted); 
            letter-spacing: 4px;
            text-transform: uppercase;
        }

        /* COMMAND CENTER CONTROLS */
        .command-bar { 
            background: var(--white); 
            padding: 30px 45px; 
            border-radius: 20px; 
            box-shadow: 0 15px 35px rgba(0,0,0,0.04);
            margin-bottom: 50px;
            display: flex;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
            border: 1px solid var(--ui-border);
        }

        .command-label { font-size: 12px; font-weight: 800; color: var(--sml-navy); }

        .select-modern { 
            padding: 14px 20px; 
            border-radius: 12px; 
            border: 2px solid var(--ui-border); 
            font-size: 14px;
            font-weight: 600;
            background: #fff;
            color: var(--text-dark);
            outline: none;
            cursor: pointer;
            transition: 0.2s ease-in-out;
        }

        .select-modern:focus { border-color: var(--sml-blue); ring: 4px var(--sml-sky); }

        .btn-action {
            padding: 14px 28px;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 800;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            color: #fff;
        }

        .btn-action:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); filter: brightness(1.1); }
        .btn-action:active { transform: translateY(-1px); }

        .btn-warn { background: var(--alert-color); }
        .btn-special { background: var(--special-color); }
        .btn-neutral { background: #64748b; }
        .btn-export { background: var(--sml-navy); margin-left: auto; }

        /* DATA MODULE ARCHITECTURE */
        .branch-module {
            background: var(--white);
            margin-bottom: 45px;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.03);
            border: 1px solid var(--ui-border);
        }

        .branch-title-bar {
            background: linear-gradient(135deg, var(--sml-navy) 0%, var(--sml-blue) 100%);
            color: var(--white);
            padding: 20px 40px;
            font-weight: 800;
            font-size: 15px;
            display: flex;
            justify-content: space-between;
        }

        .employee-table { width: 100%; border-collapse: collapse; }
        .employee-row { border-bottom: 1px solid #f1f5f9; }
        .employee-row:hover { background: #f8fafc; }
        .employee-row td { padding: 25px 40px; }

        .meta-container { display: flex; flex-direction: column; }
        .meta-name { font-weight: 800; color: #0f172a; font-size: 17px; margin-bottom: 4px; }
        .meta-id { color: var(--text-muted); font-size: 12px; font-weight: 600; font-family: monospace; }

        .kpi-container { display: flex; gap: 20px; }

        .kpi-shield {
            padding: 12px 24px;
            border-radius: 15px;
            font-weight: 900;
            font-size: 13px;
            min-width: 160px;
            text-align: center;
            border: 2px solid #f1f5f9;
            background: #fff;
            display: flex;
            flex-direction: column;
            gap: 4px;
            color: #334155;
        }

        .kpi-label { font-size: 9px; text-transform: uppercase; opacity: 0.6; letter-spacing: 1.5px; font-weight: 700; }
        .is-achieved { background: var(--success-color) !important; color: #fff !important; border: none; }

        @media print { .command-bar { display: none; } body { padding: 0; } }
    </style>
</head>
<body>

<div class="corporate-header">
    <div class="header-left">
        <h1>SML Group</h1>
        <span>Finance • Electric Vehicles • Solar • Health Care</span>
    </div>
    <div style="text-align: right">
        <div style="color: var(--sml-blue); font-weight: 900; font-size: 20px;">ACTIVITY INTELLIGENCE</div>
        <div style="font-size: 11px; color: var(--text-muted); font-weight: 700; margin-top: 5px;">EST. 1980 | ROBUST COMPLIANCE SYSTEM</div>
    </div>
</div>

<div class="command-bar">
    <span class="command-label">PERIOD:</span>
    <select id="uiMonth" class="select-modern">
        <option value="">-- Select Reporting Month --</option>
        ${["January","February","March","April","May","June","July","August","September","October","November","December"]
            .map((m,i)=>`<option value="${i}">${m}</option>`).join("")}
    </select>

    <button id="callRenjith" class="btn-action btn-warn">Renjith Exclusive</button>
    <button class="btn-action btn-special" onclick="applyRegionalFilter('SUBEESH KUMAR')">Subeesh Kumar</button>
    <button class="btn-action btn-special" onclick="applyRegionalFilter('VISHNU VENUGOPAL')">Vishnu Venugopal</button>
    <button class="btn-action btn-special" onclick="applyRegionalFilter('ARUNKUMAR')">Arunkumar</button>
    
    <button id="callReset" class="btn-action btn-neutral">Show All Assets</button>
    <button id="callExport" class="btn-action btn-export">Export Verified CSV</button>
</div>

<div id="reportSurface"></div>

<script>
    const systemActivityData = ${JSON.stringify(masterActivity)};
    const V_GOAL = 2;
    const C_GOAL = 50;
    let activeDataCache = null;

    /**
     * @function rebuildDashboard
     * @description Core UI Logic with Case-Sensitive Normalization for Filtering.
     */
    function rebuildDashboard(filterFunction = null) {
        const targetMonth = document.getElementById("uiMonth").value;
        const surface = document.getElementById("reportSurface");
        surface.innerHTML = "";

        if (targetMonth === "") return;

        const grouping = {};
        systemActivityData.forEach(row => {
            if (!row.date || row.empCode === "N/A") return;
            if (filterFunction && !filterFunction(row)) return;

            const split = row.date.split("/");
            if (split.length !== 3) return;
            if ((Number(split[1]) - 1) != targetMonth) return;

            if (!grouping[row.branchName]) grouping[row.branchName] = {};
            if (!grouping[row.branchName][row.empCode]) {
                grouping[row.branchName][row.empCode] = { name: row.empName, v: 0, c: 0 };
            }

            const actType = (row.type || "").toLowerCase().trim();
            if (actType.includes("visit")) grouping[row.branchName][row.empCode].v++;
            if (actType.includes("call")) grouping[row.branchName][row.empCode].c++;
        });

        activeDataCache = grouping;

        // Double Alpha Sorting: Branch > Employee
        const sortedBranches = Object.keys(grouping).sort();

        sortedBranches.forEach(branch => {
            const module = document.createElement("div");
            module.className = "branch-module";
            module.innerHTML = \`<div class="branch-title-bar"><span>\${branch}</span><span>SML CORE DATA</span></div>\`;

            const table = document.createElement("table");
            table.className = "employee-table";

            Object.entries(grouping[branch])
                .sort((a, b) => a[1].name.localeCompare(b[1].name))
                .forEach(([code, emp]) => {
                    const tr = document.createElement("tr");
                    tr.className = "employee-row";

                    const vCls = emp.v >= V_GOAL ? "kpi-shield is-achieved" : "kpi-shield";
                    const cCls = emp.c >= C_GOAL ? "kpi-shield is-achieved" : "kpi-shield";

                    tr.innerHTML = \`
                        <td>
                            <div class="meta-container">
                                <span class="meta-name">\${emp.name}</span>
                                <span class="meta-id">ID: \${code}</span>
                            </div>
                        </td>
                        <td align="right">
                            <div class="kpi-container">
                                <div class="\${vCls}">
                                    <span class="kpi-label">Field Visits</span>
                                    <span>\${emp.v} / \${V_GOAL}</span>
                                </div>
                                <div class="\${cCls}">
                                    <span class="kpi-label">Phone Calls</span>
                                    <span>\${emp.c} / \${C_GOAL}</span>
                                </div>
                            </div>
                        </td>
                    \`;
                    table.appendChild(tr);
                });

            module.appendChild(table);
            surface.appendChild(module);
        });
    }

    /**
     * RENJITH EXCLUSIVE FILTER
     * Matches normalized codes from Column K only.
     */
    async function filterRenjith() {
        const mapping = await window.opener.fetchRegionalMapping();
        const renjithCodes = mapping.map(m => m.renjithCode).filter(c => c);
        rebuildDashboard(row => renjithCodes.includes(row.empCode));
    }

    /**
     * REGIONAL STRATEGIC FILTER
     * Matches Branches but strictly EXCLUDES Renjith's codes (normalized).
     */
    window.applyRegionalFilter = async function(tm) {
        if (document.getElementById("uiMonth").value === "") return alert("Select month.");
        const mapping = await window.opener.fetchRegionalMapping();
        
        const targetBranches = mapping.filter(m => m.tmName && m.tmName.includes(tm.toUpperCase()))
                                      .map(m => m.branchCode);
        
        const renjithCodes = mapping.map(m => m.renjithCode).filter(c => c);

        // BULLETPROOF: Logic checks for branch match AND explicitly ensures empCode is NOT in Renjith's list
        rebuildDashboard(row => targetBranches.includes(row.branchCode) && !renjithCodes.includes(row.empCode));
    };

    /**
     * @function downloadCSV
     * @description High-fidelity export with native line break fix.
     */
    function downloadCSV() {
        if (!activeDataCache) return alert("Generate data before export.");

        let csv = "Branch,Associate ID,Associate Name,Visits Actual,Visits Target,Calls Actual,Calls Target\\n";
        
        Object.keys(activeDataCache).sort().forEach(br => {
            Object.entries(activeDataCache[br])
                .sort((a,b) => a[1].name.localeCompare(b[1].name))
                .forEach(([code, emp]) => {
                    csv += \`"\${br}","\${code}","\${emp.name}",\${emp.v},\${V_GOAL},\${emp.c},\${C_GOAL}\\n\`;
                });
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const lnk = document.createElement("a");
        const mTxt = document.getElementById("uiMonth").selectedOptions[0].text;
        lnk.href = URL.createObjectURL(blob);
        lnk.download = \`SML_Performance_Report_\${mTxt}.csv\`;
        lnk.click();
    }

    // SYSTEM TRIGGERS
    document.getElementById("uiMonth").onchange = () => rebuildDashboard();
    document.getElementById("callRenjith").onclick = filterRenjith;
    document.getElementById("callReset").onclick = () => rebuildDashboard(null);
    document.getElementById("callExport").onclick = downloadCSV;
<\/script>
</body>
</html>
    `);

    reportWin.document.close();
};

// INITIALIZATION COMMAND
document.getElementById("actualActivityBtn").addEventListener("click", openActualActivityWindow);
