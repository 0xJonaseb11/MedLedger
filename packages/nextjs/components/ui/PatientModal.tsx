import React, { useEffect, useState } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface MedicalRecord {
  recordType: string;
  description: string;
  date: string;
  doctorName: string;
}

interface Patient {
  patientAddress: string;
  name: string;
  age: number;
  phone: string;
  email: string;
}

interface PatientModalProps {
  patient: Patient;
  onClose: () => void;
}

const PatientModal: React.FC<PatientModalProps> = ({ patient, onClose }) => {
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([]);
  const [personalDetails, setPersonalDetails] = useState({
    allergies: "",
    insurance: "",
  });

  const { data: personalHealthDetails } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getPersonalHealthDetails",
    args: [patient.patientAddress],
  });

  const { data: medicalHistoryData } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getPatientMedicalHistory",
    args: [patient.patientAddress],
  });

  useEffect(() => {
    if (personalHealthDetails) {
      setPersonalDetails({
        allergies: personalHealthDetails[0],
        insurance: personalHealthDetails[1],
      });
    }
    if (medicalHistoryData) {
      setMedicalHistory([...medicalHistoryData]);
    }
  }, [personalHealthDetails, medicalHistoryData]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-gray-800 bg-opacity-60">
      <div className="bg-white rounded-lg w-full max-w-3xl p-8 shadow-lg border border-gray-300 relative overflow-auto max-h-[95vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-semibold"
        >
          &times;
        </button>
        <h2 className="text-3xl font-bold text-indigo-800 mb-6 text-center">Patient Details</h2>

        {/* Patient Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
          <div>
            <span className="font-medium text-gray-800">Name:</span>{" "}
            <span className="text-gray-700">{patient.name}</span>
          </div>
          <div>
            <span className="font-medium text-gray-800">Age:</span> <span className="text-gray-700">{patient.age}</span>
          </div>
          <div>
            <span className="font-medium text-gray-800">Phone:</span>{" "}
            <span className="text-gray-700">{patient.phone}</span>
          </div>
          <div>
            <span className="font-medium text-gray-800">Email:</span>{" "}
            <span className="text-gray-700">{patient.email}</span>
          </div>
          <div>
            <span className="font-medium text-gray-800">Allergies:</span>{" "}
            <span className="text-gray-700">{personalDetails.allergies || "N/A"}</span>
          </div>
          <div>
            <span className="font-medium text-gray-800">Insurance:</span>{" "}
            <span className="text-gray-700">{personalDetails.insurance || "N/A"}</span>
          </div>
        </div>

        {/* Medical History */}
        <h3 className="text-2xl font-semibold text-indigo-800 mb-4 text-center">Medical History</h3>
        <div className="space-y-4 overflow-y-auto max-h-72">
          {medicalHistory.length > 0 ? (
            medicalHistory
              .filter(record => record.recordType || record.description || record.date || record.doctorName)
              .map((record, index) => (
                <div key={index} className="border p-4 rounded-md bg-gray-50 shadow-sm">
                  <p className="text-gray-800">
                    <span className="font-semibold">Record Type:</span> {record.recordType || "N/A"}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-semibold">Description:</span> {record.description || "N/A"}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-semibold">Date:</span> {record.date || "N/A"}
                  </p>
                  <p className="text-gray-800">
                    <span className="font-semibold">Doctor:</span> {record.doctorName || "N/A"}
                  </p>
                </div>
              ))
          ) : (
            <p className="text-center text-gray-600 italic">No medical history available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientModal;
