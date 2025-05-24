from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import numpy as np
from pulp import *
import matplotlib.pyplot as plt
import io
import base64

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET', 'POST'])
def index():
    resultado = None
    if request.method == 'POST':
        # Aquí procesas los datos de entrada y resuelves el problema de PL
        # datos = request.form.get('datos')
        resultado = "Aquí irá la solución del problema"
    return render_template('index.html', resultado=resultado)

@app.route('/resolver', methods=['POST'])
def resolver_pl():
    datos = request.json
    
    # Extraer datos de la solicitud
    objetivo = datos['objetivo']  # 'max' o 'min'
    coeficientes = datos['coeficientes']  # [coef_x, coef_y]
    restricciones = datos['restricciones']  # [[coef_x, coef_y, operador, valor], ...]
    
    # Crear el problema de optimización
    prob = LpProblem("Programacion_Lineal", LpMaximize if objetivo == 'max' else LpMinimize)
    
    # Crear variables
    x = LpVariable("x", lowBound=0)
    y = LpVariable("y", lowBound=0)
    
    # Función objetivo
    prob += coeficientes[0] * x + coeficientes[1] * y
    
    # Agregar restricciones
    for restriccion in restricciones:
        coef_x, coef_y, operador, valor = restriccion
        if operador == '<=':
            prob += coef_x * x + coef_y * y <= valor
        elif operador == '>=':
            prob += coef_x * x + coef_y * y >= valor
        else:  # '='
            prob += coef_x * x + coef_y * y == valor
    
    # Resolver el problema
    prob.solve()
    
    # Obtener resultados
    resultado = {
        'estado': LpStatus[prob.status],
        'x': value(x),
        'y': value(y),
        'valor_objetivo': value(prob.objective)
    }
    
    # Generar gráfico
    datos_grafico = generar_grafico(coeficientes, restricciones, resultado)
    resultado['grafico'] = datos_grafico
    
    return jsonify(resultado)

def generar_grafico(coeficientes, restricciones, resultado):
    plt.figure(figsize=(10, 8))
    
    # Graficar restricciones
    x = np.linspace(0, 10, 100)
    for restriccion in restricciones:
        coef_x, coef_y, operador, valor = restriccion
        if coef_y != 0:
            y = (valor - coef_x * x) / coef_y
            plt.plot(x, y, label=f'{coef_x}x + {coef_y}y {operador} {valor}')
    
    # Graficar función objetivo
    if coeficientes[1] != 0:
        y_obj = (resultado['valor_objetivo'] - coeficientes[0] * x) / coeficientes[1]
        plt.plot(x, y_obj, 'k--', label='Función Objetivo')
    
    # Graficar punto óptimo
    plt.plot(resultado['x'], resultado['y'], 'ro', label='Punto Óptimo')
    
    plt.grid(True)
    plt.legend()
    plt.xlabel('x')
    plt.ylabel('y')
    plt.title('Solución de Programación Lineal')
    
    # Convertir gráfico a string base64
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode()
    plt.close()
    
    return plot_url

if __name__ == '__main__':
    app.run(debug=True) 