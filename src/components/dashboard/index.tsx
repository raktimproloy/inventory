import React from "react";
import Counter from "../common/counter";
import Dashboard from "../common/dashboard";
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
	return (
		<div className="home-page">
			<Counter />
			<Dashboard />
		</div>
	);
};

export default Home;
