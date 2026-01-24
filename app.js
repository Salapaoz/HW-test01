document.addEventListener("DOMContentLoaded", () => {

  /* ---------- State ---------- */
  let data = JSON.parse(localStorage.getItem("hw") || "[]");
  let editingId = null;

  /* ---------- Elements ---------- */
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

  /* ---------- Helpers ---------- */
  function save() {
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

  /* ---------- Modal ---------- */
  addBtn.addEventListener("click", () => {
    editingId = null;
    clearForm();
    modal.classList.remove("hidden");
  });

  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  saveBtn.addEventListener("click", () => {
    if (!due.value || !title.value) {
      alert("กรอกวันที่ส่งและชื่องานก่อนนะ");
      return;
    }

    if (editingId) {
      const h = data.find(x => x.id === editingId);
      Object.assign(h, getFormData());
    } else {
      data.push({
        id: Date.now(),
        done: false,
        lastNotify: "",
        ...getFormData()
      });
    }

    save();
    modal.classList.add("hidden");
    render();
  });

  /* ---------- Render ---------- */
  function render() {
    list.innerHTML = "";
    let pending = 0;
    const todayKey = new Date().toDateString();

    data.forEach(h => {
      const diff = Math.ceil((new Date(h.due) - new Date()) / 86400000);
      if (!h.done) pending++;

      // notify when <= 3 days
      if (!h.done && diff <= 3 && h.lastNotify !== todayKey) {
        notify(h);
        h.lastNotify = todayKey;
        save();
      }

      const card = document.createElement("div");
      card.className = `card ${h.done ? "done" : "pending"}`;

      card.innerHTML = `
        <h3>${h.subject || "-"} — ${h.title}</h3>
        <small>👩‍🏫 ${h.teacher || "-"}</small><br>
        <small>📥 ${h.assigned || "-"} | ⏰ ${h.due} (${diff} วัน)</small>
        <p>${h.detail || ""}</p>
        <div class="actions">
          <button type="button" class="doneBtn">✔</button>
          <button type="button" class="delBtn">🗑</button>
        </div>
      `;

      // open edit
      card.addEventListener("click", () => openEdit(h.id));

      // toggle done
      card.querySelector(".doneBtn").addEventListener("click", (e) => {
        e.stopPropagation();
        h.done = !h.done;
        save();
        render();
      });

      // delete
      card.querySelector(".delBtn").addEventListener("click", (e) => {
        e.stopPropagation();
        data = data.filter(x => x.id !== h.id);
        save();
        render();
      });

      list.appendChild(card);
    });

    pendingCount.textContent = pending;
    pendingCount.classList.toggle("zero", pending === 0);
  }

  function openEdit(id) {
    const h = data.find(x => x.id === id);
    editingId = id;

    assigned.value = h.assigned || "";
    due.value = h.due || "";
    subject.value = h.subject || "";
    title.value = h.title || "";
    detail.value = h.detail || "";
    teacher.value = h.teacher || "";

    modal.classList.remove("hidden");
  }

  function notify(h) {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification("📌 งานใกล้ครบกำหนด", {
        body: `${h.title} เหลือไม่เกิน 3 วัน`
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }

  render();
});

  render();
});
