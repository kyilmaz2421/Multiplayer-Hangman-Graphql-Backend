const { buildSchema } = require('graphql');
module.exports = buildSchema(`

type User {
    username: String
    id: ID
    error: String
}

type Query{
    isUserLoggedIn: User!
}

type Mutation {
    signUp(username: String!, password: String!): User!
    login(username: String!, password: String!): User!
    logout(_id: ID!): User!
}

`);