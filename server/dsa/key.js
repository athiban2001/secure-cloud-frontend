const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
	getPrimeNumber,
	randBetween,
	isPrime,
	bitLength,
	modPow,
	gcd,
} = require("./lib");

const keyDirectory = path.join(__dirname, "../keys");

// const generateKeyFiles = async (userId) => {
// 	let toLoop = true;
// 	while (toLoop) {
// 		let q = await getPrimeNumber(160);
// 		let k = randBetween(2n ** 416n, 2n ** 415n);
// 		let p = k * q + 1n;
// 		if (!isPrime(p)) {
// 			k = randBetween(2n ** 416n, 2n ** 415n);
// 			q = await getPrimeNumber(160);
// 			p = k * q + 1n;
// 		}
// 		let L = bitLength(p);
// 		let t = randBetween(p - 1n);
// 		let g = modPow(t, (p - 1n) / q, p);
// 		if (
// 			L >= 512 &&
// 			L <= 1024 &&
// 			L % 64 === 0 &&
// 			gcd(p - 1n, q).g > 1n &&
// 			modPow(g, q, p) === 1n
// 		) {
// 			toLoop = false;
// 			let a = randBetween(q - 1n, 2n);
// 			let h = modPow(g, a, p);
// 			const publicKey =
// 				p.toString() +
// 				"." +
// 				q.toString() +
// 				"." +
// 				g.toString() +
// 				"." +
// 				h.toString();
// 			fs.writeFileSync(
// 				path.join(keyDirectory, `publicKey${userId}.txt`),
// 				publicKey
// 			);
// 			const privateKey = a.toString();
// 			fs.writeFileSync(
// 				path.join(keyDirectory, `privateKey${userId}.txt`),
// 				privateKey
// 			);
// 		}
// 	}
// };
const { publicKey, privateKey } = crypto.generateKeyPairSync("dsa", {
	modulusLength: 512,
	divisorLength: 160,
	publicKeyEncoding: {
		type: "spki",
		format: "pem",
	},
	privateKeyEncoding: {
		type: "pkcs8",
		format: "pem",
	},
});

const sign = crypto.createSign("SHA256");
sign.update(
	fs.readFileSync(path.join(__dirname, "../data/build.xml.gz"), {
		encoding: "utf-8",
	})
);
sign.end();
const signature = sign.sign(privateKey);
console.log(signature);
const verify = crypto.createVerify("SHA256");
verify.update(
	fs.readFileSync(path.join(__dirname, "../data/build.xml.gz"), {
		encoding: "utf-8",
	})
);
verify.end();
console.log(verify.verify(publicKey, signature));
