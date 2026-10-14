# The reference results of the cross-tests: Lai et al.'s code (code/, commit 093c4dc, patched as in patches.diff) run on
# the artificial datasets (../artificial). Not needed by the package's tests, which read the files this writes:
#
#   reference.json   for each case, A: the initial weights, the forecasts and RSE/CORR of the test times and the
#                    correlation and test std of each series; B: the
#                    initial weights, the batch order of each epoch, the gradient norm of each step, the training loss
#                    and validation RSE/CORR of each epoch, and the final weights (dropout 0)
#   training.csv     C: the test RSE and CORR of main.py itself, for each case and seed
#   replay.json      D: as B, but all EPOCHS_C epochs, then the epoch main.py keeps and its test RSE and CORR
#   rounding.json    the same as D with every initial weight moved by one float32 rounding unit (NUDGES): how far
#                    rounding alone moves the authors' code, the yardstick for D
#
# Run with python export.py (Python 3.9, PyTorch 2.8, NumPy 2.0, CPU).

import ast, copy, json, math, os, re, subprocess, sys, types

import numpy as np
import torch
import torch.nn as nn

here = os.path.dirname(os.path.abspath(__file__))
code = os.path.join(here, 'code')
sys.path.insert(0, code)
from models import LSTNet
from utils import Data_utility
import Optim

# The functions evaluate and train of main.py, without running its script
source = open(os.path.join(code, 'main.py')).read()
tree = ast.parse(source)
tree.body = [node for node in tree.body if isinstance(node, ast.FunctionDef)]
authors = {'math': math, 'torch': torch}
exec(compile(tree, 'main.py', 'exec'), authors)
evaluate, train = authors['evaluate'], authors['train']

# The settings of the cross-tests: small, and with (window - kernel) / skip = 42 / 12 = 3.5, not a whole number, as with
# the code's defaults (162 / 24 = 6.75)
SETTINGS = dict(window=48, CNN_kernel=6, skip=12, hidCNN=16, hidRNN=16, hidSkip=4, highway_window=12)
CASES = [
	('seasonal', 3, 'None'), ('seasonal', 12, 'None'),
	('trend', 3, 'sigmoid'), ('trend', 12, 'sigmoid'),
	('constant', 3, 'None'), ('constant', 12, 'None'),
]
EPOCHS_B = 3
SEEDS_C = [1, 2, 3, 4, 5]
EPOCHS_C = 100
SEED_D = 1
NUDGES = ['up', 'down', 1, 2, 3]


def datafile(name):
	return os.path.join(here, '..', 'artificial', name + '.txt')


def model(data, output, dropout):
	args = types.SimpleNamespace(cuda=False, dropout=dropout, output_fun=output, **SETTINGS)
	return LSTNet.Model(args, data)


def weights(m):
	return {name: {'shape': list(p.shape), 'values': p.detach().double().flatten().tolist()} for name, p in m.state_dict().items()}


def losses():
	# The criteria of main.py: summed, not averaged
	return nn.L1Loss(size_average=False), nn.MSELoss(size_average=False), nn.L1Loss(size_average=False)


def correlations(m, data):
	# The correlation of each series of the test times, as evaluate computes it before averaging, and the test std of
	# each series it checks against 0: in float32 a nonzero constant can have a tiny std, which keeps it in the average
	m.eval()
	with torch.no_grad():
		p = m(data.test[0]).numpy()
	y = data.test[1].numpy()
	sigma_p, sigma_g = p.std(axis=0), y.std(axis=0)
	corrs = ((p - p.mean(axis=0)) * (y - y.mean(axis=0))).mean(axis=0) / (sigma_p * sigma_g)
	return {'corrs': corrs.astype(float).tolist(), 'sigma': sigma_g.astype(float).tolist()}


def forward(name, horizon, output):
	torch.manual_seed(1)
	data = Data_utility(datafile(name), 0.6, 0.2, False, horizon, SETTINGS['window'], 2)
	m = model(data, output, 0.2)
	m.eval()
	with torch.no_grad():
		predicted = m(data.test[0])
	_, l2, l1 = losses()
	rse, rae, corr = evaluate(data, data.test[0], data.test[1], m, l2, l1, 128)
	return dict({'weights': weights(m), 'test': predicted.double().tolist(), 'rse': float(rse), 'corr': float(corr)},
		**correlations(m, data))


def nudge(m, how):
	# Every weight moved by one float32 rounding unit: all up, all down, or each up or down at random (seeded by how)
	with torch.no_grad():
		g = torch.Generator().manual_seed(how) if isinstance(how, int) else None
		for p in m.parameters():
			up = torch.nextafter(p, torch.full_like(p, math.inf))
			down = torch.nextafter(p, torch.full_like(p, -math.inf))
			p.copy_(up if how == 'up' else down if how == 'down' else torch.where(torch.rand(p.shape, generator=g) < 0.5, up, down))


def steps(name, horizon, output, seed=2, epochs=EPOCHS_B, best=False, how=None):
	torch.manual_seed(seed)
	data = Data_utility(datafile(name), 0.6, 0.2, False, horizon, SETTINGS['window'], 2)
	m = model(data, output, 0.0)
	if how is not None:
		nudge(m, how)
	initial = weights(m)
	# The batch orders train draws (get_batches' torch.randperm, the only random numbers once dropout is 0)
	state = torch.get_rng_state()
	orders = [torch.randperm(len(data.train[0])).tolist() for _ in range(epochs)]
	torch.set_rng_state(state)
	optim = Optim.Optim(m.parameters(), 'adam', 0.001, 10.0)
	norms = []
	step = optim.step
	optim.step = lambda: norms.append(step()) or norms[-1]
	criterion, l2, l1 = losses()
	result = {'initial': initial, 'orders': orders, 'norms': norms, 'epochs': []}
	# As main.py: the model of the epoch with the smallest validation RSE, then its test RSE and CORR
	smallest, kept = math.inf, None
	for epoch in range(1, epochs + 1):
		loss = train(data, data.train[0], data.train[1], m, criterion, optim, 128)
		rse, rae, corr = evaluate(data, data.valid[0], data.valid[1], m, l2, l1, 128)
		result['epochs'].append({'loss': loss, 'rse': float(rse), 'corr': float(corr)})
		if best and rse < smallest:
			smallest, kept = rse, (epoch, copy.deepcopy(m.state_dict()))
	result['final'] = weights(m)
	if best:
		m.load_state_dict(kept[1])
		rse, rae, corr = evaluate(data, data.test[0], data.test[1], m, l2, l1, 128)
		result.update(best=kept[0], test=dict({'rse': float(rse), 'corr': float(corr)}, **correlations(m, data)))
	return result


def training(name, horizon, output, seed):
	save = os.path.join(here, 'model.pt')
	arguments = [sys.executable, 'main.py', '--data', datafile(name), '--save', save, '--horizon', str(horizon),
		'--seed', str(seed), '--epochs', str(EPOCHS_C), '--output_fun', output]
	arguments += [x for key, value in SETTINGS.items() for x in ('--' + key, str(value))]
	out = subprocess.run(arguments, cwd=code, capture_output=True, text=True, check=True).stdout
	os.remove(save)
	rse, rae, corr = map(float, re.findall(r'test rse ([\d.]+) \| test rae ([\d.]+) \| test corr ([\d.]+)', out)[-1])
	return rse, corr


if __name__ == '__main__':
	reference = {'settings': SETTINGS, 'versions': {'python': sys.version.split()[0], 'torch': torch.__version__, 'numpy': np.__version__}, 'cases': []}
	for name, horizon, output in CASES:
		print(name, horizon, flush=True)
		reference['cases'].append({'dataset': name, 'horizon': horizon, 'output': output,
			'forward': forward(name, horizon, output), 'steps': steps(name, horizon, output)})
	with open(os.path.join(here, 'reference.json'), 'w') as f:
		json.dump(reference, f)
	replay = {'settings': SETTINGS, 'seed': SEED_D, 'cases': []}
	for name, horizon, output in CASES:
		print(name, horizon, 'replay', flush=True)
		replay['cases'].append({'dataset': name, 'horizon': horizon, 'output': output,
			'steps': steps(name, horizon, output, SEED_D, EPOCHS_C, best=True)})
	with open(os.path.join(here, 'replay.json'), 'w') as f:
		json.dump(replay, f)
	rounding = {'settings': SETTINGS, 'seed': SEED_D, 'nudges': NUDGES, 'cases': []}
	for name, horizon, output in CASES:
		runs = []
		for how in NUDGES:
			r = steps(name, horizon, output, SEED_D, EPOCHS_C, best=True, how=how)
			runs.append({'nudge': how, 'best': r['best'], 'test': r['test'], 'valid': [e['rse'] for e in r['epochs']]})
			print(name, horizon, 'nudge', how, r['best'], round(r['test']['rse'], 4), round(r['test']['corr'], 4), flush=True)
		rounding['cases'].append({'dataset': name, 'horizon': horizon, 'output': output, 'runs': runs})
	with open(os.path.join(here, 'rounding.json'), 'w') as f:
		json.dump(rounding, f)
	if '--no-training' not in sys.argv:
		with open(os.path.join(here, 'training.csv'), 'w') as f:
			f.write('dataset,horizon,seed,rse,corr\n')
			for name, horizon, output in CASES:
				for seed in SEEDS_C:
					rse, corr = training(name, horizon, output, seed)
					print(name, horizon, seed, rse, corr, flush=True)
					f.write(f'{name},{horizon},{seed},{rse},{corr}\n')
