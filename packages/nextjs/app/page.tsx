"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { GrantAccessModal } from "~~/components/ui/GrantAccessModal";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [isPatientRegistered, setIsPatientRegistered] = useState(false);
  const [isDoctorRegistered, setIsDoctorRegistered] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const router = useRouter();

  // Fetch patient registration status
  const { data: patientInfo, isLoading: patientLoading } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getPatientInfo",
    args: [connectedAddress],
  });

  // Fetch doctor registration status
  const { data: doctorInfo, isLoading: doctorLoading } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "isDoctorRegistered",
    args: [connectedAddress],
  });

  useEffect(() => {
    // Check if the connected address is registered as a patient
    if (patientInfo && patientInfo[0]) {
      setIsPatientRegistered(true);
    } else {
      setIsPatientRegistered(false);
    }

    // Check if the connected address is registered as a doctor
    if (doctorInfo) {
      setIsDoctorRegistered(doctorInfo);
    }
  }, [patientInfo, doctorInfo]);

  // const openGrantAccessModal = () => setIsAccessModalOpen(true);
  const navigateToRegisterPage = () => router.push("/register-basic-info");
  const navigateToDoctorRegisterPage = () => router.push("/register-doctor");
  const navigateToDashboard = () => router.push("/doc-dashboard");
  const navigateTopatientDashboard = () => router.push("/dashboard");

  return (
    <>
      <main>
        {/* Hero Section */}
        <section
          className="relative h-screen bg-cover bg-center text-white flex items-center justify-center"
          style={{
            backgroundImage:
              "url('https://plus.unsplash.com/premium_photo-1661670161789-f3d20b78fcab?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZSUyMGhlYWx0aHxlbnwwfHwwfHx8MA%3D%3D')",
          }}
        >
          <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <div className="relative z-10 text-center max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">Secure and Decentralized Health Records</h1>
            <p className="text-xl mb-6">
            MedLedger ensures privacy, integrity, and accessibility of health records.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <div className="bg-base-100 py-16">
          <section id="features" className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="order-2 lg:order-1">
              <img
                src="https://plus.unsplash.com/premium_photo-1658506671316-0b293df7c72b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG9jdG9yfGVufDB8fDB8fHww"
                alt="Feature image"
                className="shadow-md transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center order-1 lg:order-2 text-white">
              <h2 className="text-4xl font-bold mb-6">Why choose MedLedger(MedRecordchain)?</h2>
              <p className="text-lg mb-4 leading-relaxed">
                Our system provides a secure and immutable platform for patient records, ensuring only authorized
                doctors can access and update information during consultations.
              </p>
              <p className="text-lg leading-relaxed">
                Enjoy peace of mind knowing your health records are safely stored on the blockchain, accessible anytime,
                anywhere.
              </p>
            </div>
          </section>
        </div>

        <div className="bg-base-100 py-16">
          <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="flex flex-col justify-center text-white">
              <h2 className="text-4xl font-bold mb-6">A Vision for Better Healthcare</h2>
              <p className="text-lg mb-4 leading-relaxed">
              MedLedger leverages blockchain technology to eliminate data tampering and unauthorized access,
                providing continuity of care across medical facilities.
              </p>
              <p className="text-lg leading-relaxed">
                Empower your healthcare journey with a reliable, patient-centered record system.
              </p>
            </div>
            <div>
              <img
                src="https://plus.unsplash.com/premium_photo-1661281397737-9b5d75b52beb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjV8fGRvY3RvcnxlbnwwfHwwfHx8MA%3D%3D"
                alt="Vision image"
                className="shadow-md transition-transform duration-300 hover:scale-105"
              />
            </div>
          </section>
        </div>

        {/* Registration Section */}
        <section id="register" className="bg-gray-800 py-24 text-white">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-5xl font-bold text-white mb-10">Get Started with MedLedger</h2>
            {patientLoading || doctorLoading ? (
              <div className="loading loading-spinner text-white"></div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8 justify-center items-center">
                {connectedAddress ? (
                  <>
                    {isPatientRegistered ? (
                      <button
                        onClick={navigateTopatientDashboard}
                        className="px-8 py-4 text-lg font-medium bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-all"
                      >
                        Go to Patient Dashboard
                      </button>
                    ) : (
                      <div className="relative group">
                        <button
                          onClick={navigateToRegisterPage}
                          disabled={isDoctorRegistered}
                          className={`px-8 py-4 text-lg font-medium rounded-lg shadow-md transition-all ${
                            isDoctorRegistered
                              ? "bg-gray-500 cursor-not-allowed"
                              : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
                          }`}
                        >
                          Register as Patient
                        </button>
                        {isDoctorRegistered && (
                          <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-sm px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            You are already registered
                          </span>
                        )}
                      </div>
                    )}
                    {isDoctorRegistered ? (
                      <button
                        onClick={navigateToDashboard}
                        className="px-8 py-4 text-lg font-medium bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-all"
                      >
                        Go to Doctor Dashboard
                      </button>
                    ) : (
                      <div className="relative group">
                        <button
                          onClick={navigateToDoctorRegisterPage}
                          disabled={isPatientRegistered}
                          className={`px-8 py-4 text-lg font-medium rounded-lg shadow-md transition-all ${
                            isPatientRegistered
                              ? "bg-gray-500 cursor-not-allowed"
                              : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
                          }`}
                        >
                          Register as Doctor
                        </button>
                        {isPatientRegistered && (
                          <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-sm px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            You are already registered
                          </span>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-lg text-gray-300">Please connect your wallet to continue.</p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      <GrantAccessModal isOpen={isAccessModalOpen} onClose={() => setIsAccessModalOpen(false)} />
    </>
  );
};

export default Home;
