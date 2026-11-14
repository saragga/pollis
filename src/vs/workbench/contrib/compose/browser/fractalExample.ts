/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The example of the Time Arrow pages of Compose > Compilation Lab (Translate Julia to Rust, Compile Julia to
// WebAssembly): the count of every pixel of the Mandelbrot set or of the Julia set of c, in Julia.

/** The two sets of the example. */
export type FractalExample = 'mandelbrot' | 'julia';

/**
 * The region of each set: the real part across, from x0 to x1, and the imaginary part down, from y0 to y1, as written
 * in Julia, where each is a Float64.
 */
export const FRACTAL_REGIONS: Record<FractalExample, { readonly x0: string; readonly x1: string; readonly y0: string; readonly y1: string }> = {
	mandelbrot: { x0: '-2.2', x1: '0.8', y0: '-1.2', y1: '1.2' },
	julia: { x0: '-1.6', x1: '1.6', y0: '-1.0', y1: '1.0' },
};

/** The function of one pixel in Julia, with the operations every translation keeps in the same order. */
export const ESCAPE_TIME_JULIA = `# The iterations of z^2 + c before |z| passes 2, for one pixel, written with real numbers
function escape_time(zr, zi, cr, ci, maxiter::Int32)
	k = zero(maxiter)
	while k < maxiter
		zr2 = zr * zr
		zi2 = zi * zi
		zr2 + zi2 > 4.0 && return k
		zi = 2.0 * zr * zi + ci
		zr = zr2 - zi2 + cr
		k += one(maxiter)
	end
	return maxiter
end`;

/**
 * The data and the Julia functions of the example: the region, the size of the picture, the most iterations and c, as
 * written in Julia (`width` and `maxiter` integers, `cre` and `cim` decimal numbers), then escape_time and
 * fractal_counts, which returns the count of every pixel as a matrix.
 */
export function fractalExampleCode(example: FractalExample, width = '800', maxiter = '256', cre = '-0.8', cim = '0.156'): string {
	const { x0, x1, y0, y1 } = FRACTAL_REGIONS[example];
	return `# The example: ${example === 'julia' ? 'the Julia set of c' : 'the Mandelbrot set'}, on a grid of ${width} pixels across
julia_set = ${example === 'julia'}
c = complex(${cre}, ${cim})  # the c of the Julia set; the Mandelbrot set does not use it
x0, x1, y0, y1 = ${x0}, ${x1}, ${y0}, ${y1}
width = ${width}
height = round(Int, width * (y1 - y0) / (x1 - x0))
spacing = (x1 - x0) / (width - 1)  # the distance between two pixels, across and down
maxiter = Int32(${maxiter})

${ESCAPE_TIME_JULIA}

# The count of every pixel, as a matrix: the imaginary part down the rows, the real part across the columns
function fractal_counts(x0, y0, spacing, height, width, julia_set, c, maxiter)
	counts = Matrix{Int32}(undef, height, width)
	for j in 1:width, i in 1:height
		x = x0 + (j - 1) * spacing
		y = y0 + (i - 1) * spacing
		counts[i, j] = julia_set ? escape_time(x, y, real(c), imag(c), maxiter) : escape_time(0.0, 0.0, x, y, maxiter)
	end
	return counts
end`;
}
