"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddMedicalRecordModal from "../../components/ui/AddMedicalRecordModal";
import PatientModal from "../../components/ui/PatientModal";
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
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface Patient {
  patientAddress: string;
  name: string;
  age: number;
  phone: string;
  email: string;
}

const DoctorDashboard: React.FC = () => {
  const { address: doctorAddress } = useAccount();
  const router = useRouter();
  const [doctorInfo, setDoctorInfo] = useState({
    name: "",
    specialization: "",
  });
  const [accessiblePatients, setAccessiblePatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);

  const openPatientModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsPatientModalOpen(true);
  };

  const openAddRecordModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsAddRecordModalOpen(true);
  };

  // Fetch doctor's own details
  const { data: doctorDetailsData } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getDoctorDetails",
    args: [doctorAddress],
  });

  // Fetch patients who granted access to this doctor
  const { data: accessiblePatientsData } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getAccessiblePatientsWithDetails",
    args: [doctorAddress],
  });

  useEffect(() => {
    if (doctorDetailsData) {
      setDoctorInfo({
        name: doctorDetailsData[0],
        specialization: doctorDetailsData[1],
      });
    }

    if (accessiblePatientsData) {
      const formattedPatients = accessiblePatientsData.map(patient => {
        const birthDate = new Date(Number(patient.age));
        const currentDate = new Date();
        const age = currentDate.getFullYear() - birthDate.getFullYear();

        return {
          ...patient,
          age: age,
        };
      });
      setAccessiblePatients(formattedPatients);
    }

    setLoading(false);
  }, [doctorDetailsData, accessiblePatientsData]);

  if (loading) return <p className="text-center mt-20 text-indigo-600 font-semibold">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-indigo-50 to-indigo-100">
      {/* Sidebar */}
      <aside className="w-1/4 bg-white shadow-md p-6 flex flex-col items-center border-r border-gray-200">
        {/* Profile Picture */}
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-indigo-600">
            <FiUser size={48} />
          </span>
        </div>

        {/* Doctor's Info */}
        {doctorInfo.name && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">{doctorInfo.name}</h2>
            <p className="text-gray-500">{doctorInfo.specialization}</p>
          </>
        )}

        {/* Quick Stats */}
        <div className="w-full mt-6 text-left border-t pt-4">
          <p className="text-gray-600 mb-1 flex items-center">
            <span className="mr-2 text-gray-400">
              <FiClock />
            </span>
            <span>Last Activity:</span> <span className="text-gray-800 ml-1">3 hrs ago</span>
          </p>
          <p className="text-gray-600 flex items-center">
            <span>Patients Accessible:</span>{" "}
            <span className="text-indigo-600 font-bold ml-1">{accessiblePatients.length}</span>
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
              placeholder="Search patients"
              className="w-full p-2 text-gray-700 focus:outline-none bg-white"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="w-full mt-8 space-y-2">
          <button
            className="w-full flex items-center justify-start p-2 text-gray-700 hover:bg-indigo-50 rounded-md"
            onClick={() => router.push("/doc-appointments")} // Navigate to doc-appointments page
          >
            <FiBarChart2 className="mr-2" />
            Appointments
          </button>
          <button className="w-full flex items-center justify-start p-2 text-gray-700 hover:bg-indigo-50 rounded-md">
            <span className="mr-2">
              <FiUsers />
            </span>
            Statistics
          </button>
          <button className="w-full flex items-center justify-start p-2 text-gray-700 hover:bg-indigo-50 rounded-md">
            <span className="mr-2">
              <FiFileText />
            </span>
            Reports
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

      {/* Main Content Area */}
      <main className="w-3/4 p-8 overflow-y-auto">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-6">Accessible Patients</h2>
        {accessiblePatients.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {accessiblePatients.map((patient, index) => (
              <div key={index} className="p-6 border rounded-lg shadow-md bg-white hover:shadow-lg transition w-full">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">{patient.name}</h3>
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {patient.email}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Address:</span>
                  <span className="block overflow-hidden text-ellipsis whitespace-normal">
                    {patient.patientAddress}
                  </span>
                </p>
                <div className="mt-4 flex space-x-2">
                  <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex-1"
                    onClick={() => openPatientModal(patient)}
                  >
                    View Patient
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex-1"
                    onClick={() => openAddRecordModal(patient)}
                  >
                    Add Medical History
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 italic">No patients have granted you access yet.</p>
        )}
      </main>

      {/* Modals */}
      {isPatientModalOpen && selectedPatient && (
        <PatientModal patient={selectedPatient} onClose={() => setIsPatientModalOpen(false)} />
      )}

      {isAddRecordModalOpen && selectedPatient && (
        <AddMedicalRecordModal
          patientAddress={selectedPatient.patientAddress}
          onClose={() => setIsAddRecordModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
