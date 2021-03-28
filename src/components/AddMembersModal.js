import React from "react";
import Modal from "react-modal";
import { IsAuthenticatedContext } from "../utils/useLocalState";
import { ManagerStorage } from "../utils/db";
import apiFetch from "../utils/apiFetch";
import { find_k, find_Xik } from "../utils/diffieHellman";

Modal.setAppElement("#modal1");

const AddMembersModal = (props) => {
	const {
		userList,
		handleModalClose,
		setError,
		showModal,
		requests,
		handleCheckBoxClick,
		setRequests,
	} = props;
	const [token] = React.useContext(IsAuthenticatedContext);

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		if (userList.length === 0) {
			return;
		}
		const time = new Date();
		const manager = JSON.parse(atob(token.split(".")[1]));
		const managerStorage = ManagerStorage.getInstance(manager.id);
		const { q, p } = await managerStorage.getGroup();
		const k = find_k(q);
		managerStorage.addK(k, time);
		const body = userList.map((user) => {
			return {
				...user,
				Xik: find_Xik(user.xi, k, p).toString(),
				time: time.toJSON(),
			};
		});
		const { error } = await apiFetch(
			"/api/manager/requests",
			{ method: "POST", body: JSON.stringify(body) },
			token
		);
		handleModalClose();
		if (error) {
			setError(error);
		}
		setRequests([]);
	};

	return (
		<Modal isOpen={showModal} onRequestClose={handleModalClose}>
			<div>
				<h1>Select the members to be added</h1>
				<form onSubmit={handleFormSubmit}>
					{requests.map((req) => (
						<React.Fragment key={req.id}>
							{req.joining === true && (
								<>
									<input
										type="checkbox"
										id={req.id}
										onChange={(e) =>
											handleCheckBoxClick(e, req)
										}
									/>
									<label htmlFor={req.id}>
										{req.user_name} -{" "}
										<a href={`mailto:${req.email}`}>
											{req.email}
										</a>
									</label>
									<br />
								</>
							)}
						</React.Fragment>
					))}
					<button type="submit">Add These Members</button>
				</form>
			</div>
		</Modal>
	);
};

export default AddMembersModal;
