import SponsorGrid from "@/components/sponsor/SponsorGrid";
import ChsHead from "@/components/layouts/ChsHead";
import PrivateRoute from "@/routes/PrivetRoute";

const SponsorGridPage = () => {
	return (
		<PrivateRoute>
			<ChsHead />
			<SponsorGrid />
		</PrivateRoute>
	);
};

export default SponsorGridPage;
