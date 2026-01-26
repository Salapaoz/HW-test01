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

  /* ---------- Modal Controls ---------- */
  addBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    editingId = null;
    clearForm();
    modal.classList.remove("hidden");
  });

  cancelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    modal.classList.add("hidden");
  });

  // ปิด modal เมื่อกดพื้นหลัง
  modal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // ⭐⭐ จุดแก้บั๊กมือถือที่สำคัญที่สุด
  saveBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation(); // กัน event ไหลบนมือถือ

    if (!due.value || !title.value) {
      alert("กรอกวันที่ส่งและชื่องานก่อนนะ");
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
  });

  /* ---------- Render ---------- */
  function render() {
    list.innerHTML = "";
    let pending = 0;
    const todayKey = new Date().toDateString();

    data.forEach(h => {
      const diff = Math.ceil((new Date(h.due) - new Date()) / 86400000);
      if (!h.done) pending++;

      // แจ้งเตือนเมื่อเหลือ ≤ 3 วัน
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

      // เปิดแก้ไข
      card.addEventListener("click", () => openEdit(h.id));

      // ทำเสร็จ / ยกเลิกเสร็จ
      card.querySelector(".doneBtn").addEventListener("click", (e) => {
        e.stopPropagation();
        h.done = !h.done;
        save();
        render();
      });

      // ลบงาน
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

  /* ---------- Edit ---------- */
  function openEdit(id) {
    const h = data.find(x => x.id === id);
    if (!h) return;

    editingId = id;

    assigned.value = h.assigned || "";
    due.value = h.due || "";
    subject.value = h.subject || "";
    title.value = h.title || "";
    detail.value = h.detail || "";
    teacher.value = h.teacher || "";

    modal.classList.remove("hidden");
  }

  /* ---------- Notification ---------- */
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
