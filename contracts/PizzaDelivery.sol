// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title Sample Pizzaria Vending Machine
/// @author zZackz
/// @notice This generates fake pizza tokens
contract PizzaDelivery {
    // deployer of the contract
    address payable public owner;
    
    // map for storing tokens for different users 
    mapping(address => uint256) tokens;
    
    // this is called when contract is deployed and assigns the owner
    constructor() {
        owner = payable(msg.sender);
    }
    
    /// @notice "miniumum required Eth is 0.0005"
    error MinimumValue(); // custom error, used later

      /// @notice Mint tokens by sending ETH
    function mintTokens() external payable {
        // throws error, if the caller is owner
        require(msg.sender != owner, "cant mint tokens for the owner");
        
        // throws error if the Minimum value is less than 0.0005 ETH
        // We multiply 0.0005 by 10^18 because `msg.value` is
        // expressed in Wei, i.e 1 ETH = 10^18 Wei
        if (msg.value < 0.0005 * 10**18) {
            // using our custom error
            revert MinimumValue();
        }
        
        // calculating the number of tokens, 1 token costs 0.0005 ETH
        uint256 noOfTokens = msg.value / (0.0005 * 10**18);
        
        // return the remaining tokens if any
        uint256 remainingEth = msg.value % (0.0005 * 10**18);
        
        // transfer the ETH to owner account
        owner.transfer(msg.value - remainingEth);
        
        // return the remaining ETH to the caller account
        payable(msg.sender).transfer(remainingEth);
        
        // add the tokens to the caller account
        tokens[msg.sender] += noOfTokens;
    }

    /// @notice Gift `to` tokens to `address`
    /// @dev Transfers tokens to another user
    /// @param to The recipient address
    /// @param amount Amount of tokens to transfer
    function transferTokens(address to, uint256 amount) external {
        require(tokens[msg.sender] >= amount, "account balance is low");
        // send the tokens from one account to another
        tokens[msg.sender] -= amount;
        tokens[to] += amount;
    }

    /// @notice Fetch your token balance
    /// @dev Gets token balance of the calling address
    /// @return "Total tokens in the calling address"
    function getTokenBalance() external view returns (uint256) {
        return tokens[msg.sender];
    }

    /// @notice Purchase coffee with your tokens
    /// @dev Subtract total tokens from the user's account
    /// @param price number of tokens to subtract
    function purchaseCoffee(uint256 price) external {
        require(tokens[msg.sender] >= price, "account balance is low");
        tokens[msg.sender] -= price;
    }
}