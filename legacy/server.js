import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

import { GATES } from './js/gates.js';
import { Perceptron } from './js/perceptron.js';
import { Trainer, TrainerState } from './js/trainer.js';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const maxBodyBytes = 1024 * 1024;
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8'
};

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*'
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, status, body, contentType = 'text/plain; charset=utf-8') {
  response.writeHead(status, { 'content-type': contentType });
  response.end(body);
}

async function readJson(request) {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    totalBytes += chunk.length;
    if (totalBytes > maxBodyBytes) {
      throw httpError(413, 'Request body exceeds the 1 MiB limit.');
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw httpError(400, 'Request body must contain valid JSON.');
  }
}

function getGate(gateId = 'AND') {
  if (typeof gateId !== 'string' || !GATES[gateId]) {
    throw httpError(400, `Unknown gate '${gateId}'. Use AND, OR, NAND, or XOR.`);
  }
  return GATES[gateId];
}

function readFiniteNumber(value, field, { min = -Infinity, max = Infinity } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw httpError(400, `${field} must be a finite number between ${min} and ${max}.`);
  }
  return value;
}

function readBinary(value, field) {
  if (value !== 0 && value !== 1) {
    throw httpError(400, `${field} must be either 0 or 1.`);
  }
  return value;
}

function readLearningRate(value = 0.1) {
  return readFiniteNumber(value, 'learningRate', { min: 0.000001, max: 10 });
}

function readMaxEpochs(value = 30) {
  if (!Number.isInteger(value) || value < 1 || value > 1000) {
    throw httpError(400, 'maxEpochs must be an integer between 1 and 1000.');
  }
  return value;
}

function readWeights(value) {
  if (value === undefined) return null;
  if (!value || typeof value !== 'object') {
    throw httpError(400, 'weights must be an object with w1, w2, and b fields.');
  }
  return {
    w1: readFiniteNumber(value.w1, 'weights.w1'),
    w2: readFiniteNumber(value.w2, 'weights.w2'),
    b: readFiniteNumber(value.b, 'weights.b')
  };
}

function createPerceptron(gate, body) {
  const learningRate = readLearningRate(body.learningRate);
  const perceptron = new Perceptron({
    ...gate.defaultWeights,
    learningRate
  });
  const weights = readWeights(body.weights);
  if (weights) perceptron.setParameters(weights);
  return perceptron;
}

function serializeGate(gate) {
  return {
    id: gate.id,
    name: gate.name,
    symbol: gate.symbol,
    booleanExpr: gate.booleanExpr,
    description: gate.description,
    isLinearlySeparable: gate.isLinearlySeparable,
    table: gate.table
  };
}

function serializeTrainer(trainer) {
  return {
    gate: serializeGate(trainer.gate),
    state: trainer.state,
    currentEpoch: trainer.currentEpoch,
    totalStepsProcessed: trainer.totalStepsProcessed,
    parameters: {
      w1: trainer.perceptron.w1,
      w2: trainer.perceptron.w2,
      b: trainer.perceptron.b,
      learningRate: trainer.perceptron.learningRate
    },
    evaluation: trainer.perceptron.evaluate(trainer.gate.table),
    history: trainer.history
  };
}

function predict(body) {
  const gate = getGate(body.gateId);
  const x1 = readBinary(body.x1, 'x1');
  const x2 = readBinary(body.x2, 'x2');
  const perceptron = createPerceptron(gate, body);
  const result = perceptron.predict(x1, x2);
  const target = gate.table.find(item => item.x1 === x1 && item.x2 === x2).y;

  return {
    gate: serializeGate(gate),
    inputs: { x1, x2 },
    target,
    ...result,
    isCorrect: result.yHat === target,
    parameters: { w1: perceptron.w1, w2: perceptron.w2, b: perceptron.b }
  };
}

function train(body) {
  const gate = getGate(body.gateId);
  const learningRate = readLearningRate(body.learningRate);
  const maxEpochs = readMaxEpochs(body.maxEpochs);
  const trainer = new Trainer({ gateId: gate.id, learningRate, maxEpochs });
  const weights = readWeights(body.weights);
  if (weights) trainer.reset(weights);
  trainer.fastForward();

  return {
    ...serializeTrainer(trainer),
    converged: trainer.state === TrainerState.CONVERGED,
    maxEpochsReached: trainer.state === TrainerState.MAX_EPOCHS
  };
}

function trainStep(body) {
  const gate = getGate(body.gateId);
  const x1 = readBinary(body.x1, 'x1');
  const x2 = readBinary(body.x2, 'x2');
  const perceptron = createPerceptron(gate, body);
  const target = gate.table.find(item => item.x1 === x1 && item.x2 === x2).y;
  const snapshot = perceptron.trainSample(x1, x2, target);

  return {
    gate: serializeGate(gate),
    snapshot,
    evaluation: perceptron.evaluate(gate.table)
  };
}

function safeStaticPath(pathname) {
  let relativePath;
  try {
    relativePath = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
  } catch {
    return null;
  }

  const candidate = path.resolve(projectRoot, `.${relativePath}`);
  const rootPrefix = `${projectRoot}${path.sep}`;
  if (candidate !== projectRoot && !candidate.startsWith(rootPrefix)) return null;
  return candidate;
}

async function serveStatic(pathname, response) {
  const filePath = safeStaticPath(pathname);
  if (!filePath) {
    sendText(response, 400, 'Invalid path.');
    return;
  }

  try {
    const body = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      'content-type': contentTypes[extension] ?? 'application/octet-stream',
      'cache-control': 'no-cache'
    });
    response.end(body);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'EISDIR') {
      sendText(response, 404, 'Not found.');
      return;
    }
    throw error;
  }
}

async function handleRequest(request, response) {
  const requestUrl = new URL(request.url, 'http://localhost');
  const { pathname } = requestUrl;

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type'
    });
    response.end();
    return;
  }

  if (pathname === '/api/health' && request.method === 'GET') {
    sendJson(response, 200, { ok: true, service: 'perceptron-lab-api' });
    return;
  }

  if (pathname === '/api/gates' && request.method === 'GET') {
    sendJson(response, 200, { gates: Object.values(GATES).map(serializeGate) });
    return;
  }

  if (pathname === '/api/predict' && request.method === 'POST') {
    sendJson(response, 200, predict(await readJson(request)));
    return;
  }

  if (pathname === '/api/train' && request.method === 'POST') {
    sendJson(response, 200, train(await readJson(request)));
    return;
  }

  if (pathname === '/api/train/step' && request.method === 'POST') {
    sendJson(response, 200, trainStep(await readJson(request)));
    return;
  }

  if (pathname.startsWith('/api/')) {
    sendJson(response, 404, { error: 'API route not found.' });
    return;
  }

  if (request.method === 'GET') {
    await serveStatic(pathname, response);
    return;
  }

  sendJson(response, 405, { error: 'Method not allowed.' });
}

const portArgumentIndex = process.argv.indexOf('--port');
const configuredPort = portArgumentIndex >= 0 ? process.argv[portArgumentIndex + 1] : process.env.PERCEPTRON_PORT;
const port = Number(configuredPort ?? 8000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('Port must be an integer between 1 and 65535.');
}

const server = http.createServer((request, response) => {
  handleRequest(request, response).catch(error => {
    const status = Number.isInteger(error.status) ? error.status : 500;
    if (!response.headersSent) {
      sendJson(response, status, { error: status === 500 ? 'Internal server error.' : error.message });
    } else {
      response.destroy();
    }
  });
});

server.listen(port, () => {
  console.log(`Perceptron Lab server listening at http://localhost:${port}`);
});