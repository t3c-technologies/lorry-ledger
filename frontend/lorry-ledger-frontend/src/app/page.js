"use client";

import React, { useState } from "react";
import InputField from "../components/InputField";
import Button from "../components/Button";
import api from "../utils/api";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);

  const handleSendOtp = async () => {
    try {
      await api.post("/send-otp", { mobile });
      setStep(2);
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await api.post("/verify-otp", { mobile, otp });
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
      <div className="w-3/5 flex items-center justify-center bg-primary">
        <img
          src="/lorry-ledger.png"
          alt="Lorry Image"
          className="w-4/5 h-auto object-cover rounded-lg shadow-lg"
        />
      </div>

      {/* Right Section */}
      <div className="w-2/5 flex items-center justify-center bg-secondary">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-primary">
            {isLogin ? "Login" : "Signup"}
          </h2>
          {step === 1 && (
            <div>
              <InputField
                type="text"
                placeholder="Enter Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
              <Button text="Send OTP" onClick={handleSendOtp} color="blue" />
            </div>
          )}
          {step === 2 && (
            <div>
              <InputField
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
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
