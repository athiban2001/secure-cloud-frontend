const crypto = require("crypto");
const path = require("path");
const { randBetween, isProbablyPrime, modPow } = require("../utils/math");
const { sign, verify } = require("./signAndVerify");

const generatePandQ = (L, N) => {
	let g = BigInt(N);
	let n = (BigInt(L) - 1n) / g;
	let b = (BigInt(L) - 1n) % g;
	let s, q;
	while (true) {
		s = randBetween(2n ** g);
		let a = crypto.createHash("SHA256").update(s.toString(2)).digest("hex");
		let zz = (s + 1n) % 2n ** g;
		let z = crypto
			.createHash("SHA256")
			.update(zz.toString(2))
			.digest("hex");
		let U = BigInt("0x" + a) ^ BigInt("0x" + z);
		let mask = 2n ** (BigInt(N) - 1n) + 1n;
		q = U | mask;
		if (isProbablyPrime(q, 20)) {
			break;
		}
	}
	let i = 0n;
	let j = 2n;
	while (i < 4096) {
		const V = [];
		for (let k = 0n; k < n + 1n; k++) {
			let arg = (s + j + k) % 2n ** g;
			let zzv = crypto
				.createHash("SHA256")
				.update(arg.toString(2))
				.digest("hex");
			V.push(BigInt("0x" + zzv));
		}
		let W = 0n;
		for (let qq = 0n; qq < n; qq++) {
			W += V[qq] * 2n ** (160n * qq);
		}
		W += (V[n] % 2n ** b) * 2n ** (160n * n);
		let X = W + 2n ** (BigInt(L) - 1n);
		let c = X % (2n * q);
		let p = X - c + 1n;
		if (p >= 2n ** (BigInt(L) - 1n)) {
			if (isProbablyPrime(p, 10)) {
				return { p, q };
			}
		}
		i += 1n;
		j += n + 1n;
	}
};

const generateG = (p, q) => {
	let g;
	p = BigInt(p);
	q = BigInt(q);
	while (true) {
		let h = randBetween(p - 1n);
		let exp = (p - 1n) / q;
		g = modPow(h, exp, p);
		if (g > 1n) {
			break;
		}
	}

	return g;
};

const generateKeys = (g, p, q) => {
	q = BigInt(q);
	p = BigInt(p);
	g = BigInt(g);
	let x = randBetween(q, 2n);
	let y = modPow(g, x, p);
	return { x, y };
};

const generateParams = (L, N) => {
	const { p, q } = generatePandQ(L, N);
	const g = generateG(p, q);
	return { g, p, q };
};

(() => {
	let N = 160;
	let L = 1024;
	const { p, q, g } = generateParams(L, N);
	const { x, y } = generateKeys(g, p, q);

	let privateKey =
		p.toString(16) +
		"." +
		q.toString(16) +
		"." +
		g.toString(16) +
		"." +
		x.toString(16);
	let publicKey =
		p.toString(16) +
		"." +
		q.toString(16) +
		"." +
		g.toString(16) +
		"." +
		y.toString(16);

	const file = path.join(__dirname, "../data/Fonts.tar.gz.enc");
	const signature = sign(file, privateKey);
	console.log(verify(file, signature, publicKey));

	return { privateKey, publicKey };
})();
