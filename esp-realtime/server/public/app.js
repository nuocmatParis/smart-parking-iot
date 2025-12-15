// public/app.js

// --- 1. KHAI BÁO BIẾN ---
const TOTAL_SLOTS = 18;
const parkingTimes = {}; 
const initialData = new Array(24).fill(0); 
const labels = Array.from({length: 24}, (_, i) => `${i}h`);
var myChart = null; 

function $(id) { return document.getElementById(id); }

// --- 2. CÁC TÍNH NĂNG MỚI (SHORTCUTS & CREDITS) 🔥 ---

// A. Bật tắt bảng thông tin
window.toggleCredits = function() {
    const modal = document.getElementById('credits-modal');
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
    }
}

// B. Lắng nghe bàn phím (Vũ khí bí mật)
document.addEventListener('keydown', function(event) {
    // Nếu đang gõ vào ô tìm kiếm thì không kích hoạt phím tắt
    if (document.activeElement.tagName === 'INPUT') return;

    const key = event.key.toLowerCase(); // Chuyển về chữ thường

    if (key === '1') toggleSlotByKeyboard(1);
    if (key === '2') toggleSlotByKeyboard(2);
    if (key === '3') toggleSlotByKeyboard(3);
    
    // Phím 'a' -> Random (Auto)
    if (key === 'a') {
        const randomSlot = Math.floor(Math.random() * TOTAL_SLOTS) + 1;
        toggleSlotByKeyboard(randomSlot);
    }
});

// Hàm hỗ trợ phím tắt: Tự động đảo trạng thái (Nếu đầy -> Trống, Nếu trống -> Đầy)
function toggleSlotByKeyboard(slotId) {
    const el = $(`slot${slotId}`);
    if (el) {
        const isOccupied = el.classList.contains('occupied');
        // Nếu đang có xe thì cho ra (0), nếu chưa có thì cho vào (1)
        setSlot(slotId, !isOccupied); 
    }
}

// --- 3. VOICE ASSISTANT ---
function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN'; 
        window.speechSynthesis.speak(utterance);
    }
}

// --- 4. CÁC HÀM UI CŨ ---
function setOccupiedCount(n) {
    const occEl = $("occupied"), totEl = $("total");
    if (occEl) occEl.textContent = String(n);
    if (totEl) totEl.textContent = String(TOTAL_SLOTS);

    const circle = document.querySelector('.progress-ring__circle');
    if (circle) {
        const r = circle.r.baseVal.value, c = r * 2 * Math.PI;
        circle.style.strokeDasharray = `${c} ${c}`;
        const pct = n / TOTAL_SLOTS;
        circle.style.strokeDashoffset = c - (pct * c);
        if (pct < 0.5) circle.style.stroke = '#2ecc71';
        else if (pct < 0.85) circle.style.stroke = '#f1c40f';
        else circle.style.stroke = '#e74c3c';
    }
}

function updateChart() {
    const h = new Date().getHours();
    initialData[h] += 1;
    if (myChart) {
        myChart.data.datasets[0].data[h] = initialData[h];
        myChart.update();
    }
}

function showToast(slotId, type) {
    const box = document.getElementById('toast-box');
    if (!box) return;
    const t = document.createElement('div');
    const isDark = document.body.classList.contains('dark-mode');
    
    t.className = type === 'IN' ? 'toast' : 'toast out';
    if(isDark) { t.style.background = "#23233a"; t.style.color = "#fff"; }
    
    const title = type === 'IN' ? `Xe vào Slot ${slotId}` : `Xe rời Slot ${slotId}`;
    const icon = type === 'IN' ? '⬇' : '⬆';
    
    t.innerHTML = `<div style="font-size:20px;">${icon}</div><div><strong>${title}</strong><span style="font-size:12px; opacity:0.7; display:block">Vừa xong</span></div>`;
    box.appendChild(t);
    setTimeout(() => t.remove(), 3500);
}

function addLogRow(slotId, type, note) {
    const tbody = document.getElementById('log-body');
    if (!tbody) return;
    const row = document.createElement('tr');
    const timeNow = new Date().toLocaleTimeString('vi-VN');
    const status = type === 'IN' ? `<span class="status-in">⬇ Xe vào</span>` : `<span class="status-out">⬆ Xe ra</span> <small>(${note})</small>`;
    row.innerHTML = `<td>${timeNow}</td><td>Slot ${slotId}</td><td>${status}</td>`;
    tbody.insertBefore(row, tbody.firstChild);
}

// --- 5. HÀM XỬ LÝ CHÍNH ---
function setSlot(i, occupied) {
  const el = $(`slot${i}`);
  const timerEl = $(`timer${i}`);
  if (!el) return;

  const isOccupied = el.classList.contains("occupied");
  const isValidating = el.classList.contains("validating");

  if (!!occupied !== isOccupied && !isValidating) {
    
    if (occupied) {
      // === XE VÀO ===
      el.classList.add("validating");
      
      setTimeout(() => {
          el.classList.remove("validating");
          el.classList.add("occupied");

          parkingTimes[i] = Date.now();
          addLogRow(i, 'IN', '');
          updateChart();
          showToast(i, 'IN');
          updateTotalCount();
          speak(`Xe vào vị trí số ${i}`);

      }, 1500); // Trễ 1.5s nhấp nháy

    } else {
      // === XE RA ===
      el.classList.remove("occupied");
      el.classList.remove("validating");

      let durationText = "";
      if (parkingTimes[i]) {
        const diff = Date.now() - parkingTimes[i];
        const h = Math.floor(diff/3600000), m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
        durationText = h > 0 ? `${h}h ${m}p` : (m > 0 ? `${m}p` : `${s}s`);
        delete parkingTimes[i];
      }
      if (timerEl) timerEl.textContent = "";
      addLogRow(i, 'OUT', `Đỗ: ${durationText}`);
      showToast(i, 'OUT');
      updateTotalCount();
      speak(`Xe rời vị trí số ${i}`);
    }
  }
}

function updateTotalCount() {
    const total = document.querySelectorAll('.slot-u.occupied').length;
    setOccupiedCount(total);
}

// --- 6. KHỞI TẠO ---
document.addEventListener('DOMContentLoaded', function() {
    const darkBtn = document.getElementById('darkModeBtn');
    if(darkBtn) darkBtn.addEventListener('click', () => document.body.classList.toggle('dark-mode'));

    const ctx = document.getElementById('parkingChart');
    if (ctx) {
        myChart = new Chart(ctx, {
            type: 'bar',
            data: { labels: labels, datasets: [{ label: 'Xe vào', data: initialData, backgroundColor: '#6c5ce7', borderRadius: 4 }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }, plugins: { legend: { display: false } } }
        });
    }

    const search = document.getElementById('filterInput');
    if(search) search.addEventListener('keyup', function() {
        const v = this.value.toUpperCase();
        document.querySelectorAll('#log-body tr').forEach(r => r.style.display = r.innerText.toUpperCase().includes(v) ? "" : "none");
    });
    
    const exportBtn = document.querySelector('.primary-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            const table = document.querySelector('.log-table');
            if (!table) return alert("Chưa có dữ liệu!");
            let csv = [];
            csv.push('\ufeff' + Array.from(table.querySelectorAll('th')).map(th=>th.innerText).join(','));
            table.querySelectorAll('tbody tr').forEach(row => {
                if(row.style.display !== 'none') csv.push(Array.from(row.querySelectorAll('td')).map(td=>`"${td.innerText}"`).join(','));
            });
            const link = document.createElement('a');
            link.download = `Log_${Date.now()}.csv`;
            link.href = URL.createObjectURL(new Blob([csv.join('\n')], {type: 'text/csv'}));
            link.click();
        });
    }
});

setInterval(() => {
  const now = Date.now();
  for (const [id, start] of Object.entries(parkingTimes)) {
    const el = $(`timer${id}`);
    if (el) {
        const d = Math.floor((now - start)/1000);
        el.textContent = `${Math.floor(d/60)}m ${d%60}s`;
    }
  }
}, 1000);

(function main() {
  const wsUrl = `ws://${location.hostname}:3000`;
  let ws, timer;
  function connect() {
    if(timer) clearTimeout(timer);
    ws = new WebSocket(wsUrl);
    ws.onopen = () => { const d=$('status-dot'); if(d) d.className='status-online'; };
    ws.onclose = () => { const d=$('status-dot'); if(d) d.className='status-offline'; timer=setTimeout(connect,1000); };
    ws.onmessage = (ev) => {
        try {
            const j = JSON.parse(ev.data);
            setSlot(1, j.slot1); setSlot(2, j.slot2); setSlot(3, j.slot3);
        } catch(e) {}
    };
  }
  setOccupiedCount(0);
  connect();
})();