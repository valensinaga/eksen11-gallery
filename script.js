const $ = (s, e = document) => e.querySelector(s);
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}
const pakaiDB = !!(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_KEY);
let karya = [], filter = "semua";

// ===== Ambil data (Fetch API + async/await + loading & error) =====
async function ambilKarya() {
  const status = $("#status");
  try {
    let res;
    if (pakaiDB) {
      res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/karya?draft=eq.false&order=created_at.desc`,
        { headers: { apikey: CONFIG.SUPABASE_KEY, Authorization: `Bearer ${CONFIG.SUPABASE_KEY}` } });
    } else {
      res = await fetch("karya.json");
    }
    if (!res.ok) throw new Error("Gagal mengambil data karya");
    karya = await res.json();
    status.textContent = "";
    status.classList.remove("error");
    tampilkan();
  } catch (err) {
    status.textContent = `Terjadi kesalahan: ${err.message}`;
    status.classList.add("error");
  }
}

// ===== Render kartu (DOM dinamis) =====
function buatKartu(k) {
  const btn = el("button", "frame");
  btn.type = "button";
  const img = el("img");
  img.src = k.gambar_url; img.alt = k.judul; img.loading = "lazy";
  btn.appendChild(img);
  const info = el("div", "info-k");
  info.appendChild(el("h3", "", k.judul));
  info.appendChild(el("p", "by", k.fotografer));
  if (k.jual !== "tidak") info.appendChild(el("span", "badge " + k.jual, k.jual === "dijual" ? "Dijual" : "Terjual"));
  btn.appendChild(info);
  btn.addEventListener("click", () => bukaDetail(k));
  return btn;
}
function isiGrid(grid, list) {
  grid.replaceChildren();
  if (!list.length) { grid.appendChild(el("p", "empty", "Belum ada karya di bagian ini.")); return; }
  list.forEach(k => grid.appendChild(buatKartu(k)));
}
function tampilkan() {
  const lolos = karya.filter(k => filter === "semua" || k.jual === filter);
  isiGrid($("#gridOS"), lolos.filter(k => k.asal === "Open Submission"));
  isiGrid($("#gridUKM"), lolos.filter(k => k.asal !== "Open Submission"));
}

// ===== Filter =====
[["semua", "Semua"], ["dijual", "Dijual"], ["terjual", "Terjual"]].forEach(([key, label]) => {
  const b = el("button", "chip", label);
  b.type = "button";
  b.setAttribute("aria-pressed", key === "semua");
  b.addEventListener("click", () => {
    filter = key;
    document.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", x === b));
    tampilkan();
  });
  $("#filters").appendChild(b);
});

// ===== Detail karya (dialog) =====
const dlg = $("#dlg");
function bukaDetail(k) {
  $("#dImg").src = k.gambar_url; $("#dImg").alt = k.judul;
  $("#dJudul").textContent = k.judul;
  $("#dMeta").textContent = `${k.fotografer}, ${k.asal}`;
  $("#dDesk").textContent = k.deskripsi || "";
  const wa = $("#dWa");
  wa.hidden = k.jual !== "dijual";
  wa.href = `https://wa.me/${CONFIG.WA}?text=` + encodeURIComponent(`Halo, saya tertarik dengan karya "${k.judul}" di Galeri Eksen 11.`);
  dlg.showModal();
}
$("#dClose").addEventListener("click", () => dlg.close());
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });

// ===== Hitung mundur =====
function hitung() {
  const box = $("#count"), sisa = new Date(CONFIG.EVENT_DATE) - new Date();
  if (sisa <= 0) { box.textContent = "Eksen 11 sedang berlangsung atau sudah selesai"; return; }
  const d = Math.floor(sisa / 864e5), h = Math.floor(sisa / 36e5) % 24, m = Math.floor(sisa / 6e4) % 60, s = Math.floor(sisa / 1e3) % 60;
  box.textContent = `${d} hari ${h} jam ${m} menit ${s} detik lagi`;
}
hitung(); setInterval(hitung, 1000);

// ===== Menu mobile & kontak =====
const burger = $("#burger"), menu = $("#menu");
burger.addEventListener("click", () => burger.setAttribute("aria-expanded", menu.classList.toggle("open")));
menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }));
$("#waBtn").href = `https://wa.me/${CONFIG.WA}`;
$("#igBtn").href = `https://instagram.com/${CONFIG.IG}`;
$("#year").textContent = new Date().getFullYear();

// ===== Mulai + perbarui otomatis tiap 30 detik (mode database) =====
ambilKarya();
if (pakaiDB) setInterval(ambilKarya, 30000);
