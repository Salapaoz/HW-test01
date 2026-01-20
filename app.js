if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

let data = JSON.parse(localStorage.getItem("hw") || "[]");

const list = document.getElementById("list");
const modal = document.getElementById("modal");
const taskList = document.getElementById("task-list");


addBtn.onclick = () => modal.classList.remove("hidden");
document.querySelector(".cancel").onclick = () => modal.classList.add("hidden");

document.querySelector(".save").onclick = () => {
  data.push({
    id: Date.now(),
    assigned: assigned.value,
    due: due.value,
    subject: subject.value,
    title: title.value,
    detail: detail.value,
    teacher: teacher.value,
    done: false,
    lastNotify: ""
  });
  localStorage.setItem("hw", JSON.stringify(data));
  modal.classList.add("hidden");
  render();
};

function render() {
  list.innerHTML = "";
  const now = new Date();

  data.forEach(h => {
    const d = new Date(h.due);
    const diff = Math.ceil((d - now) / 86400000);

    let cls = "";
    if (!h.done && diff <= 3) cls = "soon";
    if (!h.done && diff <= 1) cls = "today";

    list.innerHTML += `
      <div class="card ${cls}">
        <h3>${h.subject} — ${h.title}</h3>
        <small>👩‍🏫 ${h.teacher}</small><br>
        <small>📅 ส่ง: ${h.due} (${diff} วัน)</small>
        <p>${h.detail}</p>
        <div class="actions">
          <button class="done" onclick="toggle(${h.id})">✔ ส่งแล้ว</button>
          <button class="del" onclick="del(${h.id})">🗑</button>
        </div>
      </div>`;
  });
}

function toggle(id) {
  const h = data.find(x => x.id === id);
  h.done = !h.done;
  localStorage.setItem("hw", JSON.stringify(data));
  render();
}

function del(id) {
  data = data.filter(x => x.id !== id);
  localStorage.setItem("hw", JSON.stringify(data));
  render();
}

render();

