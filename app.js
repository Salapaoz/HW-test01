let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function openForm() {
  document.getElementById("modal").style.display = "block";
}

function closeForm() {
  document.getElementById("modal").style.display = "none";
}

function saveTask() {
  const task = {
    start: startDate.value,
    due: dueDate.value,
    subject: subject.value,
    title: title.value,
    detail: detail.value,
    teacher: teacher.value
  };

  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  closeForm();
  render();
}

function render() {
  taskList.innerHTML = "";
  const today = new Date();

  tasks.forEach(t => {
    const due = new Date(t.due);
    const diff = (due - today) / (1000*60*60*24);

    const card = document.createElement("div");
    card.className = "card" + (diff <= 3 ? " danger" : "");

    card.innerHTML = `
      <h3>${t.title}</h3>
      <p>📘 ${t.subject}</p>
      <p>📅 ส่ง: ${t.due}</p>
      <p>${t.detail}</p>
      <small>👨‍🏫 ${t.teacher}</small>
    `;

    taskList.appendChild(card);

    if (diff <= 3) {
      notify(t.title);
    }
  });
}

function notify(title) {
  if (Notification.permission === "granted") {
    new Notification("ใกล้ถึงกำหนดส่ง!", {
      body: title
    });
  }
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

Notification.requestPermission();
render();
