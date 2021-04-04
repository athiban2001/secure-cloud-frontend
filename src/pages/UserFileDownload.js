import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import UserGroupNav from "../components/UserGroupNav";
import apiFetch from "../utils/apiFetch";
import { dateDiff } from "../utils/date";
import { IsAuthenticatedContext } from "../utils/useLocalState";

const UserFileDownload = () => {
	const [files, setFiles] = useState([]);
	const [error, setError] = useState("");
	const { id } = useParams();
	const [token] = useContext(IsAuthenticatedContext);
	const router = useHistory();

	useEffect(() => {
		apiFetch(`/api/file/${id}/files`, {}, token).then(({ data, error }) => {
			if (error) {
				setError(error);
				return;
			}
			setFiles(data.files);
		});
	}, [id, token]);

	if (!id) {
		router.push(`/user/groups`);
		return null;
	}

	return (
		<>
			<UserGroupNav />
			<h1>All Files In This Group</h1>
			{error && (
				<div>
					<h3>An Error Occured</h3>
					<p>{error}</p>
				</div>
			)}
			{files.map((file) => (
				<div key={file.id}>
					<h4>{file.original_filename}</h4>
					<p>{file.file_size} bytes</p>
					<p>
						Uploaded{" "}
						{dateDiff(new Date(), new Date(file.file_time))}
					</p>
				</div>
			))}
		</>
	);
};

export default UserFileDownload;
