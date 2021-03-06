/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { signUnSchema, addNewUser } from '../../models/user';
import { getBy } from '../../models/index';

const { SECRET } = process.env;
export const getUserById = async ({ id }, req) => {
  const foundUser = await getBy('users', 'id', id);
  if (!foundUser) {
    const error = new Error('User not found');
    error.code = 404;
    throw error;
  }
  const userPosts = await getBy('projects', 'owner', foundUser[0].id);
  foundUser[0].projects = userPosts;
  return { ...foundUser[0], _id: foundUser[0].id.toString() };
};

export const createUserFunc = async ({ userInput }, req) => {
  let message;
  try {
    let {
      first_name,
      last_name,
      email,
      address,
      password,
      phone_number,
      nationality,
    } = userInput;
    await signUnSchema.validateAsync(userInput);

    first_name = first_name.trim();
    address = address.trim();
    last_name = last_name.trim();
    phone_number = phone_number.trim();
    nationality = nationality.trim();
    email = email.trim();
    password = password.trim();

    const foundUser = await getBy('users', 'email', email);
    if (foundUser.length > 0) {
      // const error = new Error('User already exists');

      const error = new Error('Conflict Error');
      error.code = 409;
      throw error;
    }

    const hashPassword = await bcrypt.hash(password, 8);
    const values = [
      first_name,
      last_name,
      email,
      phone_number,
      nationality,
      address,
      hashPassword,
    ];
    const createdUser = await addNewUser(values);
    return createdUser;
  } catch (e) {
    if (e.isJoi) {
      const error = new Error('Invalid input');
      error.data = { message: e.details[0].message };
      error.code = 422;
      throw error;
    }
    if (e.code === 409) {
      e.data = {
        message: 'User already exists',
      };
      throw e;
    }
    throw e;
  }
};

export const loginUser = async ({ email, password }, req) => {
  try {
    const error = new Error('Incorrect credentials');
    error.code = 403;
    const foundUser = await getBy('users', 'email', email);
    if (!foundUser) {
      throw error;
    }
    const result = bcrypt.compareSync(password, foundUser[0].password);
    if (!result) {
      throw error;
    }
    const token = jwt.sign({ email }, SECRET, { expiresIn: '3h' });

    return {
      token,
      email,
      userId: foundUser[0].id,
    };
  } catch (e) {
    if (e.isJoi) {
      const error = new Error('Invalid input');
      error.data = { message: e.details[0].message };
      error.code = 422;
      throw error;
    }
    if (e.code === 403) {
      const error = new Error('Invalid input');
      error.data = { message: e.message };
      error.code = 403;
      throw error;
    }
    throw e;
  }
};
