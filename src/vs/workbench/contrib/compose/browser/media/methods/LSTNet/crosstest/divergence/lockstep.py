# The authors' code against itself: two copies of their model trained in lockstep on the same batches, one with every
# initial weight moved up by one float32 rounding unit. Writes, for every step, the relative distance between the two
# copies' weights and the number of the convolution's pre-activations (ReLU inputs) of the batch whose sign differs
# between them, with the smallest absolute pre-activation.
#
# Run with python lockstep.py DATASET HORIZON OUTPUT FILE, e.g. python lockstep.py seasonal 3 None lockstep-seasonal-3.csv
# (the Python environment of ../authors/export.py). The settings and seed are those of replay.json.

import copy, os, sys

import torch

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'authors'))
import export as e

name, horizon, output, file = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4]
torch.manual_seed(e.SEED_D)
data = e.Data_utility(e.datafile(name), 0.6, 0.2, False, horizon, e.SETTINGS['window'], 2)
a = e.model(data, output, 0.0)
b = copy.deepcopy(a)
e.nudge(b, 'up')
orders = [torch.randperm(len(data.train[0])) for _ in range(e.EPOCHS_C)]
optims = [e.Optim.Optim(m.parameters(), 'adam', 0.001, 10.0) for m in (a, b)]
criterion = e.losses()[0]


def distance():
	with torch.no_grad():
		pa = torch.cat([p.flatten() for p in a.parameters()])
		pb = torch.cat([p.flatten() for p in b.parameters()])
		return float((pa - pb).norm() / pa.norm())


def flips(X):
	with torch.no_grad():
		ca, cb = (m.conv1(X.view(-1, 1, m.P, m.m)) for m in (a, b))
		return int(((ca > 0) != (cb > 0)).sum()), float(ca.abs().min())


with open(file, 'w') as f:
	f.write('step,distance,flips,smallest\n')
	step = 0
	for order in orders:
		for i in range(0, len(order), 128):
			index = order[i:i + 128]
			X, Y = data.train[0][index], data.train[1][index]
			step += 1
			n, smallest = flips(X)
			# As main.py's train, for each copy
			for m, optim in zip((a, b), optims):
				m.train()
				m.zero_grad()
				scale = data.scale.expand(len(index), data.m)
				criterion(m(X) * scale, Y * scale).backward()
				optim.step()
			f.write(f'{step},{distance()},{n},{smallest}\n')
print('wrote', file)
