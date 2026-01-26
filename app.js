document.addEventListener("DOMContentLoaded", () => {

  /* ================== STATE ================== */
  let data = JSON.parse(localStorage.getItem("hw") || "[]");

  /* ================== ELEMENTS ================== */
  const list = document.getElementById("list");
  const modal = document.getElementById("modal");
  const addBtn = document.getElementById("addBtn");
  const pendingCount = document.getElementById("pendingCount");

  const assigned = document.getElementById("assigned");
  const due = document.getElementById("due");
  const subject = document.getElementById("subject");
  const title = document.getElementById("title");
  const detail = document.getElementById("detail");
  const teacher = document.getElementById("teacher");

  const saveBtn = document.querySelector(".save");
  const cancelBtn = document.querySelector(".cancel");
  const modalCard = document.querySelector(".modal-card");

  /* ================== UTILS ================== */
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
  }

  function showToast(msg) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = msg;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  function parseDateSafe(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  }

  /* ================== MODAL ================== */
  addBtn.addEventListener("click", () => {
    clearForm();
    modal.classList.remove("hidden");
  });

  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  modalCard.addEventListener("click", e => e.stopPropagation());

  /* ================== SAVE ================== */
  saveBtn.addEventListener("click", () => {
    const titleVal = title.value.trim();
    const dueVal = due.value;

    if (!titleVal || !dueVal) {
      showToast("❗ กรุณากรอกวันที่ส่งและชื่องาน");
      return;
    }

    data.push({
      id: Date.now(),
      assigned: assigned.value,
      due: dueVal,
      subject: subject.value,
      title: titleVal,
      detail: detail.value,
      teacher: teacher.value,
      done: false,
      lastNotify: ""
    });

    saveStorage();
    render();

    modal.classList.add("hidden");
    clearForm();
    showToast("✅ บันทึกการบ้านแล้ว");
  });

  /* ================== RENDER ================== */
  function render() {
    list.innerHTML = "";
    let pending = 0;
    const todayKey = new Date().toDateString();

    data.forEach(h => {
      const dueDate = parseDateSafe(h.due);
      const diff = dueDate
        ? Math.ceil((dueDate - new Date()) / 86400000)
        : "-";

      if (!h.done) pending++;

      const card = document.createElement("div");
      card.className = `card ${h.done ? "done" : "pending"}`;

      card.innerHTML = `
        <h3>${h.subject || "-"} — ${h.title}</h3>
        <small>👩‍🏫 ${h.teacher || "-"}</small>
        <small>⏰ ${h.due || "-"} (${diff} วัน)</small>
        <p>${h.detail || ""}</p>
        <div class="actions">
          <button class="doneBtn" type="button">✔</button>
          <button class="delBtn" type="button">🗑</button>
        </div>
      `;

      card.querySelector(".doneBtn").onclick = () => {
        h.done = !h.done;
        saveStorage();
        render();
      };

      card.querySelector(".delBtn").onclick = () => {
        data = data.filter(x => x.id !== h.id);
        saveStorage();
        render();
      };

      list.appendChild(card);
    });

    pendingCount.textContent = pending;
  }

  render();
});
