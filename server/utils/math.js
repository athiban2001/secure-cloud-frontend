const fs = require("fs");

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

const bigToUint8Array = (big) => {
	const big0 = BigInt(0);
	const big1 = BigInt(1);
	const big8 = BigInt(8);

	if (big < big0) {
		const bits = (BigInt(big.toString(2).length) / big8 + big1) * big8;
		const prefix1 = big1 << bits;
		big += prefix1;
	}
	let hex = big.toString(16);
	if (hex.length % 2) {
		hex = "0" + hex;
	}
	const len = hex.length / 2;
	const u8 = new Uint8Array(len);
	var i = 0;
	var j = 0;
	while (i < len) {
		u8[i] = parseInt(hex.slice(j, j + 2), 16);
		i += 1;
		j += 2;
	}
	if (u8.length < 32) {
		const zeroPadding = new Uint8Array(32 - u8.length);
		let tmp = new Uint8Array(zeroPadding.byteLength + u8.byteLength);
		tmp.set(new Uint8Array(zeroPadding), 0);
		tmp.set(new Uint8Array(u8), zeroPadding.byteLength);
		return tmp;
	}
	return u8;
};

function getByteArray(filePath) {
	let fileData = fs.readFileSync(filePath).toString("hex");
	let result = [];
	for (var i = 0; i < fileData.length; i += 2)
		result.push("0x" + fileData[i] + "" + fileData[i + 1]);
	return result;
}

module.exports = {
	find_gk,
	modPow,
	bigToUint8Array,
	getByteArray,
};
