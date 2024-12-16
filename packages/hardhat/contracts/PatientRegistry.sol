// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";


interface IAccountAbstraction {
    function execute(address to, uint256 value, bytes calldata data) external returns (bool success);
}

contract PatientRegistry is Ownable {
    using ECDSA for bytes32;

    struct MedicalRecord {
        string recordType;
        string description;
        string date;
        string doctorName;
    }

    struct PersonalHealthDetails {
        string allergies;
        string insurance;
    }

    struct Patient {
        string name;
        uint256 age;
        string phone;
        string email;
        mapping(uint256 => MedicalRecord) medicalHistory;
        uint256 medicalHistorySize;
        PersonalHealthDetails personalDetails;
        bool isRegistered;
    }

    struct Doctor {
        string name;
        string specialization;
        bool isRegistered;
    }

    mapping(address => Patient) public patients;
    mapping(address => Doctor) public doctors;
    mapping(address => mapping(address => bool)) private doctorPermissions;
    mapping(address => address[]) private grantedDoctors;
    mapping(address => address[]) private accessiblePatients;

    // Events
    event PatientRegistered(address patientAddress, string name, uint256 age);
    event DoctorRegistered(address doctorAddress, string name, string specialization);
    event HealthDetailsUpdated(address patientAddress, string phone, string email);
    event AccessGranted(address patientAddress, address doctorAddress);
    event AccessRevoked(address patientAddress, address doctorAddress);
    event MedicalRecordAdded(address indexed patientAddress, string recordType, string description);

    // Contract owner or relayer can execute on behalf of users
    function executeOnBehalf(
        address to,
        uint256 value,
        bytes calldata data,
        bytes calldata signature
    ) public {
        // Validate signature
        address signer = recoverSigner(to, value, data, signature);
        require(signer == to, "Invalid signature");

        // Call the execute function of the abstract account (smart contract wallet)
        IAccountAbstraction(signer).execute(to, value, data);
    }

    // Utility function to recover signer from the signature
    function recoverSigner(
        address to,
        uint256 value,
        bytes calldata data,
        bytes calldata signature
    ) internal pure returns (address) {
        bytes32 hash = keccak256(abi.encodePacked(to, value, data));
        return hash.toEthSignedMessageHash().recover(signature);
    }

    // Register a patient
    function registerPatient(
        string memory _name,
        uint256 _age,
        string memory _phone,
        string memory _email
    ) public {
        require(!patients[msg.sender].isRegistered, "Patient already registered.");

        Patient storage newPatient = patients[msg.sender];
        newPatient.name = _name;
        newPatient.age = _age;
        newPatient.phone = _phone;
        newPatient.email = _email;
        newPatient.medicalHistorySize = 0;
        newPatient.isRegistered = true;

        emit PatientRegistered(msg.sender, _name, _age);
    }

    // Register a doctor
    function registerDoctor(string memory _name, string memory _specialization) public {
        require(!doctors[msg.sender].isRegistered, "Doctor already registered.");

        doctors[msg.sender] = Doctor({
            name: _name,
            specialization: _specialization,
            isRegistered: true
        });

        emit DoctorRegistered(msg.sender, _name, _specialization);
    }

    // Grant access to doctor for patient
    function grantAccess(address _doctor) public {
        require(patients[msg.sender].isRegistered, "Patient is not registered.");
        require(doctors[_doctor].isRegistered, "Doctor is not registered.");

        if (!doctorPermissions[msg.sender][_doctor]) {
            doctorPermissions[msg.sender][_doctor] = true;
            grantedDoctors[msg.sender].push(_doctor);
            accessiblePatients[_doctor].push(msg.sender);
            emit AccessGranted(msg.sender, _doctor);
        }
    }

    // Revoke access from doctor
    function revokeAccess(address _doctor) public {
        require(patients[msg.sender].isRegistered, "Patient is not registered.");
        require(doctorPermissions[msg.sender][_doctor], "Access not granted.");

        doctorPermissions[msg.sender][_doctor] = false;

        // Remove doctor from granted list
        for (uint i = 0; i < grantedDoctors[msg.sender].length; i++) {
            if (grantedDoctors[msg.sender][i] == _doctor) {
                grantedDoctors[msg.sender][i] = grantedDoctors[msg.sender][grantedDoctors[msg.sender].length - 1];
                grantedDoctors[msg.sender].pop();
                break;
            }
        }

        // Remove patient from accessible list
        for (uint i = 0; i < accessiblePatients[_doctor].length; i++) {
            if (accessiblePatients[_doctor][i] == msg.sender) {
                accessiblePatients[_doctor][i] = accessiblePatients[_doctor][accessiblePatients[_doctor].length - 1];
                accessiblePatients[_doctor].pop();
                break;
            }
        }

        emit AccessRevoked(msg.sender, _doctor);
    }

    // Add medical record
    function addMedicalRecord(
        address patientAddress,
        string memory _recordType,
        string memory _description,
        string memory _date,
        string memory _doctorName
    ) public {
        require(patients[patientAddress].isRegistered, "Patient not registered.");
        require(doctors[msg.sender].isRegistered, "Doctor not registered.");
        require(doctorPermissions[patientAddress][msg.sender], "Doctor not authorized.");

        Patient storage patient = patients[patientAddress];
        uint256 recordIndex = patient.medicalHistorySize;

        patient.medicalHistory[recordIndex] = MedicalRecord({
            recordType: _recordType,
            description: _description,
            date: _date,
            doctorName: _doctorName
        });
        patient.medicalHistorySize++;

        emit MedicalRecordAdded(patientAddress, _recordType, _description);
    }
    
    // Get patient information
    function getPatientInfo(address patientAddress) public view returns (string memory name, uint256 age, string memory phone, string memory email) {
        require(patients[patientAddress].isRegistered, "Patient not registered.");
        Patient storage patient = patients[patientAddress];
        return (patient.name, patient.age, patient.phone, patient.email);
    }
}
