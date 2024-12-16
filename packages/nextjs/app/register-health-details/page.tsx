"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

const RegisterHealthDetailsPage: React.FC = () => {
  const router = useRouter();
  const [healthDetails, setHealthDetails] = useState({
    allergies: "",
    insurance: "",
  });
  const { writeContractAsync: completeRegistrationAsync } = useScaffoldWriteContract("PatientRegistry");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCompleteRegistration = async () => {
    if (!healthDetails.allergies) {
      setErrorMessage("Please provide information on any allergies.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      // Call the smart contract function to complete registration
      await completeRegistrationAsync({
        functionName: "completeRegistration",
        args: [healthDetails.allergies, healthDetails.insurance],
      });

      console.log("Health details updated!");
      router.push("/dashboard"); // Navigate to the patient dashboard
    } catch (e) {
      console.error("Error updating health details:", e);
      setErrorMessage("An error occurred while updating health details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHealthDetails(prev => ({ ...prev, [name]: value }));
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
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Complete Health Details</h1>
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div>
              <label htmlFor="allergies" className="block text-lg font-medium text-gray-700">
                Allergies
              </label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                value={healthDetails.allergies}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none bg-white text-gray-800"
                placeholder="E.g., penicillin, nuts"
              />
            </div>
            <div>
              <label htmlFor="insurance" className="block text-lg font-medium text-gray-700">
                Insurance (Optional)
              </label>
              <input
                type="text"
                id="insurance"
                name="insurance"
                value={healthDetails.insurance}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none bg-white text-gray-800"
                placeholder="Insurance provider or policy number"
              />
            </div>
            {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
            <button
              type="button"
              onClick={handleCompleteRegistration}
              className={`w-full py-3 mt-4 font-medium rounded-md transition-colors ${
                loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
              disabled={loading}
            >
              {loading ? "Updating..." : "Complete Registration"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterHealthDetailsPage;
