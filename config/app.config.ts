const AppConst: AppConstType = {
  raffleDbCollection: "raffles",
  inventoryDbCollection: "inventory",
  raffleTicket: "raffle_tickets",
};

interface AppConstType {
  raffleDbCollection: string;
  inventoryDbCollection: string;
  raffleTicket: string;
}

export default AppConst;
