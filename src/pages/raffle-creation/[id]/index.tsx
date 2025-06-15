import ChsHead from "@/components/layouts/ChsHead";
import EditRaffle from "@/components/raffle/edit";
import PrivateRoute from "@/routes/PrivetRoute";

const EditRafflePage = () => {
	return (
		<PrivateRoute>
            <ChsHead />
            <EditRaffle />
		</PrivateRoute>
	);
};

export default EditRafflePage;
