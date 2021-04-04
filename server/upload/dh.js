const eGcd = (a, b) => {
	a = BigInt(a);
	b = BigInt(b);
	if ((a <= 0n) | (b <= 0n)) {
		throw new RangeError("a and b MUST be > 0");
	}

	let x = 0n;
	let y = 1n;
	let u = 1n;
	let v = 0n;

	while (a !== 0n) {
		const q = b / a;
		const r = b % a;
		const m = x - u * q;
		const n = y - v * q;
		b = a;
		a = r;
		x = u;
		y = v;
		u = m;
		v = n;
	}
	return {
		g: b,
		x: x,
		y: y,
	};
};

const abs = (a) => {
	a = BigInt(a);
	return a >= 0n ? a : -a;
};

const modInv = (a, n) => {
	const egcd = eGcd(toZn(a, n), n);
	if (egcd.g !== 1n) {
		throw new RangeError("No Inverse Modulo");
	} else {
		return toZn(egcd.x, n);
	}
};

const toZn = (a, n) => {
	n = BigInt(n);
	if (n <= 0) {
		return NaN;
	}

	a = BigInt(a) % n;
	return a < 0 ? a + n : a;
};

const modPow = (b, e, n) => {
	n = BigInt(n);
	if (n === 0n) {
		throw new RangeError("n must be > 0");
	} else if (n === 1n) {
		return BigInt(0);
	}
	b = toZn(b, n);
	e = BigInt(e);
	if (e < 0n) {
		return modInv(modPow(b, abs(e), n), n);
	}

	let r = 1n;
	while (e > 0) {
		if (e % 2n === 1n) {
			r = (r * b) % n;
		}
		e = e / 2n;
		b = b ** 2n % n;
	}

	return r;
};

const find_gk = (Xik, yi, p) => {
	Xik = BigInt(Xik);
	yi = BigInt(yi);
	p = BigInt(p);
	return modPow(Xik, yi, p);
};

module.exports = {
	find_gk,
	modPow,
};
