"use client";

import React, { useState, useRef, useEffect } from "react";
import InputField from "../components/InputField";
import OtpInput from "../components/OtpInput";
import Button from "../components/Button";
import api from "../utils/api";

import { MessageCircle } from "lucide-react";

import { notifySuccess, notifyError } from "../components/Notification";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState("");
  const [countryCode, setCountryCode] = useState("+91"); // Default country code
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [step, setStep] = useState(1);

  const handleSuccess = (message) => notifySuccess(message);
  const handleError = (message) => notifyError(message);

  const mobileInputRef = useRef(null);
  const firstOtpInputRef = useRef(null);


  const [countdown, setCountdown] = useState(10);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, canResend]);

  const handleResendOTP = () => {
    if (canResend) {
      setCountdown(10);
      setCanResend(false);
    }
  };

  const handleChangeNumber = () => {
    setStep(1);
  };

  const backToLogin = () => {
    setStep(1);
    setIsLogin(!isLogin);
  }

  useEffect(() => {
    if (step === 1) {
      mobileInputRef.current?.focus();
    } else if (step === 2){
      firstOtpInputRef.current?.focus();
    }
  }, [step]);

  const validateMobile = async (mobile) => {
    // Check if the input is empty
    if (!mobile) {
      return { isValid: false, message: "Mobile number is required." };
    }

    // Check if input is numeric
    const numericRegex = /^[0-9]+$/;
    if (!numericRegex.test(mobile)) {
      return {
        isValid: false,
        message: "Mobile number must contain only digits.",
      };
    }

    // Check length
    if (mobile.length !== 10) {
      return { isValid: false, message: "Enter a valid mobile number." };
    }

    // Check valid starting digit (6-9)
    if (!["6", "7", "8", "9"].includes(mobile[0])) {
      return { isValid: false, message: "Enter a valid mobile number." };
    }

    // If all checks pass
    return { isValid: true, message: "Mobile number is valid." };
  };

  const handleSendOtp = async () => {
    try {
      const fullMobile = `${countryCode}${mobile}`; // Combine country code and mobile
      const { isValid, message } = await validateMobile(mobile);
      if (!isValid) {
        notifyError(message);
        return;
      }
      // await api.post("/send-otp", { mobile: fullMobile });
      setStep(2);
      // handleSuccess();
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (step === 1) {
        handleSendOtp();
      } else if (step === 2) {
        handleVerifyOtp();
      }
    }
  };

  return (
    <div className="min-h-screen flex" onKeyDown={handleKeyPress} tabIndex="0">
      {/* Left Section - Made slightly smaller */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-primary p-6 text-white">
        <img
          src="/lorry-ledger.png"
          alt="Lorry Image"
          className="w-4/5 h-auto object-cover rounded-lg shadow-lg"
        />
        <div className="mt-8 text-center">
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

      {/* Right Section - Made slightly bigger */}
      <div className="w-1/2 flex items-center justify-center bg-secondary">
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg mx-8">
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-bold mb-8 text-center text-primary">
                {isLogin ? "Login" : "Signup"}
              </h2>
              <div className="mb-8 text-center">
                <div className="flex items-center justify-center mb-3">
                  <MessageCircle className="text-primary mr-2" size={20} />
                  <p className="text-lg text-textPrimary font-medium">
                    {isLogin ? "Login " : "Signup "} with your registered mobile
                    number
                  </p>
                </div>
                <p className="text-sm text-textSecondary">
                  We'll send you a one-time password to verify your identity
                </p>
              </div>
              <div className="flex gap-3 mb-6">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="+91">+91</option>
                  <option value="+1" disabled>
                    +1
                  </option>
                  <option value="+44" disabled>
                    +44
                  </option>
                </select>
                <InputField
                  type="text"
                  placeholder="9019719989"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  ref={mobileInputRef}
                />
              </div>
              <Button text="Get OTP" onClick={handleSendOtp} className="blue" />
              <p className="text-sm text-center mt-6 text-gray-600">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary ml-2 hover:underline"
                >
                  {isLogin ? "Signup" : "Login"}
                </button>
              </p>
            </div>
          )}
          {step === 2 && (
            <div className="max-w-md mx-auto px-6 py-6">
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-center text-primary">
                  Enter OTP Received
                </h2>
                <div className="mb-8 text-center">
                  <p className="text-sm text-textSecondary">
                    An OTP is sent to {countryCode} {mobile}, valid for next 5
                    minutes
                  </p>
                </div>
                <OtpInput otp={otp} setOtp={setOtp} firstInputRef={firstOtpInputRef}/>

                <Button
                  text="Verify OTP"
                  onClick={handleVerifyOtp}
                  color="green"
                />
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center">
                    {canResend ? (
                      <Button
                        text="Resend OTP"
                        onClick={handleResendOTP}
                        className="blue"
                      />
                    ) : (
                      <>
                        Resend OTP in&nbsp;
                        <span className="text-primary">{countdown}s</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={backToLogin}
                    className="text-primary ml-2 hover:underline"
                  >
                    Back To Login
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
