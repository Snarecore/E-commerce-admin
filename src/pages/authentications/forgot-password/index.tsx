import { LuMail } from "react-icons/lu";
import companyLogo from "/images/lg-logo.svg";
import forgotPassword from "/images/forgotPassword.png";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <div className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center overflow-hidden overflow-y-scroll">
        <div className="w-2xl mx-auto space-y-8">
        <Link to={"/"}>
            <img
              src={companyLogo}
              alt="company logo"
              className="w-74 mx-auto mb-8"
            />
          </Link>
            <p className="text-3xl font-bold text-[#092c4c] mb-2">Forgot Password?</p>
            <p className="text-[15px] text-gray-600">
            If you forgot your password, well, then we’ll email you instructions to reset your password.
            </p>

          <form className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block mb-1.5">
                  <span className="text-[14px] font-medium text-[#212b36]">
                    Email Address
                  </span>
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    className="w-full bg-white text-[#212b36] px-4 py-4 border border-[#e6eaed] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-all duration-200"
                    required
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none  transition-colors duration-200">
                    <LuMail className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] border border-[var(--color-primary)] text-white py-3 rounded-lg hover:bg-white hover:text-[var(--color-primary)] font-bold transform transition-all duration-200 cursor-pointer"
            >
              Submit
            </button>

            <p className="text-center text-[15px] text-[#092C4C]">
              Return to {" "}
              <Link to={"/"}
                className="font-semibold hover:text-[var(--color-primary)] hover:border-b-2 border-[var(--color-primary)] transition-colors duration-200"
              >
                login
              </Link>
            </p>

          </form>
        </div>
      </div>

      <div className="hidden lg:block w-1/2 bg-cover bg-center">
        <div className="h-full bg-[#FFDABA] w-full flex items-center justify-center">
          <img src={forgotPassword} alt="company logo" className="fixed" />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
