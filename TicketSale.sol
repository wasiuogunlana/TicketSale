// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract TicketSale {
    address public owner;
    uint public ticketPrice;
    uint public totalTickets;
    uint public serviceFee;
    
    enum TicketStatus { Unsold, Sold, Available }
    mapping(uint => TicketStatus) public ticketStatus;
    mapping(address => uint) public ticketOf;
    
    struct SwapOffer {
        address offerer;
        uint ticketToSwap;
    }

    SwapOffer public swap;
    address exchange;
    
    mapping(address => SwapOffer) public swapOffers;
    
    constructor(uint numTickets, uint price)  {
        owner = msg.sender;
        totalTickets = numTickets;
        ticketPrice = price;
        serviceFee = price / 10; 
        for (uint i = 1; i <= numTickets; i++) {
            ticketStatus[i] = TicketStatus.Available;
        }
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can carry out this request");
        _;
    }
    
    function buyTicket(uint ticketId) public payable {
        require(ticketStatus[ticketId] == TicketStatus.Available, "Ticket is not available");
        require(msg.value >= ticketPrice, "Insufficient payment");
        
        ticketStatus[ticketId] = TicketStatus.Sold;
        ticketOf[msg.sender] = ticketId;
        totalTickets -= 1;
        (bool success,)= payable(owner).call{value: ticketPrice}("");
        require(success, "transfer failed");
  
    }
    
    function getTicketOf(address person) public view returns (uint) {
        return ticketOf[person];
    }
    
   function offerSwap(address partner) public {
        require(ticketOf[msg.sender] > 0, "You do not own a ticket to offer");
        require(ticketOf[partner] > 0, "The partner does own a ticket");
        
        exchange=partner;
    }
    
    function acceptSwap(address partner) public {
        uint myTicket = ticketOf[msg.sender];
        uint partnerTicket = ticketOf[partner];
        
       require(exchange == msg.sender, "Invalid swap offer");
        
        ticketOf[msg.sender] = partnerTicket;
        ticketOf[partner] = myTicket;
        exchange = address (0);
    }
    
    function returnTicket(address partner) public payable{
        require(ticketOf[partner] > 0, "You do not own a ticket to offer");
        
        ticketStatus[ticketOf[partner]] = TicketStatus.Available;
        
      uint getRefund = ticketPrice - serviceFee;
        (bool success,)= payable(owner).call{value:getRefund}("");
        ticketOf[partner] = 0;
    }
}

