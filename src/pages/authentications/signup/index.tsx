import { FiUser } from "react-icons/fi";
import { LuMail } from "react-icons/lu";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import companyLogo from "/images/sm-logo.png";
import signup from "/images/signUp.png";
import { Link } from "react-router-dom";
import { useState } from "react";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <div className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center overflow-hidden overflow-y-scroll">
        <div className="w-full max-w-2xl mx-auto space-y-8">
          <Link to={"/"}>
            <img
              src={companyLogo}
              alt="company logo"
              className="w-40 mx-auto mb-8"
            />
          </Link>
          <p className="text-3xl font-bold text-[#092c4c] mb-2">Register</p>
          <p className="text-[15px] text-gray-600">
            Create New BazarBound Account
          </p>

          <form className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block mb-1.5">
                  <span className="text-[14px] font-medium text-[#212b36]">
                    Name
                  </span>
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    className="w-full bg-white text-[#212b36] px-4 py-4 border border-[#e6eaed] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-all duration-200"
                    required
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none  transition-colors duration-200 border-l border-gray-200">
                    <FiUser className="h-6 w-6 pl-2" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1.5">
                  <span className="text-[14px] font-medium text-[#212b36]">
                    Email
                  </span>
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    className="w-full bg-white text-[#212b36] px-4 py-4 border border-[#e6eaed] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-all duration-200"
                    required
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none  transition-colors duration-200 border-l border-gray-200">
                    <LuMail className="h-6 w-6 pl-2" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1.5">
                  <span className="text-[14px] font-medium text-[#212b36]">
                    Password
                  </span>
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-white text-[#212b36] px-4 py-4 border border-[#e6eaed] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-all duration-200"
                    required
                  />
                  <div
                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer  transition-colors duration-200 border-l pl-2 border-gray-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <BiSolidShow className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    ) : (
                      <BiSolidHide className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1.5">
                  <span className="text-[14px] font-medium text-[#212b36]">
                    Confirm Password
                  </span>
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full bg-white text-[#212b36] px-4 py-4 border border-[#e6eaed] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-all duration-200"
                    required
                  />
                  <div
                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer transition-colors duration-200 border-l pl-2 border-gray-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <BiSolidShow className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    ) : (
                      <BiSolidHide className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 cursor-pointer focus:outline-none"
                />
                <label
                  htmlFor="terms"
                  className="text-[15px] text-[#092c4c] font-normal cursor-pointer"
                >
                  I agree to the{" "}
                  <a className="text-[var(--color-primary)] ">Terms & Privacy</a>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--color-primary)] border border-[var(--color-primary)] text-white py-3 rounded-lg hover:bg-white hover:text-[var(--color-primary)] font-bold transform transition-all duration-200 cursor-pointer"
            >
              Sign Up
            </button>

            <p className="text-center text-[15px] text-[#092C4C]">
              Already have an account?{" "}
              <Link
                to={"/"}
                className="font-semibold hover:text-[var(--color-primary)] hover:border-b-2 border-[var(--color-primary)] transition-colors duration-200"
              >
                Sign In Instead
              </Link>
            </p>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-1/5 mx-auto border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-[14px] text-[#646b72] font-bold">
                <span className="px-4 bg-[#F7F7F7] text-gray-500">OR</span>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button className="p-3 w-42 flex items-center justify-center bg-[#1877F2] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200  cursor-pointer">
                <FaFacebook className="h-6 w-6 text-white  cursor-pointer" />
              </button>
              <button className="p-3 w-42 flex items-center justify-center bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200  cursor-pointer">
                <FcGoogle className="h-6 w-6" />
              </button>
              <button className="p-3 w-42 flex items-center justify-center bg-black rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <FaApple className="h-6 w-6 text-white" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:block w-1/2 bg-cover bg-center">
        <div className="h-full bg-[#FFDABA] w-full flex items-center justify-center">
          <img src={signup} alt="company logo" className="fixed" />
        </div>
      </div>
    </div>
  );
};

export default Signup;
