// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Privapass {
    string public name = "Privasetu Identity";

    //maps a Zk-nullifier to "true" is they already used their nullifier id
    mapping(uint256 => bool) public hasVerified;

    //allow your frontend to see when it done
    event Verified(uint256 indexed nullifier, uint256 timestamp);

    //this is work for verification function
    //the api call this function
    function verifyUser(uint256 _nullifier) external {

        //if id exist in mapping, then revert the transaction
        require(!hasVerified[_nullifier],"Indentity already used..!");

        //mark as used
        hasVerified[_nullifier] = true;
        emit Verified(_nullifier, block.timestamp);
    }
}
