import ChsHead from "@/components/layouts/ChsHead";
import ResetPassword from "@/components/reset-password-form";
import RedirectRoute from "@/routes/RedirectRoute";

const ResetPasswordPage = () => {
	return (
		<RedirectRoute>
			<ChsHead />
			<ResetPassword />
		</RedirectRoute>
	);
};

ResetPasswordPage.noLayout = true;
export default ResetPasswordPage;
