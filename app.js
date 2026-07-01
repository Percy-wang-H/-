const state = {
  students: [],
  filtered: [],
  sortKey: "total",
  sortDirection: "desc",
  editingId: null,
  isAuthenticated: localStorage.getItem("grade-system-auth") === "true",
};

const els = {
  loginScreen: document.querySelector("#loginScreen"),
  appShell: document.querySelector("#appShell"),
  loginForm: document.querySelector("#loginForm"),
  username: document.querySelector("#username"),
  password: document.querySelector("#password"),
  loginError: document.querySelector("#loginError"),
  fileInput: document.querySelector("#fileInput"),
  exportBtn: document.querySelector("#exportBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  logoutBtn: document.querySelector("#logoutBtn"),
  addBtn: document.querySelector("#addBtn"),
  searchInput: document.querySelector("#searchInput"),
  body: document.querySelector("#studentBody"),
  count: document.querySelector("#studentCount"),
  avg: document.querySelector("#avgScore"),
  max: document.querySelector("#maxScore"),
  top: document.querySelector("#topStudent"),
  pass: document.querySelector("#passRate"),
  distribution: document.querySelector("#distributionChart"),
  component: document.querySelector("#componentChart"),
  dialog: document.querySelector("#studentDialog"),
  form: document.querySelector("#studentForm"),
  dialogTitle: document.querySelector("#dialogTitle"),
};

const numberKeys = ["attendance", "homework", "checkin", "activity", "pbl", "total"];
const componentLabels = [
  ["attendance", "课堂"],
  ["homework", "作业"],
  ["checkin", "签到"],
  ["activity", "互动"],
  ["pbl", "PBL"],
];

function renderAuth() {
  els.loginScreen.classList.toggle("is-hidden", state.isAuthenticated);
  els.appShell.classList.toggle("is-locked", !state.isAuthenticated);
  if (!state.isAuthenticated) {
    setTimeout(() => els.username.focus(), 0);
  }
  if (window.lucide) {
    lucide.createIcons();
  }
}

function handleLogin(event) {
  event.preventDefault();
  const username = els.username.value.trim();
  const password = els.password.value;
  if (username === "admin" && password === "123456") {
    state.isAuthenticated = true;
    localStorage.setItem("grade-system-auth", "true");
    els.loginError.textContent = "";
    els.password.value = "";
    renderAuth();
    render();
    return;
  }
  els.loginError.textContent = "账号或密码错误";
  els.password.select();
}

function logout() {
  state.isAuthenticated = false;
  localStorage.removeItem("grade-system-auth");
  renderAuth();
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function calculateTotal(student) {
  return round(
    toNumber(student.attendance) +
      toNumber(student.homework) +
      toNumber(student.checkin) +
      toNumber(student.activity) +
      toNumber(student.pbl),
  );
}

function normalizeStudent(raw, index) {
  const student = {
    id: raw.id || Date.now() + index,
    name: String(raw.name || "").trim(),
    studentId: String(raw.studentId || "").trim(),
    college: String(raw.college || "人工智能学院").trim(),
    major: String(raw.major || "计算机科学与技术（创新实验班）").trim(),
    className: String(raw.className || "").trim(),
    attendance: toNumber(raw.attendance),
    homework: toNumber(raw.homework),
    checkin: toNumber(raw.checkin),
    activity: toNumber(raw.activity),
    pbl: toNumber(raw.pbl),
  };
  student.total = raw.total !== undefined && raw.total !== "" ? toNumber(raw.total) : calculateTotal(student);
  return student;
}

function loadInitialData() {
  const payload = window.SAMPLE_GRADE_DATA || { students: [] };
  state.students = payload.students.map(normalizeStudent);
  render();
}

function getFilteredStudents() {
  const term = els.searchInput.value.trim().toLowerCase();
  const rows = state.students.filter((student) => {
    const haystack = `${student.name} ${student.studentId} ${student.className}`.toLowerCase();
    return haystack.includes(term);
  });

  rows.sort((a, b) => {
    const av = a[state.sortKey];
    const bv = b[state.sortKey];
    const result =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv), "zh-Hans-CN");
    return state.sortDirection === "asc" ? result : -result;
  });
  return rows;
}

function render() {
  state.filtered = getFilteredStudents();
  renderMetrics();
  renderTable();
  renderCharts();
  if (window.lucide) {
    lucide.createIcons();
  }
}

function renderMetrics() {
  const students = state.students;
  const count = students.length;
  const total = students.reduce((sum, student) => sum + student.total, 0);
  const avg = count ? total / count : 0;
  const top = students.reduce((best, student) => (student.total > (best?.total || -1) ? student : best), null);
  const passCount = students.filter((student) => student.total >= 60).length;

  els.count.textContent = count;
  els.avg.textContent = round(avg).toFixed(2);
  els.max.textContent = top ? top.total.toFixed(2) : "0";
  els.top.textContent = top ? `${top.name} ${top.studentId}` : "-";
  els.pass.textContent = count ? `${round((passCount / count) * 100)}%` : "0%";
}

function renderTable() {
  els.body.innerHTML = state.filtered
    .map((student) => {
      const scoreClass = student.total < 60 ? "danger" : student.total < 80 ? "warn" : "";
      return `
        <tr>
          <td>${escapeHtml(student.name)}</td>
          <td>${escapeHtml(student.studentId)}</td>
          <td>${escapeHtml(student.className)}</td>
          <td>${student.attendance.toFixed(2)}</td>
          <td>${student.homework.toFixed(2)}</td>
          <td>${student.checkin.toFixed(2)}</td>
          <td>${student.activity.toFixed(2)}</td>
          <td>${student.pbl.toFixed(2)}</td>
          <td><span class="score ${scoreClass}">${student.total.toFixed(2)}</span></td>
          <td>
            <div class="row-actions">
              <button title="编辑" data-action="edit" data-id="${student.id}"><i data-lucide="pencil"></i></button>
              <button title="删除" data-action="delete" data-id="${student.id}"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        </tr>`;
    })
    .join("");
}

function renderCharts() {
  drawDistributionChart(els.distribution, state.students);
  drawComponentChart(els.component, state.students);
}

function drawBase(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(260 * dpr));
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, rect.width, 260);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, rect.width, 260);
  return { ctx, width: rect.width, height: 260 };
}

function drawDistributionChart(canvas, students) {
  const { ctx, width, height } = drawBase(canvas);
  const buckets = [
    ["<60", 0, 59.99, "#c75146"],
    ["60-69", 60, 69.99, "#b7791f"],
    ["70-79", 70, 79.99, "#d59f2f"],
    ["80-89", 80, 89.99, "#2865d9"],
    ["90+", 90, 100, "#138a72"],
  ];
  const values = buckets.map(([label, min, max, color]) => ({
    label,
    color,
    count: students.filter((student) => student.total >= min && student.total <= max).length,
  }));
  drawBars(ctx, width, height, "综合成绩分布", values);
}

function drawComponentChart(canvas, students) {
  const { ctx, width, height } = drawBase(canvas);
  const colors = ["#2865d9", "#138a72", "#b7791f", "#6750c7", "#c75146"];
  const values = componentLabels.map(([key, label], index) => ({
    label,
    color: colors[index],
    count: students.length
      ? round(students.reduce((sum, student) => sum + toNumber(student[key]), 0) / students.length)
      : 0,
  }));
  drawBars(ctx, width, height, "各项成绩平均值", values);
}

function drawBars(ctx, width, height, title, values) {
  const pad = { left: 42, right: 18, top: 42, bottom: 46 };
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;
  const max = Math.max(...values.map((item) => item.count), 1);
  const barGap = 18;
  const barWidth = Math.max(26, (chartWidth - barGap * (values.length - 1)) / values.length);

  ctx.fillStyle = "#162032";
  ctx.font = "700 16px Microsoft YaHei, Arial";
  ctx.fillText(title, pad.left, 24);

  ctx.strokeStyle = "#d9e0ea";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + chartHeight);
  ctx.lineTo(width - pad.right, pad.top + chartHeight);
  ctx.stroke();

  values.forEach((item, index) => {
    const x = pad.left + index * (barWidth + barGap);
    const h = (item.count / max) * (chartHeight - 18);
    const y = pad.top + chartHeight - h;
    ctx.fillStyle = item.color;
    ctx.fillRect(x, y, barWidth, h);
    ctx.fillStyle = "#435066";
    ctx.font = "12px Microsoft YaHei, Arial";
    ctx.textAlign = "center";
    ctx.fillText(item.label, x + barWidth / 2, height - 18);
    ctx.fillStyle = "#162032";
    ctx.font = "700 13px Microsoft YaHei, Arial";
    ctx.fillText(String(item.count), x + barWidth / 2, y - 7);
  });
  ctx.textAlign = "left";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[char];
  });
}

function parseWorkbook(workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const headerIndex = rows.findIndex((row) => row.some((cell) => String(cell).includes("综合成绩")));
  const dataStart = headerIndex >= 0 ? headerIndex + 1 : 1;
  return rows
    .slice(dataStart)
    .filter((row) => row[1] || row[0])
    .map((row, index) =>
      normalizeStudent(
        {
          id: row[0] || index + 1,
          name: row[1] || row[0],
          studentId: row[2] || "",
          college: row[3] || "",
          major: row[4] || "",
          className: row[5] || "",
          attendance: row[6],
          homework: row[7],
          checkin: row[8],
          activity: row[9],
          pbl: row[10],
          total: row[11],
        },
        index,
      ),
    )
    .filter((student) => student.name && student.studentId);
}

async function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const rows = parseWorkbook(workbook);
  if (!rows.length) {
    alert("没有识别到成绩数据，请检查表格首个工作表是否包含综合成绩。");
    return;
  }
  state.students = rows;
  render();
}

function openStudentDialog(student) {
  state.editingId = student?.id || null;
  els.dialogTitle.textContent = student ? "编辑学生" : "新增学生";
  const defaults = {
    name: "",
    studentId: "",
    className: "23本计算机科学与技术（创新实验班）1班",
    attendance: 20,
    homework: 25,
    checkin: 10,
    activity: 15,
    pbl: 20,
  };
  const data = student || defaults;
  Object.keys(defaults).forEach((key) => {
    els.form.elements[key].value = data[key] ?? defaults[key];
  });
  els.dialog.showModal();
}

function saveStudent() {
  const data = Object.fromEntries(new FormData(els.form).entries());
  const student = normalizeStudent({
    ...data,
    id: state.editingId || Date.now(),
  });
  student.total = calculateTotal(student);

  if (state.editingId) {
    state.students = state.students.map((item) => (item.id === state.editingId ? student : item));
  } else {
    state.students.push(student);
  }
  els.dialog.close();
  render();
}

function exportCsv() {
  const header = ["姓名", "学号", "班级", "课堂", "作业", "签到", "互动", "PBL", "综合成绩"];
  const rows = state.students.map((student) => [
    student.name,
    student.studentId,
    student.className,
    student.attendance,
    student.homework,
    student.checkin,
    student.activity,
    student.pbl,
    student.total,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "综合成绩导出.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

document.querySelectorAll("th[data-sort]").forEach((th) => {
  th.addEventListener("click", () => {
    const key = th.dataset.sort;
    if (state.sortKey === key) {
      state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
    } else {
      state.sortKey = key;
      state.sortDirection = numberKeys.includes(key) ? "desc" : "asc";
    }
    render();
  });
});

els.body.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  const student = state.students.find((item) => item.id === id);
  if (button.dataset.action === "edit") {
    openStudentDialog(student);
  }
  if (button.dataset.action === "delete" && confirm(`确认删除 ${student.name} 的成绩记录吗？`)) {
    state.students = state.students.filter((item) => item.id !== id);
    render();
  }
});

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  saveStudent();
});
els.loginForm.addEventListener("submit", handleLogin);
els.logoutBtn.addEventListener("click", logout);
els.fileInput.addEventListener("change", handleFile);
els.searchInput.addEventListener("input", render);
els.addBtn.addEventListener("click", () => openStudentDialog());
els.exportBtn.addEventListener("click", exportCsv);
els.resetBtn.addEventListener("click", loadInitialData);
window.addEventListener("resize", renderCharts);

renderAuth();
loadInitialData();
