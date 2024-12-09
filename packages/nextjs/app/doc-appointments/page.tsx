"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiClock, FiFileText, FiHelpCircle, FiLogOut, FiSearch, FiSettings, FiUser } from "react-icons/fi";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const DoctorAppointmentsPage: React.FC = () => {
  const { address: doctorAddress } = useAccount();
  const router = useRouter();
  const [doctorInfo, setDoctorInfo] = useState({ name: "", specialization: "" });
  const [appointments, setAppointments] = useState<
    { appointmentId: string; dateTime: number; patientName: string; reason: string; status: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch doctor details
  const { data: doctorDetailsData } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getDoctorDetails",
    args: [doctorAddress],
  });

  // Fetch appointments for the doctor
  const { data: appointmentsData, refetch: refetchAppointments } = useScaffoldReadContract({
    contractName: "AppointmentRegistry",
    functionName: "getDoctorAppointments",
    args: [doctorAddress],
  });

  const { writeContractAsync: approveAppointmentAsync } = useScaffoldWriteContract("AppointmentRegistry");
  const { writeContractAsync: declineAppointmentAsync } = useScaffoldWriteContract("AppointmentRegistry");

  useEffect(() => {
    if (doctorDetailsData) {
      setDoctorInfo({ name: doctorDetailsData[0], specialization: doctorDetailsData[1] });
    }
    if (appointmentsData) {
      setAppointments(
        appointmentsData.map((appointment, index) => ({
          appointmentId: index.toString(),
          dateTime: Number(appointment.date),
          patientName: appointment.patient,
          reason: appointment.reason,
          status: appointment.status,
        })),
      );
    }
    setLoading(false);
  }, [doctorDetailsData, appointmentsData]);

  const handleApprove = async (appointmentId: string) => {
    try {
      await approveAppointmentAsync({
        functionName: "approveAppointment",
        args: [BigInt(appointmentId)],
      });
      refetchAppointments();
    } catch (error) {
      console.error("Failed to approve appointment:", error);
    }
  };

  const handleDecline = async (appointmentId: string) => {
    try {
      await declineAppointmentAsync({
        functionName: "declineAppointment",
        args: [BigInt(appointmentId)],
      });
      refetchAppointments();
    } catch (error) {
      console.error("Failed to decline appointment:", error);
    }
  };

  if (loading) return <p className="text-center mt-20 text-indigo-600 font-semibold">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-indigo-50 to-indigo-100">
      {/* Sidebar */}
      <aside className="w-1/4 bg-white shadow-md p-6 flex flex-col items-center border-r border-gray-200">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <FiUser size={48} className="text-indigo-600" />
        </div>
        {doctorInfo.name && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">{doctorInfo.name}</h2>
            <p className="text-gray-500">{doctorInfo.specialization}</p>
          </>
        )}
        <div className="w-full mt-6 text-left border-t pt-4">
          <p className="text-gray-600 mb-1 flex items-center">
            <FiClock className="mr-2 text-gray-400" />
            Last Activity: <span className="text-gray-800 ml-1">3 hrs ago</span>
          </p>
          <p className="text-gray-600 flex items-center">
            Appointments: <span className="text-indigo-600 font-bold ml-1">{appointments.length}</span>
          </p>
        </div>
        <div className="w-full mt-6 flex justify-center">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden max-w-md w-full">
            <FiSearch className="text-gray-400 pl-3" />
            <input
              type="text"
              placeholder="Search appointments"
              className="w-full p-2 text-gray-700 focus:outline-none bg-white"
            />
          </div>
        </div>
        <nav className="w-full mt-8 space-y-2">
          <button
            className="w-full flex items-center justify-start p-2 text-gray-700 hover:bg-indigo-50 rounded-md"
            onClick={() => router.push("/doc-dashboard")}
          >
            <FiUser className="mr-2" />
            Dashboard
          </button>
          <button className="w-full flex items-center justify-start p-2 text-gray-700 hover:bg-indigo-50 rounded-md">
            <FiFileText className="mr-2" />
            Reports
          </button>
          <button className="w-full flex items-center justify-start p-2 text-gray-700 hover:bg-indigo-50 rounded-md">
            <FiSettings className="mr-2" />
            Settings
          </button>
          <button className="w-full flex items-center justify-start p-2 text-gray-700 hover:bg-indigo-50 rounded-md">
            <FiHelpCircle className="mr-2" />
            Help & Support
          </button>
          <button className="w-full flex items-center justify-start p-2 text-red-600 hover:bg-red-50 rounded-md">
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Appointments Content */}
      <main className="w-3/4 p-8 overflow-y-auto">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-6">Your Appointments</h2>
        {appointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map(appointment => (
              <div
                key={appointment.appointmentId}
                className="p-6 border rounded-lg shadow-md bg-white hover:shadow-lg transition"
              >
                <p className="text-gray-800 mb-2">
                  <strong>Date:</strong>{" "}
                  {new Date(Number(appointment.dateTime) * 1000).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-gray-800 mb-2">
                  <strong>Time:</strong>{" "}
                  {new Date(Number(appointment.dateTime) * 1000).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-gray-800 mb-2 overflow-hidden overflow-ellipsis whitespace-nowrap">
                  <strong>Patient:</strong> {appointment.patientName}
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
                {appointment.status === 0 && (
                  <div className="mt-4 flex space-x-4">
                    <button
                      onClick={() => handleApprove(appointment.appointmentId)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecline(appointment.appointmentId)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Decline
                    </button>
                  </div>
                )}
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

export default DoctorAppointmentsPage;
