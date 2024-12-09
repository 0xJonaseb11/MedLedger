"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

const RegisterBasicInfoPage: React.FC = () => {
  const router = useRouter();
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    dob: "",
    phone: "",
    email: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const { writeContractAsync: registerPatientAsync } = useScaffoldWriteContract("PatientRegistry");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    // Check if all required fields are filled
    if (!basicInfo.name || !basicInfo.dob || !basicInfo.phone || !basicInfo.email) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    try {
      // Clear any previous error message
      setErrorMessage("");
      setLoading(true);

      // Convert date to BigInt and handle format
      const dobBigInt = BigInt(new Date(basicInfo.dob).getTime());

      // Call the smart contract function
      await registerPatientAsync({
        functionName: "registerPatient",
        args: [basicInfo.name, dobBigInt, basicInfo.phone, basicInfo.email],
      });

      console.log("Basic info registered!");
      router.push("/register-health-details");
    } catch (e) {
      console.error("Error during registration:", e);
      setErrorMessage("An error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <div className="hidden lg:block">
        <img
          src="https://media.istockphoto.com/id/1319031310/photo/doctor-writing-a-medical-prescription.jpg?s=612x612&w=0&k=20&c=DWZGM8lBb5Bun7cbxhKT1ruVxRC_itvFzA9jxgoA0N8="
          alt="Illustration"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex items-center justify-center p-8 bg-gray-100">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Register as Patient</h1>
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div>
              <label htmlFor="name" className="block text-lg font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={basicInfo.name}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none bg-white text-gray-800"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="dob" className="block text-lg font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={basicInfo.dob}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none bg-white text-gray-800"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-lg font-medium text-gray-700">
                Phone
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={basicInfo.phone}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none bg-white text-gray-800"
                placeholder="123-456-7890"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={basicInfo.email}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none bg-white text-gray-800"
                placeholder="email@domain.com"
              />
            </div>
            {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
            <button
              type="button"
              onClick={handleNext}
              className={`w-full py-3 mt-4 text-white font-medium rounded-md ${
                loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
              disabled={loading}
            >
              {loading ? "Processing..." : "Next"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterBasicInfoPage;
