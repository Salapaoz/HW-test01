let data = JSON.parse(localStorage.getItem("hw_pro_data") || "[]");
let subjects = JSON.parse(localStorage.getItem("hw_pro_subs") || '["คณิตศาสตร์", "ฟิสิกส์", "อังกฤษ"]');
let editingId = null;
let currentFilter = 'All';

const list = document.getElementById("list");
const modal = document.getElementById("modal");
const subModal = document.getElementById("subModal");

function renderSubjectUI() {
    // 1. Filter Chips
    document.getElementById("fixedFilter").innerHTML = `<button class="filter-chip ${currentFilter === 'All' ? 'active' : ''}" onclick="setFilter('All')">🌈 ทั้งหมด</button>`;
    const scroll = document.getElementById("subjectScroll");
    scroll.innerHTML = subjects.map(s => `<button class="filter-chip ${currentFilter === s ? 'active' : ''}" onclick="setFilter('${s}')">${s}</button>`).join('');

    // 2. Dropdown (No "General")
    const select = document.getElementById("subjectSelect");
    select.innerHTML = subjects.map(s => `<option value="${s}">${s}</option>`).join('');

    // 3. Management List
    const manageList = document.getElementById("subjectManagementList");
    manageList.innerHTML = subjects.map((sub, i) => `
        <div class="sub-row">
            <span>${sub}</span>
            <button onclick="deleteSubject(${i})" style="color:#e11d48; border:none; background:none; cursor:pointer;">ลบ</button>
        </div>
    `).join('');
}

window.setFilter = (f) => { currentFilter = f; renderSubjectUI(); render(); };

window.deleteSubject = (index) => {
    if(confirm(`ลบวิชา "${subjects[index]}" ใช่ไหม?`)) {
        subjects.splice(index, 1);
        localStorage.setItem("hw_pro_subs", JSON.stringify(subjects));
        renderSubjectUI();
        render();
    }
};

document.getElementById("addNewSubjectBtn").onclick = () => {
    const input = document.getElementById("newSubjectInput");
    const val = input.value.trim();
    if(val && !subjects.includes(val)) {
        subjects.push(val);
        localStorage.setItem("hw_pro_subs", JSON.stringify(subjects));
        input.value = "";
        renderSubjectUI();
    }
};

document.getElementById("addBtn").onclick = () => {
    if(subjects.length === 0) return alert("กรุณาเพิ่มวิชาก่อนนะ!");
    editingId = null;
    document.getElementById("modalTitle").innerText = "＋ เพิ่มงานใหม่";
    document.getElementById("title").value = "";
    document.getElementById("due").value = "";
    document.getElementById("detail").value = "";
    document.getElementById("deleteBtn").classList.add("hidden");
    document.getElementById("toggleDoneBtn").classList.add("hidden");
    modal.classList.remove("hidden");
};

document.getElementById("saveBtn").onclick = () => {
    const title = document.getElementById("title").value;
    const due = document.getElementById("due").value;
    const subject = document.getElementById("subjectSelect").value;
    if(!title || !due) return alert("ใส่ชื่อและวันที่ด้วยจ้า");

    if(editingId) {
        const idx = data.findIndex(x => x.id === editingId);
        data[idx] = { ...data[idx], title, due, subject, detail: document.getElementById("detail").value };
    } else {
        data.push({ id: Date.now(), title, due, subject, detail: document.getElementById("detail").value, done: false });
    }
    saveAndClose();
};

function saveAndClose() {
    localStorage.setItem("hw_pro_data", JSON.stringify(data));
    modal.classList.add("hidden");
    render();
}

function render() {
    list.innerHTML = "";
    let pending = 0, soon = 0;
    const filtered = currentFilter === 'All' ? data : data.filter(x => x.subject === currentFilter);

    filtered.forEach(h => {
        const diff = Math.ceil((new Date(h.due) - new Date().setHours(0,0,0,0)) / 86400000);
        if(!h.done) {
            pending++;
            if(diff <= 1) soon++;
        }
        const item = document.createElement("div");
        item.className = `task-item ${h.done ? 'done-card' : ''}`;
        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>${h.title}</strong>
                <span style="font-size:0.75rem; background:#f1f5f9; padding:2px 8px; border-radius:8px;">${h.subject}</span>
            </div>
            <div style="font-size:0.85rem; color:#64748b; margin-top:5px;">📅 ส่ง: ${h.due} (${h.done ? 'เสร็จ' : diff+' วัน'})</div>
        `;
        item.onclick = () => {
            editingId = h.id;
            document.getElementById("modalTitle").innerText = "✏️ แก้ไขงาน";
            document.getElementById("title").value = h.title;
            document.getElementById("due").value = h.due;
            document.getElementById("subjectSelect").value = h.subject;
            document.getElementById("detail").value = h.detail;
            document.getElementById("deleteBtn").classList.remove("hidden");
            document.getElementById("toggleDoneBtn").classList.remove("hidden");
            document.getElementById("toggleDoneBtn").innerText = h.done ? "↩ ยังไม่เสร็จ" : "✔ เสร็จแล้ว";
            modal.classList.remove("hidden");
        };
        list.appendChild(item);
    });
    document.getElementById("pendingBox").innerText = pending;
    document.getElementById("soonBox").innerText = soon;
}

document.getElementById("deleteBtn").onclick = () => {
    if(confirm("ลบงานนี้ใช่ไหม?")) {
        data = data.filter(x => x.id !== editingId);
        saveAndClose();
    }
};

document.getElementById("toggleDoneBtn").onclick = () => {
    const idx = data.findIndex(x => x.id === editingId);
    data[idx].done = !data[idx].done;
    saveAndClose();
};

document.getElementById("cancelModalBtn").onclick = () => modal.classList.add("hidden");
document.getElementById("subjectBtn").onclick = () => subModal.classList.remove("hidden");
document.getElementById("closeSubBtn").onclick = () => subModal.classList.add("hidden");

renderSubjectUI();
render();
