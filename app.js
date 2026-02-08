/* --- STATE --- */
let data = JSON.parse(localStorage.getItem("homeworks_v2") || "[]");
let subjects = JSON.parse(localStorage.getItem("subjects_v2") || '["คณิตศาสตร์", "วิทยาศาสตร์", "ภาษาไทย"]');
let editingId = null;
let currentFilter = 'All';

/* --- ELEMENTS --- */
const list = document.getElementById("list");
const modal = document.getElementById("modal");
const subModal = document.getElementById("subModal");
const subjectScroll = document.getElementById("subjectScroll");

/* --- MOUSE DRAG SCROLL --- */
function initDragScroll(el) {
    let isDown = false, startX, scrollLeft;
    el.addEventListener('mousedown', (e) => {
        isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft;
    });
    el.addEventListener('mouseleave', () => isDown = false);
    el.addEventListener('mouseup', () => isDown = false);
    el.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 2;
        el.scrollLeft = scrollLeft - walk;
    });
}
initDragScroll(subjectScroll);

/* --- SUBJECT LOGIC (เพิ่ม/ลบ) --- */
function renderSubjectUI() {
    // 1. แถบ Filter
    document.getElementById("fixedFilter").innerHTML = "";
    subjectScroll.innerHTML = "";
    const allBtn = document.createElement("button");
    allBtn.className = `filter-chip ${currentFilter === 'All' ? 'active' : ''}`;
    allBtn.textContent = "🌈 ทั้งหมด";
    allBtn.onclick = () => { currentFilter = 'All'; render(); renderSubjectUI(); };
    document.getElementById("fixedFilter").appendChild(allBtn);

    subjects.forEach(sub => {
        const btn = document.createElement("button");
        btn.className = `filter-chip ${currentFilter === sub ? 'active' : ''}`;
        btn.textContent = sub;
        btn.onclick = () => { currentFilter = sub; render(); renderSubjectUI(); };
        subjectScroll.appendChild(btn);
    });

    // 2. รายการใน Modal จัดการวิชา
    const manageList = document.getElementById("subjectManagementList");
    manageList.innerHTML = "";
    subjects.forEach((sub, index) => {
        const div = document.createElement("div");
        div.className = "sub-item";
        div.innerHTML = `<span>${sub}</span><button class="btn-danger" style="padding:4px 8px; font-size:12px" onclick="deleteSubject(${index})">ลบ</button>`;
        manageList.appendChild(div);
    });

    // 3. Dropdown ในหน้าเพิ่มงาน
    const select = document.getElementById("subjectSelect");
    select.innerHTML = '<option value="">-- ทั่วไป --</option>';
    subjects.forEach(sub => {
        select.innerHTML += `<option value="${sub}">${sub}</option>`;
    });
}

window.deleteSubject = (index) => {
    if (confirm(`ลบวิชา "${subjects[index]}" ใช่หรือไม่?`)) {
        if (currentFilter === subjects[index]) currentFilter = 'All';
        subjects.splice(index, 1);
        localStorage.setItem("subjects_v2", JSON.stringify(subjects));
        renderSubjectUI();
        render();
    }
};

document.getElementById("addNewSubjectBtn").onclick = () => {
    const input = document.getElementById("newSubjectInput");
    const val = input.value.trim();
    if (val && !subjects.includes(val)) {
        subjects.push(val);
        localStorage.setItem("subjects_v2", JSON.stringify(subjects));
        input.value = "";
        renderSubjectUI();
    }
};

/* --- TASK LOGIC --- */
document.getElementById("addBtn").onclick = () => {
    editingId = null;
    document.getElementById("modalTitle").innerText = "＋ เพิ่มงานใหม่";
    document.getElementById("title").value = "";
    document.getElementById("due").value = "";
    document.getElementById("detail").value = "";
    document.getElementById("subjectSelect").value = "";
    
    // ซ่อนปุ่ม ลบ/เสร็จแล้ว เวลาเพิ่มงานใหม่
    document.getElementById("deleteBtn").classList.add("hidden");
    document.getElementById("toggleDoneBtn").classList.add("hidden");
    modal.classList.remove("hidden");
};

function openEdit(h) {
    editingId = h.id;
    document.getElementById("modalTitle").innerText = "✏️ แก้ไขงาน";
    document.getElementById("title").value = h.title;
    document.getElementById("due").value = h.due;
    document.getElementById("detail").value = h.detail;
    document.getElementById("subjectSelect").value = h.subject || "";

    document.getElementById("deleteBtn").classList.remove("hidden");
    document.getElementById("toggleDoneBtn").classList.remove("hidden");
    document.getElementById("toggleDoneBtn").innerText = h.done ? "↩ ยังไม่เสร็จ" : "✔ เสร็จแล้ว";
    
    modal.classList.remove("hidden");
}

/* --- BUTTON ACTIONS --- */
document.getElementById("saveBtn").onclick = () => {
    const title = document.getElementById("title").value;
    const due = document.getElementById("due").value;
    if (!title || !due) return alert("กรุณาใส่ชื่อและวันที่ส่ง");

    if (editingId) {
        const idx = data.findIndex(x => x.id === editingId);
        data[idx] = { ...data[idx], title, due, detail: document.getElementById("detail").value, subject: document.getElementById("subjectSelect").value };
    } else {
        data.push({ id: Date.now(), title, due, detail: document.getElementById("detail").value, subject: document.getElementById("subjectSelect").value, done: false });
    }
    saveAndClose();
};

document.getElementById("deleteBtn").onclick = () => {
    if (confirm("ลบงานนี้ถาวรใช่ไหม?")) {
        data = data.filter(x => x.id !== editingId);
        saveAndClose();
    }
};

document.getElementById("toggleDoneBtn").onclick = () => {
    const idx = data.findIndex(x => x.id === editingId);
    data[idx].done = !data[idx].done;
    saveAndClose();
};

function saveAndClose() {
    localStorage.setItem("homeworks_v2", JSON.stringify(data));
    modal.classList.add("hidden");
    render();
}

/* --- RENDER MAIN --- */
function render() {
    list.innerHTML = "";
    let pending = 0, soon = 0;
    const filtered = (currentFilter === 'All') ? data : data.filter(x => x.subject === currentFilter);

    filtered.sort((a,b) => a.done - b.done || new Date(a.due) - new Date(b.due));

    filtered.forEach(h => {
        const diff = Math.ceil((new Date(h.due) - new Date().setHours(0,0,0,0)) / 86400000);
        if (!h.done) {
            pending++;
            if (diff <= 1) soon++;
        }

        const item = document.createElement("div");
        item.className = `task-item ${h.done ? 'done-card' : ''}`;
        item.innerHTML = `
            <div style="display:flex; justify-content:space-between">
                <strong>${h.title}</strong>
                <small style="color:var(--primary)">${h.subject || 'ทั่วไป'}</small>
            </div>
            <div style="margin-top:5px; font-size:13px; color:#64748b">
                📅 ส่ง: ${h.due} (${h.done ? 'สำเร็จ' : diff + ' วัน'})
            </div>
        `;
        item.onclick = () => openEdit(h);
        list.appendChild(item);
    });

    document.getElementById("pendingBox").innerText = pending;
    document.getElementById("soonBox").innerText = soon;
}

// UI Controls
document.getElementById("cancelModalBtn").onclick = () => modal.classList.add("hidden");
document.getElementById("closeSubBtn").onclick = () => subModal.classList.add("hidden");
document.getElementById("subjectBtn").onclick = () => { renderSubjectUI(); subModal.classList.remove("hidden"); };

renderSubjectUI();
render();
