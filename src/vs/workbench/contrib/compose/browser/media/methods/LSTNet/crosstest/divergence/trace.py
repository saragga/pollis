# The authors' side of the step-by-step trace of cross-test D: their code replays one case of ../authors/replay.json
# (its initial weights and batch orders, dropout 0) and writes into FOLDER
#
#   layout.json    the names and shapes of the weights, in state_dict order
#   weights.bin    the weights after every step, float32 little-endian, one step after another
#   near.json      the convolution's pre-activations (ReLU inputs) within 1e-4 of zero at every step, as
#                  [step, sample, filter, time, value] (0-based but the step), and the gradient norm of every step
#
# trace.jl then replays the same case in Julia and compares. Run with python trace.py CASE FOLDER, CASE the 0-based
# index of the case in replay.json (2 is trend, horizon 3), in the Python environment of ../authors/export.py.

import json, os, sys

import torch

here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(here, '..', 'authors'))
import export as e

k, folder = int(sys.argv[1]), sys.argv[2]
os.makedirs(folder, exist_ok=True)
case = json.load(open(os.path.join(here, '..', 'authors', 'replay.json')))['cases'][k]
data = e.Data_utility(e.datafile(case['dataset']), 0.6, 0.2, False, case['horizon'], e.SETTINGS['window'], 2)
m = e.model(data, case['output'], 0.0)
m.load_state_dict({n: torch.tensor(w['values'], dtype=torch.float32).view(w['shape']) for n, w in case['steps']['initial'].items()})
optim = e.Optim.Optim(m.parameters(), 'adam', 0.001, 10.0)
criterion = e.losses()[0]
names = list(m.state_dict().keys())
with open(os.path.join(folder, 'layout.json'), 'w') as f:
	json.dump({'names': names, 'shapes': [list(m.state_dict()[n].shape) for n in names]}, f)

near, norms, step = [], [], 0
with open(os.path.join(folder, 'weights.bin'), 'wb') as f:
	for order in case['steps']['orders']:
		order = torch.tensor(order)
		for i in range(0, len(order), 128):
			index = order[i:i + 128]
			X, Y = data.train[0][index], data.train[1][index]
			step += 1
			with torch.no_grad():
				c = m.conv1(X.view(-1, 1, m.P, m.m))[:, :, :, 0]
				near += [(step, b, j, t, float(c[b, j, t])) for b, j, t in torch.nonzero(c.abs() < 1e-4).tolist()]
			# As main.py's train
			m.train()
			m.zero_grad()
			scale = data.scale.expand(len(index), data.m)
			criterion(m(X) * scale, Y * scale).backward()
			norms.append(optim.step())
			f.write(torch.cat([p.detach().flatten() for p in m.state_dict().values()]).numpy().astype('<f4').tobytes())
with open(os.path.join(folder, 'near.json'), 'w') as f:
	json.dump({'near': near, 'norms': norms}, f)
# The trace must be the replay itself
print(step, 'steps,', len(near), 'pre-activations near zero; the gradient norms are those of replay.json:', norms == case['steps']['norms'])
