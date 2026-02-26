const temp = document.getElementById("temp");
const distancia = document.getElementById("distancia");
const passo = document.getElementById("passo");
const sensor = document.getElementById("sensor");
const sensorMovimento = document.getElementById("sensorMovimento"); 
const pot = document.getElementById("pot");

let cx = 0, cy = 0, ultimo = 0;
let mouseMoveTimeout; 

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

  // Mostra a imagem
  sensorMovimento.style.display = 'block';
  if (mouseMoveTimeout) {
    clearTimeout(mouseMoveTimeout);
  }
  mouseMoveTimeout = setTimeout(() => {
    sensorMovimento.style.display = 'none';
  }, 500); // Esconde após 500ms sem movimento

  post("/distancia_mouse", {mouseX: e.clientX, mouseY: e.clientY, sensorX: cx, sensorY: cy});
};

// Começa com a imagem escondida
sensorMovimento.style.display = 'none';

sensor.onload = window.onresize = atualizarCentro;
atualizarCentro();
buscarTemp();
setInterval(buscarTemp, 200);
