import ForgotPassword from "@/components/ForgotPassword";
import ChsHead from "@/components/layouts/ChsHead";
import RedirectRoute from "@/routes/RedirectRoute";

const ForgotPasswordPage = () => {
	return (
		<RedirectRoute>
			<ChsHead />
			<ForgotPassword />
		</RedirectRoute>
	);
};
ForgotPasswordPage.noLayout = true;

export default ForgotPasswordPage;
