import React from "react";
import { useHistory } from "react-router-dom";

const AdminLogin = () => {
	const [username, setUsername] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [error, setError] = React.useState("");
	const router = useHistory();

	const onSubmit = async (e) => {
		e.preventDefault();
		if (!username || !password) {
			return;
		}
		const response = await fetch(
			process.env.REACT_APP_API_URL + "/api/admin/login",
			{
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			}
		).then((res) => res.json());

		if (response.error) {
			setError(response.error);
		} else {
			localStorage.setItem("token", response.token);
			router.push("/admin/groups");
		}
	};

	return (
		<div>
			<h1>Admin Login</h1>
			{error && (
				<div>
					<h5>An Error Occured</h5>
					<p>{error}</p>
				</div>
			)}
			<form onSubmit={onSubmit}>
				<div>
					<label>Username</label>
					<br />
					<input
						type="text"
						placeholder="Username"
						onChange={(e) => setUsername(e.target.value)}
					/>
				</div>
				<div>
					<label>Password</label>
					<br />
					<input
						type="password"
						placeholder="Password"
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				<button type="submit">Sign In</button>
			</form>
		</div>
	);
};

export default AdminLogin;
