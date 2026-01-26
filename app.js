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
      title: title.value,
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
    editingId = null;
    clearForm();
    modal.classList.remove("hidden");
  });

  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });

  /* ⭐ แก้บั๊กมือถือ: click + touch */
  saveBtn.addEventListener("click", handleSave);
  saveBtn.addEventListener("touchend", handleSave, { passive: false });

  function handleSave(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!due.value || !title.value) {
      showToast("❗ กรุณากรอกวันที่ส่งและชื่องาน");
      return;
    }

    if (editingId) {
      const h = data.find(x => x.id === editingId);
      if (h) Object.assign(h, getFormData());
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
    clearForm();
    render();
    showToast("✅ บันทึกการบ้านเรียบร้อยแล้ว");
  }

  /* ---------- Notification (⬅ กลับมาแล้ว) ---------- */
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

  /* ---------- Render ---------- */
  function render() {
    list.innerHTML = "";
    let pending = 0;
    const todayKey = new Date().toDateString();

    data.forEach(h => {
      const diff = Math.ceil((new Date(h.due) - new Date()) / 86400000);
      if (!h.done) pending++;

      // แจ้งเตือนก่อนครบกำหนด 3 วัน
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
        <small>⏰ ${h.due} (${diff} วัน)</small>
        <p>${h.detail || ""}</p>
        <div class="actions">
          <button class="doneBtn" type="button">✔</button>
          <button class="delBtn" type="button">🗑</button>
        </div>
      `;

      card.querySelector(".doneBtn").addEventListener("click", (e) => {
        e.stopPropagation();
        h.done = !h.done;
        save();
        render();
      });

      card.querySelector(".delBtn").addEventListener("click", (e) => {
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
