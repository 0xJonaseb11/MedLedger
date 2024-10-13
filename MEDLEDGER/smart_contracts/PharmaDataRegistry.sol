// spdx-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@opezeppelin/contracts/access/Ownable.sol";

contract PharmaDataRegistry {
    address public s_owner;
    enum UserRole {
        Manufacturer,
        Distributor,
        Retailer
    }

    struct Medicine {
        address manufacturer;
        string name;
        string batchNumber;
        uint256 manufacturingDate;
        uint256 expiryDate;
        uint256 price;
        uint256 quantity;
    }

    mapping( address => UserRole ) private userRoles;
    mapping( address => Medicine[]) private medicineRecords;

    // events to log to blockchain
    event MedicineManufactured(address indexed manufacturer, string batchNumber);
    event MedicineSold(address indexed seller, address indexed buyer, string batchNumber, uint256 quantity);
    event RoleUpdated(address indexed user, UserRole newRole);
    event OwnershipTransferred(address indexed from, address indexed to, string batchNumber);

    // constructor to initialize contract
    constructor() {
        s_owner = msg.sender;
        UserRoles[msg.sender] = UserRoles.Manufacturer;
    }

    // modifiers for access control
    modifier onlyOwner() {
        require(msg.sender == s_owner, "Only the caller can call this function!!");
        _;
    }
    
    modifier onlyManufacturer() {
        require(userRoles[msg.sender] == UserRole.Manufacturer, "Only the manufacturer can access this function!!");
        _;
    }

    modifier onlyDistributorOrRetailer() {
        require(
            userRoles[msg.sender] == UserRole.Distributor || userRoles[msg.sender] == UserRoles.Retailer,
            "Only distributors and retailers can access this function"
        );
        _;
    }

    // add user
    function addUser(address user, UserRole) external onlyOwner {
        userRoles[user] = role;
        emit RoleUpdated(user, role);
    }

    function updateUserRole(address user, UserRole newRole) external onlyOwner {
        require(user != s_owner, "You Cannot change owner's role");
        userRoles[user] = newRole;
        emit RoleUpdated(user, newRole);
    }

    // transfer ownership
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0));
    }
}
