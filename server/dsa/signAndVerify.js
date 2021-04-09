const crypto = require("crypto");
const fs = require("fs");
const {
	isProbablyPrime,
	modPow,
	randBetween,
	modInv,
} = require("../utils/math");

const validateParams = (p, q, g) => {
	if (isProbablyPrime(p) && isProbablyPrime(q)) {
		return true;
	}
	if (modPow(g, q, p) === 1n && g > 1n && (p - 1n) % q) {
		return true;
	}

	return false;
};

const validateSign = (r, s, q) => {
	r = BigInt(r);
	s = BigInt(s);
	q = BigInt(q);
	if (r < 0 && r > q) {
		return false;
	}
	if (s < 0 && s > q) {
		return false;
	}

	return true;
};

const Sign = (M, p, q, g, x) => {
	p = BigInt(p);
	q = BigInt(q);
	g = BigInt(g);
	x = BigInt(x);

	if (!validateParams(p, q, g)) {
		return null;
	}

	while (true) {
		let k = randBetween(q, 2n);
		let r = modPow(g, k, p) % q;
		let m = BigInt(
			"0x" + crypto.createHash("SHA256").update(M).digest("hex")
		);
		try {
			let s = (modInv(k, q) * (m + x * r)) % q;
			return { r, s };
		} catch (e) {
			return null;
		}
	}
};

const Verify = (M, r, s, p, q, g, y) => {
	p = BigInt(p);
	q = BigInt(q);
	g = BigInt(g);
	y = BigInt(y);
	r = BigInt(r);
	s = BigInt(s);
	let w;

	if (!validateParams(p, q, g)) {
		return false;
	}

	if (!validateSign(r, s, q)) {
		return false;
	}

	try {
		w = modInv(s, q);
	} catch (e) {
		return false;
	}

	let m = BigInt("0x" + crypto.createHash("SHA256").update(M).digest("hex"));
	let u1 = (m * w) % q;
	let u2 = (r * w) % q;
	let v = ((modPow(g, u1, p) * modPow(y, u2, p)) % p) % q;
	if (v === r) {
		return true;
	}

	return false;
};

module.exports = {
	sign: (fileAbsolutePath, privateKey) => {
		const keyParts = privateKey.split(".");
		const p = BigInt("0x" + keyParts[0]);
		const q = BigInt("0x" + keyParts[1]);
		const g = BigInt("0x" + keyParts[2]);
		const x = BigInt("0x" + keyParts[3]);
		const data = fs.readFileSync(fileAbsolutePath, { encoding: "utf-8" });
		const { r, s } = Sign(data, p, q, g, x);
		return r.toString(16) + "||" + s.toString(16);
	},
	verify: (fileAbsolutePath, signature, publicKey) => {
		const keyParts = publicKey.split(".");
		const p = BigInt("0x" + keyParts[0]);
		const q = BigInt("0x" + keyParts[1]);
		const g = BigInt("0x" + keyParts[2]);
		const y = BigInt("0x" + keyParts[3]);
		const data = fs.readFileSync(fileAbsolutePath, { encoding: "utf-8" });
		const signatureParts = signature.split("||");
		const r = BigInt("0x" + signatureParts[0]);
		const s = BigInt("0x" + signatureParts[1]);
		return Verify(data, r, s, p, q, g, y);
	},
};
