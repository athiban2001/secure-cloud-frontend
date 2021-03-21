import React from "react";
import { useHistory, Link } from "react-router-dom";
import AdminNav from "./AdminNav";

const AdminGroups = () => {
	const [groups, setGroups] = React.useState([]);
	const [error, setError] = React.useState("");
	const router = useHistory();
	const token = localStorage.getItem("token");

	React.useEffect(() => {
		if (!token) {
			return;
		}
		fetch(process.env.REACT_APP_API_URL + "/api/admin/groups", {
			headers: {
				authorization: `Bearer ${token}`,
			},
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.error) {
					setError(data.error);
					return;
				}
				setGroups(data.groups);
			});
	}, [token]);

	if (!token) {
		router.push("/admin/login");
		return null;
	}

	return (
		<div>
			<AdminNav />
			<h1>Currently Existing Groups</h1>
			{error && (
				<div>
					<h5>An Error Occured</h5>
					<p>{error}</p>
				</div>
			)}
			<div>
				<div>
					{groups.map((grp) => (
						<Link
							key={grp.id}
							href={`/admin/groups/${grp.id}`}
							to={`/admin/groups/${grp.id}`}
						>
							<div key={grp.id}>
								<h1>{grp.name}</h1>
								<p>Managed by {grp.manager_name}</p>
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
};

export default AdminGroups;
