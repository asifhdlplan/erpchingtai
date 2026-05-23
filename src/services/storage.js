export const STORAGE_KEY = 'erp_orders_data';

export const storageService = {
  saveOrder: (order) => {
    const orders = storageService.getAllOrders();
    if (order.id) {
      const index = orders.findIndex(o => o.id === order.id);
      if (index !== -1) {
        orders[index] = order;
      } else {
        orders.push(order);
      }
    } else {
      const newOrder = { ...order, id: Date.now().toString() };
      orders.push(newOrder);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      return newOrder;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    return order;
  },

  getAllOrders: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  deleteOrder: (id) => {
    const orders = storageService.getAllOrders().filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  },

  getOrderById: (id) => {
    const orders = storageService.getAllOrders();
    return orders.find(o => o.id === id);
  }
};
