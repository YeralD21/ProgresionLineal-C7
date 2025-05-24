import numpy as np

# Crear un array simple
arr = np.array([1, 2, 3, 4, 5])
print("Array original:", arr)

# Realizar algunas operaciones básicas
print("\nOperaciones básicas:")
print("Suma de todos los elementos:", arr.sum())
print("Promedio:", arr.mean())
print("Valor máximo:", arr.max())
print("Valor mínimo:", arr.min())

# Crear una matriz 2D
matriz = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
print("\nMatriz 2D:")
print(matriz)

# Operaciones con la matriz
print("\nOperaciones con la matriz:")
print("Suma por filas:", matriz.sum(axis=1))
print("Suma por columnas:", matriz.sum(axis=0)) 