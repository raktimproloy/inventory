import Home from "@/components/dashboard";
import ChsHead from "@/components/layouts/ChsHead";
import PrivateRoute from "@/routes/PrivetRoute";

const LandingPage = () => {
	return (
		<PrivateRoute>
			<ChsHead />
			<Home />
		</PrivateRoute>
	);
};

export default LandingPage;
