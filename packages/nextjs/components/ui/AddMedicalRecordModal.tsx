"use client";

import React, { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface AddMedicalRecordModalProps {
  patientAddress: string;
  onClose: () => void;
}

const AddMedicalRecordModal: React.FC<AddMedicalRecordModalProps> = ({ patientAddress, onClose }) => {
  const [recordType, setRecordType] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const { writeContractAsync: addMedicalRecord } = useScaffoldWriteContract("PatientRegistry");

  const handleAddRecord = async () => {
    // Check if all fields have been provided
    if (!recordType || !description || !date || !doctorName) {
      alert("Please fill in all fields before adding the record.");
      return;
    }

    try {
      await addMedicalRecord({
        functionName: "addMedicalRecord",
        args: [patientAddress, recordType, description, date, doctorName],
      });

      // Clear input fields after successful transaction
      setRecordType("");
      setDescription("");
      setDate("");
      setDoctorName("");
      alert("Medical record added successfully");
      onClose(); // Close the modal after adding record
    } catch (error) {
      console.error("Error adding record:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-gray-800 bg-opacity-60">
      <div className="bg-white rounded-lg w-full max-w-md p-8 shadow-lg border border-gray-300 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-semibold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Add Medical Record</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-gray-700">Record Type</label>
            <input
              type="text"
              placeholder="Record Type"
              value={recordType}
              onChange={e => setRecordType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none bg-white text-gray-800"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">Description</label>
            <textarea
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none bg-white text-gray-800 resize-none h-24"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">Date</label>
            <input
              type="date"
              placeholder="Date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none bg-white text-gray-800"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">Doctor Name</label>
            <input
              type="text"
              placeholder="Doctor Name"
              value={doctorName}
              onChange={e => setDoctorName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none bg-white text-gray-800"
            />
          </div>
          <button
            onClick={handleAddRecord}
            className="w-full py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none transition-all"
          >
            Add Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMedicalRecordModal;
