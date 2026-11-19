// Daftar proyek yang statusnya "Selesai" (hanya Portal, Cyber, dan Pengingat Makanan Kedaluwarsa)
const PetaDemoKhusus = {
    "Portal-akademik_Fatihatul-ikrimah": {
        judul: "Portal Akademik Kampus",
        deskripsi: "Sistem informasi akademik berbasis web untuk jadwal kuliah dan nilai.",
        teknologi: "HTML & Tailwind",
        status: "Selesai",
        demoUrl: "https://fatihatulikrimah41-lgtm.github.io/Portal-akademik_Fatihatul-ikrimah/"
    },
    "Aplikasi-Pengingat-Masa-Kedaluwarsa-Makanan-di-Kos": {
        judul: "Pengingat Kedaluwarsa Makanan di Kos",
        deskripsi: "Aplikasi pencatat masa simpan bahan makanan anak kos.",
        teknologi: "JavaScript",
        status: "Selesai",
        demoUrl: "https://fatihatulikrimah41-lgtm.github.io/Aplikasi-Pengingat-Masa-Kedaluwarsa-Makanan-di-Kos/"
    }
};

// Daftar repository yang tidak memakai tombol Buka Live Demo (hanya Lihat GitHub)
const RepoTanpaLiveDemo = [
    "tokoobatkhasyafa"
];

// Menyimpan seluruh data proyek yang ditarik dari GitHub + data lokal
let semuaData = [];

// Mengambil elemen DOM dari halaman HTML
const inputCari = document.querySelector("#input-cari");
const filterStatus = document.querySelector("#filter-status");
const btnMuatGithub = document.querySelector("#btn-muat-github");
const statusBar = document.querySelector("#status-bar");
const gridData = document.querySelector("#grid-data");

// Membersihkan teks agar aman dari karakter HTML
function amanTeks(teks) {
    const div = document.createElement("div");
    div.textContent = teks || "";
    return div.innerHTML;
}

// Memformat tanggal update terakhir dari GitHub agar mudah dibaca
function formatTanggalUpdate(isoDate) {
    if (!isoDate) return "";
    const tanggal = new Date(isoDate);
    if (Number.isNaN(tanggal.getTime())) return "";
    return tanggal.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// Merender kartu proyek lengkap dengan status (Selesai / Proses), update terakhir, Live Demo & GitHub
function tampilkanKartu(daftar) {
    gridData.innerHTML = "";

    if (daftar.length === 0) {
        gridData.innerHTML = "<p>Tidak ada proyek yang cocok dengan pencarian.</p>";
        return;
    }

    daftar.forEach((item) => {
        const kartu = document.createElement("article");
        kartu.className = "card";

        const kelasStatus = item.status === "Selesai" ? "status" : "status proses";
        const infoUpdate = item.updatedAt
            ? `<p style="font-size:0.78rem;color:#6b7280;margin-top:8px;">Status: <strong>${amanTeks(item.status)}</strong> &bull; Update: ${amanTeks(item.updatedAt)}</p>`
            : `<p style="font-size:0.78rem;color:#6b7280;margin-top:8px;">Status: <strong>${amanTeks(item.status)}</strong></p>`;

        const tombolDemo = item.demoUrl
            ? `<a class="btn-link btn-demo" href="${amanTeks(item.demoUrl)}" target="_blank" rel="noopener">Buka Live Demo</a>`
            : "";

        kartu.innerHTML = `
            <div>
                <h3>${amanTeks(item.judul)}</h3>
                <p>${amanTeks(item.deskripsi)}</p>
                ${infoUpdate}
            </div>
            <div>
                <div class="meta">
                    <span class="tag">${amanTeks(item.teknologi)}</span>
                    <span class="${kelasStatus}">${amanTeks(item.status)}</span>
                </div>
                <div class="actions">
                    ${tombolDemo}
                    <a class="btn-link btn-repo" href="${amanTeks(item.repoUrl)}" target="_blank" rel="noopener">Lihat GitHub</a>
                </div>
            </div>
        `;
        gridData.appendChild(kartu);
    });
}

// Menyaring kartu berdasarkan kata kunci dan status (Selesai / Proses)
function terapkanFilter() {
    const kataKunci = inputCari.value.toLowerCase().trim();
    const statusDipilih = filterStatus.value;

    const hasil = semuaData.filter((item) => {
        const cocokTeks =
            item.judul.toLowerCase().includes(kataKunci) ||
            item.teknologi.toLowerCase().includes(kataKunci) ||
            item.deskripsi.toLowerCase().includes(kataKunci) ||
            item.status.toLowerCase().includes(kataKunci);
        const cocokStatus =
            statusDipilih === "semua" || item.status === statusDipilih;
        return cocokTeks && cocokStatus;
    });

    tampilkanKartu(hasil);
}

// Mengambil semua repository terbaru dari GitHub API lalu menggabungkan link Live Demo
async function muatSemuaDariGitHub() {
    statusBar.textContent = "Mengambil update semua repository dari GitHub fatihatulikrimah41-lgtm...";
    try {
        // 1. Ambil fallback lokal dari data.json (termasuk Cyber di Render)
        const resLokal = await fetch("data.json");
        const dataLokal = resLokal.ok ? await resLokal.json() : [];

        // 2. Ambil semua repository publik terbaru dari GitHub API
        const resGithub = await fetch("https://api.github.com/users/fatihatulikrimah41-lgtm/repos?sort=updated&per_page=30");
        if (!resGithub.ok) {
            throw new Error("Gagal mengambil data dari GitHub API");
        }
        const repos = await resGithub.json();

        // Gabungkan Cyber dari data.json agar selalu tampil dengan status Selesai beserta link Render-nya
        const cyberItem = dataLokal.find((d) => d.id === "cyber-app");
        const daftarGabungan = cyberItem
            ? [{ ...cyberItem, status: "Selesai", updatedAt: "Aktif di Render" }]
            : [];

        repos.forEach((repo) => {
            const khusus = PetaDemoKhusus[repo.name];
            const tanpaDemo = RepoTanpaLiveDemo.includes(repo.name.toLowerCase());

            // Cek apakah repo punya homepage atau GitHub Pages aktif (kecuali yang dikecualikan)
            const urlDemo = tanpaDemo
                ? ""
                : (khusus
                    ? khusus.demoUrl
                    : (repo.homepage && repo.homepage.trim() !== ""
                        ? repo.homepage.trim()
                        : (repo.has_pages ? `https://fatihatulikrimah41-lgtm.github.io/${repo.name}/` : "")));

            // Hanya Portal Akademik, Cyber, dan Pengingat Makanan Kedaluwarsa yang berstatus "Selesai"; sisanya "Proses"
            const statusProyek = khusus ? "Selesai" : "Proses";

            daftarGabungan.push({
                id: repo.id,
                judul: khusus ? khusus.judul : repo.name,
                deskripsi: khusus ? khusus.deskripsi : (repo.description || "Repository proyek & praktikum di GitHub."),
                teknologi: khusus ? khusus.teknologi : (repo.language || "Web"),
                status: statusProyek,
                updatedAt: formatTanggalUpdate(repo.updated_at),
                demoUrl: urlDemo,
                repoUrl: repo.html_url
            });
        });

        semuaData = daftarGabungan;
        const jumlahSelesai = semuaData.filter((d) => d.status === "Selesai").length;
        const jumlahProses = semuaData.filter((d) => d.status === "Proses").length;
        statusBar.textContent = `Status Sinkronisasi: ${semuaData.length} proyek (${jumlahSelesai} Selesai • ${jumlahProses} Proses)`;
        terapkanFilter();
    } catch (error) {
        // Jika offline, tetap tampilkan data dari data.json
        const resCadangan = await fetch("data.json");
        semuaData = await resCadangan.json();
        statusBar.textContent = `Status Offline (data.json): menampilkan ${semuaData.length} proyek utama`;
        terapkanFilter();
    }
}

// Event listener pencarian, filter, dan tombol sinkronisasi ulang GitHub
inputCari.addEventListener("input", terapkanFilter);
filterStatus.addEventListener("change", terapkanFilter);
btnMuatGithub.addEventListener("click", muatSemuaDariGitHub);

// Otomatis ambil update terbaru dari GitHub saat halaman dibuka
muatSemuaDariGitHub();
