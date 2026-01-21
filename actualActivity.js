/* =============================================================================
   SML GROUP | ENTERPRISE ACTIVITY & LEADERSHIP INTELLIGENCE SYSTEM (V11.6)
   -----------------------------------------------------------------------------
   Full Integration: Calls, Visits, Hierarchy Fixes, and Strategic Export
   ============================================================================= */

const DATA_SOURCE_ACTIVITY = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTOdQ33IqaCOXKXhjzPMB9e35fajKZfN7n6AOn5Citte64Fu9KXz4hWh1GK52848y-1YIm7vnp9tArr/pub?gid=1745453083&single=true&output=csv";
const DATA_SOURCE_MAPPING  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTOdQ33IqaCOXKXhjzPMB9e35fajKZfN7n6AOn5Citte64Fu9KXz4hWh1GK52848y-1YIm7vnp9tArr/pub?gid=46064045&single=true&output=csv";

let coreData = [];
let activeMap = [];
let activeFiltered = [];
let currentTM = "";

/**
 * 1. SYSTEM INITIALIZER
 */
window.addEventListener('DOMContentLoaded', async () => {
    console.log("[SML-SYSTEM] Initializing Intelligence Modules...");

    const launchBtn = document.getElementById('actualActivityBtn');
    if (launchBtn) {
        launchBtn.onclick = () => {
            window.open("actualactivity.htm", "SML_Group_V11", "width=1500,height=1000,resizable=yes,scrollbars=yes");
        };
    }

    const dashboardContainer = document.getElementById('snapshotDisplay');
    if (dashboardContainer) {
        coreData = await fetchSMLActivityData();
        activeMap = await fetchSMLRegionalMapping();
        setupDashboardListeners();
    }
});

/**
 * 2. DATA ACQUISITION
 */
async function fetchSMLActivityData() {
    try {
        const response = await fetch(DATA_SOURCE_ACTIVITY);
        const textData = await response.text();
        const entries = textData.trim().split("\n").map(line => {
            return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
                       .map(cell => cell.replace(/^"|"$/g, '').trim());
        });
        entries.shift(); 
        return entries.map(row => ({
            date: row[1] || "",
            branchName: row[2] || "Unassigned",
            empName: row[3] || "Associate",
            empCode: (row[4] || "N/A").toUpperCase().trim(),
            activityType: (row[6] || "").toLowerCase().trim(),
            branchCode: (row[24] || "N/A").trim()
        }));
    } catch (e) {
        console.error("[SML-ERROR] Activity stream unreachable:", e);
        return [];
    }
}

async function fetchSMLRegionalMapping() {
    try {
        const response = await fetch(DATA_SOURCE_MAPPING);
        const textData = await response.text();
        const entries = textData.trim().split("\n").map(line => {
            return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
                       .map(cell => cell.replace(/^"|"$/g, '').trim());
        });
        entries.shift();
        return entries.map(row => ({
            branchCode: (row[1] || "").trim(),
            umName: (row[2] || "N/A").trim(), 
            dmName: (row[3] || "N/A").trim(), 
            rmName: (row[4] || "N/A").trim(), 
            tmOwner: (row[5] || "").toUpperCase().trim(), 
            renjithCode: (row[10] || "").toUpperCase().trim(),
            renjithUM: (row[13] || "").trim() // Added Column N (Renjith's specific UM mapping)
        }));
    } catch (e) {
        return [];
    }
}

/**
 * 3. DASHBOARD UI ENGINE
 */
function setupDashboardListeners() {
    const safeAssign = (id, tm) => {
        const el = document.getElementById(id);
        if (el) el.onclick = () => applyFilters(tm);
    };

    safeAssign('btnRenjith', 'RENJITH');
    safeAssign('btnSubeesh', 'SUBEESH KUMAR');
    safeAssign('btnVishnu',  'VISHNU VENUGOPAL');
    safeAssign('btnArun',    'ARUNKUMAR');
    
    if(document.getElementById('btnExport')) document.getElementById('btnExport').onclick = exportToCSV;
}

async function applyFilters(tmName) {
    const monthIdx = document.getElementById("selMonth").value;
    if(!monthIdx) return alert("Please select a month.");

    currentTM = tmName;
    const renjithCodes = activeMap.map(m => m.renjithCode).filter(c => c);

    let filtered = [];
    let tmContext = [];

    if(tmName === 'RENJITH') {
        filtered = coreData.filter(r => renjithCodes.includes(r.empCode));
        const activeEmpCodes = [...new Set(filtered.map(f => f.empCode))];
        tmContext = activeMap.filter(m => activeEmpCodes.includes(m.renjithCode));
    } else {
        tmContext = activeMap.filter(m => m.tmOwner === tmName);
        const branchList = tmContext.map(m => m.branchCode);
        filtered = coreData.filter(r => branchList.includes(r.branchCode) && !renjithCodes.includes(r.empCode));
    }

    filtered = filtered.filter(r => (Number(r.date.split("/")[1]) - 1) == monthIdx);
    activeFiltered = filtered;
    
    renderSnapshot(tmName, tmContext, filtered);
    renderBranchDetails(filtered);
}

/**
 * UPDATED: renderSnapshot with Hard-Core Renjith Filtering
 */
/**
 * UPDATED: renderSnapshot - Grouped by Branch with Employee Detail
 * Preserves Renjith Strict Logic & Clean RM Context
 */
function renderSnapshot(tmName, tmContext, filtered) {
    const snapRoot = document.getElementById("snapshotDisplay");
    if(tmContext.length === 0) {
        snapRoot.innerHTML = "";
        return;
    }

    const nameMap = {};
    coreData.forEach(d => nameMap[d.branchCode] = d.branchName);

    const dmStore = {};
    const umStore = {};
    
    filtered.forEach(entry => {
        const type = entry.activityType.includes("visit") ? 'v' : 'c';
        
        const map = tmContext.find(m => {
            return tmName === 'RENJITH' ? m.renjithCode === entry.empCode : m.branchCode === entry.branchCode;
        });

        if (map) {
            let displayUM, displayDM;

            // RENJITH STRICT LOGIC
            if (tmName === 'RENJITH') {
                const checkUM = (map.renjithUM || "").trim().toUpperCase();
                displayUM = (checkUM === "SENTHIL KUMAR") ? "SENTHIL KUMAR" : "RENJITH (Direct)";
                displayDM = "RENJITH REGION"; 
            } else {
                displayUM = map.umName;
                displayDM = map.dmName;
            }

            // Initialize Stores
            if(!dmStore[displayDM]) dmStore[displayDM] = { v: 0, c: 0, ums: {} };
            if(!dmStore[displayDM].ums[displayUM]) dmStore[displayDM].ums[displayUM] = { v: 0, c: 0 };
            
            if(!umStore[displayUM]) umStore[displayUM] = { v: 0, c: 0, branches: {} };
            
            // Initialize Branch within UM
            if(!umStore[displayUM].branches[entry.branchCode]) {
                umStore[displayUM].branches[entry.branchCode] = { 
                    name: nameMap[entry.branchCode] || entry.branchCode, 
                    v: 0, c: 0, employees: {} 
                };
            }

            // Initialize Employee within Branch
            const bRef = umStore[displayUM].branches[entry.branchCode];
            if(!bRef.employees[entry.empCode]) {
                bRef.employees[entry.empCode] = { name: entry.empName, v: 0, c: 0 };
            }

            // Increment All Levels
            dmStore[displayDM][type]++;
            dmStore[displayDM].ums[displayUM][type]++;
            umStore[displayUM][type]++;
            bRef[type]++;
            bRef.employees[entry.empCode][type]++;
        }
    });

    // 1. Generate DM Section
    let dmHtml = Object.entries(dmStore).map(([dm, data]) => `
        <div class="dm-container">
            <div class="module-header" style="background:var(--accent-purple); color:white;">
                <strong>DM: ${dm}</strong>
                <small>V: ${data.v} | C: ${data.c}</small>
            </div>
            <div class="branch-grid">${Object.entries(data.ums).map(([um, s]) => `
                <div class="branch-link"><span>${um}</span><span class="branch-score">V:${s.v}</span></div>`).join("")}
            </div>
        </div>`).join("");

    // 2. Generate UM Section (Grouped by Branch)
    let umHtml = Object.entries(umStore).map(([um, data]) => {
        const titleLabel = (tmName === 'RENJITH' && um === "RENJITH (Direct)") ? "TM" : "UM";
        
        // Sort Branches Alphabetically
        const sortedBranches = Object.entries(data.branches).sort((a, b) => a[1].name.localeCompare(b[1].name));

        return `
        <div class="module-branch">
            <div class="module-header" style="background: var(--sml-blue); color: white;">
                <span>${titleLabel} - ${um}</span>
                <small>V: ${data.v} | C: ${data.c}</small>
            </div>
            <div class="module-content" style="padding: 5px;">
                ${sortedBranches.map(([code, b]) => `
                    <div class="branch-group" style="margin-bottom: 10px; border: 1px solid #eee; border-radius: 6px; overflow: hidden;">
                        <div style="background: #f8fafc; padding: 6px 10px; font-size: 0.85rem; font-weight: 700; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                            <span>${b.name} (${code})</span>
                            <span style="color: var(--sml-blue);">V: ${b.v} | C: ${b.c}</span>
                        </div>
                        <table class="module-table" style="width: 100%; border-collapse: collapse;">
                            ${Object.values(b.employees).sort((a,b) => a.name.localeCompare(b.name)).map(e => `
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 6px 10px; font-size: 0.8rem; color: #334155;">${e.name}</td>
                                    <td align="right" style="padding: 6px 10px; white-space: nowrap;">
                                        <span class="stat-badge ${e.v > 0 ? 'achieved' : ''}" style="font-size: 0.7rem;">V: ${e.v}</span>
                                        <span class="stat-badge" style="background:#64748b; font-size: 0.7rem;">C: ${e.c}</span>
                                    </td>
                                </tr>
                            `).join("")}
                        </table>
                    </div>
                `).join("")}
            </div>
        </div>`;
    }).join("");

    // RM Context: Clear Stalin Jose for Renjith
    const regionalRM = (tmName === 'RENJITH') ? "N/A" : (tmContext.find(m => m.rmName && m.rmName !== "N/A")?.rmName || "N/A");

    snapRoot.innerHTML = `
        <div class="snapshot-card">
            <div class="snapshot-header"><h2>SML Executive Intelligence: ${tmName}</h2></div>
            <div class="regional-strip" style="background: var(--sml-blue); color: white; margin:15px; padding:20px; border-radius:10px;">
                <div class="tier-title" style="font-size:10px; text-transform:uppercase; letter-spacing:2px; opacity:0.8;">Regional Manager Context</div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="font-size:1.2rem;">${regionalRM}</strong>
                    <span style="background:rgba(255,255,255,0.2); padding:5px 12px; border-radius:20px; font-weight:700;">
                        Total Activity — V: ${filtered.filter(f => f.activityType.includes("visit")).length} | C: ${filtered.filter(f => f.activityType.includes("call")).length}
                    </span>
                </div>
            </div>
            <div class="tier-panel">
                <div class="tier-title">District Management Mapping</div>
                <div class="manager-grid">${dmHtml}</div>
            </div>
            <div class="tier-panel">
                <div class="tier-title">Unit Management Modules (Branch Grouped)</div>
                <div class="manager-grid">${umHtml}</div>
            </div>
        </div>`;
}

/**
 * UPDATED: exportToCSV with Clean Renjith Hierarchy
 */
function exportToCSV() {
    if(activeFiltered.length === 0) return alert("No report data to export.");
    
    let csv = "RM,DM,UM,TM,Branch,Code,Employee,ID,Visit Target,Actual,Visit %,Call Target,Actual,Call %\n";
    
    const contextMap = {};
    const renjithCodes = activeMap.map(m => m.renjithCode).filter(c => c);
    activeMap.forEach(m => {
        if(currentTM === 'RENJITH' && renjithCodes.includes(m.renjithCode)) contextMap[m.renjithCode] = m;
        else if (m.tmOwner === currentTM) contextMap[m.branchCode] = m;
    });
    
    const empAgg = {};
    activeFiltered.forEach(r => {
        if(!empAgg[r.empCode]) empAgg[r.empCode] = { ...r, v: 0, c: 0 };
        if(r.activityType.includes("visit")) empAgg[r.empCode].v++;
        if(r.activityType.includes("call")) empAgg[r.empCode].c++;
    });

    Object.values(empAgg).forEach(e => {
        const h = contextMap[e.empCode] || contextMap[e.branchCode] || {rmName:"N/A", dmName:"N/A", umName:"N/A", tmOwner:currentTM};
        
        // HIERARCHY OVERRIDE FOR EXPORT
        let finalRM = h.rmName;
        let finalDM = h.dmName;
        let finalUM = h.umName;
        let finalTM = h.tmOwner;

        if (currentTM === 'RENJITH') {
            finalRM = "N/A"; // Clean RM
            finalDM = "RENJITH REGION";
            const checkUM = (h.renjithUM || "").trim().toUpperCase();
            finalUM = (checkUM === "SENTHIL KUMAR") ? "SENTHIL KUMAR" : "RENJITH (Direct)";
            finalTM = "RENJITH"; // Put Renjith back in the TM spot
        }

        const vT = 2; 
        const cT = 50;
        
        csv += `"${finalRM}","${finalDM}","${finalUM}","${finalTM}","${e.branchName}","${e.branchCode}","${e.empName}","${e.empCode}",${vT},${e.v},"${((e.v/vT)*100).toFixed(0)}%",${cT},${e.c},"${((e.c/cT)*100).toFixed(0)}%"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `SML_${currentTM}_Strategic_Report.csv`;
    link.click();
}
