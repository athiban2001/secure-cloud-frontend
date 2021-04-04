const tar = require("tar-fs");
const path = require("path");
const fs = require("fs");
const zlib = require("zlib");

const dataDirectory = path.join(__dirname, "../data");

const compressFolder = async (folderAbsolutePath, callback) => {
	const foldername = folderAbsolutePath
		.split("/")
		.filter((_, index, arr) => index === arr.length - 1);
	const tarPath = path.join(dataDirectory, foldername + ".tar");
	const targzPath = path.join(dataDirectory, foldername + ".tar.gz");

	tar.pack(folderAbsolutePath)
		.pipe(fs.createWriteStream(tarPath, { encoding: "utf-8" }))
		.on("close", () => {
			try {
				const result = zlib.gzipSync(fs.readFileSync(tarPath), {});
				fs.writeFileSync(targzPath, result);
				callback();
				fs.unlink(tarPath, () => {});
				fs.rm(
					folderAbsolutePath,
					{
						recursive: true,
						force: true,
					},
					() => {}
				);
			} catch (err) {
				callback(err);
			}
		});
};

const compressFile = (fileAbsolutePath, callback) => {
	try {
		const result = zlib.gzipSync(fs.readFileSync(fileAbsolutePath));
		const filename = fileAbsolutePath
			.split("/")
			.filter((_, index, arr) => index === arr.length - 1);
		fs.writeFileSync(path.join(dataDirectory, filename + ".gz"), result);
		callback();
		fs.rm(fileAbsolutePath, () => {});
	} catch (err) {
		callback(err);
	}
};

module.exports = {
	compressFolder,
	compressFile,
};
