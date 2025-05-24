import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Tabs,
  Tab
} from '@material-ui/core';
import axios from 'axios';

function App() {
  // Estados principales
  const [paso, setPaso] = useState(0); // 0: Configuración, 1: Detalles, 2: Resultados
  const [objetivo, setObjetivo] = useState('max');
  const [variables, setVariables] = useState([{ nombre: 'X0', valor: '' }, { nombre: 'X1', valor: '' }]);
  const [restricciones, setRestricciones] = useState([]);
  const [nuevaRestriccion, setNuevaRestriccion] = useState({ x: '', y: '', operador: '<=', valor: '' });
  const [coeficientes, setCoeficientes] = useState({ x: '', y: '', metodo: 'grafico' });
  const [resultado, setResultado] = useState(null);

  // Navegación entre pasos
  const siguiente = () => setPaso((prev) => Math.min(prev + 1, 2));
  const volver = () => setPaso((prev) => Math.max(prev - 1, 0));

  // Agregar restricción
  const agregarRestriccion = () => {
    setRestricciones([...restricciones, nuevaRestriccion]);
    setNuevaRestriccion({ x: '', y: '', operador: '<=', valor: '' });
  };

  // Resolver el modelo
  const resolverProblema = async () => {
    try {
      const datos = {
        objetivo,
        coeficientes: variables.map((_, idx) => parseFloat(coeficientes[`x${idx}`] || 0)),
        restricciones: restricciones.map(r => [
          ...variables.map((_, idx) => parseFloat(r[`x${idx}`] || 0)),
          r.operador,
          parseFloat(r.valor)
        ])
      };
      const respuesta = await axios.post('http://localhost:5000/resolver', datos);
      setResultado(respuesta.data);
      siguiente();
    } catch (error) {
      alert('Error al resolver el problema');
    }
  };

  // Tabs para navegación visual
  const tabs = [
    "Configuración del Modelo",
    "Detalles del Modelo",
    "Presentación de los Resultados"
  ];

  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      <Paper style={{ padding: '2rem' }}>
        <Tabs value={paso} indicatorColor="primary" textColor="primary" centered>
          {tabs.map((label, idx) => (
            <Tab key={idx} label={label} />
          ))}
        </Tabs>

        {/* Paso 1: Configuración */}
        {paso === 0 && (
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              Comenzamos configurando nuestro modelo
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper style={{ padding: '1rem', textAlign: 'center' }}>
                  <Typography>Método a utilizar</Typography>
                  <Button
                    variant={coeficientes.metodo === 'grafico' ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => setCoeficientes(c => ({ ...c, metodo: 'grafico' }))}
                    style={{ marginRight: 8 }}
                  >
                    Gráfico
                  </Button>
                  <Button
                    variant={coeficientes.metodo === 'simplex' ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => setCoeficientes(c => ({ ...c, metodo: 'simplex' }))}
                  >
                    Simplex
                  </Button>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper style={{ padding: '1rem', textAlign: 'center' }}>
                  <Typography>Tipo de optimización</Typography>
                  <Button
                    variant={objetivo === 'max' ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => setObjetivo('max')}
                    style={{ marginRight: 8 }}
                  >
                    Maximizar
                  </Button>
                  <Button
                    variant={objetivo === 'min' ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => setObjetivo('min')}
                  >
                    Minimizar
                  </Button>
                </Paper>
              </Grid>
            </Grid>
            <Box mt={4}>
              <Typography variant="h6">Variables</Typography>
              <Grid container spacing={2}>
                {variables.map((v, idx) => (
                  <React.Fragment key={idx}>
                    <Grid item xs={2}>
                      <TextField
                        label={`X${idx}`}
                        value={v.nombre}
                        disabled
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        label="Descripción"
                        value={v.descripcion || ''}
                        onChange={e => {
                          const newVars = [...variables];
                          newVars[idx].descripcion = e.target.value;
                          setVariables(newVars);
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setVariables(variables.filter((_, i) => i !== idx))}
                        disabled={variables.length <= 1}
                      >
                        🗑️
                      </Button>
                    </Grid>
                  </React.Fragment>
                ))}
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setVariables([...variables, { nombre: `X${variables.length}`, descripcion: '' }])}
                  >
                    + Añadir variable
                  </Button>
                </Grid>
              </Grid>
            </Box>
            <Box mt={4}>
              <Typography variant="h6">Restricciones</Typography>
              <Grid container spacing={2}>
                {restricciones.map((r, idx) => (
                  <React.Fragment key={idx}>
                    <Grid item xs={2}>
                      <TextField
                        label={`R${idx}`}
                        value={r.nombre || `R${idx}`}
                        disabled
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Descripción"
                        value={r.descripcion || ''}
                        onChange={e => {
                          const newRes = [...restricciones];
                          newRes[idx].descripcion = e.target.value;
                          setRestricciones(newRes);
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        label="Expresión"
                        value={r.expresion || ''}
                        onChange={e => {
                          const newRes = [...restricciones];
                          newRes[idx].expresion = e.target.value;
                          setRestricciones(newRes);
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setRestricciones(restricciones.filter((_, i) => i !== idx))}
                      >
                        🗑️
                      </Button>
                    </Grid>
                  </React.Fragment>
                ))}
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setRestricciones([...restricciones, { nombre: `R${restricciones.length}`, descripcion: '', expresion: '' }])}
                  >
                    + Añadir restricción
                  </Button>
                </Grid>
              </Grid>
            </Box>
            <Box mt={4} display="flex" justifyContent="flex-end">
              <Button variant="contained" color="primary" onClick={siguiente}>Siguiente</Button>
            </Box>
          </Box>
        )}

        {/* Paso 2: Detalles del Modelo */}
        {paso === 1 && (
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              Cargamos los datos de nuestro modelo
            </Typography>
            {/* Referencias de variables y restricciones */}
            <Box mt={2}>
              <Typography variant="subtitle1">Referencias</Typography>
              <Paper style={{ padding: '1rem', marginBottom: '1rem' }}>
                <Typography variant="subtitle2">Variables:</Typography>
                {variables.map((v, idx) => (
                  <Box key={idx} display="flex" alignItems="center" mb={1}>
                    <Box
                      style={{
                        background: "#e0e0e0",
                        borderRadius: "4px",
                        padding: "2px 8px",
                        marginRight: 8,
                        fontWeight: "bold"
                      }}
                    >
                      X{idx}
                    </Box>
                    <Typography>{v.descripcion || "(sin descripción)"}</Typography>
                  </Box>
                ))}
                <Typography variant="subtitle2" style={{ marginTop: 8 }}>Restricciones:</Typography>
                {restricciones.map((r, idx) => (
                  <Box key={idx} display="flex" alignItems="center" mb={1}>
                    <Box
                      style={{
                        background: "#e0e0e0",
                        borderRadius: "4px",
                        padding: "2px 8px",
                        marginRight: 8,
                        fontWeight: "bold"
                      }}
                    >
                      R{idx}
                    </Box>
                    <Typography>{r.descripcion || "(sin descripción)"}</Typography>
                  </Box>
                ))}
              </Paper>
            </Box>

            {/* Función objetivo */}
            <Box mt={2}>
              <Typography variant="subtitle1">Función objetivo</Typography>
              <Paper style={{ padding: '1rem', marginBottom: '1rem' }}>
                <Grid container spacing={2} alignItems="center">
                  {variables.map((v, idx) => (
                    <React.Fragment key={idx}>
                      <Grid item>
                        <TextField
                          label={`Coef X${idx}`}
                          type="number"
                          value={coeficientes[`x${idx}`] || ""}
                          onChange={e => setCoeficientes(c => ({
                            ...c,
                            [`x${idx}`]: e.target.value
                          }))}
                          style={{ width: 80 }}
                        />
                      </Grid>
                      <Grid item>
                        <Typography>{v.nombre}</Typography>
                      </Grid>
                      {idx < variables.length - 1 && (
                        <Grid item>
                          <Typography>+</Typography>
                        </Grid>
                      )}
                    </React.Fragment>
                  ))}
                  <Grid item>
                    <Typography>
                      {objetivo === "max" ? "=> MAX" : "=> MIN"}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>

            {/* Restricciones */}
            <Box mt={2}>
              <Typography variant="subtitle1">Restricciones</Typography>
              <Paper style={{ padding: '1rem', marginBottom: '1rem' }}>
                {restricciones.map((r, idx) => (
                  <Box key={idx} mb={2}>
                    <Typography variant="body2" style={{ fontWeight: "bold" }}>
                      R{idx}: {r.descripcion || "(sin descripción)"}
                    </Typography>
                    <Grid container spacing={1} alignItems="center">
                      {variables.map((v, vIdx) => (
                        <React.Fragment key={vIdx}>
                          <Grid item>
                            <TextField
                              label={`Coef X${vIdx}`}
                              type="number"
                              value={r[`x${vIdx}`] || ""}
                              onChange={e => {
                                const newRes = [...restricciones];
                                newRes[idx][`x${vIdx}`] = e.target.value;
                                setRestricciones(newRes);
                              }}
                              style={{ width: 80 }}
                            />
                          </Grid>
                          <Grid item>
                            <Typography>{v.nombre}</Typography>
                          </Grid>
                          {vIdx < variables.length - 1 && (
                            <Grid item>
                              <Typography>+</Typography>
                            </Grid>
                          )}
                        </React.Fragment>
                      ))}
                      <Grid item>
                        <FormControl>
                          <Select
                            value={r.operador || "<="}
                            onChange={e => {
                              const newRes = [...restricciones];
                              newRes[idx].operador = e.target.value;
                              setRestricciones(newRes);
                            }}
                          >
                            <MenuItem value="<=">≤</MenuItem>
                            <MenuItem value=">=">≥</MenuItem>
                            <MenuItem value="=">=</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item>
                        <TextField
                          label="Valor"
                          type="number"
                          value={r.valor || ""}
                          onChange={e => {
                            const newRes = [...restricciones];
                            newRes[idx].valor = e.target.value;
                            setRestricciones(newRes);
                          }}
                          style={{ width: 80 }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Paper>
            </Box>

            <Box mt={4} display="flex" justifyContent="space-between">
              <Button variant="outlined" onClick={volver}>Volver</Button>
              <Button variant="contained" color="primary" onClick={resolverProblema}>Siguiente</Button>
            </Box>
          </Box>
        )}

        {/* Paso 3: Resultados */}
        {paso === 2 && resultado && (
          <Box mt={4}>
            <Typography
              variant="h5"
              gutterBottom
              align="center"
              style={{ background: "#e3f2fd", padding: "1rem", borderRadius: "8px" }}
            >
              El resultado óptimo de la función objetivo es: {resultado.valor_objetivo}
            </Typography>

            <Box mt={2} style={{ border: "2px solid #90caf9", borderRadius: "8px", padding: "1rem" }}>
              <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
                Gráfico:
              </Typography>
              <Box display="flex" justifyContent="center">
                <img
                  src={`data:image/png;base64,${resultado.grafico}`}
                  alt="Gráfico de la solución"
                  style={{ width: '400px', marginTop: '1rem', border: '1px solid #ccc' }}
                />
              </Box>
              {/* Puedes agregar aquí un botón para ver sombra de restricciones si lo deseas */}
            </Box>

            <Box mt={2} style={{ border: "2px solid #90caf9", borderRadius: "8px", padding: "1rem" }}>
              <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
                Referencias
              </Typography>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ccc', padding: '4px' }}>Punto</th>
                    <th style={{ border: '1px solid #ccc', padding: '4px' }}>Resultado</th>
                    {/* Genera dinámicamente las columnas de variables */}
                    {resultado.tabla_resultados && Object.keys(resultado.tabla_resultados[0])
                      .filter(key => key.startsWith('x') || key.startsWith('X'))
                      .map((key, idx) => (
                        <th key={idx} style={{ border: '1px solid #ccc', padding: '4px' }}>{key.toUpperCase()}</th>
                      ))}
                    {/* Si tienes variables de holgura, agrégalas aquí */}
                    {resultado.tabla_resultados && Object.keys(resultado.tabla_resultados[0])
                      .filter(key => key.startsWith('s') || key.startsWith('S'))
                      .map((key, idx) => (
                        <th key={idx} style={{ border: '1px solid #ccc', padding: '4px' }}>{key.toUpperCase()}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {resultado.tabla_resultados?.map((p, idx) => (
                    <tr key={idx} style={p.punto.includes('OPTIMO') ? { background: '#e0ffe0' } : {}}>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{p.punto}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{p.valor_objetivo}</td>
                      {/* Muestra dinámicamente los valores de las variables */}
                      {Object.keys(p)
                        .filter(key => key.startsWith('x') || key.startsWith('X'))
                        .map((key, idx2) => (
                          <td key={idx2} style={{ border: '1px solid #ccc', padding: '4px' }}>{p[key]}</td>
                        ))}
                      {/* Muestra dinámicamente los valores de las variables de holgura */}
                      {Object.keys(p)
                        .filter(key => key.startsWith('s') || key.startsWith('S'))
                        .map((key, idx2) => (
                          <td key={idx2} style={{ border: '1px solid #ccc', padding: '4px' }}>{p[key]}</td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button variant="outlined" onClick={volver}>Volver</Button>
                <Button variant="contained" color="primary" style={{ marginLeft: 8 }}>
                  Imprimir Resultados
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default App; 