document.addEventListener("DOMContentLoaded", function () {

  // ================= DATA LATIH =================
  const dataLatih = [
    { suhu: 'tinggi', tanah: 'kering', label: 'ON' },
    { suhu: 'tinggi', tanah: 'kering', label: 'ON' },
    { suhu: 'normal', tanah: 'kering', label: 'ON' },
    { suhu: 'normal', tanah: 'lembap', label: 'OFF' },
    { suhu: 'rendah', tanah: 'basah', label: 'OFF' },
    { suhu: 'rendah', tanah: 'basah', label: 'OFF' }
  ];

  // ================= VARIABEL =================
  let autoMode = false;
  let autoInterval;
  let pompaAktif = false;
  let lastWatering = 0;

  const WATERING_INTERVAL = 2 * 60 * 1000;
  const WATERING_DURATION = 10 * 1000;

  // ================= KATEGORI =================
  function kategoriSuhu(s) {
    if (s > 30) return 'tinggi';
    if (s >= 25) return 'normal';
    return 'rendah';
  }

  function kategoriTanah(t) {
    if (t < 40) return 'kering';
    if (t <= 70) return 'lembap';
    return 'basah';
  }

  // ================= NAIVE BAYES =================
  function hitungProb(label, suhu, tanah) {
    const dataLabel = dataLatih.filter(d => d.label === label);
    const total = dataLatih.length;

    const pLabel = dataLabel.length / total;
    const pSuhu = dataLabel.filter(d => d.suhu === suhu).length / dataLabel.length || 0.01;
    const pTanah = dataLabel.filter(d => d.tanah === tanah).length / dataLabel.length || 0.01;

    return pLabel * pSuhu * pTanah;
  }

  // ================= CHART =================
  const chart = new Chart(document.getElementById('chart'), {
    type: 'bar',
    data: {
      labels: ['Pompa ON', 'Pompa OFF'],
      datasets: [{
        label: 'Probabilitas',
        data: [0, 0]
      }]
    }
  });

  // ================= UPDATE STATUS =================
  function updateStatus(keputusan, alasan) {
    const status = document.getElementById('status');
    status.innerText = keputusan === 'ON' ? 'POMPA ON 🚿' : 'POMPA OFF ❌';
    status.className = `status ${keputusan === 'ON' ? 'on' : 'off'}`;

    document.getElementById('kondisi').innerText = alasan;

    const riwayat = document.getElementById('riwayat');
    const li = document.createElement('li');
    li.innerText = `${new Date().toLocaleTimeString()} → ${keputusan}`;
    riwayat.prepend(li);
  }

  // ================= PREDIKSI MANUAL =================
  window.prediksi = function () {
    const suhuVal = parseFloat(document.getElementById('suhu').value);
    const tanahVal = parseFloat(document.getElementById('tanah').value);
    if (isNaN(suhuVal) || isNaN(tanahVal)) return;

    const suhu = kategoriSuhu(suhuVal);
    const tanah = kategoriTanah(tanahVal);

    const pON = hitungProb('ON', suhu, tanah);
    const pOFF = hitungProb('OFF', suhu, tanah);

    updateStatus(pON > pOFF ? 'ON' : 'OFF', 'Prediksi Manual');

    chart.data.datasets[0].data = [pON, pOFF];
    chart.update();
  };

  // ================= MODE OTOMATIS =================
  function toggleAuto() {
    autoMode = !autoMode;

    if (autoMode) {
      autoInterval = setInterval(() => {
        const suhu = (24 + Math.random() * 10).toFixed(1);
        const tanah = (35 + Math.random() * 45).toFixed(1);

        document.getElementById('suhu').value = suhu;
        document.getElementById('tanah').value = tanah;

        const keputusan = hitungProb('ON', kategoriSuhu(suhu), kategoriTanah(tanah)) >
                           hitungProb('OFF', kategoriSuhu(suhu), kategoriTanah(tanah))
                           ? 'ON' : 'OFF';

        updateStatus(keputusan, 'Mode Otomatis');

      }, 5000);
    } else {
      clearInterval(autoInterval);
    }
  }

  document.getElementById("btnAuto").addEventListener("click", toggleAuto);

});
