/* --- STATE --- */
let data = JSON.parse(localStorage.getItem("hw") || "[]");
let subjects = JSON.parse(localStorage.getItem("subjects") || '["คณิตศาสตร์", "วิทยาศาสตร์", "ภาษาไทย", "ภาษาอังกฤษ"]');
let editingId = null;
let currentFilter = 'All';

/* --- ELEMENTS --- */
const list = document.getElementById("list");
const modal = document.getElementById("modal");
const subModal = document.getElementById("subModal");

const fixedFilter = document.getElementById("fixedFilter");
const subjectScroll = document.getElementById("subjectScroll");

// ฟอร์ม
const titleInput = document.getElementById("title");
const dueInput = document.getElementById("due");
const subjectSelect = document.getElementById("subjectSelect");
const detailInput = document.getElementById("detail");

// ปุ่ม
const addBtn = document.getElementById("addBtn");
const subjectBtn = document.getElementById("subjectBtn");
const saveBtn = document.getElementById("saveBtn");
const deleteBtn = document.getElementById("deleteBtn");
const toggleDoneBtn = document.getElementById("toggleDoneBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const closeSubBtn = document.getElementById("closeSubBtn");
const addNewSubjectBtn = document.getElementById("addNewSubjectBtn");

/* --- FILTER LOGIC --- */

function renderFilterBar() {
    fixedFilter.innerHTML = "";
    subjectScroll.innerHTML = "";

    // ปุ่มทั้งหมด (Fixed)
    const allBtn = document.createElement("button");
    allBtn.className = `filter-chip ${currentFilter === 'All' ? 'active' : ''}`;
    allBtn.textContent = "🌈 ทั้งหมด";
    allBtn.onclick = () => { currentFilter = 'All'; renderFilterBar(); render(); };
    fixedFilter.appendChild(allBtn);

    // ปุ่มรายวิชา (Scrollable)
    subjects.forEach(sub => {
        const btn = document.createElement("button");
        btn.className = `filter-chip ${currentFilter === sub ? 'active' : ''}`;
        btn.textContent = sub;
        btn.onclick = () => { currentFilter = sub; renderFilterBar(); render(); };
        subjectScroll.appendChild(btn);
    });
}

/* --- SUBJECT MANAGEMENT --- */

function renderSubjectOptions() {
    // อัปเดต Dropdown
    subjectSelect.innerHTML = '<option value="">-- ทั่วไป --</option>';
    subjects.forEach(sub => {
        const opt = document.createElement("option");
        opt.value = sub;
        opt.textContent = sub;
        subjectSelect.appendChild(opt);
    });

    // อัปเดตรายการลบวิชา
    const subjectList = document.getElementById("subjectList");
    subjectList.innerHTML = "";
    subjects.forEach((sub, index) => {
        const li = document.createElement("li");
        li.className = "subject-item";
        li.innerHTML = `<span>${sub}</span><button style="color:red;border:none;background:none;cursor:pointer" onclick="deleteSubject(${index})">✕</button>`;
        subjectList.appendChild(li);
    });
}

window.deleteSubject = function(index) {
    if(confirm(`ลบวิชา "${subjects[index]}" ใช่ไหม?`)) {
        if(currentFilter === subjects[index]) currentFilter = 'All';
        subjects.splice(index, 1);
        localStorage.setItem("subjects", JSON.stringify(subjects));
        renderSubjectOptions();
        renderFilterBar();
        render();
    }
}

addNewSubjectBtn.onclick = () => {
    const val = document.getElementById("newSubjectInput").value.trim();
    if(val && !subjects.includes(val)) {
        subjects.push(val);
        localStorage.setItem("subjects", JSON.stringify(subjects));
        document.getElementById("newSubjectInput").value = "";
        renderSubjectOptions();
        renderFilterBar();
    }
};

/* --- MODAL CONTROL --- */

addBtn.onclick = () => {
    editingId = null;
    titleInput.value = "";
    dueInput.value = "";
    detailInput.value = "";
    subjectSelect.value = (currentFilter !== 'All') ? currentFilter : "";
    
    deleteBtn.style.display = "none";
    toggleDoneBtn.style.display = "none";
    document.getElementById("modalTitle").innerText = "✨ เพิ่มงานใหม่";
    renderSubjectOptions();
    modal.classList.remove("hidden");
};

// แก้ปัญหาปุ่มยกเลิกใช้ไม่ได้
cancelModalBtn.onclick = () => modal.classList.add("hidden");
closeSubBtn.onclick = () => subModal.classList.add("hidden");
subjectBtn.onclick = () => { renderSubjectOptions(); subModal.classList.remove("hidden"); };

/* --- CORE FUNCTIONS --- */

saveBtn.onclick = () => {
    if(!titleInput.value || !dueInput.value) return alert("กรอกชื่อและวันส่งด้วยจ้า");
    
    const hw = {
        id: editingId || Date.now(),
        title: titleInput.value,
        due: dueInput.value,
        subject: subjectSelect.value,
        detail: detailInput.value,
        done: editingId ? data.find(x => x.id === editingId).done : false
    };

    if(editingId) {
        const i = data.findIndex(x => x.id === editingId);
        data[i] = hw;
    } else {
        data.push(hw);
    }

    localStorage.setItem("hw", JSON.stringify(data));
    modal.classList.add("hidden");
    render();
};

deleteBtn.onclick = () => {
    if(confirm("ลบงานนี้ใช่ไหม?")) {
        data = data.filter(x => x.id !== editingId);
        localStorage.setItem("hw", JSON.stringify(data));
        modal.classList.add("hidden");
        render();
    }
};

toggleDoneBtn.onclick = () => {
    const i = data.findIndex(x => x.id === editingId);
    data[i].done = !data[i].done;
    localStorage.setItem("hw", JSON.stringify(data));
    modal.classList.add("hidden");
    render();
};

function render() {
    list.innerHTML = "";
    let pending = 0; let soon = 0;

    // Filter
    let filtered = data;
    if(currentFilter !== 'All') filtered = data.filter(x => x.subject === currentFilter);

    // Sort: งานไม่เสร็จขึ้นก่อน ตามด้วยวันส่ง
    filtered.sort((a,b) => (a.done === b.done) ? new Date(a.due) - new Date(b.due) : a.done - b.done);

    filtered.forEach(h => {
        const diff = Math.ceil((new Date(h.due) - new Date().setHours(0,0,0,0)) / 86400000);
        if(!h.done) {
            pending++;
            if(diff <= 1) soon++;
        }

        const item = document.createElement("div");
        item.className = `task-item ${h.done ? 'done-card' : ''}`;
        
        let statusText = h.done ? "เสร็จแล้ว" : (diff < 0 ? "เกินกำหนด" : `${diff} วัน`);
        let statusCls = h.done ? "status-done" : (diff <= 1 ? "status-soon" : "status-pending");

        item.innerHTML = `
            <div class="task-header">
                <span class="task-title">${h.title}</span>
                <span class="task-status ${statusCls}">${statusText}</span>
            </div>
            <div class="subject-tag">${h.subject ? '📘 ' + h.subject : '📝 ทั่วไป'}</div>
        `;
        item.onclick = () => openEdit(h);
        list.appendChild(item);
    });

    document.getElementById("pendingBox").textContent = pending;
    document.getElementById("soonBox").textContent = soon;
}

function openEdit(h) {
    editingId = h.id;
    renderSubjectOptions();
    titleInput.value = h.title;
    dueInput.value = h.due;
    subjectSelect.value = h.subject;
    detailInput.value = h.detail;

    deleteBtn.style.display = "block";
    toggleDoneBtn.style.display = "block";
    toggleDoneBtn.innerText = h.done ? "↩ ยังไม่เสร็จ" : "✔ เสร็จแล้ว";
    toggleDoneBtn.className = h.done ? "undone" : "done";
    
    document.getElementById("modalTitle").innerText = "✏️ แก้ไขงาน";
    modal.classList.remove("hidden");
}

/* --- INIT --- */
renderFilterBar();
render();
