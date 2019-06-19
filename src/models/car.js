/* eslint-disable linebreak-style */
import Joi from '@hapi/joi';
import pool from '../../config/db_config';

export const cars = [
  {
    id: 1,
    owner: 1, // user id
    created_on: 'DateTime',
    state: 'new', // new,used
    status: 'available', // sold,available - default is available
    price: 150,
    manufacturer: 'Mazda',
    model: 'es1',
    body_type: 'van', // car, truck, trailer, van, etc
  },

];

export const carSchema = Joi.object().keys({
  state: Joi.string().valid(['new', 'used']).required().trim(),
  status: Joi.string().valid(['sold', 'available']).default('available').trim(),
  price: Joi.number().min(1).max(100000000000)
    .required(),
  manufacturer: Joi.string().trim(),
  model: Joi.string().required().trim(),
  body_type: Joi.string().required().trim(),
});

export const addNewCar = async (values) => {
  const result = await pool.query(`INSERT INTO cars(
    owner,
    state,
    status,
    price,
    manufacturer,
    model,
    body_type) VALUES($1,$2,$3,$4,$5,$6,$7) returning *`, values);
  return result;
};

export const getCarsBy = async (key, value) => {
  const result = await pool.query(`SELECT * FROM cars WHERE ${key}='${value}'`);
  if (result.rows.length === 0) return [];
  return result.rows;
};
export const getCarsMinMax = async (minPrice, maxPrice) => {
  const result = await pool.query(`SELECT * FROM cars WHERE status='available' AND price>='${minPrice}' AND price<='${maxPrice}'`);
  if (result.rows.length === 0) return [];
  return result.rows;
};

export const markSold = async (id) => {
  const result = await pool.query(`UPDATE cars SET status='sold' WHERE id='${id}'`);
  return result;
};

export const getCarId = async (id) => {
  const result = await pool.query(`SELECT * FROM cars WHERE id='${id}'`);
  if (result.rows.length === 0) return false;
  return result.rows[0];
};
