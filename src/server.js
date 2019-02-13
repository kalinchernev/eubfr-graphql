import "@babel/polyfill";
require("dotenv").config();

import AWS from "aws-sdk";

import elasticsearch from "elasticsearch";
import connectionClass from "http-aws-es";
import { GraphQLSchema, GraphQLObjectType } from "graphql";
import { composeWithElastic } from "graphql-compose-elasticsearch";
import { ApolloServer } from "apollo-server";

import getProjectMapping from "./mappings/project";

const projectMapping = getProjectMapping();

const {
  ES_INDEX,
  ES_TYPE,
  HOST: host,
  REGION: region,
  SECRET_ID
} = process.env;

AWS.config.update({ region });

(async () => {
  const secretsManager = new AWS.SecretsManager();
  const secretsResponse = await secretsManager
    .getSecretValue({ SecretId: SECRET_ID })
    .promise();

  const secrets = JSON.parse(secretsResponse.SecretString);

  const {
    AWS_ACCESS_KEY_ID: accessKeyId,
    AWS_SECRET_ACCESS_KEY: secretAccessKey
  } = secrets;

  const elasticClient = new elasticsearch.Client({
    host,
    trace: true,
    connectionClass,
    apiVersion: "6.3",
    awsConfig: new AWS.Config({
      region,
      accessKeyId,
      secretAccessKey
    })
  });

  const ProjectTC = composeWithElastic({
    apiVersion: "6.3",
    graphqlTypeName: "Project",
    elasticIndex: ES_INDEX,
    elasticType: ES_TYPE,
    elasticMapping: projectMapping.mappings.project,
    elasticClient,
    pluralFields: [
      "ec_priorities",
      "media",
      "project_locations",
      "related_links",
      "themes",
      "third_parties",
      "type"
    ]
  });

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: "Query",
      fields: {
        projectById: ProjectTC.getResolver("findById").getFieldConfig(),
        projects: ProjectTC.getResolver("search").getFieldConfig(),
        projectsPagination: ProjectTC.getResolver(
          "searchPagination"
        ).getFieldConfig()
      }
    })
  });

  const server = new ApolloServer({
    schema,
    introspection: true,
    tracing: true
  });

  // Default port of EB.
  // @read: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/nodejs-platform-proxy.html
  server.listen({ port: 8081 }).then(({ url }) => {
    console.log(`🚀 EUBFR GraphQL Server: ${url}`);
  });
})();
