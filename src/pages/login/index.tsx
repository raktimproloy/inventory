import ChsHead from "@/components/layouts/ChsHead";
import Login from "@/components/login";
import RedirectRoute from "@/routes/RedirectRoute";

const LoginPage = () => {
	return (
		<RedirectRoute>
			<ChsHead />
			<Login />
		</RedirectRoute>
	);
};
LoginPage.noLayout = true;

export default LoginPage;
