const modal = document.getElementById("modal");
const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveBtn");
const list = document.getElementById("list");
const pendingCount = document.getElementById("pendingCount");

const assigned = document.getElementById("assigned");
const due = document.getElementById("due");
const subject = document.getElementById("subject");
const title = document.getElementById("title");
const detail = document.getElementById("detail");
const teacher = document.getElementById("teacher");

let data = JSON.parse(localStorage.getItem("hw") || "[]");

/* ป้องกัน modal เด้ง */
modal.classList.add("hidden");

/* เปิด modal */
addBtn.onclick = () => modal.classList.remove("hidden");

/* ปิด modal */
cancelBtn.onclick = () => modal.classList.add("hidden");

/* บันทึก */
saveBtn.onclick = () => {
  data.push({
    id: Date.now(),
    subject: subject.value,
    title: title.value,
    due: due.value
  });

  localStorage.setItem("hw", JSON.stringify(data));
  modal.classList.add("hidden");
  render();
};

/* render */
function render() {
  list.innerHTML += `
  <div class="card ${cls}">
    <h3>📘 ${h.subject} — ${h.title}</h3>
    <small>👩‍🏫 ${h.teacher}</small><br>
    <small>📅 ส่ง: ${h.due} (${diff} วัน)</small>

    <p>${h.detail || ""}</p>

    <div class="actions">
      <button class="done-btn" data-id="${h.id}">
        ${h.done ? "↩ ยกเลิกส่ง" : "✔ ส่งแล้ว"}
      </button>

      <button class="del-btn" data-id="${h.id}">
        🗑 ลบ
      </button>
    </div>
  </div>
`;

  list.innerHTML = "";

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <b>${item.subject}</b><br>
      ${item.title}<br>
      ส่ง: ${item.due}
    `;
    list.appendChild(div);
  });

  pendingCount.textContent = data.length;
}

render();

list.addEventListener("click", (e) => {
  const id = Number(e.target.dataset.id);
  if (!id) return;

  // กดส่งแล้ว
  if (e.target.classList.contains("done-btn")) {
    const hw = data.find(h => h.id === id);
    if (!hw) return;
    hw.done = !hw.done;
  }

  // กดลบ
  if (e.target.classList.contains("del-btn")) {
    if (!confirm("🗑 ต้องการลบการบ้านนี้ใช่ไหม?")) return;
    data = data.filter(h => h.id !== id);
  }

  localStorage.setItem("hw", JSON.stringify(data));
  render();
});
