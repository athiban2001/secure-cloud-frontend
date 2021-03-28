import React, { useContext, useEffect, useState } from "react";
import apiFetch from "../utils/apiFetch";
import { IsAuthenticatedContext } from "../utils/useLocalState";
import ManagerNav from "../components/ManagerNav";

const ManagerGroup = () => {
	const [group, setGroup] = useState(null);
	const [error, setError] = useState("");
	const [token] = useContext(IsAuthenticatedContext);

	useEffect(() => {
		apiFetch("/api/manager/group", {}, token).then(({ data, error }) => {
			if (error) {
				setError(error);
				return;
			}
			setGroup(data);
		});
	}, [token]);

	return (
		<div>
			<ManagerNav />
			<div>
				{error && (
					<div>
						<h1>An Error Occured</h1>
						<p>{error}</p>
					</div>
				)}
				{group && (
					<div>
						<h1>{group.name}</h1>
						<h4>The Group Parameters are</h4>
						<ul>
							<li>
								<strong>P : </strong>
								{group.p}
							</li>
							<li>
								<strong>Q : </strong>
								{group.q}
							</li>
							<li>
								<strong>G : </strong>
								{group.g}
							</li>
						</ul>
						<h4>The Group Members are</h4>
					</div>
				)}
			</div>
		</div>
	);
};

export default ManagerGroup;
