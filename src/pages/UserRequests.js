import React from "react";
import UserNav from "../components/UserNav";
import apiFetch from "../utils/apiFetch";
import { IsAuthenticatedContext } from "../utils/useLocalState";

const UserRequests = () => {
	const [requests, setRequests] = React.useState([]);
	const [error, setError] = React.useState("");
	const [token] = React.useContext(IsAuthenticatedContext);

	React.useEffect(() => {
		apiFetch("/api/user/requests", {}, token).then(({ data, error }) => {
			if (error) {
				setError(error);
				return;
			}
			setRequests(data.requests);
		});
	}, [token]);

	return (
		<div>
			<UserNav />
			<h1>Requests Made By You</h1>
			{error && (
				<div>
					<h2>An Error Occured</h2>
					<p>{error}</p>
				</div>
			)}
			<h2>Pending Requests</h2>
			{requests.every((req) => req.ok != null) &&
				"There is 0 requests pending"}
			{requests.map((req) => (
				<React.Fragment key={req.id}>
					{req.ok == null ? (
						<div>
							<h3>{req.group_name}</h3>
							<p>Managed By {req.manager_name}</p>
						</div>
					) : null}
				</React.Fragment>
			))}
			<h2>Accepted Requests</h2>
			{requests.every((req) => req.ok === false || req.ok == null) &&
				"There is no accepted requests"}
			{requests.map((req) => (
				<React.Fragment key={req.id}>
					{req.ok === true ? (
						<div>
							<h3>{req.group_name}</h3>
							<p>Managed By {req.manager_name}</p>
						</div>
					) : null}
				</React.Fragment>
			))}
			<h2>Rejected Requests</h2>
			{requests.every((req) => req.ok === true || req.ok == null) &&
				"There is no rejected requests"}
			{requests.map((req) => (
				<React.Fragment key={req.id}>
					{req.ok === false ? (
						<div>
							<h3>{req.group_name}</h3>
							<p>Managed By {req.manager_name}</p>
						</div>
					) : null}
				</React.Fragment>
			))}
		</div>
	);
};

export default UserRequests;
