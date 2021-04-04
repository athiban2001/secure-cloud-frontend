import React, { useContext, useState } from "react";
import { useHistory, useParams } from "react-router";
import UserGroupNav from "../components/UserGroupNav";
import { IsAuthenticatedContext } from "../utils/useLocalState";

const UserFileUpload = () => {
	const [file, setFile] = useState(null);
	const [files, setFiles] = useState([]);
	const { id } = useParams();
	const router = useHistory();
	const [token] = useContext(IsAuthenticatedContext);

	if (!id) {
		router.push("/users/groups");
		return null;
	}

	const onChange = (e) => {
		console.log(e.target.files.length);
		if (e.target.files.length === 1) {
			setFile(e.target.files[0]);
		}
		if (e.target.files.length > 1) {
			const filesConsidered = Array.from(e.target.files).filter(
				(file) => {
					console.log(!file.webkitRelativePath.includes("/."));
					return !file.webkitRelativePath.includes("/.");
				}
			);
			setFiles(filesConsidered);
		}
	};

	console.log(file);

	const onSubmit = (e) => {
		e.preventDefault();
		if (!files.length && !file) {
			return;
		}
		if (files.length > 1) {
			const formData = new FormData();
			for (let i = 0; i < files.length; i++) {
				let file = files[i];
				let fileParamName = `file${i + 1}`;
				let filePathParamName = `filepath${i + 1}`;
				formData.append(filePathParamName, file.webkitRelativePath);
				formData.append(fileParamName, file);
			}
			fetch(process.env.REACT_APP_SERVER_URL + `/${id}/upload`, {
				method: "POST",
				headers: {
					authorization: `Bearer ${token}`,
				},
				body: formData,
			})
				.then((res) => res.json())
				.then(console.log);
		} else {
			const formData = new FormData();
			formData.append("filepath1", file.name);
			formData.append("file1", file);
			fetch(process.env.REACT_APP_SERVER_URL + `/${id}/upload`, {
				method: "POST",
				headers: {
					authorization: `Bearer ${token}`,
				},
				body: formData,
			})
				.then((res) => res.json())
				.then(console.log);
		}
	};

	return (
		<>
			<UserGroupNav />
			<form
				onSubmit={onSubmit}
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "80vh",
				}}
			>
				<input type="file" onChange={onChange} />
				<input
					type="file"
					onChange={onChange}
					webkitdirectory=""
					directory=""
				/>
				<button type="submit">Upload Files</button>
			</form>
		</>
	);
};

export default UserFileUpload;
