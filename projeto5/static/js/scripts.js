// -------------------------------
// Controles de temperatura + atualização periódica via servidor
// -------------------------------
const saidaTemperatura = document.getElementById("saidaTemperatura");
const botaoTempAumentar = document.getElementById("botaoTempAumentar");
const botaoTempDiminuir = document.getElementById("botaoTempDiminuir");

function definirTemperaturaNaTela(valor) {
  saidaTemperatura.textContent = String(valor);
}

function buscarTemperatura() {
  fetch("/temperatura")
    .then(resposta => resposta.json())
    .then(dados => {
      definirTemperaturaNaTela(dados.temperatura);
    });
}

function alterarTemperaturaEmPasso(direcao) {
  fetch("/passo_temperatura", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ direction: direcao })
  })
    .then(resposta => resposta.json())
    .then(dados => {
      definirTemperaturaNaTela(dados.temperatura);
    });
}

botaoTempAumentar.addEventListener("click", function () {
  alterarTemperaturaEmPasso("up");
});

botaoTempDiminuir.addEventListener("click", function () {
  alterarTemperaturaEmPasso("down");
});

// Atualização periódica para voltar ao zero e continuar a luta entre Akainu e Aokiji
buscarTemperatura();
setInterval(buscarTemperatura, 200);


// -------------------------------
// Distância do mouse -> Flask (/distancia_mouse)
// -------------------------------
const imagemSensor = document.getElementById("imagemSensor");
const valorDistancia = document.getElementById("valorDistancia");

let centroSensorX = 0;
let centroSensorY = 0;

function atualizarCentroSensor() {
  const retangulo = imagemSensor.getBoundingClientRect();
  centroSensorX = retangulo.left + (retangulo.width / 2);
  centroSensorY = retangulo.top + (retangulo.height / 2);
}

// Garante que o centro é calculado depois que a imagem carregar
imagemSensor.addEventListener("load", atualizarCentroSensor);

atualizarCentroSensor();
window.addEventListener("resize", atualizarCentroSensor);

// Controle de frequência de requisicoes
let ultimoEnvioMs = 0;

document.addEventListener("mousemove", function (evento) {
  const agora = Date.now();
  if (agora - ultimoEnvioMs < 50) return; // ~20 req/s
  ultimoEnvioMs = agora;

  fetch("/distancia_mouse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mouseX: evento.clientX,
      mouseY: evento.clientY,
      sensorX: centroSensorX,
      sensorY: centroSensorY
    })
  })
    .then(resposta => resposta.json())
    .then(dados => {
      valorDistancia.textContent = dados.distanciaPx;
    });
});