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
} from '@material-ui/core';
import axios from 'axios';

function App() {
  const [objetivo, setObjetivo] = useState('max');
  const [coeficientes, setCoeficientes] = useState({ x: '', y: '' });
  const [restricciones, setRestricciones] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [nuevaRestriccion, setNuevaRestriccion] = useState({
    x: '',
    y: '',
    operador: '<=',
    valor: ''
  });

  const agregarRestriccion = () => {
    setRestricciones([...restricciones, nuevaRestriccion]);
    setNuevaRestriccion({ x: '', y: '', operador: '<=', valor: '' });
  };

  const resolverProblema = async () => {
    try {
      const datos = {
        objetivo,
        coeficientes: [parseFloat(coeficientes.x), parseFloat(coeficientes.y)],
        restricciones: restricciones.map(r => [
          parseFloat(r.x),
          parseFloat(r.y),
          r.operador,
          parseFloat(r.valor)
        ])
      };

      const respuesta = await axios.post('http://localhost:5000/resolver', datos);
      setResultado(respuesta.data);
    } catch (error) {
      console.error('Error al resolver el problema:', error);
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Paper style={{ padding: '2rem' }}>
        <Typography variant="h4" gutterBottom>
          Solucionador de Programación Lineal
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Objetivo</InputLabel>
              <Select
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
              >
                <MenuItem value="max">Maximizar</MenuItem>
                <MenuItem value="min">Minimizar</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Coeficiente X"
              type="number"
              value={coeficientes.x}
              onChange={(e) => setCoeficientes({ ...coeficientes, x: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Coeficiente Y"
              type="number"
              value={coeficientes.y}
              onChange={(e) => setCoeficientes({ ...coeficientes, y: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Restricciones
            </Typography>
          </Grid>

          {restricciones.map((r, index) => (
            <Grid item xs={12} key={index}>
              <Typography>
                {r.x}x + {r.y}y {r.operador} {r.valor}
              </Typography>
            </Grid>
          ))}

          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Coef X"
              type="number"
              value={nuevaRestriccion.x}
              onChange={(e) => setNuevaRestriccion({ ...nuevaRestriccion, x: e.target.value })}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Coef Y"
              type="number"
              value={nuevaRestriccion.y}
              onChange={(e) => setNuevaRestriccion({ ...nuevaRestriccion, y: e.target.value })}
            />
          </Grid>
          <Grid item xs={2}>
            <FormControl fullWidth>
              <Select
                value={nuevaRestriccion.operador}
                onChange={(e) => setNuevaRestriccion({ ...nuevaRestriccion, operador: e.target.value })}
              >
                <MenuItem value="<=">≤</MenuItem>
                <MenuItem value=">=">≥</MenuItem>
                <MenuItem value="=">=</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Valor"
              type="number"
              value={nuevaRestriccion.valor}
              onChange={(e) => setNuevaRestriccion({ ...nuevaRestriccion, valor: e.target.value })}
            />
          </Grid>
          <Grid item xs={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={agregarRestriccion}
              fullWidth
            >
              +
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={resolverProblema}
              fullWidth
              style={{ marginTop: '1rem' }}
            >
              Resolver
            </Button>
          </Grid>

          {resultado && (
            <Grid item xs={12}>
              <Box mt={3}>
                <Typography variant="h6">Resultados:</Typography>
                <Typography>Estado: {resultado.estado}</Typography>
                <Typography>X = {resultado.x}</Typography>
                <Typography>Y = {resultado.y}</Typography>
                <Typography>Valor Objetivo = {resultado.valor_objetivo}</Typography>
                <img
                  src={`data:image/png;base64,${resultado.grafico}`}
                  alt="Gráfico de la solución"
                  style={{ width: '100%', marginTop: '1rem' }}
                />

                {/* Referencias */}
                <Box mt={2}>
                  <Typography variant="subtitle1">Referencias:</Typography>
                  <Typography>Variables: {resultado.referencias?.variables?.join(', ')}</Typography>
                  <Typography>Restricciones: {resultado.referencias?.restricciones?.join(', ')}</Typography>
                </Box>

                {/* Tabla de resultados */}
                <Box mt={2}>
                  <Typography variant="subtitle1">Tabla de Puntos:</Typography>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Punto</th>
                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>X</th>
                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Y</th>
                        <th style={{ border: '1px solid #ccc', padding: '4px' }}>Valor Objetivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.tabla_resultados?.map((p, idx) => (
                        <tr key={idx} style={p.punto.includes('OPTIMO') ? { background: '#e0ffe0' } : {}}>
                          <td style={{ border: '1px solid #ccc', padding: '4px' }}>{p.punto}</td>
                          <td style={{ border: '1px solid #ccc', padding: '4px' }}>{p.x}</td>
                          <td style={{ border: '1px solid #ccc', padding: '4px' }}>{p.y}</td>
                          <td style={{ border: '1px solid #ccc', padding: '4px' }}>{p.valor_objetivo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
}

export default App; 