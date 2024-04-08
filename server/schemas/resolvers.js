const { User, Book } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async () => {
      return User.find();
    }
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email, password });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(user);

      return { token, user };
    },
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { savedBook }, context) => {
      const user = context.user;

      if (!user) {
        throw AuthenticationError;
      }
      const updatedUser = await User.findByIdAndUpdate(
        { _id: user._id },
        { $push: { savedBooks: savedBook } },
        { new: true }
      );
      return updatedUser;
    },
    removeBook: async (parent, { bookId }, context) => {
      const user = context.user;

      if (!user) {
        throw AuthenticationError;
      }

      const updatedUser = await User.findByIdAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId }}},
        { new: true }
      );
      return updatedUser;
    }

  }
};

module.exports = resolvers;
