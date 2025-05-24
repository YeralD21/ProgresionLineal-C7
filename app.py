from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import numpy as np
from pulp import *
import matplotlib.pyplot as plt
import io
import base64
from matplotlib.patches import Polygon

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
    
    objetivo = datos['objetivo']  # 'max' o 'min'
    coeficientes = datos['coeficientes']  # [coef_x, coef_y]
    restricciones = datos['restricciones']  # [[coef_x, coef_y, operador, valor], ...]

    prob = LpProblem("Programacion_Lineal", LpMaximize if objetivo == 'max' else LpMinimize)
    x = LpVariable("x", lowBound=0)
    y = LpVariable("y", lowBound=0)
    prob += coeficientes[0] * x + coeficientes[1] * y
    for restriccion in restricciones:
        coef_x, coef_y, operador, valor = restriccion
        if operador == '<=':
            prob += coef_x * x + coef_y * y <= valor
        elif operador == '>=':
            prob += coef_x * x + coef_y * y >= valor
        else:
            prob += coef_x * x + coef_y * y == valor
    prob.solve()
    resultado = {
        'estado': LpStatus[prob.status],
        'x': value(x),
        'y': value(y),
        'valor_objetivo': value(prob.objective)
    }
    # Calcular tabla de puntos
    tabla_resultados = calcular_tabla_puntos(coeficientes, restricciones, objetivo)
    # Marcar el óptimo
    for punto in tabla_resultados:
        if abs(punto['x0'] - resultado['x']) < 1e-4 and abs(punto['x1'] - resultado['y']) < 1e-4:
            punto['punto'] += ' - OPTIMO'
    resultado['tabla_resultados'] = tabla_resultados
    # Referencias
    resultado['referencias'] = {
        'variables': ['X0', 'X1'],
        'restricciones': [f'Restriccion{i+1}' for i in range(len(restricciones))]
    }
    datos_grafico = generar_grafico(coeficientes, restricciones, resultado)
    resultado['grafico'] = datos_grafico
    return jsonify(resultado)

def calcular_tabla_puntos(coeficientes, restricciones, objetivo):
    import itertools
    puntos = []
    n = len(restricciones)
    for i, j in itertools.combinations(range(n), 2):
        a1, b1, op1, c1 = restricciones[i]
        a2, b2, op2, c2 = restricciones[j]
        det = a1 * b2 - a2 * b1
        if abs(det) < 1e-8:
            continue  # Son paralelas
        x = (c1 * b2 - c2 * b1) / det
        y = (a1 * c2 - a2 * c1) / det
        # Verificar si cumple todas las restricciones
        cumple = True
        holguras = []
        for idx, (a, b, op, c) in enumerate(restricciones):
            val = a * x + b * y
            if op == '<=' and val > c + 1e-6:
                cumple = False
                break
            elif op == '>=' and val < c - 1e-6:
                cumple = False
                break
            elif op == '=' and abs(val - c) > 1e-6:
                cumple = False
                break
            # Calcular holgura
            if op == '<=':
                holguras.append(round(c - val, 2))
            elif op == '>=':
                holguras.append(round(val - c, 2))
            else:
                holguras.append(0.0)
        if cumple and x >= -1e-6 and y >= -1e-6:
            valor_obj = coeficientes[0] * x + coeficientes[1] * y
            punto = {
                'punto': f'P{len(puntos)}',
                'x0': round(x, 2),
                'x1': round(y, 2),
                'valor_objetivo': round(valor_obj, 2)
            }
            # Agregar variables de holgura S0, S1, ...
            for idx, h in enumerate(holguras):
                punto[f's{idx}'] = h
            puntos.append(punto)
    # Agregar intersecciones con ejes
    for i, (a, b, op, c) in enumerate(restricciones):
        if a != 0:
            x = c / a
            y = 0
            cumple = True
            holguras = []
            for idx, (a2, b2, op2, c2) in enumerate(restricciones):
                val = a2 * x + b2 * y
                if op2 == '<=' and val > c2 + 1e-6:
                    cumple = False
                    break
                elif op2 == '>=' and val < c2 - 1e-6:
                    cumple = False
                    break
                elif op2 == '=' and abs(val - c2) > 1e-6:
                    cumple = False
                    break
                if op2 == '<=':
                    holguras.append(round(c2 - val, 2))
                elif op2 == '>=':
                    holguras.append(round(val - c2, 2))
                else:
                    holguras.append(0.0)
            if cumple and x >= -1e-6 and y >= -1e-6:
                valor_obj = coeficientes[0] * x + coeficientes[1] * y
                punto = {
                    'punto': f'P{len(puntos)}',
                    'x0': round(x, 2),
                    'x1': round(y, 2),
                    'valor_objetivo': round(valor_obj, 2)
                }
                for idx, h in enumerate(holguras):
                    punto[f's{idx}'] = h
                puntos.append(punto)
        if b != 0:
            x = 0
            y = c / b
            cumple = True
            holguras = []
            for idx, (a2, b2, op2, c2) in enumerate(restricciones):
                val = a2 * x + b2 * y
                if op2 == '<=' and val > c2 + 1e-6:
                    cumple = False
                    break
                elif op2 == '>=' and val < c2 - 1e-6:
                    cumple = False
                    break
                elif op2 == '=' and abs(val - c2) > 1e-6:
                    cumple = False
                    break
                if op2 == '<=':
                    holguras.append(round(c2 - val, 2))
                elif op2 == '>=':
                    holguras.append(round(val - c2, 2))
                else:
                    holguras.append(0.0)
            if cumple and x >= -1e-6 and y >= -1e-6:
                valor_obj = coeficientes[0] * x + coeficientes[1] * y
                punto = {
                    'punto': f'P{len(puntos)}',
                    'x0': round(x, 2),
                    'x1': round(y, 2),
                    'valor_objetivo': round(valor_obj, 2)
                }
                for idx, h in enumerate(holguras):
                    punto[f's{idx}'] = h
                puntos.append(punto)
    return puntos

def generar_grafico(coeficientes, restricciones, resultado):
    plt.figure(figsize=(10, 8))
    x = np.linspace(0, 60, 400)
    y = np.linspace(0, 60, 400)
    X, Y = np.meshgrid(x, y)
    region = np.ones_like(X, dtype=bool)
    for coef_x, coef_y, operador, valor in restricciones:
        if operador == '>=':
            region &= (coef_x * X + coef_y * Y >= valor)
        elif operador == '<=':
            region &= (coef_x * X + coef_y * Y <= valor)
        else:
            region &= (np.isclose(coef_x * X + coef_y * Y, valor))
    plt.contourf(X, Y, region, levels=[0.5, 1], colors=['#a0ffa0'], alpha=0.5)

    # Graficar restricciones
    for coef_x, coef_y, operador, valor in restricciones:
        if coef_y != 0:
            y_line = (valor - coef_x * x) / coef_y
            plt.plot(x, y_line, label=f'{coef_x}x + {coef_y}y {operador} {valor}')
    # Graficar función objetivo
    if coeficientes[1] != 0:
        y_obj = (resultado['valor_objetivo'] - coeficientes[0] * x) / coeficientes[1]
        plt.plot(x, y_obj, 'k--', label='Función Objetivo')
    # Graficar punto óptimo
    plt.plot(resultado['x'], resultado['y'], 'ro', label='Punto Óptimo')
    # Marcar los vértices factibles
    for punto in resultado['tabla_resultados']:
        plt.plot(punto['x0'], punto['x1'], 'bo')
        plt.text(punto['x0'], punto['x1'], punto['punto'], fontsize=9, ha='right')
    plt.grid(True)
    plt.legend()
    plt.xlabel('x')
    plt.ylabel('y')
    plt.title('Solución de Programación Lineal')
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode()
    plt.close()
    return plot_url

if __name__ == '__main__':
    app.run(debug=True) 