// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AppointmentRegistry {
    enum AppointmentStatus { Requested, Approved, Declined }

    struct Appointment {
        uint id;
        address patient;
        address doctor;
        uint date;
        string reason;
        AppointmentStatus status;
    }

    mapping(uint => Appointment) public appointments; // Mapping of appointment ID to Appointment
    mapping(address => uint[]) public patientAppointments; // Patient's list of appointment IDs
    mapping(address => uint[]) public doctorAppointments; // Doctor's list of appointment IDs

    uint public nextAppointmentId;

    event AppointmentRequested(uint appointmentId, address patient, address doctor, uint date, string reason);
    event AppointmentApproved(uint appointmentId, address doctor);
    event AppointmentDeclined(uint appointmentId, address doctor);

    // Patient requests an appointment with a doctor at a certain date
    function requestAppointment(address doctor, uint date, string calldata reason) external {
        require(doctor != address(0), "Invalid doctor address");
        require(date > block.timestamp, "Date should be in the future");

        uint appointmentId = nextAppointmentId++;
        appointments[appointmentId] = Appointment({
            id: appointmentId,
            patient: msg.sender,
            doctor: doctor,
            date: date,
            reason: reason,
            status: AppointmentStatus.Requested
        });

        patientAppointments[msg.sender].push(appointmentId);
        doctorAppointments[doctor].push(appointmentId);

        emit AppointmentRequested(appointmentId, msg.sender, doctor, date, reason);
    }

    // Doctor approves an appointment
    function approveAppointment(uint appointmentId) external {
        Appointment storage appointment = appointments[appointmentId];
        require(msg.sender == appointment.doctor, "Only the doctor can approve this appointment");
        require(appointment.status == AppointmentStatus.Requested, "Appointment is not in 'Requested' status");

        appointment.status = AppointmentStatus.Approved;

        emit AppointmentApproved(appointmentId, msg.sender);
    }

    // Doctor declines an appointment
    function declineAppointment(uint appointmentId) external {
        Appointment storage appointment = appointments[appointmentId];
        require(msg.sender == appointment.doctor, "Only the doctor can decline this appointment");
        require(appointment.status == AppointmentStatus.Requested, "Appointment is not in 'Requested' status");

        appointment.status = AppointmentStatus.Declined;

        emit AppointmentDeclined(appointmentId, msg.sender);
    }

    // View all appointments for a specific patient
    function getPatientAppointments(address patient) external view returns (Appointment[] memory) {
        uint[] memory appointmentIds = patientAppointments[patient];
        Appointment[] memory result = new Appointment[](appointmentIds.length);

        for (uint i = 0; i < appointmentIds.length; i++) {
            result[i] = appointments[appointmentIds[i]];
        }

        return result;
    }

    // View all appointments for a specific doctor
    function getDoctorAppointments(address doctor) external view returns (Appointment[] memory) {
        uint[] memory appointmentIds = doctorAppointments[doctor];
        Appointment[] memory result = new Appointment[](appointmentIds.length);

        for (uint i = 0; i < appointmentIds.length; i++) {
            result[i] = appointments[appointmentIds[i]];
        }

        return result;
    }
}
