let data = JSON.parse(localStorage.getItem("hw") || "[]");
let editingId = null;

const list = document.getElementById("list");
const modal = document.getElementById("modal");
const addBtn = document.getElementById("addBtn");

const assigned = document.getElementById("assigned");
const due = document.getElementById("due");
const subject = document.getElementById("subject");
const title = document.getElementById("title");
const detail = document.getElementById("detail");
const teacher = document.getElementById("teacher");

const saveBtn = document.querySelector(".save");
const cancelBtn = document.querySelector(".cancel");

const pendingCount = document.getElementById("pendingCount");
const pendingBox = document.getElementById("pendingBox");
const soonBox = document.getElementById("soonBox");

/* UTIL */
function saveStorage() {
  localStorage.setItem("hw", JSON.stringify(data));
}

function clearForm() {
  assigned.value = "";
  due.value = "";
  subject.value = "";
  title.value = "";
  detail.value = "";
  teacher.value = "";
  editingId = null;
}

/* MODAL */
addBtn.onclick = () => {
  clearForm();
  modal.classList.remove("hidden");
};

cancelBtn.onclick = () => modal.classList.add("hidden");

modal.onclick = e => {
  if (e.target === modal) modal.classList.add("hidden");
};

/* SAVE */
saveBtn.onclick = () => {
  if (!title.value || !due.value) return;

  if (editingId) {
    const i = data.findIndex(x => x.id === editingId);
    data[i] = { ...data[i], ...getFormData() };
  } else {
    data.push({ id: Date.now(), done: false, ...getFormData() });
  }

  saveStorage();
  modal.classList.add("hidden");
  render();
};

function getFormData() {
  return {
    assigned: assigned.value,
    due: due.value,
    subject: subject.value,
    title: title.value,
    detail: detail.value,
    teacher: teacher.value
  };
}

function render() {
  list.innerHTML = "";
  let pending = 0;
  let soon = 0;

  data.forEach(h => {
    const diff = Math.ceil(
      (new Date(h.due) - new Date()) / 86400000
    );

    let status = "ค้าง";
    let cls = "status-pending";

    if (h.done) {
      status = "เสร็จแล้ว";
      cls = "status-done";
    } else if (diff <= 1) {
      status = "ใกล้ส่ง";
      cls = "status-soon";
      soon++;
    }

    if (!h.done) pending++;

    const item = document.createElement("div");
    item.className = "task-item";
    item.innerHTML = `
      <div class="task-title">${h.title}</div>
      <div class="task-status ${cls}">${status}</div>
    `;

    item.onclick = () => openDetail(h.id);
    list.appendChild(item);
  });

  /* ===== อัปเดตตัวเลข ===== */
  pendingCount.textContent = pending;
  pendingBox.textContent = pending;
  soonBox.textContent = soon;

  /* ===== เปลี่ยนสีการ์ดงานค้าง ===== */
  const pendingCard = document.querySelector(".sum-card.pending");

  if (pending === 0) {
    pendingCard.classList.add("none");
  } else {
    pendingCard.classList.remove("none");
  }
}

function openDetail(id) {
  const h = data.find(x => x.id === id);
  if (!h) return;

  editingId = id;
  assigned.value = h.assigned;
  due.value = h.due;
  subject.value = h.subject;
  title.value = h.title;
  detail.value = h.detail;
  teacher.value = h.teacher;

  modal.classList.remove("hidden");
}

render();
