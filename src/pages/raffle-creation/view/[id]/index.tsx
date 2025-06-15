import ChsHead from "@/components/layouts/ChsHead";
import ViewRaffle from "@/components/raffle/view";
import PrivateRoute from "@/routes/PrivetRoute";

const ViewRafflePage = () => {
	return (
		<PrivateRoute>
            <ChsHead />
            <ViewRaffle/>
		</PrivateRoute>
	);
};

export default ViewRafflePage;
