"use client";

import React, { useState } from "react";
import InputField from "../components/InputField";
import OtpInput from "../components/OtpInput";
import Button from "../components/Button";
import api from "../utils/api";

import { notifySuccess, notifyError } from "../components/Notification";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("+91"); // Default country code
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [step, setStep] = useState(1);

  const handleSuccess = () => notifySuccess("Welcome to Lorry Ledger!");
  const handleError = () => notifyError("Something went wrong!");

  const handleSendOtp = async () => {
    try {
      const fullMobile = `${countryCode}${mobile}`; // Combine country code and mobile
      // await api.post("/send-otp", { mobile: fullMobile });
      // setStep(2);
      handleSuccess();
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const enteredOtp = otp.join("");
      const fullMobile = `${countryCode}${mobile}`; // Combine country code and mobile
      const response = await api.post("/verify-otp", {
        mobile: fullMobile,
        otp: enteredOtp,
      });
      if (response.data.success) {
        alert("OTP Verified Successfully!");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="w-3/5 flex flex-col items-center justify-center bg-primary p-6 text-white">
        <img
          src="/lorry-ledger.png"
          alt="Lorry Image"
          className="w-4/5 h-auto object-cover rounded-lg shadow-lg"
        />
        <div className="mt-8 text-center">
          <h3 className="text-3xl font-extrabold mb-6 text-white">
            Lorry Ledger Stats
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-secondary p-4 rounded-lg shadow-md">
              <p className="text-3xl font-bold text-primary">1.2M+</p>
              <p className="text-md font-medium text-textSecondary">
                Transactions
              </p>
            </div>
            <div className="bg-secondary p-4 rounded-lg shadow-md">
              <p className="text-3xl font-bold text-primary">5K+</p>
              <p className="text-md font-medium text-textSecondary">Vehicles</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg shadow-md">
              <p className="text-3xl font-bold text-primary">8K+</p>
              <p className="text-md font-medium text-textSecondary">Drivers</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg shadow-md">
              <p className="text-3xl font-bold text-primary">50+</p>
              <p className="text-md font-medium text-textSecondary">Cities</p>
            </div>
            <div className="bg-secondary p-4 rounded-lg shadow-md">
              <p className="text-3xl font-bold text-primary">10M+</p>
              <p className="text-md font-medium text-textSecondary">
                Km Traveled
              </p>
            </div>
            <div className="bg-secondary p-4 rounded-lg shadow-md">
              <p className="text-3xl font-bold text-primary">98%</p>
              <p className="text-md font-medium text-textSecondary">
                Satisfaction
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-2/5 flex items-center justify-center bg-secondary">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-primary">
            {isLogin ? "Login" : "Signup"}
          </h2>
          {step === 1 && (
            <div>
              <div className="flex gap-2 mb-4">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="+91">+91</option>
                  <option value="+1" disabled>
                    +1
                  </option>{" "}
                  {/* Disabled */}
                  <option value="+44" disabled>
                    +44
                  </option>{" "}
                  {/* Disabled */}
                </select>
                <InputField
                  type="text"
                  placeholder="9019719989"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
              <Button text="Get OTP" onClick={handleSendOtp} color="blue" />
            </div>
          )}
          {step === 2 && (
            <div>
              <OtpInput otp={otp} setOtp={setOtp} />
              <Button
                text="Verify OTP"
                onClick={handleVerifyOtp}
                color="green"
              />
            </div>
          )}
          <p className="text-sm text-center mt-4 text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary ml-1 hover:underline"
            >
              {isLogin ? "Signup" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
