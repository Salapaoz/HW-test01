let data = JSON.parse(localStorage.getItem("hw") || "[]");
const modal = document.getElementById("modal");

function openModal() {
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}
function closeModal() {
  modal.classList.add("hidden");
}

function saveHomework() {
  data.push({
    id: Date.now(),
    title: title.value,
    detail: detail.value,
    due: due.value,
    done: false,
    lastNotified: null
  });
  localStorage.setItem("hw", JSON.stringify(data));
  closeModal();
  render();
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

function daysLeft(due) {
  return (new Date(due) - new Date()) / 86400000;
}

function render() {
  list.innerHTML = "";
  let p = 0, s = 0;

  data.forEach(h => {
    const diff = daysLeft(h.due);
    if (!h.done) p++;
    if (!h.done && diff <= 3 && diff >= 0) s++;

    list.innerHTML += `
      <div class="card flex justify-between ${(!h.done && diff<=3)?'due-soon':''}">
        <div>
          <h3 class="font-bold ${h.done?'line-through text-gray-400':''}">
            ${h.title}
          </h3>
          <p class="text-sm">${h.detail}</p>
          <p class="text-sm">⏰ ${new Date(h.due).toLocaleString()}</p>
        </div>
        <div class="flex gap-2">
          <button onclick="toggle(${h.id})" class="btn-blue">✓</button>
          <button onclick="del(${h.id})" class="btn-gray">🗑</button>
        </div>
      </div>`;
  });

  total.textContent = data.length;
  pending.textContent = p;
  soon.textContent = s;
}

render();

/* 🔔 Notification */
document.getElementById("notifyBtn").onclick = async () => {
  const perm = await Notification.requestPermission();
  if (perm === "granted") alert("เปิดแจ้งเตือนเรียบร้อย ✅");
};

setInterval(checkNotifications, 60000);

function checkNotifications() {
  if (Notification.permission !== "granted") return;

  const today = new Date().toDateString();

  data.forEach(h => {
    const diff = daysLeft(h.due);
    if (!h.done && diff <= 3 && diff >= 0 && h.lastNotified !== today) {
      new Notification("📚 ใกล้ถึงกำหนดส่ง!", {
        body: `${h.title} เหลือ ${Math.ceil(diff)} วัน`
      });
      h.lastNotified = today;
      localStorage.setItem("hw", JSON.stringify(data));
    }
  });
}
