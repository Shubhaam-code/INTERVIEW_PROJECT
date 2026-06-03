import React from "react";
import { IoSparkles } from "react-icons/io5";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import axios from "axios";
import { ServerUrl } from "../App";
import { setUserData } from "../../redux/userSlice";
import { useDispatch } from "react-redux";
import heroImg from "../assets/images/MM.png";

function Auth({ isModel = false }) {
  const dispatch = useDispatch();

  const handleGoogleAuth = async () => {
    try {
      const response = await signInWithPopup(auth, provider);
      let User = response.user;
      let name = User.displayName;
      let email = User.email;
      const result = await axios.post(
        ServerUrl + "/api/auth/google",
        { name, email },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data));
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        console.log("Sign-in popup closed by user.");
      } else {
        console.error(error);
      }
      dispatch(setUserData(null));
    }
  };

  return (
    <div
      className={`w-full ${
        isModel
          ? "py-4"
          : "flex min-h-screen items-center justify-center bg-[#F5F9FF] px-6 py-20"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full overflow-hidden border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] ${
          isModel ? "max-w-md rounded-2xl p-8" : "grid max-w-4xl rounded-2xl md:grid-cols-2"
        }`}
      >
        {!isModel && (
          <div className="relative hidden items-center justify-center bg-gradient-to-br from-blue-50 to-white p-10 md:flex">
            <motion.img
              src={heroImg}
              alt="NextHire AI"
              className="max-h-64 object-contain"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        )}
        <div className={isModel ? "" : "p-10 lg:p-12"}>
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-lg font-bold text-white">
              N
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">NextHire AI</h2>
          </div>

          <h1 className="mb-4 text-center text-2xl font-bold leading-snug text-[#0F172A] md:text-3xl">
            Continue with{" "}
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[#2563EB]">
              <IoSparkles />
              AI Interview
            </span>
          </h1>
          <p className="mb-8 text-center text-sm leading-relaxed text-[#64748B] md:text-base">
            Sign in to start AI-powered mock interviews, track progress, and
            unlock detailed performance insights.
          </p>
          <motion.button
            type="button"
            onClick={handleGoogleAuth}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 font-semibold text-white shadow-md shadow-blue-500/25"
          >
            <FcGoogle size={20} />
            Continue with Google
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default Auth;
