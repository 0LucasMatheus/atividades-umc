from flask import Flask, render_template, request, jsonify
import math, time

app = Flask(__name__)
temperatura = 0.0
ultima_atualizacao = int(time.time() * 1000)
passo_temperatura = 30

def aplicar_decaimento():
    global temperatura, ultima_atualizacao

    agora = int(time.time() * 1000)
    ms = agora - ultima_atualizacao

    if ms > 0 and temperatura:
        fator = max(0, 1 - ms / 10000)
        temperatura *= fator
        if abs(temperatura) < 0.5:
            temperatura = 0.0

    ultima_atualizacao = agora


@app.route("/")
def inicio():
    return render_template("index.html")

@app.route("/distancia_mouse", methods=["POST"])
def distancia_mouse():
    d = request.get_json(force=True)
    dist = math.hypot(float(d.get("mouseX", 0)) - float(d.get("sensorX", 0)),
                      float(d.get("mouseY", 0)) - float(d.get("sensorY", 0)))
    return jsonify({"distanciaPx": round(dist, 2)})

@app.route("/temperatura")
def obter_temperatura():
    aplicar_decaimento()
    return jsonify({"temperatura": int(round(temperatura)), "passo": passo_temperatura})

@app.route("/ajustar_temperatura", methods=["POST"])
def ajustar_temperatura():
    global temperatura
    aplicar_decaimento()
    direcao = request.get_json(force=True).get("direcao", "")
    
    if direcao == "subir":
        temperatura = max(-200, min(200, temperatura + passo_temperatura))
    elif direcao == "descer":
        temperatura = max(-200, min(200, temperatura - passo_temperatura))
    else:
        return jsonify({"erro": "Direção inválida"}), 400
    
    return jsonify({"temperatura": int(round(temperatura))})

@app.route("/ajustar_sensibilidade", methods=["POST"])
def ajustar_sensibilidade():
    global passo_temperatura
    passo_temperatura = max(1, min(100, int(request.get_json(force=True).get("passo", 30))))
    return jsonify({"passo": passo_temperatura})


if __name__ == "__main__":
    app.run(debug=True)