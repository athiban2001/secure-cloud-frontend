const fs = require("fs");
const path = require("path");
const express = require("express");
const fetch = require("node-fetch");
const multer = require("multer");
const { compressFolder, compressFile } = require("../compression/tar");
const { find_gk } = require("./dh");
const { bigToUint8Array, getByteArray } = require("../utils/math");
const salsa20 = require("../encryption/salsa20");

const dataDirectory = path.join(__dirname, "../data");
const upload = multer({
	fileFilter: function (req, file, cb) {
		const id = parseInt(file.fieldname.replace("file", ""));
		if (!id || !req.body[`filepath${id}`]) {
			cb(null, false);
		} else {
			cb(null, true);
		}
	},
	storage: multer.memoryStorage(),
});

const FileRouter = express.Router();

const FileUploadInitCallback = (
	groupId,
	userId,
	token,
	yi,
	p,
	filename,
	filesize,
	cb
) => {
	fetch(process.env.REACT_APP_API_URL + `/api/file/${groupId}/upload/init`, {
		method: "POST",
		headers: {
			"Content-type": "application/json",
			authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			original_filename: filename,
			file_size: filesize,
		}),
	})
		.then((res) => res.json())
		.then((response) => {
			const groupKey = find_gk(response.Xik, yi, p);
			const fileAbsolutePath = path.join(__dirname, "../data", filename);
			fs.writeFileSync(
				fileAbsolutePath + ".enc",
				salsa20.encrypt(
					bigToUint8Array(groupKey),
					bigToUint8Array(groupKey).slice(0, 8),
					getByteArray(fileAbsolutePath)
				)
			);
			const content = fs.readFileSync(fileAbsolutePath + ".enc", {
				encoding: "base64",
			});
			fetch(
				process.env.REACT_APP_API_URL + `/api/file/${groupId}/upload`,
				{
					method: "POST",
					headers: {
						"Content-type": "application/json",
						authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						id: response.file_id,
						original_filename: response.original_filename,
						content,
					}),
				}
			)
				.then((res) => res.json())
				.then(() => {
					cb();
				});
		});
};

FileRouter.post("/:group_id/upload", upload.any(), async (req, res) => {
	const group_id = req.params.group_id;
	let payload, data, token;
	try {
		payload = JSON.parse(
			Buffer.from(
				req.headers.authorization.split(".")[1],
				"base64"
			).toString("binary")
		);
		data = JSON.parse(
			fs.readFileSync(path.join(dataDirectory, "data.json"), {
				encoding: "utf-8",
			})
		);
		token = req.headers.authorization.replace("Bearer ", "");
	} catch (e) {
		console.log(e);
		res.status(300).json({ error: "Authorization Requried" });
		return;
	}

	if (!payload) {
		res.status(300).json({ error: "Authentication Required" });
		return;
	}

	if (Object.keys(req.body).length !== req.files.length) {
		console.log(Object.keys(req.body), req.files.length);
		res.status(300).json({ error: "Invalid Body Data" });
		return;
	}
	if (req.files.length === 0) {
		res.status(300).json({ error: "Invalid Body Data" });
		return;
	}
	if (req.files.length > 1) {
		const mainFolder = req.body[`filepath1`].split("/")[0];
		for (let i = 0; i < req.files.length; i++) {
			const folderpath = req.body[`filepath${i + 1}`].split("/");
			const filename = folderpath.pop();
			try {
				fs.mkdirSync(path.join(dataDirectory, ...folderpath), {
					recursive: true,
				});
			} catch (e) {}

			try {
				fs.writeFileSync(
					path.join(dataDirectory, ...folderpath, filename),
					req.files[i].buffer,
					{ encoding: "utf-8" }
				);
			} catch (e) {
				res.status(500).json({ error: "Internal Server Error" });
				return;
			}
		}

		compressFolder(path.join(dataDirectory, mainFolder), () => {
			const groupPrivateData =
				data[`${payload.role}-${payload.id}-${group_id}`];
			FileUploadInitCallback(
				group_id,
				payload.id,
				token,
				groupPrivateData.yi,
				groupPrivateData.p,
				mainFolder + ".tar.gz",
				fs.statSync(path.join(dataDirectory, mainFolder + ".tar.gz"))
					.size,
				() => res.status(200).json({ ok: true })
			);
		});
		return;
	}

	try {
		fs.writeFileSync(
			path.join(dataDirectory, req.files[0].originalname),
			req.files[0].buffer,
			{ encoding: "utf-8" }
		);
		compressFile(
			path.join(dataDirectory, req.files[0].originalname),
			() => {
				const groupPrivateData =
					data[`${payload.role}-${payload.id}-${group_id}`];
				console.log(
					"THE DATA IS " +
						data[`${payload.role}-${payload.id}-${group_id}`]
				);
				FileUploadInitCallback(
					group_id,
					payload.id,
					token,
					groupPrivateData.yi,
					groupPrivateData.p,
					req.files[0].originalname + ".gz",
					fs.statSync(
						path.join(
							dataDirectory,
							req.files[0].originalname + ".gz"
						)
					).size,
					() => res.status(200).json({ ok: true })
				);
				return;
			}
		);
	} catch (e) {
		console.log(e);
		res.status(500).json({ error: "Internal Server Error" });
		return;
	}
});

module.exports = FileRouter;
