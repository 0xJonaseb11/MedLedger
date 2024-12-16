// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract PatientRegistry {
    struct MedicalRecord {
        string recordType;
        string description;
        string date;
        string doctorName;
    }

    struct MedicalRecordData {
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
        string allergies;
        string insurance;
        bool isRegistered;
    }
    
    struct Doctor {
        string name;
        string specialization;
        bool isRegistered;
    }

    struct DoctorDetails {
        address doctorAddress;
        string name;
        string specialization;
    }

    struct PatientDetails {
        address patientAddress;
        string name;
        uint256 age;
        string phone;
        string email;
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

    // Register the patient with basic info (step 1)
    function registerPatient(
        string memory _name,
        uint256 _age,
        string memory _phone,
        string memory _email
    ) public {
        require(!patients[msg.sender].isRegistered, "Patient is already registered.");

        Patient storage newPatient = patients[msg.sender];
        newPatient.name = _name;
        newPatient.age = _age;
        newPatient.phone = _phone;
        newPatient.email = _email;
        newPatient.medicalHistorySize = 0;
        newPatient.isRegistered = true;

        emit PatientRegistered(msg.sender, _name, _age);
    }

    // Register a doctor with their name and specialization
    function registerDoctor(string memory _name, string memory _specialization) public {
        require(!doctors[msg.sender].isRegistered, "Doctor is already registered.");

        doctors[msg.sender] = Doctor({
            name: _name,
            specialization: _specialization,
            isRegistered: true
        });

        emit DoctorRegistered(msg.sender, _name, _specialization);
    }

    // Complete registration by adding medical history (step 2)
    function completeRegistration(string memory _allergies, string memory _insurance) public {
        require(patients[msg.sender].isRegistered, "Patient must register basic info first.");
        Patient storage patient = patients[msg.sender];
        patient.allergies = _allergies;
        patient.insurance = _insurance;
        emit HealthDetailsUpdated(msg.sender, _allergies, _insurance);
    }

    // Check if the specified address is registered as a patient
    function isPatientRegistered(address patientAddress) public view returns (bool) {
        bool registeredStatus = patients[patientAddress].isRegistered;
        return registeredStatus;
    }

    // Check if the specified address is registered as a doctor
    function isDoctorRegistered(address doctorAddress) public view returns (bool) {
        bool registeredStatus = doctors[doctorAddress].isRegistered;
        return registeredStatus;
    }

    // Function to add a medical record for a patient by an authorized doctor
    function addMedicalRecord(
        address patientAddress,
        string memory _recordType,
        string memory _description,
        string memory _date,
        string memory _doctorName
    ) public {
        // Ensure the patient is registered
        require(patients[patientAddress].isRegistered, "Patient is not registered.");

        // Ensure the doctor is registered and has permission
        require(doctors[msg.sender].isRegistered, "You must be a registered doctor to add records.");
        require(doctorPermissions[patientAddress][msg.sender], "Doctor does not have permission to add records for this patient.");

        // Access the patient's storage and add a new medical record
        Patient storage patient = patients[patientAddress];
        uint256 recordIndex = patient.medicalHistorySize;

        // Add the new medical record
        patient.medicalHistory[recordIndex] = MedicalRecord({
            recordType: _recordType,
            description: _description,
            date: _date,
            doctorName: _doctorName
        });
        patient.medicalHistorySize++; // Update the size of the medical history

        // Emit an event for the new medical record
        emit MedicalRecordAdded(patientAddress, _recordType, _description);
    }

    // Grant access to a doctor and add to the list
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

    // Revoke access from a doctor and remove from the list
    function revokeAccess(address _doctor) public {
        require(patients[msg.sender].isRegistered, "Patient is not registered.");
        require(doctorPermissions[msg.sender][_doctor], "Access not granted.");

        doctorPermissions[msg.sender][_doctor] = false;

        // Remove doctor from the patient's granted list
        for (uint i = 0; i < grantedDoctors[msg.sender].length; i++) {
            if (grantedDoctors[msg.sender][i] == _doctor) {
                grantedDoctors[msg.sender][i] = grantedDoctors[msg.sender][grantedDoctors[msg.sender].length - 1];
                grantedDoctors[msg.sender].pop();
                break;
            }
        }

        // Remove patient from the doctor's accessible list
        for (uint i = 0; i < accessiblePatients[_doctor].length; i++) {
            if (accessiblePatients[_doctor][i] == msg.sender) {
                accessiblePatients[_doctor][i] = accessiblePatients[_doctor][accessiblePatients[_doctor].length - 1];
                accessiblePatients[_doctor].pop();
                break;
            }
        }

        emit AccessRevoked(msg.sender, _doctor);
    }

    // Function to get the list of doctors with access
    function getGrantedDoctorsWithDetails(address patientAddress) public view returns (DoctorDetails[] memory) {
        require(patients[patientAddress].isRegistered, "Patient is not registered.");

        address[] memory doctorAddresses = grantedDoctors[patientAddress];
        DoctorDetails[] memory details = new DoctorDetails[](doctorAddresses.length);

        for (uint i = 0; i < doctorAddresses.length; i++) {
            address docAddr = doctorAddresses[i];
            details[i] = DoctorDetails({
                doctorAddress: docAddr,
                name: doctors[docAddr].name,
                specialization: doctors[docAddr].specialization
            });
        }

        return details;
    }

    // Get basic patient info for the caller
    function getPatientInfo(address patientAddress) public view returns (
        string memory name,
        uint256 age,
        string memory phone,
        string memory email
    ) {
        require(patients[patientAddress].isRegistered, "Patient is not registered.");

        // Use storage to directly access stored data
        Patient storage patient = patients[patientAddress];
        return (patient.name, patient.age, patient.phone, patient.email);
    }

    // Get doctor's own details
    function getDoctorDetails(address doctorAddress) public view returns (string memory, string memory) {
        require(doctors[doctorAddress].isRegistered, "Doctor is not registered.");
        Doctor memory doc = doctors[doctorAddress];
        return (doc.name, doc.specialization);
    }

    // function to get list of patients who have granted access to the doctor
    function getAccessiblePatientsWithDetails(address doctorAddress) public view returns (PatientDetails[] memory) {
        require(doctors[doctorAddress].isRegistered, "Doctor is not registered.");

        address[] memory patientAddresses = accessiblePatients[doctorAddress];
        uint accessibleCount = 0;

        // First pass: count accessible patients
        for (uint i = 0; i < patientAddresses.length; i++) {
            if (doctorPermissions[patientAddresses[i]][doctorAddress]) {
                accessibleCount++;
            }
        }

        // Initialize the array with the exact accessible count
        PatientDetails[] memory details = new PatientDetails[](accessibleCount);
        uint index = 0;

        // Second pass: populate details with accessible patients
        for (uint i = 0; i < patientAddresses.length; i++) {
            address patientAddr = patientAddresses[i];
            if (doctorPermissions[patientAddr][doctorAddress]) {
                // Access each field of the Patient struct directly from storage
                Patient storage patient = patients[patientAddr];
                details[index] = PatientDetails({
                    patientAddress: patientAddr,
                    name: patient.name,
                    age: patient.age,
                    phone: patient.phone,
                    email: patient.email
                });
                index++;
            }
        }

        return details;
    }

    // Function to get the medical history of a specified address
    function getPatientMedicalHistory(address patientAddress)public view
        returns (MedicalRecordData[] memory)
    {
        require(patients[patientAddress].isRegistered, "Patient is not registered.");

        uint256 historyLength = patients[patientAddress].medicalHistorySize; // Use medicalHistorySize instead of length
        MedicalRecordData[] memory historyData = new MedicalRecordData[](historyLength);

        for (uint256 i = 0; i < historyLength; i++) {
            MedicalRecord storage record = patients[patientAddress].medicalHistory[i];
            historyData[i] = MedicalRecordData(
                record.recordType,
                record.description,
                record.date,
                record.doctorName
            );
        }

        return historyData;
    }

     // Function to retrieve personal health details (allergies and insurance)
    function getPersonalHealthDetails(address patientAddress) public view returns (string memory, string memory) {
        require(patients[patientAddress].isRegistered, "Patient is not registered.");
        
        Patient storage patient = patients[patientAddress];
        return (patient.allergies, patient.insurance);
    }

    // Get the entire medical history of a patient if access is granted
    function getMedicalHistory(address _patient)public view
        returns (
            string[] memory recordTypes,
            string[] memory descriptions,
            string[] memory dates,
            string[] memory doctorNames
        )
    {
        require(
            msg.sender == _patient || doctorPermissions[_patient][msg.sender],
            "Not authorized to access this patient's medical history."
        );

        uint256 historyLength = patients[_patient].medicalHistorySize; // Use medicalHistorySize instead of length

        // Initialize arrays to store each field from MedicalRecord
        recordTypes = new string[](historyLength);
        descriptions = new string[](historyLength);
        dates = new string[](historyLength);
        doctorNames = new string[](historyLength);

        for (uint256 i = 0; i < historyLength; i++) {
            MedicalRecord storage record = patients[_patient].medicalHistory[i];
            recordTypes[i] = record.recordType;
            descriptions[i] = record.description;
            dates[i] = record.date;
            doctorNames[i] = record.doctorName;
        }
    }
}
