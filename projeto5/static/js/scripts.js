const temp = document.getElementById("temp");
const distancia = document.getElementById("distancia");
const passo = document.getElementById("passo");
const sensor = document.getElementById("sensor");
const pot = document.getElementById("pot");

let cx = 0, cy = 0, ultimo = 0;

function post(url, dados) {
  fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(dados)
  }).then(r => r.json()).then(d => {
    if (d.temperatura !== undefined) temp.textContent = d.temperatura;
    if (d.distanciaPx !== undefined) distancia.textContent = d.distanciaPx;
  });
}

function buscarTemp() {
  fetch("/temperatura").then(r => r.json()).then(d => {
    temp.textContent = d.temperatura;
    pot.value = passo.textContent = d.passo;
  });
}

function atualizarCentro() {
  const r = sensor.getBoundingClientRect();
  cx = r.left + r.width / 2;
  cy = r.top + r.height / 2;
}

document.getElementById("subir").onclick = () => post("/ajustar_temperatura", {direcao: "subir"});
document.getElementById("descer").onclick = () => post("/ajustar_temperatura", {direcao: "descer"});

pot.oninput = e => {
  passo.textContent = e.target.value;
  post("/ajustar_sensibilidade", {passo: parseInt(e.target.value)});
};

document.onmousemove = e => {
  const agora = Date.now();
  if (agora - ultimo < 50) return;
  ultimo = agora;
  post("/distancia_mouse", {mouseX: e.clientX, mouseY: e.clientY, sensorX: cx, sensorY: cy});
};

sensor.onload = window.onresize = atualizarCentro;
atualizarCentro();
buscarTemp();
setInterval(buscarTemp, 200);