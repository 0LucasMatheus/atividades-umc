const temp = document.getElementById("temp");
const distancia = document.getElementById("distancia");
const passo = document.getElementById("passo");
const sensor = document.getElementById("sensor");
const sensorMovimento = document.getElementById("sensorMovimento"); 
const pot = document.getElementById("pot");
const kizaTemp = document.getElementById("kizaTemp");
const kizaDist = document.getElementById("kizaDist");
const kizaMov = document.getElementById("kizaMov");


//função para atualizar a cor da barra de acordo com o valor do potenciômetro
function atualizarCorBarra(valor) {
  const porcentagem = (valor - pot.min) / (pot.max - pot.min) * 100;
  
  //Transição de vermelho para o azul
  const r = Math.round(255 - (valor / 100) * 255);
  const g = 0;
  const b = Math.round((valor / 100) * 255);

  const cor = `rgb(${r}, ${g}, ${b})`;
  pot.style.background = `linear-gradient(to right, ${cor} ${porcentagem}%, #ddd ${porcentagem}%)`;
}

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
    if (d.temperatura !== undefined) kizaTempUpdate(d.temperatura);
    if (d.distanciaPx !== undefined) kizaDistUpdate(d.distanciaPx);
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

// Atualiza a sensibilidade em tempo real e envia o novo valor para o servidor
pot.oninput = e => {
  const valor = parseInt(e.target.value);

  passo.textContent = valor;
  atualizarCorBarra(valor);

  post("/ajustar_sensibilidade", {passo: valor});
};



// Função para atualizar a cor da imagem do Kizaru com base na temperatura
function kizaTempUpdate(temperatureValue) {
  const maxTemp = 200;
  const intensity = Math.min(1, Math.abs(temperatureValue) / maxTemp);

  let corKizaTemp = "none";

  if (temperatureValue > 40) {
    // Mais quente = vermelho
    corKizaTemp = `sepia(${intensity}) hue-rotate(-30deg)`;
  } else if (temperatureValue < -40) {
    // Mais frio = azul
    corKizaTemp = `sepia(${intensity}) hue-rotate(200deg)`;
  } else {
    // Temperatura ideal = normal
    corKizaTemp = `sepia(${intensity})`;
  }

  kizaTemp.style.filter = corKizaTemp;

}

// Função para atualizar a cor da imagem do Kizaru com base na distância
function kizaDistUpdate(distanceValue) {
  let effect;
  if (distanceValue <= 0) {
    effect = 1;          // muito perto → efeito máximo
  } else if (distanceValue >= 300) {
    effect = 0;          // muito longe → sem efeito
  } else {
    effect = 1 - (distanceValue / 300);
  }

  kizaDist.style.filter = `brightness(${1 + effect * 0.5}) grayscale(${effect})`;
}


document.onmousemove = e => {
  const agora = Date.now();
  if (agora - ultimo < 50) return;
  ultimo = agora;

  // Mostra a imagem
  kizaMov.style.visibility = 'visible';
  if (mouseMoveTimeout) {
    clearTimeout(mouseMoveTimeout);
  }
  mouseMoveTimeout = setTimeout(() => {
    kizaMov.style.visibility = 'hidden';
  }, 500); // Esconde após 500ms sem movimento

  post("/distancia_mouse", {mouseX: e.clientX, mouseY: e.clientY, sensorX: cx, sensorY: cy});
};

// Começa com a imagem escondida
kizaMov.style.visibility = 'hidden';

sensor.onload = window.onresize = atualizarCentro;
atualizarCentro();
buscarTemp();
setInterval(buscarTemp, 200);
atualizarCorBarra(pot.value);
