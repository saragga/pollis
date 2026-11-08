// POLLIS: the id of this window, which the Julia REPL and the notebook kernels get as POLLIS_WINDOW. PollisDB names
// the REPL's connection snapshots with it, so that the Databases view of each window shows only the connections of its
// own REPL, and the file through which the REPL serves its Julia Session, which the window's notebooks attach.

import { randomUUID } from 'crypto'

export const POLLIS_WINDOW = randomUUID()
