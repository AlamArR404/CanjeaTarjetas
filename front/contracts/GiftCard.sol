// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GiftCard {
    address public owner;
    uint256 public cardsCount;
    mapping(uint256 => bool) public cards;
    mapping(uint256 => CardData) public cardData;

    event CardCreated(uint256 cardId, string email, string country, string phone, uint256 monto, string concepto);
    event CardRedeemed(uint256 cardId);

    struct CardData {
        string email;
        string country;
        string phone;
        uint256 monto;
        string concepto;
        bool redeemed;
    }

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function createCard(
        uint256 cardId,
        string memory email,
        string memory country,
        string memory phone,
        uint256 monto,
        string memory concepto
    ) external onlyOwner {
        require(!cards[cardId], "Card already exists");
        cards[cardId] = true;
        cardData[cardId] = CardData(email, country, phone, monto, concepto, false);
        cardsCount++;
        emit CardCreated(cardId, email, country, phone, monto, concepto);
    }

    function redeemCard(uint256 cardId) external {
        require(cards[cardId], "Card does not exist");
        require(!isCardRedeemed(cardId), "Card already redeemed");
        cards[cardId] = false;
        cardData[cardId].redeemed = true;
        emit CardRedeemed(cardId);
    }

    function isCardRedeemed(uint256 cardId) public view returns (bool) {
        return cardData[cardId].redeemed;
    }

    function getCardsCount() external view returns (uint256) {
        return cardsCount;
    }

    function getCardIdAtIndex(uint256 index) external view returns (uint256) {
        require(index < cardsCount, "Index out of bounds");
        uint256 count = 0;
        for (uint256 i = 0; i < cardsCount; i++) {
            if (cards[i]) {
                if (count == index) {
                    return i;
                }
                count++;
            }
        }
        revert("Index not found");
    }

    function getCardData(uint256 cardId) external view returns (CardData memory) {
        require(cards[cardId], "Card does not exist");
        return cardData[cardId];
    }

    function getAllCards() external view returns (CardData[] memory) {
        CardData[] memory allCards = new CardData[](cardsCount);

        uint256 currentIndex = 0;
        for (uint256 i = 0; i < cardsCount; i++) {
            if (cards[i]) {
                allCards[currentIndex] = cardData[i];
                currentIndex++;
            }
        }

        return allCards;
    }
}