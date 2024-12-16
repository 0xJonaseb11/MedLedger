"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

const RegisterDoctorPage: React.FC = () => {
  const router = useRouter();
  const [doctorInfo, setDoctorInfo] = useState({
    name: "",
    specialization: "",
  });

  // Initialize write contract hook for registering the doctor
  const { writeContractAsync: registerDoctorAsync } = useScaffoldWriteContract("PatientRegistry");

  const handleRegisterDoctor = async () => {
    try {
      await registerDoctorAsync({
        functionName: "registerDoctor",
        args: [doctorInfo.name, doctorInfo.specialization],
      });
      console.log("Doctor registered successfully!");
      router.push("/doc-dashboard");
    } catch (e) {
      console.error("Error registering doctor:", e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDoctorInfo(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 shadow-lg rounded-md">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">Register as Doctor</h1>
        <form className="space-y-4" onSubmit={e => e.preventDefault()}>
          <div>
            <label htmlFor="name" className="block text-lg font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={doctorInfo.name}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white text-gray-800"
              placeholder="Dr. John Doe"
            />
          </div>
          <div>
            <label htmlFor="specialization" className="block text-lg font-medium text-gray-700">
              Specialization
            </label>
            <input
              type="text"
              id="specialization"
              name="specialization"
              value={doctorInfo.specialization}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white text-gray-800"
              placeholder="Cardiology, Neurology, etc."
            />
          </div>
          <button
            type="button"
            onClick={handleRegisterDoctor}
            className="w-full py-3 mt-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            Register as Doctor
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterDoctorPage;
