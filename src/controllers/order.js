/* eslint-disable linebreak-style */
/* eslint-disable consistent-return */
import Joi from '@hapi/joi';
import { orders, purchaseOrderSchema } from '../models/order';
import { cars } from '../models/car';

export const postOrder = (req, res) => {
  Joi.validate(req.body, purchaseOrderSchema).then(() => {
    const order = req.body;
    const carAva = cars.find(car => car.id === order.car_id);
    if (carAva) {
      order.buyer = req.user.id;
      if (carAva.owner.toString() === order.buyer.toString()) return res.status(422).send('cannot buy your own car');
      order.id = orders.length + 1;
      order.created_on = Date();
      order.status = 'pending';
      if (!order.price_offered) order.price_offered = req.body.price;
      orders.push(order);
      res.status(201).send(order);
    } else throw Error('car not found');
  }).catch((e) => {
    res.status(404).send({ err: 'Invalid post request', e });
  });
};

export const updateOrder = (req, res) => {
  if (req.query.price) {
    const { id } = req.params;
    const { price } = req.query;

    const purchaseOrder = orders.find(ord => (ord.id.toString() === id));
    if (purchaseOrder.buyer.toString() === req.user.id) {
      const orderIndex = orders.indexOf(purchaseOrder);
      orders[orderIndex].new_price_offered = price;
      const order = orders[orderIndex];
      res.status(200).send(order);
    } else res.status(404).send({ error: 'Purchase order not found' });
  }
};

export const getOrderById = (req, res) => {
  const { id } = req.params;
  const foundOrder = orders.find(order => order.id.toString() === id);
  if (req.user.id.toString() === foundOrder.buyer.toString()) {
    if (foundOrder) return res.status(200).send(foundOrder);
    res.status(404).send('order not found');
  }
  res.status(404).send('order Id not found');
};
