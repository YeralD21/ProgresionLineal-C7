# Solucionador de Programación Lineal - Examen Unidad 2 - Análisis Multivariado

Esta aplicación permite resolver problemas de programación lineal de manera gráfica y numérica. Permite ingresar coeficientes, restricciones y visualizar la solución mediante un gráfico.

## Requisitos

- Python 3.7 o superior
- Node.js 14 o superior
- npm o yarn

## Instalación

### Backend (Python)

1. Crear un entorno virtual (opcional pero recomendado):
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Ejecutar el servidor:
```bash
python app.py
```

### Frontend (React)

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar la aplicación:
```bash
npm start
```

## Uso

1. Abre tu navegador y ve a `http://localhost:3000`
2. Selecciona si deseas maximizar o minimizar la función objetivo
3. Ingresa los coeficientes de las variables X e Y
4. Agrega las restricciones necesarias
5. Haz clic en "Resolver" para obtener la solución
6. Visualiza los resultados y el gráfico de la solución

## Características

- Resolución de problemas de programación lineal
- Visualización gráfica de la solución
- Interfaz intuitiva y fácil de usar
- Soporte para múltiples restricciones
- Opciones de maximización y minimización
