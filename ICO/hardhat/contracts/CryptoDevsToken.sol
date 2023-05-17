// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDevs.sol";

//inherit ERC20 and Ownable from Open Zeppelin
contract CryptoDevsToken is ERC20, Ownable {
   
    uint256 public constant tokenPrice = 0.001 ether; //designates price per token
    uint256 public constant tokensPerNFT = 10 * 10**18; //each nft is = to 10 tokens
    uint256 public constant maxTotalSupply = 10000 * 10**18; //max supply in the circulation
    ICryptoDevs CryptoDevsNFT; //initalize the interface to CryptoDevs NFT Collection
    mapping(uint256 => bool) public tokenIdsClaimed; //tracking the ids of the claimed tokens

    constructor(address _cryptoDevsSmartContract) ERC20("Crypto Dev Token", "CD") {
        CryptoDevsNFT = ICryptoDevs(_cryptoDevsSmartContract);
    }

    function mint (uint256 amount) public payable {
        uint256 _requiredAmount = tokenPrice + amount;
        uint256 amountWithDecimals = amount * 10**8; 

        require (msg.value >= _requiredAmount, "Not enough balance");
        require (amountWithDecimals + totalSupply() <= maxTotalSupply, "More than Maximum Total Supply");

        _mint(msg.sender, amountWithDecimals);
        

    }

   function claim() public {
        address sender = msg.sender;
        uint256 balance = CryptoDevsNFT.balanceOf(sender);
        require(balance > 0, "You don't own any Crypto Dev NFT");
        uint256 amount = 0;

        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = CryptoDevsNFT.tokenOfOwnerByIndex(sender, i);
            if (!tokenIdsClaimed[tokenId]) {
                amount++;
                tokenIdsClaimed[tokenId] = true;
            }
        }

        require(amount > 0, "You already claimed all the tokens");
        _mint(sender, amount * tokensPerNFT);
    }


    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "Nothing to withdraw, contract balance empty");
        
        address _owner = owner();
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    //deployed at 0xF96D32D80c5eB6bb8EB56BA4Fc421a87058A63E9


    // function withdraw() public onlyOwner {
    //     uint256 currentBalance = address(this).balance;
    //     require (currentBalance > 0, "Contract is empty" );
    //     address payable owner = payable(owner());
    //     bool sent = owner.send(currentBalance);
    //     require(sent, "Transfer not successful");

    // }   

    // function withdraw() public onlyOwner {
    //     uint256 currentBalance = address(this).balance;
    //     require (currentBalance > 0, "Contract is empty" );
    //     address payable owner = payable(owner());
    //     (bool success) = transfer(owner, currentBalance);
    //     require(success, "Transfer not successful");

    // }   
    
}