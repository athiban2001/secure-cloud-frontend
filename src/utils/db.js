import apiFetch from "./apiFetch";

export class UserStorage {
	static users = {};

	static getInstance(id) {
		if (this.users[id]) {
			return this.users[id];
		} else {
			this.users[id] = new UserStorage(id);
			return this.users[id];
		}
	}

	constructor(id) {
		this.id = id;
	}

	addGroupPrivateData(group_id, p, q, g, xi, yi) {
		p = p.toString();
		q = q.toString();
		g = g.toString();
		xi = xi.toString();
		yi = yi.toString();

		localStorage.setItem(
			`user-${this.id}-group-${group_id}`,
			JSON.stringify({ p, q, g, xi, yi, group_id })
		);
		return {
			p: BigInt(p),
			q: BigInt(q),
			g: BigInt(g),
			xi: BigInt(xi),
			yi: BigInt(yi),
			group_id,
		};
	}

	getGroupPrivateData(group_id) {
		if (!localStorage.getItem(`user-${this.id}-group-${group_id}`)) {
			return null;
		}

		const { p, q, g, xi, yi } = JSON.parse(
			localStorage.getItem(`user-${this.id}-group-${group_id}`)
		);

		return {
			p: BigInt(p),
			q: BigInt(q),
			g: BigInt(g),
			xi: BigInt(xi),
			yi: BigInt(yi),
			group_id,
		};
	}

	addGroupKey(group_id, gk, time) {
		let currentGKs = [];
		if (localStorage.getItem(`user-${this.id}-group-${group_id}-keys`)) {
			currentGKs = JSON.parse(
				localStorage.getItem(`user-${this.id}-group-${group_id}-keys`)
			);
		}
		currentGKs.push({ gk: gk.toString(), time: time.toJSON() });
		currentGKs.sort((a, b) => new Date(a.time) - new Date(b.time));
		localStorage.setItem(
			`user-${this.id}-group-${group_id}-keys`,
			currentGKs
		);
		return currentGKs;
	}

	getGroupKeys(group_id) {
		let currentGKs = [];
		if (localStorage.getItem(`user-${this.id}-group-${group_id}-keys`)) {
			currentGKs = JSON.parse(
				localStorage.getItem(`user-${this.id}-group-${group_id}-keys`)
			);
		}
		currentGKs.sort((a, b) => new Date(a.time) - new Date(b.time));
		currentGKs = currentGKs.map((GK) => {
			return {
				gk: BigInt(GK.gk),
				time: new Date(GK.time),
			};
		});

		return currentGKs;
	}
}

export class ManagerStorage {
	static managers = {};

	static getInstance(id) {
		if (this.managers[id]) {
			return this.managers[id];
		} else {
			this.managers[id] = new ManagerStorage(id);
			return this.managers[id];
		}
	}

	constructor(id) {
		this.id = id;
	}

	async addGroup() {
		const { data, error } = await apiFetch(
			"/api/manager/group",
			{},
			localStorage.getItem("token") || ""
		);
		if (error) {
			throw new Error(error);
		}

		localStorage.setItem(`manager-${this.id}-group`, JSON.stringify(data));
		return {
			...data,
			p: BigInt(data.p),
			q: BigInt(data.q),
			g: BigInt(data.g),
		};
	}

	async getGroup() {
		if (!localStorage.getItem(`manager-${this.id}-group`)) {
			const data = this.addGroup();
			return data;
		}

		const data = JSON.parse(
			localStorage.getItem(`manager-${this.id}-group`)
		);
		return {
			...data,
			p: BigInt(data.p),
			q: BigInt(data.q),
			g: BigInt(data.g),
		};
	}

	addK(k, time) {
		let currentKs = [];
		if (localStorage.getItem(`manager-${this.id}-k`)) {
			currentKs = JSON.parse(
				localStorage.getItem(`manager-${this.id}-k`)
			);
		}
		currentKs.push({ k: k.toString(), time: time.toJSON() });
		currentKs.sort((a, b) => new Date(a.time) - new Date(b.time));
		localStorage.setItem(`manager-${this.id}-k`, JSON.stringify(currentKs));
		return currentKs;
	}

	getKs() {
		let currentKs = [];
		if (localStorage.getItem(`manager-${this.id}-k`)) {
			currentKs = JSON.parse(
				localStorage.getItem(`manager-${this.id}-k`)
			);
		}
		currentKs.sort((a, b) => new Date(a.time) - new Date(b.time));

		return currentKs;
	}
}
