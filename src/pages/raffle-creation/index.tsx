import ChsHead from "@/components/layouts/ChsHead";
import RaffleList from "@/components/raffle/list";
import PrivateRoute from "@/routes/PrivetRoute";

const RaffleCreationPage = () => {
	return (
		<PrivateRoute>
			<ChsHead />
			<RaffleList />
		</PrivateRoute>
	);
};

export default RaffleCreationPage;
