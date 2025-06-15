import ChsHead from "@/components/layouts/ChsHead";
import Signup from "@/components/signup";
import RedirectRoute from "@/routes/RedirectRoute";

const SignupPage = () => {
	return (
		<RedirectRoute>
			<ChsHead />
			<Signup />
		</RedirectRoute>
	);
};

SignupPage.noLayout = true;
export default SignupPage;
