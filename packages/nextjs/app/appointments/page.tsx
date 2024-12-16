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
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface Doctor {
  doctorAddress: string;
  name: string;
  specialization: string;
}

interface MappedAppointment {
  id: bigint;
  patient: string;
  doctor: string;
  date: bigint;
  reason: string;
  status: number;
  doctorName: string;
}

const AppointmentsPage = () => {
  const { address: userAddress } = useAccount();
  const router = useRouter();
  const [patientInfo, setPatientInfo] = useState({ name: "", age: 0, email: "", allergies: "", insurance: "" });
  const [grantedDoctors, setGrantedDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<MappedAppointment[]>([]);

  const { data: patientData } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getPatientInfo",
    args: [userAddress],
  });
  const { data: grantedDoctorsData } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getGrantedDoctorsWithDetails",
    args: [userAddress],
  });
  const { data: appointmentsData } = useScaffoldReadContract({
    contractName: "AppointmentRegistry",
    functionName: "getPatientAppointments",
    args: [userAddress],
  });
  const { data: personalHealthDetails } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getPersonalHealthDetails",
    args: [userAddress],
  });

  useEffect(() => {
    if (patientData) {
      const birthDate = new Date(Number(patientData[1]));
      const age = new Date().getFullYear() - birthDate.getFullYear();
      setPatientInfo(prevInfo => ({
        ...prevInfo,
        name: patientData[0],
        age,
        email: patientData[3],
      }));
    }

    if (personalHealthDetails) {
      setPatientInfo(prevInfo => ({
        ...prevInfo,
        allergies: personalHealthDetails[0] || "N/A",
        insurance: personalHealthDetails[1] || "N/A",
      }));
    }

    if (grantedDoctorsData) setGrantedDoctors([...grantedDoctorsData]);
    if (appointmentsData) {
      const mappedAppointments: MappedAppointment[] = appointmentsData.map(appointment => {
        const doctor = grantedDoctorsData?.find(doc => doc.doctorAddress === appointment.doctor);
        return {
          ...appointment,
          doctorName: doctor ? doctor.name : appointment.doctor,
          status: appointment.status,
        };
      });
      setAppointments(mappedAppointments);
    }
  }, [patientData, grantedDoctorsData, appointmentsData, personalHealthDetails]);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-1/4 bg-white shadow-md p-6 flex flex-col items-center border-r border-gray-200">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-indigo-600">
            <FiUser size={48} />
          </span>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{patientInfo.name || "Patient"}</h2>
        <p className="text-gray-500">{patientInfo.email}</p>
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
        <nav className="w-full mt-8 space-y-2">
          <button
            className="w-full flex items-center justify-start p-2 text-gray-700 hover:bg-indigo-50 rounded-md"
            onClick={() => router.push("/dashboard")}
          >
            <FiUsers className="mr-2" /> Dashboard
          </button>
          <button className="w-full flex items-center justify-start p-2 text-gray-700 hover:bg-indigo-50 rounded-md">
            <FiBarChart2 className="mr-2" /> Appointments
          </button>
          <button className="w-full flex items-center justify-start p-2 text-gray-700 hover:bg-indigo-50 rounded-md">
            <FiFileText className="mr-2" /> Medical Reports
          </button>
          <button className="w-full flex items-center justify-start p-2 text-gray-700 hover:bg-indigo-50 rounded-md">
            <FiSettings className="mr-2" /> Settings
          </button>
          <button className="w-full flex items-center justify-start p-2 text-gray-700 hover:bg-indigo-50 rounded-md">
            <FiHelpCircle className="mr-2" /> Help & Support
          </button>
          <button className="w-full flex items-center justify-start p-2 text-red-600 hover:bg-red-50 rounded-md">
            <FiLogOut className="mr-2" /> Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-6">Your Appointments</h2>
        {appointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((appointment, index) => (
              <div key={index} className="p-6 border rounded-lg bg-gray-50 shadow-md">
                <p className="text-gray-800 mb-2">
                  <strong>Date:</strong>{" "}
                  {new Date(Number(appointment.date) * 1000).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-gray-800 mb-2">
                  <strong>Time:</strong>{" "}
                  {new Date(Number(appointment.date) * 1000).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-gray-800 mb-2">
                  <strong>Doctor:</strong> {appointment.doctorName}
                </p>
                <p className="text-gray-800 mb-2">
                  <strong>Reason:</strong> {appointment.reason}
                </p>
                <p
                  className={`text-gray-800 font-semibold ${
                    appointment.status === 1
                      ? "text-green-600"
                      : appointment.status === 2
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  Status: {appointment.status === 0 ? "Pending" : appointment.status === 1 ? "Approved" : "Declined"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 italic">No appointments available.</p>
        )}
      </main>
    </div>
  );
};

export default AppointmentsPage;
