// --- การจัดการข้อมูล ---
let data = JSON.parse(localStorage.getItem("hw_data") || "[]");
let subjects = JSON.parse(localStorage.getItem("hw_subs") || '["คณิตศาสตร์", "วิทยาศาสตร์", "ภาษาไทย"]');
let editingId = null;
let currentFilter = 'All';

// --- ตัวแปรหน้าจอ ---
const list = document.getElementById("list");
const modal = document.getElementById("modal");
const subModal = document.getElementById("subModal");
const subjectScroll = document.getElementById("subjectScroll");

// --- ระบบเลื่อนแถบวิชาด้วยเมาส์ ---
function initDrag(el) {
    let isDown = false, startX, scrollLeft;
    el.addEventListener('mousedown', (e) => { isDown = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft; });
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
initDrag(subjectScroll);

// --- จัดการรายวิชา ---
function renderSubjectUI() {
    // แถบ Filter ด้านบน
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

    // รายการลบวิชาใน Modal
    const manageList = document.getElementById("subjectManagementList");
    manageList.innerHTML = "";
    subjects.forEach((sub, index) => {
        const div = document.createElement("div");
        div.className = "sub-row";
        div.innerHTML = `<span>${sub}</span><button class="btn-delete" style="padding:5px 10px; font-size:12px" onclick="deleteSubject(${index})">ลบ</button>`;
        manageList.appendChild(div);
    });

    // ตัวเลือกในหน้าเพิ่มงาน
    const select = document.getElementById("subjectSelect");
    select.innerHTML = '<option value="">-- ทั่วไป --</option>';
    subjects.forEach(sub => {
        select.innerHTML += `<option value="${sub}">${sub}</option>`;
    });
}

window.deleteSubject = (index) => {
    if (confirm(`ลบวิชา "${subjects[index]}" ข้อมูลงานในวิชานี้จะไม่หาย แต่หมวดหมู่จะถูกถอดออก ยืนยันไหม?`)) {
        if (currentFilter === subjects[index]) currentFilter = 'All';
        subjects.splice(index, 1);
        localStorage.setItem("hw_subs", JSON.stringify(subjects));
        renderSubjectUI();
        render();
    }
};

document.getElementById("addNewSubjectBtn").onclick = () => {
    const input = document.getElementById("newSubjectInput");
    const val = input.value.trim();
    if (val && !subjects.includes(val)) {
        subjects.push(val);
        localStorage.setItem("hw_subs", JSON.stringify(subjects));
        input.value = "";
        renderSubjectUI();
    }
};

// --- จัดการงาน ---
document.getElementById("addBtn").onclick = () => {
    editingId = null;
    document.getElementById("modalTitle").innerText = "＋ เพิ่มงานใหม่";
    document.getElementById("title").value = "";
    document.getElementById("due").value = "";
    document.getElementById("detail").value = "";
    document.getElementById("subjectSelect").value = "";
    
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

document.getElementById("saveBtn").onclick = () => {
    const title = document.getElementById("title").value;
    const due = document.getElementById("due").value;
    if (!title || !due) return alert("ใส่ชื่อและวันที่ด้วยนะจ๊ะ");

    if (editingId) {
        const idx = data.findIndex(x => x.id === editingId);
        data[idx] = { ...data[idx], title, due, detail: document.getElementById("detail").value, subject: document.getElementById("subjectSelect").value };
    } else {
        data.push({ id: Date.now(), title, due, detail: document.getElementById("detail").value, subject: document.getElementById("subjectSelect").value, done: false });
    }
    saveAndClose();
};

document.getElementById("deleteBtn").onclick = () => {
    if (confirm("จะลบงานนี้จริงๆ หรอ?")) {
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
    localStorage.setItem("hw_data", JSON.stringify(data));
    modal.classList.add("hidden");
    render();
}

// --- การแสดงผลหลัก ---
function render() {
    list.innerHTML = "";
    let pending = 0, soon = 0;
    const filtered = (currentFilter === 'All') ? data : data.filter(x => x.subject === currentFilter);

    // เรียง: ยังไม่เสร็จขึ้นก่อน -> วันที่ใกล้สุดขึ้นก่อน
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
            <div style="display:flex; justify-content:space-between; align-items:center">
                <strong style="font-size:1.1rem">${h.title}</strong>
                <span style="font-size:12px; background:#f1f5f9; padding:4px 10px; border-radius:10px">${h.subject || 'ทั่วไป'}</span>
            </div>
            <div style="margin-top:8px; font-size:14px; color:#64748b">
                📅 กำหนดส่ง: ${h.due} <span style="color:${diff <=1 && !h.done ? 'red' : 'inherit'}">(${h.done ? 'เสร็จสิ้น' : diff + ' วัน'})</span>
            </div>
        `;
        item.onclick = () => openEdit(h);
        list.appendChild(item);
    });

    document.getElementById("pendingBox").innerText = pending;
    document.getElementById("soonBox").innerText = soon;
}

// แปะ Event อื่นๆ
document.getElementById("cancelModalBtn").onclick = () => modal.classList.add("hidden");
document.getElementById("closeSubBtn").onclick = () => subModal.classList.add("hidden");
document.getElementById("subjectBtn").onclick = () => { renderSubjectUI(); subModal.classList.remove("hidden"); };

// รันครั้งแรก
renderSubjectUI();
render();
