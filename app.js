/* --- STATE --- */
let data = JSON.parse(localStorage.getItem("hw") || "[]");
let subjects = JSON.parse(localStorage.getItem("subjects") || '["คณิตศาสตร์", "วิทยาศาสตร์", "ภาษาไทย", "ภาษาอังกฤษ", "สังคม"]');
let editingId = null;
let currentFilter = 'All'; // [ใหม่] เก็บค่าวิชาที่เลือกดูอยู่

/* --- ELEMENTS --- */
const list = document.getElementById("list");
const modal = document.getElementById("modal");
const subModal = document.getElementById("subModal");

const addBtn = document.getElementById("addBtn");
const subjectBtn = document.getElementById("subjectBtn");

const due = document.getElementById("due");
const subjectSelect = document.getElementById("subject");
const title = document.getElementById("title");
const detail = document.getElementById("detail");

const saveBtn = document.querySelector(".save");
const cancelBtn = document.querySelector(".cancel");
const toggleDoneBtn = document.getElementById("toggleDoneBtn");
const deleteBtn = document.querySelector(".delete");

const pendingBox = document.getElementById("pendingBox");
const soonBox = document.getElementById("soonBox");

// Filter & Subject Management
const filterBar = document.getElementById("filterBar"); // [ใหม่]
const newSubjectInput = document.getElementById("newSubjectInput");
const addNewSubjectBtn = document.getElementById("addNewSubjectBtn");
const subjectList = document.getElementById("subjectList");
const closeSubBtn = document.getElementById("closeSubBtn");

/* --- SUBJECT & FILTER LOGIC --- */

function saveSubjects() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

// [ใหม่] ฟังก์ชันสร้างปุ่มตัวกรองด้านบน
function renderFilterBar() {
  filterBar.innerHTML = "";
  
  // ปุ่ม "ทั้งหมด"
  const allBtn = document.createElement("button");
  allBtn.className = `filter-chip ${currentFilter === 'All' ? 'active' : ''}`;
  allBtn.textContent = "🌈 ทั้งหมด";
  allBtn.onclick = () => {
    currentFilter = 'All';
    renderFilterBar();
    render();
  };
  filterBar.appendChild(allBtn);

  // ปุ่มวิชาต่างๆ
  subjects.forEach(sub => {
    const btn = document.createElement("button");
    btn.className = `filter-chip ${currentFilter === sub ? 'active' : ''}`;
    btn.textContent = sub;
    btn.onclick = () => {
      currentFilter = sub;
      renderFilterBar();
      render();
    };
    filterBar.appendChild(btn);
  });
}

function renderSubjectOptions() {
  // 1. Dropdown ในหน้าเพิ่มงาน
  subjectSelect.innerHTML = '<option value="">-- เลือกวิชา --</option>';
  subjects.forEach(sub => {
    const opt = document.createElement("option");
    opt.value = sub;
    opt.textContent = sub;
    subjectSelect.appendChild(opt);
  });

  // 2. รายการในหน้าจัดการวิชา (ลบ)
  subjectList.innerHTML = "";
  subjects.forEach((sub, index) => {
    const li = document.createElement("li");
    li.className = "subject-item";
    li.innerHTML = `
      <span>${sub}</span>
      <button class="del-sub-btn" onclick="deleteSubject(${index})">✕</button>
    `;
    subjectList.appendChild(li);
  });
}

function addSubject() {
  const val = newSubjectInput.value.trim();
  if (val && !subjects.includes(val)) {
    subjects.push(val);
    saveSubjects();
    renderSubjectOptions();
    renderFilterBar(); // อัปเดตแถบด้านบนด้วย
    newSubjectInput.value = "";
  }
}

window.deleteSubject = function(index) {
  const subName = subjects[index];
  if (confirm(`ต้องการลบวิชา "${subName}" ไหม?`)) {
    // ถ้าลบวิชาที่กำลังกรองอยู่ ให้กลับไปเลือกทั้งหมด
    if (currentFilter === subName) currentFilter = 'All';
    
    subjects.splice(index, 1);
    saveSubjects();
    renderSubjectOptions();
    renderFilterBar();
    render();
  }
};

/* --- EVENT LISTENERS --- */

subjectBtn.onclick = () => {
  renderSubjectOptions();
  subModal.classList.remove("hidden");
};
closeSubBtn.onclick = () => subModal.classList.add("hidden");
addNewSubjectBtn.onclick = addSubject;

function saveStorage() {
  localStorage.setItem("hw", JSON.stringify(data));
}

function clearForm() {
  due.value = "";
  subjectSelect.value = "";
  title.value = "";
  detail.value = "";
  editingId = null;
  toggleDoneBtn.className = "done";
  toggleDoneBtn.textContent = "✔ เสร็จแล้ว";
}

addBtn.onclick = () => {
  clearForm();
  renderSubjectOptions();
  // ถ้ากำลังเลือกกรองวิชาไหนอยู่ ให้ Auto เลือกวิชานั้นในฟอร์มเลย
  if (currentFilter !== 'All') {
    subjectSelect.value = currentFilter;
  }
  
  toggleDoneBtn.style.display = "none";
  deleteBtn.style.display = "none";
  document.getElementById("modalTitle").innerText = "✨ เพิ่มงานใหม่";
  modal.classList.remove("hidden");
};

cancelBtn.onclick = () => modal.classList.add("hidden");

window.onclick = (e) => {
  if (e.target === modal) modal.classList.add("hidden");
  if (e.target === subModal) subModal.classList.add("hidden");
};

/* SAVE */
saveBtn.onclick = () => {
  if (!title.value || !due.value) {
    alert("กรุณากรอกชื่องานและวันที่ส่งครับ ✨");
    return;
  }

  const formData = {
    due: due.value,
    subject: subjectSelect.value,
    title: title.value,
    detail: detail.value
  };

  if (editingId) {
    const i = data.findIndex(x => x.id === editingId);
    if (i !== -1) data[i] = { ...data[i], ...formData };
  } else {
    data.push({ id: Date.now(), done: false, ...formData });
  }

  saveStorage();
  modal.classList.add("hidden");
  render();
};

/* TOGGLE DONE */
toggleDoneBtn.onclick = () => {
  if (!editingId) return;
  const i = data.findIndex(x => x.id === editingId);
  if (i === -1) return;

  data[i].done = !data[i].done;
  saveStorage();
  modal.classList.add("hidden");
  render();
};

deleteBtn.onclick = () => {
  if (!editingId) return;
  if (confirm("ต้องการลบงานนี้จริงๆ ใช่ไหม?")) {
    data = data.filter(x => x.id !== editingId);
    saveStorage();
    modal.classList.add("hidden");
    render();
  }
};

/* RENDER MAIN LIST */
function render() {
  list.innerHTML = "";
  let pending = 0;
  let soon = 0;

  // กรองข้อมูลตามวิชาที่เลือก (currentFilter)
  let filteredData = data;
  if (currentFilter !== 'All') {
    filteredData = data.filter(item => item.subject === currentFilter);
  }

  const sortedData = [...filteredData].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return new Date(a.due) - new Date(b.due);
  });

  // คำนวณสถิติ (นับจากข้อมูลทั้งหมด ไม่ใช่แค่ที่กรอง)
  data.forEach(h => {
    if (!h.done) {
      pending++;
      const diff = Math.ceil((new Date(h.due) - new Date()) / 86400000);
      if (diff <= 1 && diff >= 0) soon++;
    }
  });

  if (sortedData.length === 0) {
    list.innerHTML = `<div style="text-align:center; margin-top:30px; color:#aaa;">
      ${currentFilter === 'All' ? 'ยังไม่มีงานจ้า 🎉' : 'ไม่มีงานวิชานี้ ✨'}
    </div>`;
  }

  sortedData.forEach(h => {
    const diff = Math.ceil((new Date(h.due) - new Date()) / 86400000);
    let statusText = `${diff} วัน`;
    let statusCls = "status-pending";
    let cardCls = "";

    if (h.done) {
      statusText = "✔ เสร็จแล้ว";
      statusCls = "status-done";
      cardCls = "done-card";
    } else {
      if (diff < 0) {
        statusText = "⚠️ เกินกำหนด";
        statusCls = "status-soon";
      } else if (diff <= 1) {
        statusText = "🔥 ใกล้ส่ง";
        statusCls = "status-soon";
      }
    }

    const item = document.createElement("div");
    item.className = `task-item ${cardCls}`;
    item.innerHTML = `
      <div class="task-header">
        <h3 class="task-title">${h.title}</h3>
        <span class="task-status ${statusCls}">${statusText}</span>
      </div>
      <div class="task-meta">
        <span class="subject-tag">📘 ${h.subject || "ทั่วไป"}</span>
        <span>📅 ${new Date(h.due).toLocaleDateString('th-TH')}</span>
      </div>
    `;

    item.onclick = () => openDetail(h.id);
    list.appendChild(item);
  });

  // อัปเดตตัวเลขหน้ากล่อง
  pendingBox.textContent = pending;
  soonBox.textContent = soon;

  const pendingCard = document.querySelector(".sum-card.pending");
  if (pending === 0) pendingCard.classList.add("none");
  else pendingCard.classList.remove("none");
}

function openDetail(id) {
  const h = data.find(x => x.id === id);
  if (!h) return;
  editingId = id;
  renderSubjectOptions();

  due.value = h.due;
  subjectSelect.value = h.subject || "";
  title.value = h.title;
  detail.value = h.detail;

  if (h.done) {
    toggleDoneBtn.textContent = "↩ ยกเลิกสถานะเสร็จ";
    toggleDoneBtn.className = "undone";
  } else {
    toggleDoneBtn.textContent = "✔ เสร็จแล้ว";
    toggleDoneBtn.className = "done";
  }

  toggleDoneBtn.style.display = "block";
  deleteBtn.style.display = "block";
  document.getElementById("modalTitle").innerText = "✏️ แก้ไขงาน";
  modal.classList.remove("hidden");
}

// เริ่มต้นทำงาน
renderFilterBar();
renderSubjectOptions();
render();
