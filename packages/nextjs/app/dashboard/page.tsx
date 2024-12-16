"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiBarChart2,
  FiClock,
  FiFileText,
  FiHelpCircle,
  FiLogOut,
  FiSearch,
  FiSettings,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface MedicalRecord {
  recordType: string;
  description: string;
  date: string;
  doctorName: string;
}

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { address: userAddress } = useAccount();
  const [isRegistered, setIsRegistered] = useState(false);
  const [doctorAddress, setDoctorAddress] = useState("");
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    age: 0,
    phone: "",
    email: "",
    allergies: "",
    insurance: "",
  });
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([]);
  const [showDoctorsList, setShowDoctorsList] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState({ date: "", reason: "", doctorAddress: "" });
  const [grantedDoctors, setGrantedDoctors] = useState<
    { doctorAddress: string; name: string; specialization: string }[]
  >([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const { writeContractAsync: grantAccessAsync } = useScaffoldWriteContract("PatientRegistry");
  const { writeContractAsync: revokeAccessAsync } = useScaffoldWriteContract("PatientRegistry");
  const { writeContractAsync: bookAppointmentAsync } = useScaffoldWriteContract("AppointmentRegistry");

  const { data: registrationStatus, refetch: refetchRegistrationStatus } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "isPatientRegistered",
    args: [userAddress],
  });

  const { data: patientData } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getPatientInfo",
    args: [userAddress],
  });

  const { data: personalHealthDetails } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getPersonalHealthDetails",
    args: [userAddress],
  });

  const { data: historyData } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getPatientMedicalHistory",
    args: [userAddress],
  });

  const { data: grantedDoctorsData, refetch: refetchGrantedDoctorsData } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getGrantedDoctorsWithDetails",
    args: [userAddress],
  });

  useEffect(() => {
    if (registrationStatus) {
      setIsRegistered(registrationStatus);
    }
    if (patientData) {
      const birthDate = new Date(Number(patientData[1]));
      const currentDate = new Date();
      const age = currentDate.getFullYear() - birthDate.getFullYear();

      setPatientInfo(prevInfo => ({
        ...prevInfo,
        name: patientData[0],
        age: age,
        phone: patientData[2],
        email: patientData[3],
      }));
    }
    if (personalHealthDetails) {
      setPatientInfo(prevInfo => ({
        ...prevInfo,
        allergies: personalHealthDetails[0],
        insurance: personalHealthDetails[1],
      }));
    }
    if (historyData) {
      setMedicalHistory([...historyData]);
    }
    if (grantedDoctorsData) {
      setGrantedDoctors([...grantedDoctorsData]);
    }
    setLoading(false);
  }, [registrationStatus, patientData, personalHealthDetails, historyData, grantedDoctorsData]);

  useEffect(() => {
    // Call refetchRegistrationStatus on mount to ensure status is up to date
    refetchRegistrationStatus();
  }, []);

  const handleGrantAccess = async () => {
    if (!doctorAddress) {
      return;
    }
    try {
      await grantAccessAsync({
        functionName: "grantAccess",
        args: [doctorAddress],
      });
      refetchGrantedDoctorsData();
    } catch (error) {
      console.error("Failed to grant access:", error);
    }
  };

  const handleRevokeAccess = async () => {
    if (!doctorAddress) {
      return;
    }
    try {
      await revokeAccessAsync({
        functionName: "revokeAccess",
        args: [doctorAddress],
      });
      refetchGrantedDoctorsData();
    } catch (error) {
      console.error("Failed to revoke access:", error);
    }
  };

  const handleNavigateToAppointments = () => {
    router.push("/appointments");
  };

  const handleBookAppointment = async () => {
    if (!appointmentDetails.date || !appointmentDetails.reason || !appointmentDetails.doctorAddress) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    try {
      // Convert date to Unix timestamp in seconds and then to BigInt
      const dateTimeUnix = BigInt(Math.floor(new Date(appointmentDetails.date).getTime() / 1000));

      await bookAppointmentAsync({
        functionName: "requestAppointment",
        args: [appointmentDetails.doctorAddress, dateTimeUnix, appointmentDetails.reason],
      });
      console.log("Appointment booked successfully!");
      setErrorMessage(""); // Clear error message

      // Reset appointment fields
      setAppointmentDetails({ date: "", reason: "", doctorAddress: "" });
    } catch (error) {
      console.error("Error booking appointment:", error);
      setErrorMessage("Failed to book appointment. Please try again.");
    }
  };

  if (loading) return <p className="text-center mt-20 text-indigo-600 font-semibold">Loading...</p>;

  if (!isRegistered) {
    return (
      <p className="text-center mt-20 text-red-600 font-semibold">
        Error: This wallet address is not registered. Please register to view the dashboard.
      </p>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/4 bg-white shadow-md p-6 flex flex-col items-center border-r border-gray-200">
        {/* Profile Picture */}
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-indigo-600">
            <FiUser size={48} />
          </span>
        </div>

        {/* Patient Info */}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{patientInfo.name || "Patient"}</h2>
        <p className="text-gray-500">{patientInfo.email}</p>

        {/* Quick Stats */}
        <div className="w-full mt-6 text-left border-t pt-4">
          <p className="text-gray-600 mb-1 flex items-center">
            <span className="mr-2 text-gray-400">
              <FiClock />
            </span>
            Last Activity: <span className="text-gray-800 ml-1">3 hrs ago</span>
          </p>
          <p className="text-gray-600 flex items-center">
            Age: <span className="text-indigo-600 font-bold ml-1">{patientInfo.age}</span>
          </p>
          <p className="text-gray-600 flex items-center">
            Allergies: <span className="text-gray-800 ml-1">{patientInfo.allergies || "N/A"}</span>
          </p>
          <p className="text-gray-600 flex items-center">
            Insurance: <span className="text-gray-800 ml-1">{patientInfo.insurance || "N/A"}</span>
          </p>
          <p className="text-gray-600 flex items-center">
            Accessible Doctors: <span className="text-indigo-600 font-bold ml-1">{grantedDoctors.length}</span>
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full mt-6 flex justify-center">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden max-w-md w-full">
            <span className="text-gray-400 pl-3">
              <FiSearch />
            </span>
            <input
              type="text"
              placeholder="Search doctors"
              className="w-full p-2 text-gray-700 focus:outline-none bg-white"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="w-full mt-8 space-y-2">
          <button
            className="w-full flex items-center justify-start p-2 text-gray-700 hover:bg-indigo-50 rounded-md"
            onClick={handleNavigateToAppointments} // Navigate to Appointments on click
          >
            <span className="mr-2">
              <FiBarChart2 />
            </span>
            Appointments
          </button>
          <button className="w-full flex items-center justify-start p-2 text-gray-700 hover:bg-indigo-50 rounded-md">
            <span className="mr-2">
              <FiUsers />
            </span>
            Doctors List
          </button>
          <button className="w-full flex items-center justify-start p-2 text-gray-700 hover:bg-indigo-50 rounded-md">
            <span className="mr-2">
              <FiFileText />
            </span>
            Medical Reports
          </button>
          <button className="w-full flex items-center justify-start p-2 text-gray-700 hover:bg-indigo-50 rounded-md">
            <span className="mr-2">
              <FiSettings />
            </span>
            Settings
          </button>
          <button className="w-full flex items-center justify-start p-2 text-gray-700 hover:bg-indigo-50 rounded-md">
            <span className="mr-2">
              <FiHelpCircle />
            </span>
            Help & Support
          </button>
          <button className="w-full flex items-center justify-start p-2 text-red-600 hover:bg-red-50 rounded-md">
            <span className="mr-2">
              <FiLogOut />
            </span>
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Dashboard Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Medical History */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Medical History</h2>
          {medicalHistory.length > 0 &&
          medicalHistory.some(record => record.recordType || record.description || record.date || record.doctorName) ? (
            <ul className="space-y-4">
              {medicalHistory
                .filter(record => record.recordType || record.description || record.date || record.doctorName)
                .map((record, index) => (
                  <li key={index} className="p-4 border rounded-lg bg-gray-50">
                    <p className="text-gray-800">
                      <strong>Type:</strong> {record.recordType || "N/A"}
                    </p>
                    <p className="text-gray-800">
                      <strong>Description:</strong> {record.description || "N/A"}
                    </p>
                    <p className="text-gray-800">
                      <strong>Date:</strong> {record.date || "N/A"}
                    </p>
                    <p className="text-gray-800">
                      <strong>Doctor:</strong> {record.doctorName || "N/A"}
                    </p>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 italic">No medical history available.</p>
          )}
        </section>

        {/* Manage Access */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Access</h2>
          <input
            type="text"
            value={doctorAddress}
            onChange={e => setDoctorAddress(e.target.value)}
            placeholder="Enter doctor's address"
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:ring-indigo-500 bg-gray-50 text-gray-700"
          />

          {/* Buttons Row */}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={handleGrantAccess}
              className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Grant Access
            </button>
            <button
              onClick={handleRevokeAccess}
              className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Revoke Access
            </button>
            <button
              onClick={() => setShowDoctorsList(prevState => !prevState)}
              className="flex-1 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition"
            >
              {showDoctorsList ? "Hide Granted Doctors" : "View Granted Doctors"}
            </button>
          </div>

          {/* Granted Doctors List - Collapsible */}
          {showDoctorsList && (
            <ul className="mt-4 space-y-2 bg-gray-50 p-4 rounded-md border border-gray-300">
              {grantedDoctors.length > 0 ? (
                grantedDoctors.map((doctor, index) => (
                  <li key={index} className="text-gray-700">
                    <p>
                      <strong>Doctor:</strong> {doctor.name} ({doctor.specialization})
                    </p>
                    <p>
                      <strong>Address:</strong> {doctor.doctorAddress}
                    </p>
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-500 italic">No doctors have been granted access.</p>
              )}
            </ul>
          )}
        </section>

        {/* Book Appointment Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Book an Appointment</h2>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <form onSubmit={e => e.preventDefault()}>
            <input
              type="text"
              placeholder="Doctor's Address"
              value={appointmentDetails.doctorAddress}
              onChange={e => setAppointmentDetails({ ...appointmentDetails, doctorAddress: e.target.value })}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md bg-white text-gray-800"
            />
            <input
              type="date"
              value={appointmentDetails.date}
              onChange={e => setAppointmentDetails({ ...appointmentDetails, date: e.target.value })}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md bg-white text-gray-800"
            />
            <textarea
              placeholder="Reason for Appointment"
              value={appointmentDetails.reason}
              onChange={e => setAppointmentDetails({ ...appointmentDetails, reason: e.target.value })}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md bg-white text-gray-800"
            ></textarea>
            <button
              onClick={handleBookAppointment}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Book Appointment
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
