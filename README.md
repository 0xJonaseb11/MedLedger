
# MedRecordChain

MedRecordChain is a decentralized platform for managing patient medical records and appointments using blockchain technology. It allows patients to securely store their health data on the blockchain and grants permission-based access to doctors. Built on [Scaffold-ETH](https://github.com/scaffold-eth/scaffold-eth-2), this project ensures transparency and patient control over sensitive medical information.

## ✨ Features

- **Decentralized Storage**: Patients can store their medical records securely on the blockchain, ensuring data integrity and privacy.
- **Permission-Based Access**: Only doctors granted explicit permission by a patient can access or add to that patient's medical records.
- **Appointment Booking System**: Patients can book appointments, and doctors have the option to approve or decline each request.
- **Transparent Record of Access**: Patients have a transparent view of who has access to their data and can revoke access as needed.

## 🛠 Tech Stack

- **Frontend**: React, Next.js, TypeScript
- **Backend**: Solidity smart contracts deployed on Ethereum
- **Blockchain Framework**: Scaffold-ETH for development and deployment
- **Wallet Integration**: MetaMask, WalletConnect via `wagmi`

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/)
- [MetaMask](https://metamask.io/) or any Web3 wallet
- [Vercel CLI](https://vercel.com/docs/cli) (for deployment)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/medrecordchain.git
   cd medrecordchain
   ```
2. **Install Dependencies**:
   ```bash
   yarn install
   ```
3. **Start Scaffold-ETH**:
   ```bash
   yarn chain
   yarn deploy
   ```
4. **Run the Development Server**:
   ```bash
   yarn dev
   ```
  
## 🎯 Usage

### For Patients

- **Register**: Patients can register their basic information on the platform.
- **Grant Access**: Patients can grant permission to specific doctors to access their medical records.
- **Book Appointments**: Patients can book appointments with doctors who are registered on the platform.
- **Revoke Access**: Patients can revoke previously granted access to their medical records.
- **View Medical Records**: Patients can view a history of their medical records.

### For Doctors

- **Register**: Doctors can register their profile and specialization on the platform.
- **View Patient Data**: With patient-granted permission, doctors can view the patient's medical history.
- **Add Medical Records**: Doctors with access can add new medical records for the patient.
- **Approve Appointments**: Doctors can view and approve or decline appointment requests from patients.

## 📜 Smart Contracts

MedRecordChain is built with Solidity smart contracts, handling the core functionality of record management and appointment booking:

- **PatientRegistry**: Manages patient data and permissions.
- **DoctorRegistry**: Handles doctor registration and access control.
- **AppointmentRegistry**: Manages appointment bookings and approvals.

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repo and create a pull request. Make sure to test any changes thoroughly before submitting.

1.  **Fork the Repository**
2.  **Create a Branch** (`git checkout -b feature/your-feature`)
3.  **Commit Changes** (`git commit -m 'Add new feature'`)
4.  **Push to Branch** (`git push origin feature/your-feature`)
5.  **Open a Pull Request**