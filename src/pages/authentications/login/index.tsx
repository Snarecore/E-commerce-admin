import { LuMail } from "react-icons/lu";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import companyLogo from "/images/Admin-logo.png";
import { ChangeEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSetAtom, useAtomValue } from "jotai";
import { userAtom, userLoadedAtom } from "../../../store/user-store";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { loginQueryKey } from "../../../config/query-key";
import { setStoredUser } from "../../../utils/auth-storage";

const initialFieldValues = {
    email: "",
	password: ""
};

const requiredFields: any = [
    { key: "email", value: "email", label: "text" },
	{ key: "password", value: "password", label: "text" }
];

const Login = () => {
	const navigate = useNavigate();
	const user = useAtomValue(userAtom);
	const userLoaded = useAtomValue(userLoadedAtom);
	const setUser = useSetAtom(userAtom);
	const { postMutation, handleApiMutation } = useAPI();
	const [showPassword, setShowPassword] = useState(false);
	const [fieldValues, setFieldValues] = useState(initialFieldValues);

	useEffect(() => {
		if (userLoaded && user) {
			navigate("/", { replace: true });
		}
	}, [user, userLoaded, navigate]);

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setFieldValues((prevState) => ({
			...prevState,
			[name]: value
		}));
	};

	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (isSubmitting || postMutation.isPending) return;

		setIsSubmitting(true);
		try {
			const mutation = postMutation;
			const url = apiConfig.auth.loginUrl;

			const result = await handleApiMutation({
				// @ts-ignore
				mutation,
				url,
				body: fieldValues,
				invalidateQueryKey: [loginQueryKey],
				showSuccessMessage: true,
				showErrorMessage: true,
				requiredFields
			});

			if (result?.success && result?.data) {
				const rawData = result.data as any;
				const userData = rawData?.data?.user || rawData?.user || rawData?.data?.admin || rawData?.admin || (typeof rawData?.data === 'object' ? rawData?.data : rawData);

				const normalizedUser = {
					id: userData?.id || userData?._id || "",
					name: userData?.name || "Admin",
					email: userData?.email || "",
					role: userData?.role || "admin"
				};

				setStoredUser(normalizedUser);
				setUser(normalizedUser);
				navigate("/", { replace: true });
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-screen w-full bg-white items-center justify-center p-4 sm:p-6">
			<div className="w-full max-w-md mx-auto space-y-6">
				<div className="text-center">
					<img
						src={companyLogo}
						alt="company logo"
						className="w-44 mx-auto mb-3"
					/>
					<h1 className="text-2xl sm:text-3xl font-bold text-black mb-1">
						Log in to your account
					</h1>
					<p className="text-sm text-gray-500">
						Welcome back! Please enter your credentials.
					</p>
				</div>

				<form className="space-y-4" onSubmit={handleLogin}>
					<div className="space-y-3.5">
						<div>
							<label className="block mb-1">
								<span className="text-[13px] sm:text-[14px] font-bold text-[var(--color-primary)]">
									Email Address
								</span>
								<span className="text-red-500 ml-1">*</span>
							</label>
							<div className="relative group">
								<input
									type="email"
									name="email"
									value={fieldValues.email}
									onChange={handleChange}
									className="w-full bg-white text-[#212b36] px-3.5 py-2.5 pr-12 border border-[#e6eaed] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-all duration-200 text-sm sm:text-base"
									required
								/>
								<div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none border-l border-gray-200 pl-2.5 text-gray-400">
									<LuMail className="h-5 w-5" />
								</div>
							</div>
						</div>

						<div>
							<label className="block mb-1">
								<span className="text-[13px] sm:text-[14px] font-bold text-[var(--color-primary)]">
									Password
								</span>
								<span className="text-red-500 ml-1">*</span>
							</label>
							<div className="relative group">
								<input
									type={showPassword ? "text" : "password"}
									value={fieldValues.password}
									name="password"
									onChange={handleChange}
									className="w-full bg-white text-[#212b36] px-3.5 py-2.5 pr-12 border border-[#e6eaed] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-all duration-200 text-sm sm:text-base"
									required
								/>
								<div
									className="absolute inset-y-0 right-3.5 flex items-center cursor-pointer border-l border-gray-200 pl-2.5 text-gray-400"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<BiSolidShow className="h-5 w-5 hover:text-gray-700" />
									) : (
										<BiSolidHide className="h-5 w-5 hover:text-gray-700" />
									)}
								</div>
							</div>
						</div>

						<div className="flex justify-end items-center">
							<Link
								to={"/forgot-password"}
								className="text-[var(--color-primary)] font-bold text-sm hover:underline"
							>
								Forgot Password?
							</Link>
						</div>
					</div>

					<button
						type="submit"
						disabled={isSubmitting || postMutation.isPending}
						className="w-full bg-[var(--color-primary)] border border-[var(--color-primary)] text-white py-2.5 rounded-lg hover:bg-white hover:text-[var(--color-primary)] font-bold transform transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{(isSubmitting || postMutation.isPending) ? (
							<>
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
								<span>Signing In...</span>
							</>
						) : (
							"Sign In"
						)}
					</button>
				</form>
			</div>
		</div>
	);
};

export default Login;
