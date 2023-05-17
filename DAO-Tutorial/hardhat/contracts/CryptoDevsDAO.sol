// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IFakeNFTMarketplace {
    function purchase(uint256 _tokenId) external payable;

    function getPrice() external view returns (uint256);

    function available(uint256 _tokenId) external view returns (bool);
}

interface ICryptoDevsNFT {
    function balanceOf(address owner) external view returns (uint256);

    function tokenOfOwnerByIndex(
        address owner,
        uint256 index
    ) external view returns (uint256);
}

contract CryptoDevsDAO is Ownable {
    //store Proposals
    struct Proposal {
        uint256 nftTokenId; //token id
        uint256 deadline; //deadline for the voting
        uint256 yesVotes; //counts number of yes votes
        uint256 noVotes; // counts number of no votes
        bool executed; //checks if the propsal is executed
        mapping(uint256 => bool) voters; //token id already voted
    }

    //add a mapping of proposal ids to the particular proposal
    mapping(uint256 => Proposal) public proposals;

    //enum that contains either yes or no
    enum Vote {
        Yes,
        No
    }

    //counter to count the number of proposals
    uint256 public numProposals;

    IFakeNFTMarketplace nftMarketplace;
    ICryptoDevsNFT cryptoDevsNFT;

    constructor(address _nftMarketplace, address _cryptoDevsNFT) payable {
        //Assign the address to the state variables nftMarketplace and cryptoDevsNFT
        nftMarketplace = IFakeNFTMarketplace(_nftMarketplace);
        cryptoDevsNFT = ICryptoDevsNFT(_cryptoDevsNFT);
    }

    //limit users to nft holders only
    modifier nftHolderOnly() {
        require(
            cryptoDevsNFT.balanceOf(msg.sender) > 0,
            "You are not a holder of crypto devs nft"
        );
        _;
    }

    //activeProposals only
    modifier activeProposalsOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline > block.timestamp,
            "Deadline exceeded"
        );
        _;
    }

    //inactiveProposals only
    modifier inactiveProposalsOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline <= block.timestamp,
            "Deadline not exceeded"
        );
        _;
        require(
            proposals[proposalIndex].executed == false,
            "Proposal already exacuted"
        );
        _;
    }

    //create a function to create a proposal
    function createProposal(
        uint256 _nftTokenId
    ) external nftHolderOnly returns (uint256) {
        //check if the nft is available
        require(nftMarketplace.available(_nftTokenId), "NFT not for sale");
        Proposal storage proposal = proposals[numProposals];
        proposal.nftTokenId = _nftTokenId;
        proposal.deadline = block.timestamp + 5 minutes; //open voting 5 minutes

        numProposals++;
        return numProposals - 1;
    }

    //a function to vote on proposal
    function voteOnProposal(
        uint256 proposalIndex,
        Vote vote
    ) external nftHolderOnly activeProposalsOnly(proposalIndex) {
        Proposal storage proposal = proposals[proposalIndex];

        uint256 voterNFTBalance = cryptoDevsNFT.balanceOf(msg.sender); //check how many nft user has
        uint numVotes = 0; //initialize user's number of votes to 0

        for (uint256 i = 0; i < voterNFTBalance; i++) {
            uint256 tokenId = cryptoDevsNFT.tokenOfOwnerByIndex(msg.sender, i);

            if (proposal.voters[tokenId] == false) {
                numVotes++;
                proposal.voters[tokenId] == true;
            }
        }
        require(numVotes > 0, "Already voted");

        if (vote == Vote.Yes) {
            proposal.yesVotes += numVotes;
        } else {
            proposal.noVotes += numVotes;
        }
    }

    function executeProposal(
        uint256 proposalIndex
    ) external nftHolderOnly activeProposalsOnly(proposalIndex) {
        Proposal storage proposal = proposals[proposalIndex];

        if (proposal.yesVotes > proposal.noVotes) {
            uint256 nftPrice = nftMarketplace.getPrice(); //0.1 ether
            require(address(this).balance >= nftPrice, "Not enough funds");
            nftMarketplace.purchase{value: nftPrice}(proposal.nftTokenId);
        }
        proposal.executed = true;
    }

    function withdrawEther() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "Nothing to withdraw");
        (bool sent, ) = payable(owner()).call{value: amount}("");
        require(sent, "Failed to withdraw");
    }

    receive() external payable {}

    fallback() external payable {}
}