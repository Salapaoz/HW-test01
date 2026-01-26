document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Utils ---------- */
  function isValidDate(dateStr) {
    // Android / iOS safe check
    if (!dateStr) return false;
    if (dateStr.length !== 10) return false; // YYYY-MM-DD
    const d = new Date(dateStr + "T00:00:00");
    return !isNaN(d.getTime());
  }

  function parseDate(dateStr) {
    return new Date(dateStr + "T00:00:00");
  }

  /* ---------- State ---------- */
  let data = JSON.parse(localStorage.getItem("hw") || "[]");

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
  const modalCard = document.querySelector(".modal-card");

  /* ---------- Storage ---------- */
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
      title: title.value.trim(),
      detail: detail.value,
      teacher: teacher.value
    };
  }

  /* ---------- Toast ---------- */
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

  /* ---------- Modal ---------- */
  addBtn.addEventListener("click", () => {
    clearForm();
    modal.classList.remove("hidden");
  });

  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });

  modalCard.addEventListener("click", e => e.stopPropagation());

  /* ---------- Save (FINAL FIX) ---------- */
  saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const hasTitle = title.value.trim().length > 0;
    const hasDue = isValidDate(due.value);

    if (!hasTitle || !hasDue) {
      showToast("❗ กรุณากรอกวันที่ส่งและชื่องาน");
      return;
    }

    data.push({
      id: Date.now(),
      done: false,
      lastNotify: "",
      ...getFormData()
    });

    save();
    render();

    modal.classList.add("hidden");
    clearForm();
    showToast("✅ บันทึกการบ้านแล้ว");
  });

  /* ---------- Notification ---------- */
  function notify(h) {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification("📌 งานใกล้ครบกำหนด", {
        body: `${h.title} เหลือไม่เกิน 3 วัน`
      });
    }
  }

  /* ---------- Render ---------- */
  function render() {
    list.innerHTML = "";
    let pending = 0;
    const todayKey = new Date().toDateString();

    data.forEach(h => {
      const diff = Math.ceil(
        (parseDate(h.due) - new Date()) / 86400000
      );

      if (!h.done) pending++;

      if (!h.done && diff <= 3 && h.lastNotify !== todayKey) {
        notify(h);
        h.lastNotify = todayKey;
        save();
      }

      const card = document.createElement("div");
      card.className = `card ${h.done ? "done" : "pending"}`;

      card.innerHTML = `
        <h3>${h.subject || "-"} — ${h.title}</h3>
        <small>👩‍🏫 ${h.teacher || "-"}</small>
        <small>⏰ ${h.due} (${diff} วัน)</small>
        <p>${h.detail || ""}</p>
        <div class="actions">
          <button class="doneBtn" type="button">✔</button>
          <button class="delBtn" type="button">🗑</button>
        </div>
      `;

      card.querySelector(".doneBtn").addEventListener("click", e => {
        e.stopPropagation();
        h.done = !h.done;
        save();
        render();
      });

      card.querySelector(".delBtn").addEventListener("click", e => {
        e.stopPropagation();
        data = data.filter(x => x.id !== h.id);
        save();
        render();
      });

      list.appendChild(card);
    });

    pendingCount.textContent = pending;
  }

  render();
});
