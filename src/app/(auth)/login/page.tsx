import { AuthBrandShowcase } from './components/AuthBrandShowcase';
import { LoginForm } from './components/LoginForm';

export default function LoginPage() {
	return (
		<div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-[#faf9f5] dark:bg-[#121214]">
			<AuthBrandShowcase />
			<LoginForm />
		</div>
	);
}
