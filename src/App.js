import { BrowserRouter, Route, Switch } from "react-router-dom";
import { find_xi, find_yi, modPow } from "./utils/math";
import Home from "./components/Home";
import AdminLogin from "./components/AdminLogin";
import AdminGroups from "./components/AdminGroups";
import AdminGroup from "./components/AdminGroup";
import AdminGroupCreate from "./components/AdminGroupCreate";
import Logout from "./components/Logout";

function findXandY() {
	let p = 2892008489112152977727500423395925534448265782469434025702914019945396937427n;
	let q = 1446004244556076488863750211697962767224132891234717012851457009972698468713n;
	let g = 2411791678875673015167120597615695985272696273651930040967888045705490681206n;
	let xi = 2533028058966872115703619831830940557435678967102178041576202623062754158807n;
	let yi = 1299883657906481171208196598721099303456493019960379314359072363648238311173n;
	let Xi = 1157075261077181054030007485712556856583731636916774217287642520874318871275n;
	let Xik = 395744852298062469220197355513310774669332736095806511827374907831173166549n;
	let gk = modPow(Xik, yi, p);
	console.log(
		gk ===
			1790056858506605177147474530640938081753288635006049346046186230251086758263n
	);

	// find_xi( 3490214590970643266829347708884132280515133032822901341029123470833482886823n
	// ).then((val) => {
	// 	console.log(val);
	// 	find_yi(
	// 		val,
	// 		3490214590970643266829347708884132280515133032822901341029123470833482886823n
	// 	).then((num) => {
	// 		console.log(num);
	// 		console.log(
	// 			(val * num) %
	// 				(3490214590970643266829347708884132280515133032822901341029123470833482886823n -
	// 					1n)
	// 		);
	// 	});
	// });
}

function App() {
	const isAuthenticated = localStorage.getItem("token") || "";
	return (
		<BrowserRouter>
			<Switch>
				<Route path="/" exact component={Home} />
				<Route path="/admin/login" exact component={AdminLogin} />
				{isAuthenticated && (
					<>
						<Route
							path="/admin/groups"
							exact
							component={AdminGroups}
						/>
						<Route
							path="/admin/groupsCreate"
							exact
							component={AdminGroupCreate}
						/>
						<Route
							path="/admin/groups/:id"
							component={AdminGroup}
						/>
						<Route path="/admin/logout" component={Logout} />
					</>
				)}
			</Switch>
		</BrowserRouter>
	);
}

export default App;
