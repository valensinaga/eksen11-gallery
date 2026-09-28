const $ = s => document.querySelector(s);
function el(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
const U = CONFIG.SUPABASE_URL, K = CONFIG.SUPABASE_KEY;
let token = sessionStorage.getItem("tk") || "", editId = null, editUrl = "", data = [];
const H = (extra = {}) => ({ apikey: K, Authorization: `Bearer ${token || K}`, ...extra });
const msg = (t, err) => { $("#msg").textContent = t; $("#msg").classList.toggle("error", !!err); };

if (!U || !K) msg("Isi SUPABASE_URL dan SUPABASE_KEY di config.js terlebih dulu.", true);

function tampilPanel(ok) { $("#login").hidden = ok; $("#panel").hidden = !ok; if (ok) muat(); }

$("#login").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    msg("Memproses...");
    const r = await fetch(`${U}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: K, "Content-Type": "application/json" },
      body: JSON.stringify({ email: $("#email").value.trim(), password: $("#pass").value }) });
    const j = await r.json();
    if (!r.ok) throw new Error("Email atau kata sandi salah");
    token = j.access_token; sessionStorage.setItem("tk", token); msg(""); tampilPanel(true);
  } catch (err) { msg(err.message, true); }
});
$("#logout").addEventListener("click", () => { token = ""; sessionStorage.removeItem("tk"); tampilPanel(false); });

async function muat() {
  try {
    const r = await fetch(`${U}/rest/v1/karya?order=created_at.desc`, { headers: H() });
    if (r.status === 401) { token = ""; sessionStorage.removeItem("tk"); tampilPanel(false); msg("Sesi habis, silakan masuk lagi.", true); return; }
    if (!r.ok) throw new Error("Gagal memuat daftar karya");
    data = await r.json(); renderList();
  } catch (err) { msg(err.message, true); }
}

function renderList() {
  const ul = $("#list"); ul.replaceChildren();
  if (!data.length) ul.appendChild(el("li", "", "Belum ada karya."));
  data.forEach(k => {
    const li = el("li", "row-k");
    const img = el("img"); img.src = k.gambar_url; img.alt = "";
    const t = el("div", "grow"); t.appendChild(el("b", "", k.judul));
    t.appendChild(el("p", "meta", `${k.fotografer}, ${k.asal}, ${k.jual}${k.draft ? ", DRAFT" : ""}`));
    const a = el("div", "acts");
    const aksi = (label, fn) => { const b = el("button", "mini", label); b.type = "button"; b.addEventListener("click", fn); a.appendChild(b); };
    aksi("Edit", () => isiForm(k));
    aksi(k.draft ? "Tampilkan" : "Sembunyikan", () => ubah(k.id, { draft: !k.draft }));
    aksi(k.jual === "terjual" ? "Set dijual" : "Tandai terjual", () => ubah(k.id, { jual: k.jual === "terjual" ? "dijual" : "terjual" }));
    aksi("Hapus", async () => { if (confirm(`Hapus "${k.judul}"?`)) { await kirim("DELETE", `?id=eq.${k.id}`); muat(); } });
    li.append(img, t, a); ul.appendChild(li);
  });
}

async function kirim(method, query, body) {
  const r = await fetch(`${U}/rest/v1/karya${query}`, { method, headers: H({ "Content-Type": "application/json", Prefer: "return=minimal" }), body: body && JSON.stringify(body) });
  if (!r.ok) { msg("Gagal menyimpan. Pastikan kamu login dengan email admin.", true); throw new Error("gagal"); }
}
const ubah = async (id, isi) => { try { await kirim("PATCH", `?id=eq.${id}`, isi); msg("Tersimpan."); muat(); } catch (e) {} };

function isiForm(k) {
  editId = k.id; editUrl = k.gambar_url;
  ["judul", "fotografer", "asal", "deskripsi", "jual"].forEach(f => $("#" + f).value = k[f] || "");
  $("#draft").checked = k.draft; $("#formTitle").textContent = "Edit karya"; $("#batal").hidden = false;
  $("#form").scrollIntoView({ behavior: "smooth" });
}
function resetForm() { editId = null; editUrl = ""; $("#form").reset(); $("#asal").value = "Open Submission"; $("#formTitle").textContent = "Tambah karya"; $("#batal").hidden = true; }
$("#batal").addEventListener("click", resetForm);

// kecilkan foto sebelum upload agar situs tetap ringan
async function kecilkan(file) {
  const bmp = await createImageBitmap(file), s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas"); c.width = bmp.width * s; c.height = bmp.height * s;
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise(res => c.toBlob(res, "image/jpeg", 0.85));
}
async function upload(file) {
  const blob = await kecilkan(file), nama = `${Date.now()}.jpg`;
  const r = await fetch(`${U}/storage/v1/object/${CONFIG.BUCKET}/${nama}`, { method: "POST", headers: H({ "Content-Type": "image/jpeg" }), body: blob });
  if (!r.ok) throw new Error("Upload gambar gagal");
  return `${U}/storage/v1/object/public/${CONFIG.BUCKET}/${nama}`;
}

$("#form").addEventListener("submit", async e => {
  e.preventDefault();
  const btn = $("#simpan"); btn.disabled = true;
  try {
    msg("Menyimpan...");
    const f = $("#file").files[0];
    let url = editUrl;
    if (f) url = await upload(f);
    if (!url) throw new Error("Pilih gambar dulu");
    const isi = { judul: $("#judul").value.trim(), fotografer: $("#fotografer").value.trim(), asal: $("#asal").value.trim(),
      deskripsi: $("#deskripsi").value.trim(), jual: $("#jual").value, draft: $("#draft").checked, gambar_url: url };
    await (editId ? kirim("PATCH", `?id=eq.${editId}`, isi) : kirim("POST", "", isi));
    msg("Tersimpan. Situs akan menampilkannya dalam maksimal 30 detik."); resetForm(); muat();
  } catch (err) { if (err.message !== "gagal") msg(err.message, true); }
  btn.disabled = false;
});

tampilPanel(!!token);
