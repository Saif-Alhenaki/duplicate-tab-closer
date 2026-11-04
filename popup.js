const api = (typeof browser !== "undefined") ? browser : chrome;

const countEl = document.getElementById("count");
const subEl = document.getElementById("sub");
const closeAllBtn = document.getElementById("closeAll");
const keepPinnedBtn = document.getElementById("closeKeepPinned");

async function refresh() {
  let count = 0;
  try {
    const r = await api.runtime.sendMessage({ type: "getStatus" });
    count = r?.count || 0;
  } catch {}
  countEl.textContent = count;
  countEl.classList.toggle("zero", count === 0);
  subEl.textContent = count === 1 ? "tab can be closed" : "tabs can be closed";
  closeAllBtn.disabled = count === 0;
  keepPinnedBtn.disabled = count === 0;
}

closeAllBtn.addEventListener("click", async () => {
  closeAllBtn.disabled = true;
  keepPinnedBtn.disabled = true;
  try { await api.runtime.sendMessage({ type: "closeDuplicates", mode: "default" }); } catch {}
  refresh();
});

keepPinnedBtn.addEventListener("click", async () => {
  closeAllBtn.disabled = true;
  keepPinnedBtn.disabled = true;
  try { await api.runtime.sendMessage({ type: "closeDuplicates", mode: "keepPinned" }); } catch {}
  refresh();
});

refresh();
