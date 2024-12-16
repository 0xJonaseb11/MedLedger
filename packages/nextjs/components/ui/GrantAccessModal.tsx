import React, { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

interface GrantAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrantAccessModal: React.FC<GrantAccessModalProps> = ({ isOpen, onClose }) => {
  const [doctorAddress, setDoctorAddress] = useState("");

  // Initialize write functions for the contract
  const { writeContractAsync: writeToPatientRegistry } = useScaffoldWriteContract("PatientRegistry");

  const handleGrantAccess = async () => {
    try {
      await writeToPatientRegistry({
        functionName: "grantAccess",
        args: [doctorAddress],
      });
      console.log("Access granted to doctor!");
      onClose();
    } catch (error) {
      console.error("Error granting access:", error);
    }
  };

  const handleRevokeAccess = async () => {
    try {
      await writeToPatientRegistry({
        functionName: "revokeAccess",
        args: [doctorAddress],
      });
      console.log("Access revoked from doctor!");
      onClose();
    } catch (error) {
      console.error("Error revoking access:", error);
    }
  };

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Manage Doctor Access</h3>
        <input
          type="text"
          placeholder="Doctor's Address"
          className="input input-bordered w-full my-2"
          value={doctorAddress}
          onChange={e => setDoctorAddress(e.target.value)}
        />
        <div className="modal-action">
          <button className="btn btn-primary" onClick={handleGrantAccess}>
            Grant Access
          </button>
          <button className="btn btn-warning" onClick={handleRevokeAccess}>
            Revoke Access
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
