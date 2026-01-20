if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

let data = JSON.parse(localStorage.getItem("hw") || "[]");

const modal = document.getElementById("modal");
const addBtn = document.getElementById("addBtn");
const cancelBtn = document.querySelector(".cancel");

modal.classList.add("hidden"); // บังคับซ่อนตอนโหลด

addBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});
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
    done: false
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
        <small>📅 ส่ง: ${h.due} (${diff} วัน)</small>
        <p>${h.detail}</p>
        <button onclick="toggle(${h.id})">✔ ส่งแล้ว</button>
      </div>`;
  });
}

function toggle(id) {
  const h = data.find(x => x.id === id);
  h.done = !h.done;
  localStorage.setItem("hw", JSON.stringify(data));
  render();
}

render();
