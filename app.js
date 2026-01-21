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
