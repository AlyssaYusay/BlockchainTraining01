// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//Decentralized Exchange (DEX)

contract Exchange is ERC20 {
    //1 state variable - SC address of CryptoDevsToken
    address public cryptoDevsTokenAddress;

    //constructor that takes the address of the crypto devs as parameter
    //assign it to the state variable cryptoDevsTokenAddress
    //make sure that the address inputed in the constructor during deployed will
    //not be address 0

    constructor(
        address _cryptoDevsTokenAddress
    ) ERC20("CryptoDev LP Token", "CDLP") {
        require(_cryptoDevsTokenAddress != address(0), "Invalid token address");
        cryptoDevsTokenAddress = _cryptoDevsTokenAddress;
    }

    //create a function to get the reserved amount cryptodevs token held in this SC
    function getReserve() public view returns (uint256) {
        return ERC20(cryptoDevsTokenAddress).balanceOf(address(this));
    }

    //create a function to add liquidity to the exchange
    function addLiquidity(uint256 _amount) public payable returns (uint256) {
        uint liquidity; //initialized to 0
        uint ethBalance = address(this).balance; //balance of the contract
        uint cryptoDevsTokenReserve = getReserve(); //reserve of the CD tokens
        ERC20 cryptoDevsToken = ERC20(cryptoDevsTokenAddress);

        if (cryptoDevsTokenReserve == 0) {
            cryptoDevsToken.transferFrom(msg.sender, address(this), _amount);
            liquidity = ethBalance;
            _mint(msg.sender, liquidity);
        } else {
            uint ethReserve = ethBalance - msg.value;
            uint cryptoDevsTokenAmount = (msg.value * cryptoDevsTokenReserve) /
                (ethReserve);
            require(
                _amount >= cryptoDevsTokenAmount,
                "Token amount less than required minimum"
            );
            cryptoDevsToken.transferFrom(
                msg.sender,
                address(this),
                cryptoDevsTokenAmount
            );
            liquidity = (totalSupply() * msg.value) / ethReserve;
            _mint(msg.sender, liquidity);
        }

        return liquidity;
    }

    function removeLiquidity(uint _amount) public returns (uint, uint) {
        require(_amount > 0, "amount should be greater than 0");
        uint ethReserve = address(this).balance;
        uint _totalSupply = totalSupply(); //total supply of TOKEN

        //ether to be returned to user
        uint ethAmount = (ethReserve * _amount) / _totalSupply;

        //token that will be returned to the reserve
        uint cryptoDevsTokenAmount = (getReserve() * _amount) / _totalSupply;

        _burn(msg.sender, _amount);

        payable(msg.sender).transfer(ethAmount);

        ERC20(cryptoDevsTokenAddress).transfer(
            msg.sender,
            cryptoDevsTokenAmount
        );

        return (ethAmount, cryptoDevsTokenAmount);
    }

    function getAmountOfTokens(
        uint inputAmount,
        uint inputReserve,
        uint outputReserve
    ) public pure returns (uint) {
        require(inputReserve > 0 && outputReserve > 0, "ivalid reserves");
        uint256 inputAmountWithFee = inputAmount * 99;
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 100) + inputAmountWithFee;
        return numerator / denominator;
    }

    function ethToCryptoDevsToken(uint _minTokens) public payable {
        uint256 tokenReserve = getReserve(); //get token reserve of smart contract
        uint256 tokensBought = getAmountOfTokens(
            msg.value, //input amount
            address(this).balance - msg.value, //reserved amount in the smart contract
            tokenReserve // output reserve
        );

        require(tokensBought >= _minTokens, "insufficient output amount");

        ERC20(cryptoDevsTokenAddress).transfer(msg.sender, tokensBought);
    }

    function cryptoDevsTokenToEth(uint _tokensSold, uint _minEth) public {
        uint256 tokenReserve = getReserve(); // get token reserve of smart contract
        uint256 ethBought = getAmountOfTokens(
            _tokensSold, // is the token you want to sell back to the contract
            tokenReserve, // reserve in the contract
            address(this).balance // outout reserve
        );
        require(ethBought >= _minEth, "insufficient output amount");
        ERC20(cryptoDevsTokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokensSold
        );

        payable(msg.sender).transfer(ethBought);
    }
}
