/* --- STATE --- */
let data = JSON.parse(localStorage.getItem("hw") || "[]");
let subjects = JSON.parse(localStorage.getItem("subjects") || '["คณิตศาสตร์", "อังกฤษ"]');
let editingId = null;
let currentFilter = 'All';

/* --- ELEMENTS --- */
const list = document.getElementById("list");
const modal = document.getElementById("modal");
const subModal = document.getElementById("subModal");
const subjectScroll = document.getElementById("subjectScroll");

/* --- [ใหม่] ฟังก์ชันทำให้เมาส์คลิกลากเลื่อนได้ (Mouse Drag Scroll) --- */
function enableDragScroll(el) {
    let isDown = false;
    let startX;
    let scrollLeft;

    el.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
    });
    el.addEventListener('mouseleave', () => isDown = false);
    el.addEventListener('mouseup', () => isDown = false);
    el.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 2; // คูณ 2 เพื่อความเร็วในการลาก
        el.scrollLeft = scrollLeft - walk;
    });
}
enableDragScroll(subjectScroll); // เปิดใช้งานกับแถบวิชา

/* --- RENDER FILTER --- */
function renderFilterBar() {
    document.getElementById("fixedFilter").innerHTML = "";
    subjectScroll.innerHTML = "";

    const allBtn = document.createElement("button");
    allBtn.className = `filter-chip ${currentFilter === 'All' ? 'active' : ''}`;
    allBtn.textContent = "🌈 ทั้งหมด";
    allBtn.onclick = () => { currentFilter = 'All'; render(); renderFilterBar(); };
    document.getElementById("fixedFilter").appendChild(allBtn);

    subjects.forEach(sub => {
        const btn = document.createElement("button");
        btn.className = `filter-chip ${currentFilter === sub ? 'active' : ''}`;
        btn.textContent = sub;
        btn.onclick = () => { currentFilter = sub; render(); renderFilterBar(); };
        subjectScroll.appendChild(btn);
    });
}

/* --- MODAL CONTROLS --- */
document.getElementById("addBtn").onclick = () => {
    editingId = null;
    document.getElementById("modalTitle").innerText = "✨ เพิ่มงานใหม่";
    document.getElementById("title").value = "";
    document.getElementById("due").value = "";
    document.getElementById("detail").value = "";
    document.getElementById("deleteBtn").style.display = "none";
    document.getElementById("toggleDoneBtn").style.display = "none";
    renderSubjectOptions();
    modal.classList.remove("hidden");
};

// แก้ไขปุ่มยกเลิกและปิดหน้าต่าง
document.getElementById("cancelModalBtn").onclick = () => modal.classList.add("hidden");
document.getElementById("closeSubBtn").onclick = () => subModal.classList.add("hidden");
document.getElementById("subjectBtn").onclick = () => { renderSubjectOptions(); subModal.classList.remove("hidden"); };

/* --- SAVE & RENDER --- */
document.getElementById("saveBtn").onclick = () => {
    const title = document.getElementById("title").value;
    const due = document.getElementById("due").value;
    if(!title || !due) return alert("กรุณากรอกข้อมูลให้ครบ");

    const newItem = {
        id: editingId || Date.now(),
        title: title,
        due: due,
        subject: document.getElementById("subjectSelect").value,
        detail: document.getElementById("detail").value,
        done: editingId ? data.find(x => x.id === editingId).done : false
    };

    if(editingId) {
        const idx = data.findIndex(x => x.id === editingId);
        data[idx] = newItem;
    } else {
        data.push(newItem);
    }

    localStorage.setItem("hw", JSON.stringify(data));
    modal.classList.add("hidden");
    render();
};

function render() {
    list.innerHTML = "";
    let pending = 0; let soon = 0;
    
    let filtered = (currentFilter === 'All') ? data : data.filter(x => x.subject === currentFilter);

    filtered.forEach(h => {
        const diff = Math.ceil((new Date(h.due) - new Date().setHours(0,0,0,0)) / 86400000);
        if(!h.done) {
            pending++;
            if(diff <= 1) soon++;
        }

        const div = document.createElement("div");
        div.className = `task-item ${h.done ? 'done-card' : ''}`;
        div.innerHTML = `<strong>${h.title}</strong><br><small>${h.subject || 'ทั่วไป'} | ส่งใน ${diff} วัน</small>`;
        div.onclick = () => openEdit(h);
        list.appendChild(div);
    });

    document.getElementById("pendingBox").innerText = pending;
    document.getElementById("soonBox").innerText = soon;
}

function openEdit(h) {
    editingId = h.id;
    document.getElementById("modalTitle").innerText = "✏️ แก้ไขงาน";
    document.getElementById("title").value = h.title;
    document.getElementById("due").value = h.due;
    document.getElementById("detail").value = h.detail;
    renderSubjectOptions();
    document.getElementById("subjectSelect").value = h.subject;
    
    document.getElementById("deleteBtn").style.display = "block";
    document.getElementById("toggleDoneBtn").style.display = "block";
    modal.classList.remove("hidden");
}

function renderSubjectOptions() {
    const select = document.getElementById("subjectSelect");
    select.innerHTML = '<option value="">-- ทั่วไป --</option>';
    subjects.forEach(s => select.innerHTML += `<option value="${s}">${s}</option>`);
}

// เริ่มต้นระบบ
renderFilterBar();
render();
