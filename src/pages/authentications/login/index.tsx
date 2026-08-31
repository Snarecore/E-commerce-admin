import { LuMail } from "react-icons/lu";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import companyLogo from "/images/BazaarBound Logo.svg";
import { ChangeEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSetAtom, useAtomValue } from "jotai";
import { userAtom, userLoadedAtom } from "../../../store/user-store";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { loginQueryKey } from "../../../config/query-key";

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

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

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

		// @ts-ignore
		if (result?.success && ((result.data as any)?.data?.user || (result.data as any)?.user || (result.data as any)?.data)) {
			// @ts-ignore
			const rawData = result.data as any;
			const userData = rawData?.data?.user || rawData?.user || rawData?.data;
			const accessToken = rawData?.data?.accessToken || rawData?.accessToken || rawData?.data?.token || rawData?.token;

			const normalizedUser = {
				...userData,
				id: userData?.id || userData?._id || "",
				role: userData?.role || "admin",
				token: accessToken
			};

			sessionStorage.setItem("user", JSON.stringify(normalizedUser));
			setUser(normalizedUser);
			navigate("/", { replace: true });
		}
	};

	return (
		<div className="flex min-h-screen w-full bg-white items-center justify-center p-4 sm:p-8">
			<div className="w-full max-w-md mx-auto space-y-8">
					<img
						src={companyLogo}
						alt="company logo"
						className="w-48 mx-auto mb-4"
					/>
					<p className="text-3xl text-center font-bold text-black mb-2">
						Log in to your account
					</p>
					<p className="text-[15px] text-center text-gray-600">
						Welcome back! Please enter your credentials.
					</p>
					<form className="space-y-5" onSubmit={handleLogin}>
						<div className="space-y-4">
							<div>
								<label className="block mb-1.5">
									<span className="text-[14px] font-bold text-[var(--color-primary)]">
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
										className="w-full bg-white text-[#212b36] px-4 py-4 border border-[#e6eaed] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-all duration-200"
										required
									/>
									<div className="absolute inset-y-0 right-4 flex items-center pointer-events-none border-l border-gray-200">
										<LuMail className="h-6 w-6 pl-2" />
									</div>
								</div>
							</div>

							<div>
								<label className="block mb-1.5">
									<span className="text-[14px] font-bold text-[var(--color-primary)]">
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
										className="w-full bg-white text-[#212b36] px-4 py-4 border border-[#e6eaed] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-all duration-200"
										required
									/>
									<div
										className="absolute inset-y-0 right-3 flex items-center cursor-pointer border-l pl-2 border-gray-200"
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

							<div className="flex justify-between items-center cursor-pointer">
								<div className="flex items-center space-x-2">
									{/* <input
										type="checkbox"
										id="remember"
										className="w-4 h-4 cursor-pointer focus:outline-none"
									/>
									<label
										htmlFor="remember"
										className="text-[15px] text-[#092c4c] font-normal cursor-pointer"
									>
										Remember me
									</label> */}
								</div>

								<div>
									<Link
										to={"/forgot-password"}
										className="text-[var(--color-primary)] font-bold text-[15px]"
									>
										Forgot Password?
									</Link>
								</div>
							</div>
						</div>

						<button
							type="submit"
							className="w-full bg-[var(--color-primary)] border border-[var(--color-primary)] text-white py-3 rounded-lg hover:bg-white hover:text-[var(--color-primary)] font-bold transform transition-all duration-200 cursor-pointer"
						>
							Sign In
						</button>
					</form>
				</div>
		</div>
	);
};

export default Login;
