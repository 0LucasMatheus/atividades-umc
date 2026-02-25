from flask import Flask, render_template, request, jsonify
import math
import time

# Configuração e inicialização da aplicação Flask
app = Flask(__name__)
valor_temperatura = 0.0
temperatura_ultimo_ms = int(time.time() * 1000)

# Constantes de configuração dos limites e comportamento da temperatura
TEMP_MIN = -200
TEMP_MAX = 200
TEMP_STEP = 30
RETORNAR_PARA_ZERO_MS = 10_000  # tempo máximo de 10 segundos para retornar a 0


# Função responsável por aplicar o decaimento da temperatura ao longo do tempo
def aplicar_decaimento_temperatura(agora_ms: int) -> None:
    global valor_temperatura, temperatura_ultimo_ms

    ms_decorridos = max(0, agora_ms - temperatura_ultimo_ms)
    if ms_decorridos == 0:
        return

    if valor_temperatura == 0:
        temperatura_ultimo_ms = agora_ms
        return

    valor_inicial = valor_temperatura
    proporcao_decaimento = min(1.0, ms_decorridos / RETORNAR_PARA_ZERO_MS)
    valor_temperatura = valor_inicial * (1.0 - proporcao_decaimento)

    if abs(valor_temperatura) < 0.5:
        valor_temperatura = 0.0

    temperatura_ultimo_ms = agora_ms


# Função responsável por limitar a temperatura dentro dos valores mínimo e máximo
def limitar_temperatura(valor: float) -> float:
    return float(max(TEMP_MIN, min(TEMP_MAX, valor)))


# Rota principal que renderiza a página inicial
@app.route("/")
def inicio():
    return render_template("index.html")


# Rota que calcula a distância do mouse até um sensor em pixels
@app.route("/distancia_mouse", methods=["POST"])
def distancia_mouse():
    dados = request.get_json(force=True)

    mouse_x = float(dados.get("mouseX", 0))
    mouse_y = float(dados.get("mouseY", 0))
    sensor_x = float(dados.get("sensorX", 0))
    sensor_y = float(dados.get("sensorY", 0))

    distancia_px = math.hypot(mouse_x - sensor_x, mouse_y - sensor_y)

    return jsonify({"distanciaPx": round(distancia_px, 2)})


# Rota que retorna a temperatura atual aplicando o decaimento
@app.route("/temperatura", methods=["GET"])
def obter_temperatura():
    agora_ms = int(time.time() * 1000)
    aplicar_decaimento_temperatura(agora_ms)

    return jsonify({
        "temperatura": int(round(valor_temperatura))
    })


# Rota que altera a temperatura em passos para cima ou para baixo
@app.route("/passo_temperatura", methods=["POST"])
def passo_temperatura():
    global valor_temperatura, temperatura_ultimo_ms

    dados = request.get_json(force=True)
    direcao = str(dados.get("direction", "")).lower()

    agora_ms = int(time.time() * 1000)
    aplicar_decaimento_temperatura(agora_ms)

    if direcao == "up":
        valor_temperatura = limitar_temperatura(valor_temperatura + TEMP_STEP)
    elif direcao == "down":
        valor_temperatura = limitar_temperatura(valor_temperatura - TEMP_STEP)
    else:
        return jsonify({"error": "Direção inválida. Use 'up' ou 'down'."}), 400

    temperatura_ultimo_ms = agora_ms

    return jsonify({
        "temperatura": int(round(valor_temperatura))
    })


# Inicialização do servidor Flask em modo de depuração
if __name__ == "__main__":
    app.run(debug=True)