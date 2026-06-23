// script.js
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const loader = document.getElementById("loadingScreen");
    if (loader) {
      loader.classList.add("hide-loader");
    }
  }, 2200);
});

function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  
  if(tabId === 'clock') document.getElementById('btn-clock').classList.add('active');
  if(tabId === 'stopwatch') document.getElementById('btn-stopwatch').classList.add('active');
  if(tabId === 'timer') document.getElementById('btn-timer').classList.add('active');
}

let currentTargetTimezone = null; 
let currentTargetName = "Local Time";

const citiesDatabase = [
  { name: "London", zone: "Europe/London" },
  { name: "New York", zone: "America/New_York" },
  { name: "Tokyo", zone: "Asia/Tokyo" },
  { name: "Paris", zone: "Europe/Paris" },
  { name: "Dubai", zone: "Asia/Dubai" },
  { name: "Singapore", zone: "Asia/Singapore" },
  { name: "Sydney", zone: "Australia/Sydney" },
  { name: "Mumbai", zone: "Asia/Kolkata" },
  { name: "Los Angeles", zone: "America/Los_Angeles" },
  { name: "Hong Kong", zone: "Asia/Hong_Kong" },
  { name: "Berlin", zone: "Europe/Berlin" },
  { name: "Cape Town", zone: "Africa/Johannesburg" },
  { name: "Sao Paulo", zone: "America/Sao_Paulo" }
];

function filterCities() {
  const query = document.getElementById("citySearch").value.toLowerCase().trim();
  const resultsContainer = document.getElementById("searchResults");
  resultsContainer.innerHTML = "";

  if (!query) {
    resultsContainer.style.display = "none";
    return;
  }

  const filtered = citiesDatabase.filter(c => c.name.toLowerCase().includes(query));
  
  if ("local time".includes(query)) {
    filtered.unshift({ name: "Local Time", zone: null });
  }

  if (filtered.length > 0) {
    filtered.forEach(city => {
      const div = document.createElement("div");
      div.className = "search-item";
      div.innerText = city.name;
      div.onclick = () => selectCity(city.name, city.zone);
      resultsContainer.appendChild(div);
    });
    resultsContainer.style.display = "block";
  } else {
    resultsContainer.style.display = "none";
  }
}

function selectCity(name, zone) {
  currentTargetTimezone = zone;
  currentTargetName = name;
  document.getElementById("clockTarget").innerText = name;
  document.getElementById("citySearch").value = "";
  document.getElementById("searchResults").style.display = "none";
  updateClock();
}

document.addEventListener("click", (e) => {
  if (e.target.id !== "citySearch" && e.target.id !== "searchResults") {
    document.getElementById("searchResults").style.display = "none";
  }
});

function updateClock() {
  const now = new Date();
  let timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
  let dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

  if (currentTargetTimezone) {
    timeOptions.timeZone = currentTargetTimezone;
    dateOptions.timeZone = currentTargetTimezone;
  }

  document.getElementById("time").innerText = now.toLocaleTimeString([], timeOptions);
  document.getElementById("date").innerText = now.toLocaleDateString([], dateOptions);
}
setInterval(updateClock, 1000);
updateClock();

let swInterval;
let swTime = 0;
let running = false;

function updateSW() {
  let ms = swTime % 100;
  let totalSeconds = Math.floor(swTime / 100);
  let min = Math.floor(totalSeconds / 60);
  let sec = totalSeconds % 60;

  document.getElementById("sw").innerText =
    `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

function startStopwatch() {
  if (running) return;
  running = true;

  swInterval = setInterval(() => {
    swTime++;
    updateSW();
  }, 10);
}

function pauseStopwatch() {
  running = false;
  clearInterval(swInterval);
}

function resetStopwatch() {
  pauseStopwatch();
  swTime = 0;
  updateSW();
}

let timerInterval;

function playAlarmSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  
  let times = [0, 0.25, 0.5]; 
  
  times.forEach(delay => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    
    osc.frequency.setValueAtTime(988, ctx.currentTime + delay);
    
    gain.gain.setValueAtTime(1.0, ctx.currentTime + delay);
    
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.18);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.19);
  });
}

function startTimer() {
  let mins = parseInt(document.getElementById("mins").value || 0);
  let secs = parseInt(document.getElementById("secs").value || 0);
  
  let total = (mins * 60) + secs;
  if (total <= 0) return;
  
  clearInterval(timerInterval);
  updateTimerDisplay(total);

  timerInterval = setInterval(() => {
    total--;
    updateTimerDisplay(total);

    if (total <= 0) {
      clearInterval(timerInterval);
      playAlarmSound();
    }
  }, 1000);
}

function updateTimerDisplay(secondsLeft) {
  let m = Math.floor(secondsLeft / 60);
  let s = secondsLeft % 60;
  document.getElementById("tDisplay").innerText =
    `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function clearTimer() {
  clearInterval(timerInterval);
  document.getElementById("mins").value = 0;
  document.getElementById("secs").value = 0;
  document.getElementById("tDisplay").innerText = "00:00";
}

document.querySelectorAll('.input-col input').forEach(input => {
  input.addEventListener('blur', (e) => {
    let val = parseInt(e.target.value || 0);
    if (val < 0) val = 0;
    if (e.target.id === 'secs' && val > 59) val = 59;
    if (e.target.id === 'mins' && val > 99) val = 99;
    e.target.value = val;
  });
});