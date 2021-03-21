import React from "react";
import { useHistory } from "react-router";

const Logout = () => {
	const router = useHistory();

	React.useEffect(() => {
		localStorage.removeItem("token");
		router.push("/");
	}, [router]);

	return null;
};

export default Logout;
